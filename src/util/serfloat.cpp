// Copyright (c) 2021-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <util/serfloat.h>

#include <cmath>
#include <limits>

double DecodeDouble(uint64_t encoded_value) noexcept {
    static constexpr double NANVAL = std::numeric_limits<double>::quiet_NaN();
    static constexpr double INFVAL = std::numeric_limits<double>::infinity();
    double sign = 1.0;
    if (encoded_value & 0x8000000000000000) {
        sign = -1.0;
        encoded_value ^= 0x8000000000000000;
    }
    // Zero
    if (encoded_value == 0) return copysign(0.0, sign);
    // Infinity
    if (encoded_value == 0x7ff0000000000000) return copysign(INFVAL, sign);
    // Other numbers
    int exponent = (encoded_value & 0x7FF0000000000000) >> 52;
    uint64_t mantissa = encoded_value & 0xFFFFFFFFFFFFF;
    if (exponent == 2047) {
        // NaN
        return NANVAL;
    } else if (exponent == 0) {
        // Subnormal
        return copysign(ldexp((double)mantissa, -1074), sign);
    } else {
        // Normal
        return copysign(ldexp((double)(mantissa + 0x10000000000000), -1075 + exponent), sign);
    }
}

uint64_t EncodeDouble(double value) noexcept {
    int float_class = std::fpclassify(value);
    uint64_t sign = 0;
    if (copysign(1.0, value) == -1.0) {
        value = -value;
        sign = 0x8000000000000000;
    }
    // Zero
    if (float_class == FP_ZERO) return sign;
    // Infinity
    if (float_class == FP_INFINITE) return sign | 0x7ff0000000000000;
    // NaN
    if (float_class == FP_NAN) return 0x7ff8000000000000;
    // Other numbers
    int exponent;
    uint64_t mantissa = std::round(std::frexp(value, &exponent) * 9007199254740992.0);
    if (exponent < -1021) {
        // Too small to represent, encode 0
        if (exponent < -1084) return sign;
        // Subnormal numbers
        return sign | (mantissa >> (-1021 - exponent));
    } else {
        // Too big to represent, encode infinity
        if (exponent > 1024) return sign | 0x7ff0000000000000;
        // Normal numbers
        return sign | (((uint64_t)(1022 + exponent)) << 52) | (mantissa & 0xFFFFFFFFFFFFF);
    }
}
