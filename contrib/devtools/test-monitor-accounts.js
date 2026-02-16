#!/usr/bin/env node

// Copyright (c) 2026 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or https://opensource.org/license/mit.

/**
 * Test script for monitor-accounts.js
 * This tests the utility functions
 */

const { formatTokenValue, weiToEth, isValidAddress } = require('./monitor-accounts.js');

console.log('Testing Account Monitor Functions');
console.log('═'.repeat(80));
console.log('');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Test helper function
 */
function test(name, actual, expected) {
    totalTests++;
    const passed = actual === expected;
    
    if (passed) {
        console.log(`  ✓ ${name}`);
        passedTests++;
    } else {
        console.log(`  ✗ ${name}`);
        console.log(`    Expected: ${expected}`);
        console.log(`    Got:      ${actual}`);
        failedTests++;
    }
}

// Test 1: formatTokenValue
console.log('Test Suite 1: formatTokenValue');
console.log('-'.repeat(40));

test('Format 1 token (18 decimals)', 
    formatTokenValue('1000000000000000000', '18'), 
    '1.000000000000000000');

test('Format 0.5 tokens (18 decimals)', 
    formatTokenValue('500000000000000000', '18'), 
    '0.500000000000000000');

test('Format 1.234567 tokens (6 decimals)', 
    formatTokenValue('1234567', '6'), 
    '1.234567');

test('Format 1.00 tokens (2 decimals)', 
    formatTokenValue('100', '2'), 
    '1.00');

test('Format 0.50 tokens (2 decimals)', 
    formatTokenValue('50', '2'), 
    '0.50');

test('Format 0.000001 tokens (6 decimals)', 
    formatTokenValue('1', '6'), 
    '0.000001');

test('Handle zero value', 
    formatTokenValue('0', '18'), 
    '0.000000000000000000');

console.log('');

// Test 2: weiToEth
console.log('Test Suite 2: weiToEth');
console.log('-'.repeat(40));

test('Convert 1 ETH', 
    weiToEth('1000000000000000000'), 
    '1.000000');

test('Convert 0.5 ETH', 
    weiToEth('500000000000000000'), 
    '0.500000');

test('Convert 10 ETH', 
    weiToEth('10000000000000000000'), 
    '10.000000');

test('Convert 0 ETH', 
    weiToEth('0'), 
    '0.000000');

test('Handle empty string', 
    weiToEth(''), 
    '0.000000');

console.log('');

// Test 3: isValidAddress
console.log('Test Suite 3: isValidAddress');
console.log('-'.repeat(40));

test('Valid address (lowercase)', 
    isValidAddress('0x742d35cc6634c0532925a3b844bc9e7595f0beb0').toString(), 
    'true');

test('Valid address (mixed case)', 
    isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0').toString(), 
    'true');

test('Valid address (uppercase)', 
    isValidAddress('0x742D35CC6634C0532925A3B844BC9E7595F0BEB0').toString(), 
    'true');

test('Invalid address (too short)', 
    isValidAddress('0x742d35cc6634c0532925a3b844bc9e7595f0be').toString(), 
    'false');

test('Invalid address (too long)', 
    isValidAddress('0x742d35cc6634c0532925a3b844bc9e7595f0beb012').toString(), 
    'false');

test('Invalid address (no 0x prefix)', 
    isValidAddress('742d35cc6634c0532925a3b844bc9e7595f0beb0').toString(), 
    'false');

test('Invalid address (invalid characters)', 
    isValidAddress('0x742d35cc6634c0532925a3b844bc9e7595f0beg0').toString(), 
    'false');

test('Invalid address (empty)', 
    isValidAddress('').toString(), 
    'false');

test('Invalid address (null)', 
    isValidAddress('0x').toString(), 
    'false');

console.log('');

// Summary
console.log('═'.repeat(80));
console.log('Test Results Summary');
console.log('-'.repeat(40));
console.log(`Total Tests:  ${totalTests}`);
console.log(`Passed:       ${passedTests} ✓`);
console.log(`Failed:       ${failedTests} ${failedTests > 0 ? '✗' : ''}`);
console.log('');

if (failedTests === 0) {
    console.log('All tests passed! ✓');
    console.log('');
    console.log('To test with real API:');
    console.log('  ETHERSCAN_API_KEY=your_key node monitor-accounts.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
    process.exit(0);
} else {
    console.log(`${failedTests} test(s) failed! ✗`);
    process.exit(1);
}
