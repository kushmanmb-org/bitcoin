# ERC20 Token Transfer Events Fetcher - Example Output

This document shows example outputs from the `fetch-erc20-events.js` script demonstrating various scenarios.

## Successful Fetch Example

When the script successfully fetches ERC20 token transfers, the output looks like this:

```
Fetching ERC20 Token Transfer Events
════════════════════════════════════════════════════════════════════════════════
Address:  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
API:      Etherscan
════════════════════════════════════════════════════════════════════════════════

Found 5 ERC20 token transfer(s)

Transaction #1:
────────────────────────────────────────────────────────────────────────────────
Transaction Hash: 0xabc123...def456
Block Number:     15234567
From:             0x1234567890abcdef1234567890abcdef12345678
To:               0xabcdef1234567890abcdef1234567890abcdef12
Value:            1000.000000000000000000
Token Symbol:     USDT
Token Name:       Tether USD
Timestamp:        2023-06-15T14:30:00.000Z

Transaction #2:
────────────────────────────────────────────────────────────────────────────────
Transaction Hash: 0xdef789...abc012
Block Number:     15234568
From:             0xabcdef1234567890abcdef1234567890abcdef12
To:               0x1234567890abcdef1234567890abcdef12345678
Value:            500.500000
Token Symbol:     USDC
Token Name:       USD Coin
Timestamp:        2023-06-15T14:35:00.000Z

...

════════════════════════════════════════════════════════════════════════════════
Total: 5 transaction(s)
```

## Error Handling Examples

### Missing API Key

```
Error: ETHERSCAN_API_KEY environment variable is required

Usage:
  ETHERSCAN_API_KEY=your_api_key node fetch-erc20-events.js [ADDRESS]

Get your API key at: https://etherscan.io/myapikey
```

### Missing Address

```
Error: Ethereum address is required

Usage:
  ETHERSCAN_API_KEY=your_api_key node fetch-erc20-events.js [ADDRESS]

Example:
  ETHERSCAN_API_KEY=ABC123 node fetch-erc20-events.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

### Invalid Address Format

```
Error: Invalid Ethereum address format: 0x123
Expected format: 0x followed by 40 hexadecimal characters
```

### No Token Transfers Found

```
Fetching ERC20 Token Transfer Events
════════════════════════════════════════════════════════════════════════════════
Address:  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
API:      Etherscan
════════════════════════════════════════════════════════════════════════════════

No ERC20 token transfers found for this address.

This could mean:
  - The address has not received or sent any ERC20 tokens
  - The address is new or inactive
```

### API Error (Invalid API Key)

```
Error occurred while fetching token transfer events:
  HTTP Error: 401 Unauthorized

This usually means your API key is invalid or expired.
Please check your ETHERSCAN_API_KEY and try again.
```

### Rate Limit Exceeded

```
Error occurred while fetching token transfer events:
  HTTP Error: 429 Too Many Requests

Rate limit exceeded. Please wait and try again later.
```

### Network Error

```
Error occurred while fetching token transfer events:
  Request failed: getaddrinfo ENOTFOUND api.etherscan.io

Network error. Please check your internet connection.
```

## Features Demonstrated

1. **Clear Transaction Details**: Each transaction shows hash, block number, sender, recipient, value, token symbol, token name, and timestamp
2. **Proper Value Formatting**: Token values are formatted with appropriate decimal places based on the token's decimals
3. **Comprehensive Error Handling**: Different error types have specific, helpful error messages
4. **Input Validation**: Address format is validated before making API calls
5. **Security**: API key is required from environment variables, never hardcoded
6. **User-Friendly Output**: Clear formatting with visual separators and labeled fields
