# CDP API Integration - Quick Start Guide

This guide demonstrates how to use the Coinbase Developer Platform (CDP) API integration tools included in this repository.

## What You'll Need

1. **Node.js** - Version 14 or later
2. **CDP API Credentials** - Obtain from [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
   - KEY_ID: Your API key identifier (UUID format)
   - KEY_SECRET: Your API key secret (base64-encoded EC private key)

## Quick Start

### Step 1: Set Up Your Credentials

Export your CDP API credentials as environment variables:

```bash
export KEY_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=="
```

### Step 2: Configure Your Request

Set the API request parameters:

```bash
export REQUEST_METHOD="GET"
export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c"
export REQUEST_HOST="api.cdp.coinbase.com"
```

### Step 3: Make the API Request

Run the CDP API client:

```bash
node contrib/devtools/fetch-cdp-api.js
```

Or use the shell wrapper:

```bash
./contrib/devtools/fetch-cdp-api.sh
```

## Example Output

```
Coinbase Developer Platform (CDP) API Client
════════════════════════════════════════════════════════════════════════════════

Configuration:
  Host:   api.cdp.coinbase.com
  Method: GET
  Path:   /platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c
  Key ID: xxxxxxxx...

Making authenticated request...

CDP API Response
════════════════════════════════════════════════════════════════════════════════

Status: 200 OK

Response Body:
────────────────────────────────────────────────────────────────────────────────
{
  "data": {
    "balances": [
      {
        "token": {
          "address": "0x...",
          "symbol": "USDC",
          "decimals": 6
        },
        "balance": "1000000"
      }
    ]
  }
}
```

## Common Use Cases

### 1. Query Token Balances

Get ERC-20 token balances for any address:

```bash
export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c"
node contrib/devtools/fetch-cdp-api.js
```

### 2. List Available Networks

Get a list of all supported blockchain networks:

```bash
export REQUEST_PATH="/platform/v2/evm/networks"
node contrib/devtools/fetch-cdp-api.js
```

### 3. Query Transaction Details

Get details for a specific transaction:

```bash
export REQUEST_PATH="/platform/v2/evm/transactions/ethereum-mainnet/0x..."
node contrib/devtools/fetch-cdp-api.js
```

### 4. Get Block Information

Retrieve information about a specific block:

```bash
export REQUEST_PATH="/platform/v2/evm/blocks/ethereum-mainnet/12345678"
node contrib/devtools/fetch-cdp-api.js
```

## Using Command Line Arguments

Instead of environment variables, you can pass credentials directly:

```bash
node contrib/devtools/fetch-cdp-api.js \
  --key-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  --key-secret "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX==" \
  --method GET \
  --path "/platform/v2/evm/token-balances/base-sepolia/0x..." \
  --host "api.cdp.coinbase.com"
```

## Supported Networks

The CDP API supports multiple blockchain networks:

- **Ethereum**: `ethereum-mainnet`, `ethereum-sepolia`
- **Base**: `base-mainnet`, `base-sepolia`
- **Polygon**: `polygon-mainnet`, `polygon-mumbai`
- **Optimism**: `optimism-mainnet`, `optimism-sepolia`
- **Arbitrum**: `arbitrum-mainnet`, `arbitrum-sepolia`
- And many more...

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit your API credentials** to version control
2. **Use environment variables** to store sensitive data
3. **Rotate your API keys** regularly
4. **Monitor your API usage** for unusual activity
5. **Use minimal permissions** for your API keys

## Troubleshooting

### Missing Credentials Error

```
Error: Configuration errors:
  - KEY_ID is required (set KEY_ID env var or use --key-id)
  - KEY_SECRET is required (set KEY_SECRET env var or use --key-secret)
```

**Solution**: Ensure you've exported `KEY_ID` and `KEY_SECRET` environment variables.

### Authentication Failed (401)

```
Status: 401 Unauthorized
```

**Solution**: 
- Verify your KEY_ID and KEY_SECRET are correct
- Check that your API key has the necessary permissions
- Ensure your API key hasn't expired

### Invalid Path Error

```
Status: 404 Not Found
```

**Solution**: Check that your REQUEST_PATH is correct and the endpoint exists in the API documentation.

## Additional Resources

- **Full Documentation**: See [CDP_API_README.md](contrib/devtools/CDP_API_README.md)
- **API Reference**: [Coinbase Developer Platform Docs](https://docs.cdp.coinbase.com/)
- **Test Suite**: Run `node contrib/devtools/test-cdp-api.js` to verify functionality

## Getting Help

If you encounter issues:

1. Run with `--help` flag to see usage information
2. Check the [CDP_API_README.md](contrib/devtools/CDP_API_README.md) for detailed documentation
3. Verify your credentials at the [CDP Portal](https://portal.cdp.coinbase.com/)
4. Review the [API documentation](https://docs.cdp.coinbase.com/)

## Example: Complete Workflow

Here's a complete example workflow:

```bash
# 1. Export your credentials
export KEY_ID="12345678-1234-1234-1234-123456789abc"
export KEY_SECRET="dGVzdC1rZXktc2VjcmV0LWV4YW1wbGU="

# 2. Query token balances
export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c"
node contrib/devtools/fetch-cdp-api.js

# 3. Query another address on a different network
export REQUEST_PATH="/platform/v2/evm/token-balances/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"
node contrib/devtools/fetch-cdp-api.js

# 4. Get network information
export REQUEST_PATH="/platform/v2/evm/networks"
node contrib/devtools/fetch-cdp-api.js

# 5. Clear credentials when done
unset KEY_ID KEY_SECRET
```

## License

Copyright (c) 2026 The Bitcoin Core developers

Distributed under the MIT software license, see the accompanying
file COPYING or https://opensource.org/license/mit.
