#!/usr/bin/env python3
# Copyright (c) 2026-present The Bitcoin Core developers
# Distributed under the MIT software license, see the accompanying
# file COPYING or http://www.opensource.org/licenses/mit-license.php.

"""Script to fetch content from kushmanmb.ghost.io website."""

import sys
import urllib.request

URL = 'https://kushmanmb.ghost.io/'


def fetch_website(url):
    """Fetch content from the specified URL."""
    try:
        print(f"Fetching content from {url}...")
        with urllib.request.urlopen(url, timeout=10) as response:
            if response.status != 200:
                raise RuntimeError(f"HTTP request failed with status code: {response.status}")
            
            content = response.read()
            print(f"Successfully fetched {len(content)} bytes")
            
            # Decode and print the content
            decoded_content = content.decode('utf-8')
            print("\n" + "="*80)
            print("Website Content:")
            print("="*80)
            print(decoded_content)
            
            return 0
            
    except urllib.error.URLError as e:
        print(f"Error fetching URL: {e}", file=sys.stderr)
        print(f"Reason: {e.reason}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(fetch_website(URL))
