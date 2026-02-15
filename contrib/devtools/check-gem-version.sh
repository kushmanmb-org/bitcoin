#!/usr/bin/env bash
#
# Copyright (c) The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or https://opensource.org/license/mit/.
#
# Check Ruby gem version

export LC_ALL=C
set -e

# Check if gem command is available
if ! command -v gem &> /dev/null; then
    echo "Error: gem command not found. Please install Ruby and RubyGems."
    exit 1
fi

# Display gem version
echo "Checking gem version..."
gem --version

exit 0
