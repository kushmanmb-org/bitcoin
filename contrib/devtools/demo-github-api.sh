#!/usr/bin/env bash
# Copyright (c) 2026 The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or https://opensource.org/license/mit.

# GitHub API Demo Script
# 
# This script demonstrates the GitHub API client functionality with various examples.
# It shows how to interact with different GitHub API endpoints using OAuth tokens.
#
# Prerequisites:
#   - Node.js installed
#   - GitHub OAuth token or Personal Access Token
#
# Usage:
#   export GITHUB_TOKEN="gho_xxxxx"
#   ./contrib/devtools/demo-github-api.sh

set -e

echo "GitHub API Client - Demo Script"
echo "==============================="
echo

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js to run this demo"
    exit 1
fi

# Check if token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    echo
    echo "To run this demo, you need a GitHub token:"
    echo "1. Go to GitHub Settings → Developer settings → Personal access tokens"
    echo "2. Generate a new token with 'repo' and 'user' scopes"
    echo "3. Export it: export GITHUB_TOKEN='gho_xxxxx'"
    echo
    echo "Alternatively, if you have an OAuth token from the OAuth flow:"
    echo "  export GITHUB_TOKEN='gho_16C7e42F292c6912E7710c838347Ae178B4a'"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Using token: ${GITHUB_TOKEN:0:10}..."
echo

# Demo 1: Get authenticated user information
echo "Demo 1: Get Authenticated User Information"
echo "-------------------------------------------"
export REQUEST_PATH="/user"
export REQUEST_METHOD="GET"
node "$SCRIPT_DIR/fetch-github-api.js" || true
echo

# Demo 2: List user repositories
echo "Demo 2: List User Repositories (first 5)"
echo "-----------------------------------------"
export REQUEST_PATH="/user/repos?per_page=5&sort=updated"
node "$SCRIPT_DIR/fetch-github-api.js" || true
echo

# Demo 3: Get rate limit status
echo "Demo 3: Check Rate Limit Status"
echo "--------------------------------"
export REQUEST_PATH="/rate_limit"
node "$SCRIPT_DIR/fetch-github-api.js" || true
echo

# Demo 4: Get Bitcoin repository information
echo "Demo 4: Get Bitcoin Core Repository Info"
echo "-----------------------------------------"
export REQUEST_PATH="/repos/bitcoin/bitcoin"
node "$SCRIPT_DIR/fetch-github-api.js" || true
echo

# Demo 5: Search repositories
echo "Demo 5: Search for Bitcoin Repositories"
echo "---------------------------------------"
export REQUEST_PATH="/search/repositories?q=bitcoin&sort=stars&order=desc&per_page=3"
node "$SCRIPT_DIR/fetch-github-api.js" || true
echo

echo "Demo completed!"
echo
echo "OAuth Token Response Format:"
echo "---------------------------"
echo "When using GitHub OAuth flow, tokens are returned in this format:"
echo '{
  "access_token": "gho_16C7e42F292c6912E7710c838347Ae178B4a",
  "token_type": "bearer",
  "scope": "repo,gist"
}'
echo
echo "For more examples, see: contrib/devtools/GITHUB_API_README.md"
