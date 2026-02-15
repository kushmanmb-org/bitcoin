#!/usr/bin/env bash
# Copyright (c) 2026 The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or https://opensource.org/license/mit.

# Coinbase Developer Platform (CDP) API Shell Wrapper
#
# This script provides a shell-based wrapper for making authenticated
# requests to the Coinbase Developer Platform API.
#
# Usage:
#   export KEY_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
#   export KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=="
#   export REQUEST_METHOD="GET"
#   export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x..."
#   export REQUEST_HOST="api.cdp.coinbase.com"
#   
#   ./contrib/devtools/fetch-cdp-api.sh
#
# This wrapper delegates to the Node.js implementation for JWT generation
# and API communication, as proper ES256 JWT signing is complex in pure bash.

export LC_ALL=C
TOPDIR=${TOPDIR:-$(git rev-parse --show-toplevel)}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NODE_SCRIPT="${SCRIPT_DIR}/fetch-cdp-api.js"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required to run this script."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if the Node.js script exists
if [ ! -f "$NODE_SCRIPT" ]; then
    echo "Error: fetch-cdp-api.js not found at $NODE_SCRIPT"
    exit 1
fi

# Validate required environment variables
if [ -z "$KEY_ID" ]; then
    echo "Error: KEY_ID environment variable is required"
    echo "Usage: export KEY_ID=\"your-key-id\""
    exit 1
fi

if [ -z "$KEY_SECRET" ]; then
    echo "Error: KEY_SECRET environment variable is required"
    echo "Usage: export KEY_SECRET=\"your-key-secret\""
    exit 1
fi

if [ -z "$REQUEST_PATH" ]; then
    echo "Error: REQUEST_PATH environment variable is required"
    echo "Usage: export REQUEST_PATH=\"/platform/v2/evm/...\""
    exit 1
fi

# Set defaults
export REQUEST_METHOD="${REQUEST_METHOD:-GET}"
export REQUEST_HOST="${REQUEST_HOST:-api.cdp.coinbase.com}"

# Execute the Node.js script
exec node "$NODE_SCRIPT" "$@"
