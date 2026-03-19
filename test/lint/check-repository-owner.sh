#!/usr/bin/env bash
#
# Copyright (c) 2026-present The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or http://www.opensource.org/licenses/mit-license.php.
#
# Check that the GitHub repository owner is correct.
# This script verifies that the repository owner is either "kushmanmb-org" or "kushmanmb".

export LC_ALL=C

# Expected repository owners (add more if needed)
ALLOWED_OWNERS=("kushmanmb-org" "kushmanmb")

# Check if curl is available
if ! command -v curl >/dev/null 2>&1; then
    echo "Error: curl is not installed. Please install curl to run this check."
    exit 1
fi

# Check if jq is available
if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq is not installed. Please install jq to run this check."
    exit 1
fi

# Get the repository path from git remote
GIT_REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$GIT_REMOTE" ]; then
    echo "Error: Could not determine git remote origin."
    exit 1
fi

# Extract owner/repo from the remote URL
# Handles both HTTPS (https://github.com/owner/repo.git) and SSH (git@github.com:owner/repo.git) formats
# Also handles www subdomain and trailing slashes
REPO_PATH=$(echo "$GIT_REMOTE" | sed -E 's#^(https://(www\.)?github\.com/|git@github\.com:)##' | sed 's#/$##' | sed 's/\.git$//')

# Validate that REPO_PATH matches expected pattern (owner/repo)
# GitHub usernames and repo names must start with alphanumeric or underscore, not hyphen
if ! echo "$REPO_PATH" | grep -qE '^[a-zA-Z0-9_][a-zA-Z0-9_-]*/[a-zA-Z0-9_][a-zA-Z0-9_-]*$'; then
    echo "Error: Invalid repository path format: $REPO_PATH"
    echo "Expected format: owner/repo"
    exit 1
fi

# Get the repository owner from GitHub API with HTTP status code
HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" "https://api.github.com/repos/${REPO_PATH}")
HTTP_CODE=$(echo "$HTTP_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HTTP_RESPONSE" | sed '$d')

REPO_OWNER=$(echo "$RESPONSE_BODY" | jq -r '.owner.login')

# Check if curl was successful and provide specific error messages
if [ "$HTTP_CODE" != "200" ]; then
    echo "Error: Failed to retrieve repository owner from GitHub API (HTTP $HTTP_CODE)."
    case "$HTTP_CODE" in
        403)
            echo "This is likely due to API rate limiting. Try again later or use authentication."
            ;;
        404)
            echo "Repository not found. Check that the repository exists and is accessible."
            ;;
        *)
            echo "This could be due to network issues or other API problems."
            ;;
    esac
    exit 1
fi

if [ -z "$REPO_OWNER" ] || [ "$REPO_OWNER" = "null" ]; then
    echo "Error: Could not extract repository owner from API response."
    exit 1
fi

# Verify the repository owner
OWNER_VALID=false
for allowed_owner in "${ALLOWED_OWNERS[@]}"; do
    if [ "$REPO_OWNER" = "$allowed_owner" ]; then
        OWNER_VALID=true
        break
    fi
done

if [ "$OWNER_VALID" = true ]; then
    echo "✓ Repository owner is correct: $REPO_OWNER"
    exit 0
else
    echo "✗ Repository owner is incorrect: $REPO_OWNER"
    echo "  Expected one of: ${ALLOWED_OWNERS[*]}"
    exit 1
fi
