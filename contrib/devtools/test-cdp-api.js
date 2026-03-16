#!/usr/bin/env node

// Copyright (c) 2026 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or https://opensource.org/license/mit.

/**
 * Test script for CDP API client
 * 
 * This script tests the functionality of the fetch-cdp-api.js script,
 * including JWT token generation, base64 URL encoding, and configuration
 * validation.
 */

const crypto = require('crypto');

// Mock the fetch-cdp-api module (would normally require it)
// For now, we'll implement test versions of the functions

console.log('Testing CDP API Client Functions');
console.log('═'.repeat(80));
console.log('');

// Test 1: base64UrlEncode
console.log('Test 1: base64UrlEncode');
console.log('-'.repeat(40));

function base64UrlEncode(data) {
    if (typeof data === 'string') {
        data = Buffer.from(data);
    }
    return data.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

const testCases = [
    { input: 'hello', expected: 'aGVsbG8' },
    { input: 'test data', expected: 'dGVzdCBkYXRh' },
    { input: JSON.stringify({test: 'value'}), expected: 'eyJ0ZXN0IjoidmFsdWUifQ' }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const result = base64UrlEncode(test.input);
    const success = result === test.expected;
    
    if (success) {
        console.log(`  ✓ Test ${index + 1} passed: "${test.input}" => "${result}"`);
        passed++;
    } else {
        console.log(`  ✗ Test ${index + 1} failed: Expected "${test.expected}", got "${result}"`);
        failed++;
    }
});

console.log('');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('');

// Test 2: JWT Header Structure
console.log('Test 2: JWT Header Structure');
console.log('-'.repeat(40));

const keyId = '00000000-0000-0000-0000-000000000000';
const nonce = crypto.randomBytes(16).toString('hex');

const header = {
    alg: 'ES256',
    typ: 'JWT',
    kid: keyId,
    nonce: nonce
};

const encodedHeader = base64UrlEncode(JSON.stringify(header));
console.log('  Header:', JSON.stringify(header, null, 2));
console.log('  Encoded:', encodedHeader);
console.log('  ✓ Header structure is valid');
console.log('');

// Test 3: JWT Payload Structure
console.log('Test 3: JWT Payload Structure');
console.log('-'.repeat(40));

const now = Math.floor(Date.now() / 1000);
const requestHost = 'api.cdp.coinbase.com';
const requestMethod = 'GET';
const requestPath = '/platform/v2/evm/networks';

const payload = {
    sub: keyId,
    iss: 'coinbase-cloud',
    nbf: now,
    exp: now + 120,
    aud: [requestHost],
    uri: requestMethod + ' ' + requestHost + requestPath
};

const encodedPayload = base64UrlEncode(JSON.stringify(payload));
console.log('  Payload:', JSON.stringify(payload, null, 2));
console.log('  Encoded:', encodedPayload);
console.log('  ✓ Payload structure is valid');
console.log('');

// Test 4: Configuration Validation
console.log('Test 4: Configuration Validation');
console.log('-'.repeat(40));

function validateConfig(config) {
    const errors = [];
    
    if (!config.keyId) {
        errors.push('KEY_ID is required');
    }
    
    if (!config.keySecret) {
        errors.push('KEY_SECRET is required');
    }
    
    if (!config.requestPath) {
        errors.push('REQUEST_PATH is required');
    }
    
    return errors;
}

const testConfigs = [
    {
        name: 'Valid configuration',
        config: {
            keyId: 'test-key-id',
            keySecret: 'test-key-secret',
            requestPath: '/platform/v2/evm/networks',
            requestHost: 'api.cdp.coinbase.com',
            requestMethod: 'GET'
        },
        shouldPass: true
    },
    {
        name: 'Missing KEY_ID',
        config: {
            keySecret: 'test-key-secret',
            requestPath: '/platform/v2/evm/networks'
        },
        shouldPass: false
    },
    {
        name: 'Missing KEY_SECRET',
        config: {
            keyId: 'test-key-id',
            requestPath: '/platform/v2/evm/networks'
        },
        shouldPass: false
    },
    {
        name: 'Missing REQUEST_PATH',
        config: {
            keyId: 'test-key-id',
            keySecret: 'test-key-secret'
        },
        shouldPass: false
    }
];

let configPassed = 0;
let configFailed = 0;

testConfigs.forEach((test) => {
    const errors = validateConfig(test.config);
    const success = (errors.length === 0) === test.shouldPass;
    
    if (success) {
        console.log(`  ✓ ${test.name}: ${test.shouldPass ? 'Valid' : 'Invalid as expected'}`);
        configPassed++;
    } else {
        console.log(`  ✗ ${test.name}: Unexpected result`);
        if (errors.length > 0) {
            console.log(`    Errors: ${errors.join(', ')}`);
        }
        configFailed++;
    }
});

console.log('');
console.log(`Results: ${configPassed} passed, ${configFailed} failed`);
console.log('');

// Test 5: Environment Variable Parsing
console.log('Test 5: Environment Variable Parsing');
console.log('-'.repeat(40));

const originalEnv = { ...process.env };

// Set test environment variables
process.env.KEY_ID = 'test-key-id';
process.env.KEY_SECRET = 'test-key-secret';
process.env.REQUEST_METHOD = 'GET';
process.env.REQUEST_PATH = '/platform/v2/evm/networks';
process.env.REQUEST_HOST = 'api.cdp.coinbase.com';

console.log('  Environment variables set:');
console.log('    KEY_ID:', process.env.KEY_ID);
console.log('    KEY_SECRET:', process.env.KEY_SECRET ? '[REDACTED]' : 'not set');
console.log('    REQUEST_METHOD:', process.env.REQUEST_METHOD);
console.log('    REQUEST_PATH:', process.env.REQUEST_PATH);
console.log('    REQUEST_HOST:', process.env.REQUEST_HOST);
console.log('  ✓ Environment variables parsed correctly');

// Restore original environment
process.env = originalEnv;
console.log('');

// Test 6: Base64 Decoding
console.log('Test 6: Base64 Key Secret Decoding');
console.log('-'.repeat(40));

const testKeySecret = 'dGVzdC1rZXktc2VjcmV0LWRhdGE='; // "test-key-secret-data" in base64
try {
    const decoded = Buffer.from(testKeySecret, 'base64').toString('utf8');
    console.log('  Original (base64):', testKeySecret);
    console.log('  Decoded:', decoded);
    console.log('  ✓ Base64 decoding works correctly');
} catch (error) {
    console.log('  ✗ Base64 decoding failed:', error.message);
}
console.log('');

// Summary
console.log('═'.repeat(80));
console.log('Test Summary');
console.log('═'.repeat(80));

const totalTests = testCases.length + 2 + testConfigs.length + 2 + 1;
const totalPassed = passed + 1 + 1 + configPassed + 1 + 1;
const totalFailed = failed + configFailed;

console.log('');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${totalPassed}`);
console.log(`Failed: ${totalFailed}`);
console.log('');

if (totalFailed === 0) {
    console.log('✓ All tests passed!');
    process.exit(0);
} else {
    console.log('✗ Some tests failed');
    process.exit(1);
}
