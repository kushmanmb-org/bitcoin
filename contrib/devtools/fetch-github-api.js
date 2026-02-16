#!/usr/bin/env node

// Copyright (c) 2026 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or https://opensource.org/license/mit.

/**
 * GitHub API Client with OAuth Support
 * 
 * This script provides authentication and request functionality for the
 * GitHub API, supporting OAuth access tokens and various GitHub operations.
 * 
 * Authentication:
 *   The GitHub API supports multiple authentication methods:
 *   - OAuth access tokens (recommended for user-specific actions)
 *   - Personal Access Tokens (PAT) for automated scripts
 *   - GitHub App tokens for application integrations
 * 
 * Usage:
 *   export GITHUB_TOKEN="gho_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *   export REQUEST_METHOD="GET"
 *   export REQUEST_PATH="/user"
 *   export REQUEST_HOST="api.github.com"
 *   
 *   node contrib/devtools/fetch-github-api.js
 * 
 * Alternative - Direct CLI arguments:
 *   node contrib/devtools/fetch-github-api.js \
 *     --token "gho_xxxxx" \
 *     --method GET \
 *     --path "/user" \
 *     --host "api.github.com"
 * 
 * Environment Variables:
 *   GITHUB_TOKEN     - Required. GitHub OAuth token or Personal Access Token
 *   REQUEST_METHOD   - Optional. HTTP method (default: GET)
 *   REQUEST_PATH     - Required. API endpoint path (e.g., /user, /repos/owner/repo)
 *   REQUEST_HOST     - Optional. API host (default: api.github.com)
 *   REQUEST_BODY     - Optional. Request body for POST/PUT/PATCH requests (JSON string)
 * 
 * Examples:
 *   # Get authenticated user information
 *   export GITHUB_TOKEN="gho_xxxxx"
 *   export REQUEST_PATH="/user"
 *   node contrib/devtools/fetch-github-api.js
 * 
 *   # List repositories for authenticated user
 *   export REQUEST_PATH="/user/repos"
 *   node contrib/devtools/fetch-github-api.js
 * 
 *   # Get repository information
 *   export REQUEST_PATH="/repos/bitcoin/bitcoin"
 *   node contrib/devtools/fetch-github-api.js
 * 
 * OAuth Token Response Format:
 *   When using GitHub OAuth flow, the token response follows this format:
 *   {
 *     "access_token": "gho_16C7e42F292c6912E7710c838347Ae178B4a",
 *     "token_type": "bearer",
 *     "scope": "repo,gist"
 *   }
 */

const https = require('https');

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const config = {
        token: process.env.GITHUB_TOKEN,
        method: process.env.REQUEST_METHOD || 'GET',
        path: process.env.REQUEST_PATH,
        host: process.env.REQUEST_HOST || 'api.github.com',
        body: process.env.REQUEST_BODY
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--token':
                config.token = args[++i];
                break;
            case '--method':
                config.method = args[++i];
                break;
            case '--path':
                config.path = args[++i];
                break;
            case '--host':
                config.host = args[++i];
                break;
            case '--body':
                config.body = args[++i];
                break;
            case '--help':
            case '-h':
                console.log('GitHub API Client - Usage:');
                console.log('  --token <token>    GitHub OAuth or Personal Access Token');
                console.log('  --method <method>  HTTP method (GET, POST, PUT, PATCH, DELETE)');
                console.log('  --path <path>      API endpoint path');
                console.log('  --host <host>      API host (default: api.github.com)');
                console.log('  --body <json>      Request body (JSON string)');
                process.exit(0);
        }
    }

    return config;
}

/**
 * Validate configuration
 */
function validateConfig(config) {
    if (!config.token) {
        console.error('Error: GITHUB_TOKEN is required');
        console.error('Set it via environment variable or --token argument');
        process.exit(1);
    }

    if (!config.path) {
        console.error('Error: REQUEST_PATH is required');
        console.error('Set it via environment variable or --path argument');
        process.exit(1);
    }

    // Validate token format (basic check)
    if (!config.token.match(/^(gho_|ghp_|ghs_|ghu_|ghr_)/)) {
        console.warn('Warning: Token does not match expected GitHub token format');
        console.warn('Expected format: gho_* (OAuth), ghp_* (PAT), ghs_* (Server), ghu_* (User), ghr_* (Refresh)');
    }
}

/**
 * Make GitHub API request
 */
function makeRequest(config) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: config.host,
            port: 443,
            path: config.path,
            method: config.method,
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${config.token}`,
                'User-Agent': 'Bitcoin-Core-DevTools/1.0',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        };

        // Add Content-Type header for POST/PUT/PATCH requests
        if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(config.body);
        }

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data ? JSON.parse(data) : null
                    };
                    resolve(response);
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        // Send request body if provided
        if (config.body) {
            req.write(config.body);
        }

        req.end();
    });
}

/**
 * Format and display response
 */
function displayResponse(response) {
    console.log('\n=== GitHub API Response ===');
    console.log(`Status: ${response.statusCode}`);
    console.log('\nHeaders:');
    console.log(JSON.stringify(response.headers, null, 2));
    console.log('\nBody:');
    console.log(JSON.stringify(response.body, null, 2));
    console.log('\n=========================\n');

    // Display rate limit information if available
    if (response.headers['x-ratelimit-limit']) {
        console.log('Rate Limit Information:');
        console.log(`  Limit: ${response.headers['x-ratelimit-limit']}`);
        console.log(`  Remaining: ${response.headers['x-ratelimit-remaining']}`);
        console.log(`  Reset: ${new Date(response.headers['x-ratelimit-reset'] * 1000).toISOString()}`);
        console.log();
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        const config = parseArgs();
        validateConfig(config);

        console.log('GitHub API Request:');
        console.log(`  Method: ${config.method}`);
        console.log(`  Host: ${config.host}`);
        console.log(`  Path: ${config.path}`);
        console.log(`  Token: ${config.token.substring(0, 10)}...`);
        if (config.body) {
            console.log(`  Body: ${config.body.substring(0, 100)}${config.body.length > 100 ? '...' : ''}`);
        }
        console.log();

        const response = await makeRequest(config);
        displayResponse(response);

        // Exit with appropriate code
        if (response.statusCode >= 200 && response.statusCode < 300) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { makeRequest, parseArgs, validateConfig };
