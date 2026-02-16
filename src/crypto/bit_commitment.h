// Copyright (c) 2026-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#ifndef BITCOIN_CRYPTO_BIT_COMMITMENT_H
#define BITCOIN_CRYPTO_BIT_COMMITMENT_H

#include <cstdint>
#include <vector>

/**
 * Generate cryptographic commitments for individual bits.
 * 
 * This function creates hash-based commitments for a sequence of bits,
 * allowing each bit to be committed to separately while hiding its value
 * until revealed. Uses SHA256 for security.
 * 
 * @param bits Vector of bit values (each element should be 0 or 1)
 * @param nonce Random nonce for unpredictability (32 bytes recommended)
 * @return Vector of commitments, one per bit (each 32 bytes)
 */
std::vector<std::vector<uint8_t>> generate_bit_commitments(
    const std::vector<uint8_t>& bits,
    const std::vector<uint8_t>& nonce);

/**
 * Verify a bit commitment.
 * 
 * @param commitment The commitment to verify (32 bytes)
 * @param bit The revealed bit value (0 or 1)
 * @param nonce The nonce used in commitment
 * @param index The bit index in the original sequence
 * @return true if the commitment matches, false otherwise
 */
bool verify_bit_commitment(
    const std::vector<uint8_t>& commitment,
    uint8_t bit,
    const std::vector<uint8_t>& nonce,
    size_t index);

#endif // BITCOIN_CRYPTO_BIT_COMMITMENT_H
