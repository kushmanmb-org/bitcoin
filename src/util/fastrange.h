// Copyright (c) 2018-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#ifndef BITCOIN_UTIL_FASTRANGE_H
#define BITCOIN_UTIL_FASTRANGE_H

#include <cstdint>

/* This file offers implementations of the fast range reduction technique described
 * in https://lemire.me/blog/2016/06/27/a-fast-alternative-to-the-modulo-reduction/
 *
 * In short, they take an integer x and a range n, and return the upper bits of
 * (x * n). If x is uniformly distributed over its domain, the result is as close to
 * uniformly distributed over [0, n) as (x mod n) would be, but significantly faster.
 */

/** Fast range reduction with 32-bit input and 32-bit range. */
static inline uint32_t FastRange32(uint32_t x, uint32_t n)
{
    return (uint64_t{x} * n) >> 32;
}

/** Fast range reduction with 64-bit input and 64-bit range. */
static inline uint64_t FastRange64(uint64_t x, uint64_t n)
{
#ifdef __SIZEOF_INT128__
    return (static_cast<unsigned __int128>(x) * static_cast<unsigned __int128>(n)) >> 64;
#else
    // To perform the calculation on 64-bit numbers without losing the
    // result to overflow, split the numbers into the most significant and
    // least significant 32 bits and perform multiplication piece-wise.
    //
    // See: https://stackoverflow.com/a/26855440
    const uint64_t x_high_bits = x >> 32;
    const uint64_t x_low_bits = x & 0xFFFFFFFF;
    const uint64_t n_high_bits = n >> 32;
    const uint64_t n_low_bits = n & 0xFFFFFFFF;

    const uint64_t high_high_product = x_high_bits * n_high_bits;
    const uint64_t high_low_product = x_high_bits * n_low_bits;
    const uint64_t low_high_product = x_low_bits * n_high_bits;
    const uint64_t low_low_product = x_low_bits * n_low_bits;

    const uint64_t middle_bits = (low_low_product >> 32) + (low_high_product & 0xFFFFFFFF) + (high_low_product & 0xFFFFFFFF);
    const uint64_t upper_64_bits = high_high_product + (low_high_product >> 32) + (high_low_product >> 32) + (middle_bits >> 32);
    return upper_64_bits;
#endif
}

#endif // BITCOIN_UTIL_FASTRANGE_H
