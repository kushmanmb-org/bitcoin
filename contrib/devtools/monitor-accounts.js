#!/usr/bin/env node

// Copyright (c) 2026 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or https://opensource.org/license/mit.

/**
 * Monitor Ethereum Accounts - Continuous account monitoring tool
 * 
 * This script continuously monitors one or more Ethereum accounts for:
 * - ERC20 token balance changes
 * - New token transfer transactions
 * - Account activity updates
 * 
 * Usage:
 *   ETHERSCAN_API_KEY=your_api_key node monitor-accounts.js ADDRESS1 [ADDRESS2 ...]
 * 
 * Environment Variables:
 *   ETHERSCAN_API_KEY - Required. Your Etherscan API key
 *   POLL_INTERVAL     - Optional. Polling interval in seconds (default: 60)
 * 
 * Examples:
 *   ETHERSCAN_API_KEY=ABC123 node monitor-accounts.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
 *   POLL_INTERVAL=30 ETHERSCAN_API_KEY=ABC123 node monitor-accounts.js 0xAddress1 0xAddress2
 */

const https = require('https');

// Configuration
const BASE_URL = 'api.etherscan.io';
const API_PATH = '/v2/api';
const CHAIN_ID = '1'; // Ethereum mainnet
const DEFAULT_POLL_INTERVAL = 60; // seconds

/**
 * Fetch data from Etherscan API
 * @param {Object} params - Query parameters for the API
 * @returns {Promise<Object>} - Parsed JSON response
 */
function fetchEtherscanAPI(params) {
    return new Promise((resolve, reject) => {
        // Add chainid for V2 API
        const allParams = { chainid: CHAIN_ID, ...params };
        
        // Build query string
        const queryString = Object.keys(allParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
            .join('&');
        
        const options = {
            hostname: BASE_URL,
            path: `${API_PATH}?${queryString}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Bitcoin-Core-Account-Monitor/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

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

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

/**
 * Format Wei value to ETH
 * @param {string} wei - Value in Wei
 * @returns {string} - Formatted value in ETH
 */
function weiToEth(wei) {
    if (!wei) return '0.000000';
    const ethValue = parseFloat(wei) / 1e18;
    return ethValue.toFixed(6);
}

/**
 * Format token value
 * @param {string} value - Value in smallest unit
 * @param {string} decimals - Token decimals
 * @returns {string} - Formatted value
 */
function formatTokenValue(value, decimals) {
    if (!value || !decimals) return value || '0';
    
    const decimalNum = parseInt(decimals);
    const valueStr = value.toString();
    
    if (valueStr.length <= decimalNum) {
        const padding = '0'.repeat(decimalNum - valueStr.length);
        return '0.' + padding + valueStr;
    } else {
        const integerPart = valueStr.slice(0, -decimalNum);
        const decimalPart = valueStr.slice(-decimalNum);
        return integerPart + '.' + decimalPart;
    }
}

/**
 * Get ETH balance for an address
 * @param {string} address - Ethereum address
 * @param {string} apiKey - Etherscan API key
 * @returns {Promise<string>} - Balance in ETH
 */
async function getEthBalance(address, apiKey) {
    const params = {
        module: 'account',
        action: 'balance',
        address: address,
        tag: 'latest',
        apikey: apiKey
    };

    try {
        const response = await fetchEtherscanAPI(params);
        if (response.status === '1' && response.result) {
            return weiToEth(response.result);
        }
        return '0';
    } catch (error) {
        return 'Error';
    }
}

/**
 * Get token transfer transactions
 * @param {string} address - Ethereum address
 * @param {string} apiKey - Etherscan API key
 * @param {number} limit - Number of recent transactions to fetch
 * @returns {Promise<Array>} - Array of transactions
 */
async function getTokenTransfers(address, apiKey, limit = 10) {
    const params = {
        module: 'account',
        action: 'tokentx',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: limit,
        sort: 'desc',
        apikey: apiKey
    };

    try {
        const response = await fetchEtherscanAPI(params);
        if (response.status === '1' && response.result && Array.isArray(response.result)) {
            return response.result;
        }
        return [];
    } catch (error) {
        return [];
    }
}

/**
 * Account monitor class
 */
class AccountMonitor {
    constructor(addresses, apiKey, pollInterval) {
        this.addresses = addresses;
        this.apiKey = apiKey;
        this.pollInterval = pollInterval * 1000; // Convert to milliseconds
        this.accountData = new Map();
        this.lastUpdateTime = null;
        this.updateCount = 0;
    }

    /**
     * Initialize account data
     */
    async initialize() {
        console.log('Initializing account monitor...');
        console.log('═'.repeat(80));
        console.log(`Monitoring ${this.addresses.length} address(es)`);
        console.log(`Poll interval: ${this.pollInterval / 1000} seconds`);
        console.log('═'.repeat(80));
        console.log('');

        for (const address of this.addresses) {
            this.accountData.set(address, {
                ethBalance: '0',
                lastTxHash: null,
                tokenTransfers: [],
                error: null
            });
        }

        await this.updateAll();
    }

    /**
     * Update all monitored accounts
     */
    async updateAll() {
        this.updateCount++;
        this.lastUpdateTime = new Date();

        for (const address of this.addresses) {
            await this.updateAccount(address);
        }

        this.display();
    }

    /**
     * Update single account data
     * @param {string} address - Ethereum address
     */
    async updateAccount(address) {
        try {
            const [ethBalance, tokenTransfers] = await Promise.all([
                getEthBalance(address, this.apiKey),
                getTokenTransfers(address, this.apiKey, 5)
            ]);

            const data = this.accountData.get(address);
            
            // Check for new transactions
            const newTxHash = tokenTransfers.length > 0 ? tokenTransfers[0].hash : null;
            const hasNewTx = newTxHash && newTxHash !== data.lastTxHash;

            this.accountData.set(address, {
                ethBalance,
                lastTxHash: newTxHash,
                tokenTransfers,
                error: null,
                hasNewTx
            });
        } catch (error) {
            const data = this.accountData.get(address);
            data.error = error.message;
            this.accountData.set(address, data);
        }
    }

    /**
     * Display current account status
     */
    display() {
        // Clear console
        console.clear();

        // Header
        console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                        Ethereum Account Monitor                                ║');
        console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`Last Update: ${this.lastUpdateTime.toISOString()}`);
        console.log(`Update Count: ${this.updateCount}`);
        console.log(`Next update in: ${this.pollInterval / 1000} seconds`);
        console.log('');
        console.log('Press Ctrl+C to stop monitoring');
        console.log('─'.repeat(80));
        console.log('');

        // Display each account
        for (const [address, data] of this.accountData) {
            this.displayAccount(address, data);
        }
    }

    /**
     * Display single account information
     * @param {string} address - Ethereum address
     * @param {Object} data - Account data
     */
    displayAccount(address, data) {
        console.log('═'.repeat(80));
        console.log(`Address: ${address}`);
        
        if (data.error) {
            console.log(`  Status: ❌ Error - ${data.error}`);
        } else {
            console.log(`  ETH Balance: ${data.ethBalance} ETH`);
            
            if (data.hasNewTx) {
                console.log('  Status: 🔔 NEW TRANSACTION DETECTED!');
            } else {
                console.log('  Status: ✓ Monitoring');
            }

            if (data.tokenTransfers.length > 0) {
                console.log('');
                console.log('  Recent Token Transfers:');
                console.log('  ' + '─'.repeat(76));

                data.tokenTransfers.slice(0, 5).forEach((tx, index) => {
                    const formattedValue = formatTokenValue(tx.value, tx.tokenDecimal);
                    const timestamp = new Date(parseInt(tx.timeStamp) * 1000);
                    const direction = tx.to.toLowerCase() === address.toLowerCase() ? '⬇ IN ' : '⬆ OUT';
                    
                    console.log(`  ${index + 1}. ${direction} | ${formattedValue} ${tx.tokenSymbol}`);
                    console.log(`     Block: ${tx.blockNumber} | ${timestamp.toISOString()}`);
                    console.log(`     Hash: ${tx.hash.substring(0, 20)}...`);
                    console.log('');
                });
            } else {
                console.log('  No token transfers found');
            }
        }

        console.log('');
    }

    /**
     * Start monitoring loop
     */
    async start() {
        await this.initialize();

        // Set up periodic updates
        setInterval(async () => {
            await this.updateAll();
        }, this.pollInterval);
    }
}

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid
 */
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
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
        console.error('  ETHERSCAN_API_KEY=your_api_key node monitor-accounts.js ADDRESS1 [ADDRESS2 ...]');
        console.error('');
        console.error('Get your API key at: https://etherscan.io/myapikey');
        process.exit(1);
    }

    // Get addresses from command line
    const addresses = process.argv.slice(2);
    if (addresses.length === 0) {
        console.error('Error: At least one Ethereum address is required');
        console.error('');
        console.error('Usage:');
        console.error('  ETHERSCAN_API_KEY=your_api_key node monitor-accounts.js ADDRESS1 [ADDRESS2 ...]');
        console.error('');
        console.error('Example:');
        console.error('  ETHERSCAN_API_KEY=ABC123 node monitor-accounts.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
        process.exit(1);
    }

    // Validate addresses
    for (const address of addresses) {
        if (!isValidAddress(address)) {
            console.error(`Error: Invalid Ethereum address format: ${address}`);
            console.error('Expected format: 0x followed by 40 hexadecimal characters');
            process.exit(1);
        }
    }

    // Get poll interval
    const pollInterval = parseInt(process.env.POLL_INTERVAL || DEFAULT_POLL_INTERVAL);
    if (isNaN(pollInterval) || pollInterval < 10) {
        console.error('Error: POLL_INTERVAL must be at least 10 seconds');
        process.exit(1);
    }

    // Create and start monitor
    const monitor = new AccountMonitor(addresses, apiKey, pollInterval);
    
    try {
        await monitor.start();
    } catch (error) {
        console.error('');
        console.error('Fatal error:');
        console.error(`  ${error.message}`);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
}

// Export for testing
module.exports = { formatTokenValue, weiToEth, isValidAddress };
