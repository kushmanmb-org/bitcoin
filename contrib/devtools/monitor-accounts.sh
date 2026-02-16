#!/bin/bash

# Copyright (c) 2026 The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or https://opensource.org/license/mit.

# Shell wrapper for monitor-accounts.js

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITOR_SCRIPT="$SCRIPT_DIR/monitor-accounts.js"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js to use this script"
    exit 1
fi

# Check if script exists
if [ ! -f "$MONITOR_SCRIPT" ]; then
    echo "Error: monitor-accounts.js not found at $MONITOR_SCRIPT"
    exit 1
fi

# Check for API key
if [ -z "$ETHERSCAN_API_KEY" ]; then
    echo "Error: ETHERSCAN_API_KEY environment variable is required"
    echo ""
    echo "Usage:"
    echo "  ETHERSCAN_API_KEY=your_api_key $0 ADDRESS1 [ADDRESS2 ...]"
    echo ""
    echo "Get your API key at: https://etherscan.io/myapikey"
    exit 1
fi

# Check for addresses
if [ $# -eq 0 ]; then
    echo "Error: At least one Ethereum address is required"
    echo ""
    echo "Usage:"
    echo "  ETHERSCAN_API_KEY=your_api_key $0 ADDRESS1 [ADDRESS2 ...]"
    echo ""
    echo "Example:"
    echo "  ETHERSCAN_API_KEY=ABC123 $0 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
    exit 1
fi

# Run the Node.js script with all arguments
exec node "$MONITOR_SCRIPT" "$@"
