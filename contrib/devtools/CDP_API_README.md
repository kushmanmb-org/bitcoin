# Coinbase Developer Platform (CDP) API Integration

This directory contains tools for interacting with the Coinbase Developer Platform (CDP) API, which provides programmatic access to blockchain data and EVM operations.

## Overview

The CDP API integration provides:
- JWT-based authentication using ES256 algorithm
- Support for EVM token balance queries
- Access to multiple blockchain networks (mainnet, testnets)
- Secure credential management via environment variables

## Files

- `fetch-cdp-api.js` - Node.js implementation with JWT token generation
- `fetch-cdp-api.sh` - Shell wrapper for the Node.js script
- `test-cdp-api.js` - Test suite for CDP API functionality

## Prerequisites

- Node.js (v14 or later recommended)
- CDP API credentials (KEY_ID and KEY_SECRET)

## Getting Started

### 1. Obtain CDP API Credentials

1. Visit the [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new API key
3. Save your KEY_ID (UUID format) and KEY_SECRET (base64-encoded private key)

### 2. Set Environment Variables

```bash
export KEY_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=="
export REQUEST_METHOD="GET"
export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c"
export REQUEST_HOST="api.cdp.coinbase.com"
```

### 3. Make API Requests

#### Using Node.js Script Directly

```bash
node contrib/devtools/fetch-cdp-api.js
```

#### Using Shell Wrapper

```bash
./contrib/devtools/fetch-cdp-api.sh
```

#### Using Command Line Arguments

```bash
node contrib/devtools/fetch-cdp-api.js \
  --key-id "your-key-id" \
  --key-secret "your-key-secret" \
  --method GET \
  --path "/platform/v2/evm/token-balances/base-sepolia/0x..." \
  --host "api.cdp.coinbase.com"
```

## Usage Examples

### Get Token Balances

Query ERC-20 token balances for an address on Base Sepolia testnet:

```bash
export KEY_ID="your-key-id"
export KEY_SECRET="your-key-secret"
export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c"
node contrib/devtools/fetch-cdp-api.js
```

### Get Network Information

List supported EVM networks:

```bash
export REQUEST_PATH="/platform/v2/evm/networks"
node contrib/devtools/fetch-cdp-api.js
```

### Query Specific Network Data

Get data from Ethereum mainnet:

```bash
export REQUEST_PATH="/platform/v2/evm/token-balances/ethereum-mainnet/0x..."
node contrib/devtools/fetch-cdp-api.js
```

## API Endpoints

Common CDP API endpoints:

| Endpoint | Description |
|----------|-------------|
| `/platform/v2/evm/networks` | List supported networks |
| `/platform/v2/evm/token-balances/{network}/{address}` | Get token balances for address |
| `/platform/v2/evm/transactions/{network}/{hash}` | Get transaction details |
| `/platform/v2/evm/blocks/{network}/{number}` | Get block information |

Supported networks include:
- `ethereum-mainnet` - Ethereum mainnet
- `ethereum-sepolia` - Ethereum Sepolia testnet
- `base-mainnet` - Base mainnet
- `base-sepolia` - Base Sepolia testnet
- And many more...

## Authentication

The CDP API uses JWT (JSON Web Token) authentication with the following characteristics:

- **Algorithm**: ES256 (ECDSA with P-256 curve and SHA-256)
- **Token Lifetime**: 2 minutes (120 seconds)
- **Headers**:
  - `alg`: ES256
  - `typ`: JWT
  - `kid`: Your KEY_ID
  - `nonce`: Random 16-byte hex string
- **Payload**:
  - `sub`: Your KEY_ID
  - `iss`: "coinbase-cloud"
  - `nbf`: Current timestamp
  - `exp`: Expiration timestamp
  - `aud`: Array containing the request host
  - `uri`: HTTP method + host + path

The JWT token is sent in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Security Best Practices

1. **Never commit credentials** - Always use environment variables
2. **Rotate API keys regularly** - Generate new keys periodically
3. **Use minimal permissions** - Only grant necessary API access
4. **Monitor API usage** - Track requests and responses
5. **Secure key storage** - Store KEY_SECRET securely (e.g., secrets manager)

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KEY_ID` | Yes | - | CDP API Key ID (UUID format) |
| `KEY_SECRET` | Yes | - | CDP API Key Secret (base64-encoded PEM private key) |
| `REQUEST_METHOD` | No | `GET` | HTTP method for the request |
| `REQUEST_PATH` | Yes | - | API endpoint path |
| `REQUEST_HOST` | No | `api.cdp.coinbase.com` | CDP API hostname |

## Error Handling

The scripts handle various error scenarios:

- **Missing credentials**: Clear error message with setup instructions
- **Invalid JWT**: Signature verification failures
- **API errors**: HTTP error codes and response messages
- **Network errors**: Connection failures and timeouts

## Troubleshooting

### "Failed to sign JWT" Error

This usually means the KEY_SECRET is not properly formatted. Ensure:
1. The KEY_SECRET is base64-encoded
2. When decoded, it's a valid PEM-encoded EC private key
3. The key uses the P-256 (secp256r1) curve

### "Request failed" Error

Check:
1. Internet connectivity
2. REQUEST_HOST is correct
3. REQUEST_PATH is a valid endpoint
4. API credentials are valid and not expired

### "401 Unauthorized" Response

Verify:
1. KEY_ID and KEY_SECRET are correct
2. API key has necessary permissions
3. JWT token is being generated correctly

## Development

### Running Tests

```bash
node contrib/devtools/test-cdp-api.js
```

### Testing with Mock Credentials

For development without real credentials:

```bash
# This will fail authentication but tests the script functionality
export KEY_ID="00000000-0000-0000-0000-000000000000"
export KEY_SECRET="dGVzdC1rZXktc2VjcmV0" # Invalid test key
export REQUEST_PATH="/platform/v2/evm/networks"
node contrib/devtools/fetch-cdp-api.js
```

## References

- [Coinbase Developer Platform Documentation](https://docs.cdp.coinbase.com/)
- [CDP API Reference](https://docs.cdp.coinbase.com/api-reference)
- [JWT Specification](https://tools.ietf.org/html/rfc7519)
- [ES256 Algorithm](https://tools.ietf.org/html/rfc7518#section-3.4)

## License

Copyright (c) 2026 The Bitcoin Core developers

Distributed under the MIT software license, see the accompanying
file COPYING or https://opensource.org/license/mit.
