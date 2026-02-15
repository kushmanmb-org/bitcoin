// Copyright (c) 2026-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <crypto/bit_commitment.h>
#include <test/util/random.h>
#include <test/util/setup_common.h>
#include <util/strencodings.h>

#include <boost/test/unit_test.hpp>

BOOST_AUTO_TEST_SUITE(bit_commitment_tests)

BOOST_AUTO_TEST_CASE(basic_commitment)
{
    // Test basic commitment generation and verification
    std::vector<uint8_t> bits = {0, 1, 1, 0, 1};
    std::vector<uint8_t> nonce(32, 0x42); // Simple nonce for testing

    auto commitments = generate_bit_commitments(bits, nonce);

    // Check we got the right number of commitments
    BOOST_CHECK_EQUAL(commitments.size(), bits.size());

    // Check each commitment is the correct size
    for (const auto& commitment : commitments) {
        BOOST_CHECK_EQUAL(commitment.size(), 32u);
    }

    // Verify each commitment
    for (size_t i = 0; i < bits.size(); ++i) {
        BOOST_CHECK(verify_bit_commitment(commitments[i], bits[i], nonce, i));
    }
}

BOOST_AUTO_TEST_CASE(wrong_bit_fails_verification)
{
    // Test that wrong bit value fails verification
    std::vector<uint8_t> bits = {0, 1};
    std::vector<uint8_t> nonce(32, 0x11);

    auto commitments = generate_bit_commitments(bits, nonce);

    // Try to verify with wrong bit values
    BOOST_CHECK(!verify_bit_commitment(commitments[0], 1, nonce, 0)); // Should be 0
    BOOST_CHECK(!verify_bit_commitment(commitments[1], 0, nonce, 1)); // Should be 1
}

BOOST_AUTO_TEST_CASE(wrong_nonce_fails_verification)
{
    // Test that wrong nonce fails verification
    std::vector<uint8_t> bits = {1};
    std::vector<uint8_t> nonce(32, 0xAA);
    std::vector<uint8_t> wrong_nonce(32, 0xBB);

    auto commitments = generate_bit_commitments(bits, nonce);

    // Verify with wrong nonce should fail
    BOOST_CHECK(!verify_bit_commitment(commitments[0], bits[0], wrong_nonce, 0));
}

BOOST_AUTO_TEST_CASE(wrong_index_fails_verification)
{
    // Test that wrong index fails verification
    std::vector<uint8_t> bits = {0, 1, 1};
    std::vector<uint8_t> nonce(32, 0x77);

    auto commitments = generate_bit_commitments(bits, nonce);

    // Try to verify with wrong index
    BOOST_CHECK(!verify_bit_commitment(commitments[0], bits[0], nonce, 1));
    BOOST_CHECK(!verify_bit_commitment(commitments[1], bits[1], nonce, 0));
    BOOST_CHECK(!verify_bit_commitment(commitments[2], bits[2], nonce, 0));
}

BOOST_AUTO_TEST_CASE(commitments_are_unique)
{
    // Test that different bits produce different commitments
    std::vector<uint8_t> nonce(32, 0x33);
    
    std::vector<uint8_t> bits0 = {0};
    std::vector<uint8_t> bits1 = {1};

    auto commitment0 = generate_bit_commitments(bits0, nonce);
    auto commitment1 = generate_bit_commitments(bits1, nonce);

    // Commitments for different bit values should differ
    BOOST_CHECK(commitment0[0] != commitment1[0]);
}

BOOST_AUTO_TEST_CASE(commitments_are_deterministic)
{
    // Test that same inputs produce same commitments
    std::vector<uint8_t> bits = {1, 0, 1, 1, 0};
    std::vector<uint8_t> nonce(32, 0x99);

    auto commitments1 = generate_bit_commitments(bits, nonce);
    auto commitments2 = generate_bit_commitments(bits, nonce);

    BOOST_CHECK_EQUAL(commitments1.size(), commitments2.size());
    for (size_t i = 0; i < commitments1.size(); ++i) {
        BOOST_CHECK(commitments1[i] == commitments2[i]);
    }
}

BOOST_AUTO_TEST_CASE(different_nonces_different_commitments)
{
    // Test that different nonces produce different commitments
    std::vector<uint8_t> bits = {1};
    std::vector<uint8_t> nonce1(32, 0xAA);
    std::vector<uint8_t> nonce2(32, 0xBB);

    auto commitment1 = generate_bit_commitments(bits, nonce1);
    auto commitment2 = generate_bit_commitments(bits, nonce2);

    BOOST_CHECK(commitment1[0] != commitment2[0]);
}

BOOST_AUTO_TEST_CASE(empty_bits_vector)
{
    // Test with empty bits vector
    std::vector<uint8_t> bits;
    std::vector<uint8_t> nonce(32, 0x55);

    auto commitments = generate_bit_commitments(bits, nonce);

    BOOST_CHECK_EQUAL(commitments.size(), 0u);
}

BOOST_AUTO_TEST_CASE(large_bit_sequence)
{
    // Test with a large sequence of bits
    std::vector<uint8_t> bits(1000);
    for (size_t i = 0; i < bits.size(); ++i) {
        bits[i] = i % 2; // Alternating 0 and 1
    }
    std::vector<uint8_t> nonce(32, 0xEE);

    auto commitments = generate_bit_commitments(bits, nonce);

    BOOST_CHECK_EQUAL(commitments.size(), bits.size());
    
    // Verify a sample of commitments
    for (size_t i = 0; i < bits.size(); i += 100) {
        BOOST_CHECK(verify_bit_commitment(commitments[i], bits[i], nonce, i));
    }
}

BOOST_AUTO_TEST_CASE(random_nonce_test)
{
    // Test with random nonce
    InsecureRandomContext rng(42);
    std::vector<uint8_t> bits = {0, 1, 1, 0, 1, 0, 1, 1};
    std::vector<uint8_t> nonce(32);
    for (auto& byte : nonce) {
        byte = rng.randbits(8);
    }

    auto commitments = generate_bit_commitments(bits, nonce);

    // All commitments should verify correctly
    for (size_t i = 0; i < bits.size(); ++i) {
        BOOST_CHECK(verify_bit_commitment(commitments[i], bits[i], nonce, i));
    }
}

BOOST_AUTO_TEST_CASE(invalid_commitment_size)
{
    // Test verification with wrong commitment size
    std::vector<uint8_t> wrong_size_commitment(16, 0); // Should be 32
    std::vector<uint8_t> nonce(32, 0x44);
    
    BOOST_CHECK(!verify_bit_commitment(wrong_size_commitment, 1, nonce, 0));
}

BOOST_AUTO_TEST_CASE(variable_nonce_sizes)
{
    // Test that different nonce sizes work
    std::vector<uint8_t> bits = {1, 0};
    
    // Small nonce
    std::vector<uint8_t> nonce_small(16, 0x11);
    auto commitments_small = generate_bit_commitments(bits, nonce_small);
    BOOST_CHECK_EQUAL(commitments_small.size(), 2u);
    for (size_t i = 0; i < bits.size(); ++i) {
        BOOST_CHECK(verify_bit_commitment(commitments_small[i], bits[i], nonce_small, i));
    }
    
    // Large nonce
    std::vector<uint8_t> nonce_large(64, 0x22);
    auto commitments_large = generate_bit_commitments(bits, nonce_large);
    BOOST_CHECK_EQUAL(commitments_large.size(), 2u);
    for (size_t i = 0; i < bits.size(); ++i) {
        BOOST_CHECK(verify_bit_commitment(commitments_large[i], bits[i], nonce_large, i));
    }
    
    // Different nonce sizes should produce different commitments
    BOOST_CHECK(commitments_small[0] != commitments_large[0]);
}

BOOST_AUTO_TEST_SUITE_END()
