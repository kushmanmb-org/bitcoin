# Account Monitor - Ethereum Account Monitoring Tool

Real-time monitoring tool for Ethereum accounts that continuously tracks:
- ETH balance
- ERC20 token transfers
- New transaction notifications
- Account activity updates

## Features

- **Continuous Monitoring**: Polls Etherscan API at configurable intervals
- **Multiple Accounts**: Monitor multiple Ethereum addresses simultaneously
- **Real-time Updates**: Get notifications when new transactions occur
- **Token Transfer History**: View recent ERC20 token transfers
- **ETH Balance Tracking**: Monitor native ETH balance changes
- **Clean Display**: Console-based UI with formatted output
- **Error Handling**: Graceful error handling with retry logic

## Prerequisites

- Node.js (v14 or later recommended)
- Etherscan API key (free at https://etherscan.io/myapikey)

## Installation

No installation required - the scripts are part of the Bitcoin Core contrib tools.

## Usage

### Basic Usage

Monitor a single Ethereum address:

```bash
ETHERSCAN_API_KEY=your_api_key node contrib/devtools/monitor-accounts.js 0xYourAddress
```

### Using Shell Wrapper

```bash
ETHERSCAN_API_KEY=your_api_key ./contrib/devtools/monitor-accounts.sh 0xYourAddress
```

### Monitor Multiple Addresses

Monitor multiple addresses simultaneously:

```bash
ETHERSCAN_API_KEY=your_api_key node contrib/devtools/monitor-accounts.js \
  0xAddress1 \
  0xAddress2 \
  0xAddress3
```

### Custom Poll Interval

Set a custom polling interval (in seconds):

```bash
POLL_INTERVAL=30 ETHERSCAN_API_KEY=your_api_key \
  node contrib/devtools/monitor-accounts.js 0xYourAddress
```

**Note**: Minimum poll interval is 10 seconds to respect API rate limits.

### Example with Real Address

Monitor the Vitalik Buterin address:

```bash
ETHERSCAN_API_KEY=your_api_key \
  node contrib/devtools/monitor-accounts.js 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ETHERSCAN_API_KEY` | Yes | - | Your Etherscan API key |
| `POLL_INTERVAL` | No | `60` | Polling interval in seconds (min: 10) |

## Output Format

The monitor displays:

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                        Ethereum Account Monitor                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

Last Update: 2026-02-16T05:30:00.000Z
Update Count: 5
Next update in: 60 seconds

Press Ctrl+C to stop monitoring
────────────────────────────────────────────────────────────────────────────────

════════════════════════════════════════════════════════════════════════════════
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
  ETH Balance: 1.234567 ETH
  Status: 🔔 NEW TRANSACTION DETECTED!

  Recent Token Transfers:
  ────────────────────────────────────────────────────────────────────────────
  1. ⬇ IN  | 100.000000 USDT
     Block: 12345678 | 2026-02-16T05:25:00.000Z
     Hash: 0x1234567890abcdef...

  2. ⬆ OUT | 50.000000 DAI
     Block: 12345600 | 2026-02-16T05:20:00.000Z
     Hash: 0xabcdef1234567890...
```

## Display Indicators

- ✓ **Monitoring**: Account is being monitored successfully
- 🔔 **NEW TRANSACTION**: A new transaction was detected since last update
- ⬇ **IN**: Incoming token transfer
- ⬆ **OUT**: Outgoing token transfer
- ❌ **Error**: An error occurred while fetching account data

## Testing

Run the test suite to verify functionality:

```bash
node contrib/devtools/test-monitor-accounts.js
```

The test suite validates:
- Token value formatting
- Wei to ETH conversion
- Ethereum address validation

## How It Works

1. **Initialization**: Validates inputs and sets up monitoring for each address
2. **First Update**: Fetches initial account data (ETH balance, recent transactions)
3. **Display**: Shows formatted account information in the console
4. **Polling Loop**: Continuously updates at the specified interval
5. **Change Detection**: Compares transaction hashes to detect new activity
6. **Notifications**: Highlights accounts with new transactions

## API Calls

For each monitored address, the tool makes these Etherscan API calls:

1. **ETH Balance**: `module=account&action=balance`
2. **Token Transfers**: `module=account&action=tokentx` (last 5 transactions)

**Rate Limits**: Free Etherscan API keys have a limit of 5 calls/second. The default 60-second poll interval is designed to stay well within these limits, even when monitoring multiple addresses.

## Limitations

- **Mainnet Only**: Currently monitors Ethereum mainnet (chain ID 1)
- **Token Transfers Only**: Shows ERC20 token transfers, not regular ETH transactions
- **Recent History**: Displays only the 5 most recent token transfers
- **No Persistence**: Does not save historical data between runs
- **Console Only**: Terminal-based interface, no GUI

## Future Enhancements

Potential improvements for future versions:

- Support for other networks (Polygon, BSC, etc.)
- Display regular ETH transactions
- Save monitoring data to file
- Alert system (email, webhook notifications)
- Web-based dashboard
- Historical data analysis
- Filter by token type
- Export data to CSV/JSON

## Troubleshooting

### "ETHERSCAN_API_KEY environment variable is required"

Set your API key before running:
```bash
export ETHERSCAN_API_KEY="your_api_key_here"
```

### "Invalid Ethereum address format"

Ensure addresses:
- Start with `0x`
- Have exactly 40 hexadecimal characters after `0x`
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0`

### "Request timeout" or "Request failed"

Check:
1. Internet connectivity
2. Etherscan API status (https://status.etherscan.io/)
3. API key validity
4. Rate limits not exceeded

### "HTTP Error: 401"

Your API key may be:
- Invalid
- Expired
- Not properly set in environment variable

Get a new key at: https://etherscan.io/myapikey

### "HTTP Error: 429"

Rate limit exceeded. Either:
- Increase `POLL_INTERVAL` to poll less frequently
- Reduce number of monitored addresses
- Upgrade to a paid Etherscan API plan

## Related Tools

- **fetch-erc20-events.js**: One-time fetch of ERC20 token transfers
- **fetch-cdp-api.js**: Query Coinbase Developer Platform API
- **p2p_monitor.py**: Monitor Bitcoin Core P2P network traffic
- **mempool_monitor.py**: Monitor Bitcoin Core mempool events

## Security Considerations

- **API Keys**: Never commit API keys to version control
- **Public Data**: The tool only accesses publicly available blockchain data
- **No Private Keys**: Does not handle or require private keys
- **Read-Only**: Only reads data, cannot perform transactions

## Support

For issues or questions:
1. Check this documentation
2. Review Etherscan API docs: https://docs.etherscan.io/
3. Open an issue in the repository

## License

Copyright (c) 2026 The Bitcoin Core developers

Distributed under the MIT software license, see the accompanying
file COPYING or https://opensource.org/license/mit.

## See Also

- [Etherscan API Documentation](https://docs.etherscan.io/)
- [CDP API README](./CDP_API_README.md)
- [Bitcoin Core Developer Tools](./README.md)
