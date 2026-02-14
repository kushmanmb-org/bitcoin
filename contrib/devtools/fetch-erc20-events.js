#!/usr/bin/env node

// Copyright (c) 2026 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or https://opensource.org/license/mit.

/**
 * Fetch ERC20 Token Transfer Events from Etherscan API
 * 
 * This script fetches ERC20 token transfer events from the Etherscan API,
 * processes the results, and prints transaction details including:
 * - Transaction hash
 * - Block number
 * - Sender address (from)
 * - Recipient address (to)
 * - Token value
 * - Token symbol
 * 
 * Usage:
 *   ETHERSCAN_API_KEY=your_api_key node fetch-erc20-events.js [ADDRESS]
 * 
 * Environment Variables:
 *   ETHERSCAN_API_KEY - Required. Your Etherscan API key
 *   ADDRESS          - Optional. Ethereum address to query (can also be passed as argument)
 * 
 * Examples:
 *   ETHERSCAN_API_KEY=ABC123 node fetch-erc20-events.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
 */

const https = require('https');

// Configuration
const BASE_URL = 'api.etherscan.io';
const API_PATH = '/api';

/**
 * Fetch data from Etherscan API
 * @param {Object} params - Query parameters for the API
 * @returns {Promise<Object>} - Parsed JSON response
 */
function fetchEtherscanAPI(params) {
    return new Promise((resolve, reject) => {
        // Build query string
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        const options = {
            hostname: BASE_URL,
            path: `${API_PATH}?${queryString}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Bitcoin-Core-ERC20-Fetcher/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            // Handle non-200 status codes
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
                return;
            }

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`Failed to parse JSON response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });

        req.end();
    });
}

/**
 * Format Wei value to a readable decimal format
 * @param {string} value - Value in Wei (smallest unit)
 * @param {string} decimals - Token decimals
 * @returns {string} - Formatted value
 */
function formatTokenValue(value, decimals) {
    if (!value || !decimals) return value || '0';
    
    const decimalNum = parseInt(decimals);
    const valueStr = value.toString();
    
    if (valueStr.length <= decimalNum) {
        // Value is less than 1 token
        const padding = '0'.repeat(decimalNum - valueStr.length);
        return '0.' + padding + valueStr;
    } else {
        // Insert decimal point
        const integerPart = valueStr.slice(0, -decimalNum);
        const decimalPart = valueStr.slice(-decimalNum);
        return integerPart + '.' + decimalPart;
    }
}

/**
 * Print transaction details in a formatted manner
 * @param {Object} tx - Transaction object from API response
 */
function printTransaction(tx) {
    const formattedValue = formatTokenValue(tx.value, tx.tokenDecimal);
    
    console.log('─'.repeat(80));
    console.log(`Transaction Hash: ${tx.hash}`);
    console.log(`Block Number:     ${tx.blockNumber}`);
    console.log(`From:             ${tx.from}`);
    console.log(`To:               ${tx.to}`);
    console.log(`Value:            ${formattedValue}`);
    console.log(`Token Symbol:     ${tx.tokenSymbol}`);
    console.log(`Token Name:       ${tx.tokenName}`);
    console.log(`Timestamp:        ${new Date(parseInt(tx.timeStamp) * 1000).toISOString()}`);
}

/**
 * Main function
 */
async function main() {
    // Check for API key
    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) {
        console.error('Error: ETHERSCAN_API_KEY environment variable is required');
        console.error('');
        console.error('Usage:');
        console.error('  ETHERSCAN_API_KEY=your_api_key node fetch-erc20-events.js [ADDRESS]');
        console.error('');
        console.error('Get your API key at: https://etherscan.io/myapikey');
        process.exit(1);
    }

    // Get address from command line or environment variable
    const address = process.argv[2] || process.env.ADDRESS;
    if (!address) {
        console.error('Error: Ethereum address is required');
        console.error('');
        console.error('Usage:');
        console.error('  ETHERSCAN_API_KEY=your_api_key node fetch-erc20-events.js [ADDRESS]');
        console.error('');
        console.error('Example:');
        console.error('  ETHERSCAN_API_KEY=ABC123 node fetch-erc20-events.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
        process.exit(1);
    }

    // Validate address format (basic check)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.error(`Error: Invalid Ethereum address format: ${address}`);
        console.error('Expected format: 0x followed by 40 hexadecimal characters');
        process.exit(1);
    }

    console.log('Fetching ERC20 Token Transfer Events');
    console.log('═'.repeat(80));
    console.log(`Address:  ${address}`);
    console.log(`API:      Etherscan`);
    console.log('═'.repeat(80));
    console.log('');

    try {
        // Fetch token transfer events
        const params = {
            module: 'account',
            action: 'tokentx',
            address: address,
            startblock: 0,
            endblock: 99999999,
            page: 1,
            offset: 100,  // Fetch up to 100 transactions
            sort: 'desc',
            apikey: apiKey
        };

        const response = await fetchEtherscanAPI(params);

        // Check API response status
        if (response.status === '0') {
            if (response.message === 'No transactions found') {
                console.log('No ERC20 token transfers found for this address.');
                console.log('');
                console.log('This could mean:');
                console.log('  - The address has not received or sent any ERC20 tokens');
                console.log('  - The address is new or inactive');
                process.exit(0);
            } else {
                throw new Error(`API Error: ${response.message || response.result}`);
            }
        }

        // Check if result is empty
        if (!response.result || !Array.isArray(response.result) || response.result.length === 0) {
            console.log('No ERC20 token transfers found for this address.');
            process.exit(0);
        }

        // Print summary
        console.log(`Found ${response.result.length} ERC20 token transfer(s)`);
        console.log('');

        // Print each transaction
        response.result.forEach((tx, index) => {
            console.log(`Transaction #${index + 1}:`);
            printTransaction(tx);
            console.log('');
        });

        console.log('═'.repeat(80));
        console.log(`Total: ${response.result.length} transaction(s)`);

    } catch (error) {
        console.error('');
        console.error('Error occurred while fetching token transfer events:');
        console.error(`  ${error.message}`);
        console.error('');
        
        if (error.message.includes('HTTP Error: 401')) {
            console.error('This usually means your API key is invalid or expired.');
            console.error('Please check your ETHERSCAN_API_KEY and try again.');
        } else if (error.message.includes('HTTP Error: 429')) {
            console.error('Rate limit exceeded. Please wait and try again later.');
        } else if (error.message.includes('Request failed')) {
            console.error('Network error. Please check your internet connection.');
        } else if (error.message.includes('Failed to parse JSON')) {
            console.error('Received invalid response from Etherscan API.');
        }
        
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

// Export for testing
module.exports = { fetchEtherscanAPI, formatTokenValue, printTransaction };
