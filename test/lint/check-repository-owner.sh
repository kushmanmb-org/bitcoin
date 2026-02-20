#!/usr/bin/env bash
#
# Copyright (c) 2026-present The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or http://www.opensource.org/licenses/mit-license.php.
#
# Check that the GitHub repository owner is correct.
# This script verifies that the repository owner is either "kushmanmb-org" or "kushmanmb".

export LC_ALL=C

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

# Get the repository owner from GitHub API
REPO_OWNER=$(curl -s https://api.github.com/repos/kushmanmb-org/bitcoin | jq -r '.owner.login')

# Check if curl was successful
if [ -z "$REPO_OWNER" ] || [ "$REPO_OWNER" = "null" ]; then
    echo "Error: Failed to retrieve repository owner from GitHub API."
    echo "This could be due to network issues or API rate limiting."
    exit 1
fi

# Verify the repository owner
if [ "$REPO_OWNER" = "kushmanmb-org" ] || [ "$REPO_OWNER" = "kushmanmb" ]; then
    echo "✓ Repository owner is correct: $REPO_OWNER"
    exit 0
else
    echo "✗ Repository owner is incorrect: $REPO_OWNER"
    echo "  Expected: kushmanmb-org or kushmanmb"
    exit 1
fi
