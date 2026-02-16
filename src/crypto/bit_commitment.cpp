// Copyright (c) 2026-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <crypto/bit_commitment.h>
#include <crypto/sha256.h>

#include <cassert>

std::vector<std::vector<uint8_t>> generate_bit_commitments(
    const std::vector<uint8_t>& bits,
    const std::vector<uint8_t>& nonce)
{
    std::vector<std::vector<uint8_t>> commitments;
    commitments.reserve(bits.size());

    for (size_t i = 0; i < bits.size(); ++i) {
        // Validate bit value
        assert(bits[i] == 0 || bits[i] == 1);

        // Create commitment: SHA256(nonce || index || bit)
        CSHA256 hasher;
        
        // Write nonce
        hasher.Write(nonce.data(), nonce.size());
        
        // Write index (8 bytes, little-endian)
        uint64_t index = i;
        hasher.Write(reinterpret_cast<const uint8_t*>(&index), sizeof(index));
        
        // Write bit value
        hasher.Write(&bits[i], 1);
        
        // Finalize commitment
        std::vector<uint8_t> commitment(CSHA256::OUTPUT_SIZE);
        hasher.Finalize(commitment.data());
        
        commitments.push_back(std::move(commitment));
    }

    return commitments;
}

bool verify_bit_commitment(
    const std::vector<uint8_t>& commitment,
    uint8_t bit,
    const std::vector<uint8_t>& nonce,
    size_t index)
{
    // Validate inputs
    if (commitment.size() != CSHA256::OUTPUT_SIZE) {
        return false;
    }
    if (bit != 0 && bit != 1) {
        return false;
    }

    // Recompute commitment
    CSHA256 hasher;
    
    // Write nonce
    hasher.Write(nonce.data(), nonce.size());
    
    // Write index (8 bytes, little-endian)
    uint64_t idx = index;
    hasher.Write(reinterpret_cast<const uint8_t*>(&idx), sizeof(idx));
    
    // Write bit value
    hasher.Write(&bit, 1);
    
    // Finalize and compare
    uint8_t computed[CSHA256::OUTPUT_SIZE];
    hasher.Finalize(computed);
    
    // Constant-time comparison
    uint8_t diff = 0;
    for (size_t i = 0; i < CSHA256::OUTPUT_SIZE; ++i) {
        diff |= (commitment[i] ^ computed[i]);
    }
    
    return diff == 0;
}
