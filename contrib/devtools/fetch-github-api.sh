#!/usr/bin/env bash
# Copyright (c) 2026 The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or https://opensource.org/license/mit.

# GitHub API Client - Shell Wrapper
# 
# This script provides a convenient wrapper for the GitHub API client.
# It validates the environment and calls the Node.js implementation.
#
# Usage:
#   export GITHUB_TOKEN="gho_xxxxx"
#   export REQUEST_PATH="/user"
#   ./contrib/devtools/fetch-github-api.sh
#
# Environment Variables:
#   GITHUB_TOKEN     - Required. GitHub OAuth token or Personal Access Token
#   REQUEST_METHOD   - Optional. HTTP method (default: GET)
#   REQUEST_PATH     - Required. API endpoint path
#   REQUEST_HOST     - Optional. API host (default: api.github.com)
#   REQUEST_BODY     - Optional. Request body for POST/PUT/PATCH (JSON string)

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js to use this script"
    exit 1
fi

# Check required environment variables
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    echo "Please set your GitHub OAuth token or Personal Access Token"
    echo "Example: export GITHUB_TOKEN='gho_xxxxx'"
    exit 1
fi

if [ -z "$REQUEST_PATH" ]; then
    echo "Error: REQUEST_PATH environment variable is not set"
    echo "Please specify the API endpoint path"
    echo "Example: export REQUEST_PATH='/user'"
    exit 1
fi

# Execute the Node.js script
exec node "$SCRIPT_DIR/fetch-github-api.js" "$@"
