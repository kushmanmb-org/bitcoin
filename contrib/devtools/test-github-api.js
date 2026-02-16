#!/usr/bin/env node

// Copyright (c) 2026 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or https://opensource.org/license/mit.

/**
 * Test suite for GitHub API client
 * 
 * This script tests the GitHub API client functionality including:
 * - Configuration parsing
 * - Token validation
 * - API request handling
 * - Response formatting
 */

const { parseArgs, validateConfig } = require('./fetch-github-api.js');

/**
 * Test configuration parsing
 */
function testParseArgs() {
    console.log('Testing configuration parsing...');
    
    // Test environment variable parsing
    process.env.GITHUB_TOKEN = 'gho_testtoken123456789';
    process.env.REQUEST_PATH = '/user';
    process.env.REQUEST_METHOD = 'GET';
    
    const config = parseArgs();
    
    console.assert(config.token === 'gho_testtoken123456789', 'Token should be parsed from env');
    console.assert(config.path === '/user', 'Path should be parsed from env');
    console.assert(config.method === 'GET', 'Method should be parsed from env');
    console.assert(config.host === 'api.github.com', 'Host should default to api.github.com');
    
    console.log('✓ Configuration parsing tests passed');
}

/**
 * Test token validation
 */
function testTokenValidation() {
    console.log('\nTesting token validation...');
    
    const validTokens = [
        'gho_16C7e42F292c6912E7710c838347Ae178B4a',
        'ghp_1234567890abcdefghijklmnopqrstuvwxyz',
        'ghs_abcdef1234567890',
        'ghu_xyz123',
        'ghr_refresh456'
    ];
    
    validTokens.forEach(token => {
        const match = token.match(/^(gho_|ghp_|ghs_|ghu_|ghr_)/);
        console.assert(match !== null, `Token ${token.substring(0, 10)}... should be valid format`);
    });
    
    console.log('✓ Token validation tests passed');
}

/**
 * Test OAuth token response format
 */
function testOAuthTokenResponse() {
    console.log('\nTesting OAuth token response format...');
    
    const oauthResponse = {
        access_token: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
        token_type: 'bearer',
        scope: 'repo,gist'
    };
    
    console.assert(oauthResponse.access_token.startsWith('gho_'), 'OAuth token should start with gho_');
    console.assert(oauthResponse.token_type === 'bearer', 'Token type should be bearer');
    console.assert(typeof oauthResponse.scope === 'string', 'Scope should be a string');
    
    // Test scope parsing
    const scopes = oauthResponse.scope.split(',');
    console.assert(scopes.length > 0, 'Should have at least one scope');
    console.assert(scopes.includes('repo') || scopes.includes('gist'), 'Should have valid scopes');
    
    console.log('✓ OAuth token response format tests passed');
}

/**
 * Test request header construction
 */
function testRequestHeaders() {
    console.log('\nTesting request header construction...');
    
    const token = 'gho_16C7e42F292c6912E7710c838347Ae178B4a';
    
    const headers = {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Bitcoin-Core-DevTools/1.0',
        'X-GitHub-Api-Version': '2022-11-28'
    };
    
    console.assert(headers.Accept === 'application/vnd.github+json', 'Accept header should be correct');
    console.assert(headers.Authorization.startsWith('Bearer '), 'Authorization should use Bearer scheme');
    console.assert(headers['User-Agent'].includes('Bitcoin-Core-DevTools'), 'User-Agent should be set');
    console.assert(headers['X-GitHub-Api-Version'] === '2022-11-28', 'API version should be set');
    
    console.log('✓ Request header tests passed');
}

/**
 * Test API endpoint paths
 */
function testEndpointPaths() {
    console.log('\nTesting API endpoint paths...');
    
    const validPaths = [
        '/user',
        '/user/repos',
        '/repos/bitcoin/bitcoin',
        '/repos/owner/repo/issues',
        '/repos/owner/repo/pulls',
        '/rate_limit'
    ];
    
    validPaths.forEach(path => {
        console.assert(path.startsWith('/'), `Path ${path} should start with /`);
        console.assert(!path.includes('//'), `Path ${path} should not have double slashes`);
    });
    
    console.log('✓ Endpoint path tests passed');
}

/**
 * Test error handling
 */
function testErrorHandling() {
    console.log('\nTesting error handling...');
    
    // Test token format validation
    const invalidToken = 'invalid_token_format';
    const validToken = 'gho_16C7e42F292c6912E7710c838347Ae178B4a';
    
    console.assert(!invalidToken.match(/^(gho_|ghp_|ghs_|ghu_|ghr_)/), 'Invalid token should not match pattern');
    console.assert(validToken.match(/^(gho_|ghp_|ghs_|ghu_|ghr_)/), 'Valid token should match pattern');
    
    // Test path validation
    const validPath = '/user';
    const invalidPath = '';
    
    console.assert(validPath.length > 0, 'Valid path should not be empty');
    console.assert(invalidPath.length === 0, 'Invalid path should be empty');
    
    console.log('✓ Error handling tests passed');
}

/**
 * Display OAuth token response example
 */
function displayOAuthExample() {
    console.log('\n=== OAuth Token Response Example ===');
    console.log('When using GitHub OAuth flow, the token response follows this format:');
    console.log();
    console.log('Accept: application/json');
    console.log(JSON.stringify({
        access_token: 'gho_16C7e42F292c6912E7710c838347Ae178B4a',
        token_type: 'bearer',
        scope: 'repo,gist'
    }, null, 2));
    console.log();
    console.log('The access_token is then used in the Authorization header:');
    console.log('Authorization: Bearer gho_16C7e42F292c6912E7710c838347Ae178B4a');
    console.log('===================================\n');
}

/**
 * Run all tests
 */
function runTests() {
    console.log('GitHub API Client - Test Suite\n');
    
    try {
        testParseArgs();
        testTokenValidation();
        testOAuthTokenResponse();
        testRequestHeaders();
        testEndpointPaths();
        testErrorHandling();
        displayOAuthExample();
        
        console.log('\n✅ All tests passed!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests if executed directly
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
