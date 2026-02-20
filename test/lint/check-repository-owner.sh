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
REPO_PATH=$(echo "$GIT_REMOTE" | sed -E 's#^(https://github\.com/|git@github\.com:)##' | sed 's/\.git$//')

# Get the repository owner from GitHub API
REPO_OWNER=$(curl -s "https://api.github.com/repos/${REPO_PATH}" | jq -r '.owner.login')

# Check if curl was successful
if [ -z "$REPO_OWNER" ] || [ "$REPO_OWNER" = "null" ]; then
    echo "Error: Failed to retrieve repository owner from GitHub API."
    echo "This could be due to network issues or API rate limiting."
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
