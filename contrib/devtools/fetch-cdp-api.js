#!/usr/bin/env node

// Copyright (c) 2026 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or https://opensource.org/license/mit.

/**
 * Coinbase Developer Platform (CDP) API Client
 * 
 * This script provides authentication and request functionality for the
 * Coinbase Developer Platform API, supporting token balance queries and
 * other EVM-related operations.
 * 
 * Authentication:
 *   The CDP API uses JWT (JSON Web Token) authentication with ES256 algorithm.
 *   Requires KEY_ID (API key name) and KEY_SECRET (PEM-encoded private key).
 * 
 * Usage:
 *   export KEY_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *   export KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=="
 *   export REQUEST_METHOD="GET"
 *   export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c"
 *   export REQUEST_HOST="api.cdp.coinbase.com"
 *   
 *   node contrib/devtools/fetch-cdp-api.js
 * 
 * Alternative - Direct CLI arguments:
 *   node contrib/devtools/fetch-cdp-api.js \
 *     --key-id "your-key-id" \
 *     --key-secret "your-key-secret" \
 *     --method GET \
 *     --path "/platform/v2/evm/token-balances/base-sepolia/0x..." \
 *     --host "api.cdp.coinbase.com"
 * 
 * Environment Variables:
 *   KEY_ID          - Required. CDP API Key ID (UUID format)
 *   KEY_SECRET      - Required. CDP API Key Secret (PEM private key, base64 encoded)
 *   REQUEST_METHOD  - Optional. HTTP method (default: GET)
 *   REQUEST_PATH    - Required. API endpoint path
 *   REQUEST_HOST    - Optional. API host (default: api.cdp.coinbase.com)
 * 
 * Examples:
 *   # Get token balances for an address on Base Sepolia testnet
 *   export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x8fddcc0c5c993a1968b46787919cc34577d6dc5c"
 *   node contrib/devtools/fetch-cdp-api.js
 * 
 *   # Get network information
 *   export REQUEST_PATH="/platform/v2/evm/networks"
 *   node contrib/devtools/fetch-cdp-api.js
 */

const https = require('https');
const crypto = require('crypto');

// Configuration from environment variables or defaults
const CONFIG = {
    keyId: process.env.KEY_ID,
    keySecret: process.env.KEY_SECRET,
    requestMethod: process.env.REQUEST_METHOD || 'GET',
    requestPath: process.env.REQUEST_PATH,
    requestHost: process.env.REQUEST_HOST || 'api.cdp.coinbase.com'
};

/**
 * Parse command line arguments
 * @returns {Object} - Parsed configuration
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const config = { ...CONFIG };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];
        
        switch (arg) {
            case '--key-id':
                config.keyId = nextArg;
                i++;
                break;
            case '--key-secret':
                config.keySecret = nextArg;
                i++;
                break;
            case '--method':
                config.requestMethod = nextArg;
                i++;
                break;
            case '--path':
                config.requestPath = nextArg;
                i++;
                break;
            case '--host':
                config.requestHost = nextArg;
                i++;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
        }
    }
    
    return config;
}

/**
 * Print help message
 */
function printHelp() {
    console.log(`
Coinbase Developer Platform (CDP) API Client

Usage:
  node fetch-cdp-api.js [options]

Options:
  --key-id <id>        CDP API Key ID (or set KEY_ID env var)
  --key-secret <key>   CDP API Key Secret (or set KEY_SECRET env var)
  --method <method>    HTTP method (default: GET)
  --path <path>        API endpoint path (required)
  --host <host>        API host (default: api.cdp.coinbase.com)
  --help, -h           Show this help message

Environment Variables:
  KEY_ID               CDP API Key ID
  KEY_SECRET           CDP API Key Secret (base64-encoded PEM private key)
  REQUEST_METHOD       HTTP method (default: GET)
  REQUEST_PATH         API endpoint path
  REQUEST_HOST         API host (default: api.cdp.coinbase.com)

Examples:
  # Using environment variables
  export KEY_ID="your-key-id"
  export KEY_SECRET="your-key-secret"
  export REQUEST_PATH="/platform/v2/evm/token-balances/base-sepolia/0x..."
  node fetch-cdp-api.js

  # Using command line arguments
  node fetch-cdp-api.js \\
    --key-id "your-key-id" \\
    --key-secret "your-key-secret" \\
    --path "/platform/v2/evm/token-balances/base-sepolia/0x..."
`);
}

/**
 * Validate configuration
 * @param {Object} config - Configuration object
 * @throws {Error} - If configuration is invalid
 */
function validateConfig(config) {
    const errors = [];
    
    if (!config.keyId) {
        errors.push('KEY_ID is required (set KEY_ID env var or use --key-id)');
    }
    
    if (!config.keySecret) {
        errors.push('KEY_SECRET is required (set KEY_SECRET env var or use --key-secret)');
    }
    
    if (!config.requestPath) {
        errors.push('REQUEST_PATH is required (set REQUEST_PATH env var or use --path)');
    }
    
    if (errors.length > 0) {
        throw new Error('Configuration errors:\n  - ' + errors.join('\n  - '));
    }
}

/**
 * Build JWT token for CDP API authentication
 * @param {Object} config - Configuration object
 * @returns {string} - JWT token
 */
function buildJWT(config) {
    const { keyId, keySecret, requestMethod, requestPath } = config;
    
    // Decode the base64-encoded private key
    let privateKeyPEM;
    try {
        // If the key secret looks like base64 (no PEM headers), decode it
        if (!keySecret.includes('-----BEGIN')) {
            const decodedKey = Buffer.from(keySecret, 'base64').toString('utf8');
            privateKeyPEM = decodedKey;
        } else {
            privateKeyPEM = keySecret;
        }
    } catch (error) {
        throw new Error(`Failed to decode KEY_SECRET: ${error.message}`);
    }
    
    // JWT Header
    const header = {
        alg: 'ES256',
        typ: 'JWT',
        kid: keyId,
        nonce: crypto.randomBytes(16).toString('hex')
    };
    
    // JWT Payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: keyId,
        iss: 'coinbase-cloud',
        nbf: now,
        exp: now + 120, // Token valid for 2 minutes
        aud: [requestHost],
        uri: requestMethod + ' ' + requestHost + requestPath
    };
    
    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    // Create signature
    const signatureInput = encodedHeader + '.' + encodedPayload;
    
    try {
        const sign = crypto.createSign('SHA256');
        sign.update(signatureInput);
        sign.end();
        
        const signature = sign.sign(privateKeyPEM);
        const encodedSignature = base64UrlEncode(signature);
        
        // Build final JWT
        return signatureInput + '.' + encodedSignature;
    } catch (error) {
        throw new Error(`Failed to sign JWT: ${error.message}\nMake sure KEY_SECRET is a valid EC private key in PEM format.`);
    }
}

/**
 * Base64 URL encode
 * @param {string|Buffer} data - Data to encode
 * @returns {string} - Base64 URL encoded string
 */
function base64UrlEncode(data) {
    if (typeof data === 'string') {
        data = Buffer.from(data);
    }
    return data.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Make authenticated request to CDP API
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} - API response
 */
function makeRequest(config) {
    return new Promise((resolve, reject) => {
        try {
            // Generate JWT token
            const jwt = buildJWT(config);
            
            const options = {
                hostname: config.requestHost,
                path: config.requestPath,
                method: config.requestMethod,
                headers: {
                    'Authorization': 'Bearer ' + jwt,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Bitcoin-Core-CDP-Client/1.0'
                }
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const result = {
                            statusCode: res.statusCode,
                            statusMessage: res.statusMessage,
                            headers: res.headers,
                            body: data
                        };
                        
                        // Try to parse as JSON
                        try {
                            result.json = JSON.parse(data);
                        } catch (e) {
                            // Not JSON, keep as string
                        }
                        
                        resolve(result);
                    } catch (error) {
                        reject(new Error(`Failed to process response: ${error.message}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(new Error(`Request failed: ${error.message}`));
            });
            
            req.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Format and print the response
 * @param {Object} response - Response object
 */
function printResponse(response) {
    console.log('CDP API Response');
    console.log('═'.repeat(80));
    console.log('');
    console.log(`Status: ${response.statusCode} ${response.statusMessage}`);
    console.log('');
    
    if (response.statusCode === 200) {
        console.log('Response Body:');
        console.log('-'.repeat(80));
        if (response.json) {
            console.log(JSON.stringify(response.json, null, 2));
        } else {
            console.log(response.body);
        }
    } else {
        console.log('Error Response:');
        console.log('-'.repeat(80));
        console.log(response.body);
    }
    
    console.log('');
}

/**
 * Main function
 */
async function main() {
    try {
        // Parse arguments and validate config
        const config = parseArguments();
        validateConfig(config);
        
        console.log('Coinbase Developer Platform (CDP) API Client');
        console.log('═'.repeat(80));
        console.log('');
        console.log('Configuration:');
        console.log(`  Host:   ${config.requestHost}`);
        console.log(`  Method: ${config.requestMethod}`);
        console.log(`  Path:   ${config.requestPath}`);
        console.log(`  Key ID: ${config.keyId.substring(0, 8)}...`);
        console.log('');
        console.log('Making authenticated request...');
        console.log('');
        
        // Make the request
        const response = await makeRequest(config);
        
        // Print the response
        printResponse(response);
        
        // Exit with appropriate code
        process.exit(response.statusCode === 200 ? 0 : 1);
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('');
        console.error('Run with --help for usage information.');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

// Export functions for testing
module.exports = {
    buildJWT,
    makeRequest,
    base64UrlEncode
};
