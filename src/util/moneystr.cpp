// Copyright (c) 2009-2010 Satoshi Nakamoto
// Copyright (c) 2009-present The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <util/moneystr.h>

#include <consensus/amount.h>
#include <tinyformat.h>
#include <util/strencodings.h>
#include <util/string.h>

#include <cstdint>
#include <optional>

using util::ContainsNoNUL;
using util::TrimString;

std::string FormatMoney(const CAmount amount)
{
    // Note: not using straight sprintf here because we do NOT want
    // localized number formatting.
    static_assert(COIN > 1);
    int64_t quotient = amount / COIN;
    int64_t remainder = amount % COIN;
    if (amount < 0) {
        quotient = -quotient;
        remainder = -remainder;
    }
    std::string str = strprintf("%d.%08d", quotient, remainder);

    // Right-trim excess zeros before the decimal point:
    int trailing_zeros_count = 0;
    for (int i = str.size()-1; (str[i] == '0' && IsDigit(str[i-2])); --i)
        ++trailing_zeros_count;
    if (trailing_zeros_count)
        str.erase(str.size()-trailing_zeros_count, trailing_zeros_count);

    if (amount < 0)
        str.insert(uint32_t{0}, 1, '-');
    return str;
}


std::optional<CAmount> ParseMoney(const std::string& money_string)
{
    if (!ContainsNoNUL(money_string)) {
        return std::nullopt;
    }
    const std::string str = TrimString(money_string);
    if (str.empty()) {
        return std::nullopt;
    }

    std::string strWhole;
    int64_t fractional_units = 0;
    const char* current_char = str.c_str();
    for (; *current_char; current_char++)
    {
        if (*current_char == '.')
        {
            current_char++;
            int64_t decimal_multiplier = COIN / 10;
            while (IsDigit(*current_char) && (decimal_multiplier > 0))
            {
                fractional_units += decimal_multiplier * (*current_char++ - '0');
                decimal_multiplier /= 10;
            }
            break;
        }
        if (IsSpace(*current_char))
            return std::nullopt;
        if (!IsDigit(*current_char))
            return std::nullopt;
        strWhole.insert(strWhole.end(), *current_char);
    }
    if (*current_char) {
        return std::nullopt;
    }
    if (strWhole.size() > 10) // guard against 63 bit overflow
        return std::nullopt;
    if (fractional_units < 0 || fractional_units > COIN)
        return std::nullopt;
    int64_t whole_part_value = LocaleIndependentAtoi<int64_t>(strWhole);
    CAmount value = whole_part_value * COIN + fractional_units;

    if (!MoneyRange(value)) {
        return std::nullopt;
    }

    return value;
}
