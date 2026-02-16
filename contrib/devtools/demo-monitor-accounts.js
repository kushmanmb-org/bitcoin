#!/usr/bin/env node

// Demo script showing example output of monitor-accounts.js
// This generates sample output without requiring API calls

console.clear();

console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                        Ethereum Account Monitor                                ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('Last Update: 2026-02-16T05:45:00.000Z');
console.log('Update Count: 3');
console.log('Next update in: 60 seconds');
console.log('');
console.log('Press Ctrl+C to stop monitoring');
console.log('─'.repeat(80));
console.log('');

// Example 1: Account with new transaction
console.log('═'.repeat(80));
console.log('Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
console.log('  ETH Balance: 5.234567 ETH');
console.log('  Status: 🔔 NEW TRANSACTION DETECTED!');
console.log('');
console.log('  Recent Token Transfers:');
console.log('  ' + '─'.repeat(76));
console.log('  1. ⬇ IN  | 100.000000 USDT');
console.log('     Block: 19123456 | 2026-02-16T05:40:00.000Z');
console.log('     Hash: 0x1234567890abcdef...');
console.log('');
console.log('  2. ⬆ OUT | 50.000000 DAI');
console.log('     Block: 19123400 | 2026-02-16T05:30:00.000Z');
console.log('     Hash: 0xabcdef1234567890...');
console.log('');
console.log('  3. ⬇ IN  | 250.500000 USDC');
console.log('     Block: 19123300 | 2026-02-16T05:20:00.000Z');
console.log('     Hash: 0x9876543210fedcba...');
console.log('');

// Example 2: Account being monitored (no new transactions)
console.log('═'.repeat(80));
console.log('Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
console.log('  ETH Balance: 12.456789 ETH');
console.log('  Status: ✓ Monitoring');
console.log('');
console.log('  Recent Token Transfers:');
console.log('  ' + '─'.repeat(76));
console.log('  1. ⬆ OUT | 1000.000000000000000000 SHIB');
console.log('     Block: 19120000 | 2026-02-15T20:00:00.000Z');
console.log('     Hash: 0x5555666677778888...');
console.log('');
console.log('  2. ⬇ IN  | 0.500000 WETH');
console.log('     Block: 19119500 | 2026-02-15T19:30:00.000Z');
console.log('     Hash: 0x1111222233334444...');
console.log('');

// Example 3: Account with no token transfers
console.log('═'.repeat(80));
console.log('Address: 0x1234567890123456789012345678901234567890');
console.log('  ETH Balance: 0.123456 ETH');
console.log('  Status: ✓ Monitoring');
console.log('  No token transfers found');
console.log('');

console.log('');
console.log('═'.repeat(80));
console.log('Demo Output - This shows what the monitor displays during operation');
console.log('To use with real data, run:');
console.log('  ETHERSCAN_API_KEY=your_key node monitor-accounts.js <address>');
console.log('═'.repeat(80));
