#!/usr/bin/env bash
# Copyright (c) 2026 The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or https://opensource.org/license/mit.

# Demo script showing how to use the CDP API integration
# This script demonstrates the exact usage pattern from the problem statement

echo "═════════════════════════════════════════════════════════════════════"
echo "CDP API Integration - Demo Script"
echo "═════════════════════════════════════════════════════════════════════"
echo ""

# These are the exact environment variables from the problem statement
# (with placeholder values - users should replace with their actual credentials)

echo "Step 1: Export your CDP API credentials"
echo "----------------------------------------"
echo 'export KEY_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"'
echo 'export KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=="'
echo ""

echo "Step 2: Configure your API request"
echo "-----------------------------------"
echo 'export REQUEST_METHOD="GET"'
echo 'export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c"'
echo 'export REQUEST_HOST="api.cdp.coinbase.com"'
echo ""

echo "Step 3: Make the API request"
echo "----------------------------"
echo "node contrib/devtools/fetch-cdp-api.js"
echo ""
echo "Or use the shell wrapper:"
echo "./contrib/devtools/fetch-cdp-api.sh"
echo ""

echo "═════════════════════════════════════════════════════════════════════"
echo "For more information:"
echo "  - Quick Start: CDP_API_QUICKSTART.md"
echo "  - Full Docs:   contrib/devtools/CDP_API_README.md"
echo "  - Tests:       node contrib/devtools/test-cdp-api.js"
echo "═════════════════════════════════════════════════════════════════════"
