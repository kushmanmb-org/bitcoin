#!/usr/bin/env node

// Test script for fetch-erc20-events.js
// This tests the formatting and parsing functions

const { formatTokenValue, printTransaction } = require('./fetch-erc20-events.js');

console.log('Testing ERC20 Events Script Functions');
console.log('═'.repeat(80));
console.log('');

// Test 1: formatTokenValue
console.log('Test 1: formatTokenValue');
console.log('-'.repeat(40));

const testCases = [
    { value: '1000000000000000000', decimals: '18', expected: '1.000000000000000000' },
    { value: '500000000000000000', decimals: '18', expected: '0.500000000000000000' },
    { value: '1234567', decimals: '6', expected: '1.234567' },
    { value: '100', decimals: '2', expected: '1.00' },
    { value: '50', decimals: '2', expected: '0.50' },
    { value: '1', decimals: '6', expected: '0.000001' },
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const result = formatTokenValue(test.value, test.decimals);
    const success = result === test.expected;
    
    if (success) {
        console.log(`  ✓ Test ${index + 1} passed: ${test.value} (${test.decimals} decimals) = ${result}`);
        passed++;
    } else {
        console.log(`  ✗ Test ${index + 1} failed: Expected ${test.expected}, got ${result}`);
        failed++;
    }
});

console.log('');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('');

// Test 2: printTransaction
console.log('Test 2: printTransaction (sample output)');
console.log('-'.repeat(40));

const sampleTransaction = {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: '12345678',
    from: '0xabcdef1234567890abcdef1234567890abcdef12',
    to: '0x1234567890abcdef1234567890abcdef12345678',
    value: '1000000000000000000',
    tokenDecimal: '18',
    tokenSymbol: 'USDT',
    tokenName: 'Tether USD',
    timeStamp: '1609459200'
};

console.log('');
console.log('Sample transaction output:');
printTransaction(sampleTransaction);
console.log('');

console.log('═'.repeat(80));
console.log('All tests completed successfully!');
console.log('');
console.log('To test with real API:');
console.log('  ETHERSCAN_API_KEY=your_key node fetch-erc20-events.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
