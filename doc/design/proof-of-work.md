# Proof-of-Work Design

## Overview

Bitcoin uses a proof-of-work (PoW) system to secure the blockchain and achieve distributed consensus. This document describes the implementation of proof-of-work validation and difficulty adjustment in Bitcoin Core.

## Core Concepts

### What is Proof-of-Work?

Proof-of-work is a cryptographic mechanism that requires computational effort to produce a valid block. A block is considered valid if its hash is less than a target value, making it computationally difficult to create but easy to verify.

### Key Components

The PoW system consists of three main components:

1. **Target Calculation**: Converting the compact `nBits` representation to a 256-bit target
2. **Difficulty Adjustment**: Periodically adjusting the mining difficulty to maintain a consistent block time
3. **Validation**: Verifying that a block's hash meets the current difficulty requirement

## Implementation Files

- **`src/pow.h`**: Header file declaring PoW-related functions
- **`src/pow.cpp`**: Implementation of PoW validation and difficulty adjustment
- **`src/consensus/params.h`**: Consensus parameters including PoW limits
- **`src/test/pow_tests.cpp`**: Unit tests for PoW functionality

## Core Functions

### CheckProofOfWork

```cpp
bool CheckProofOfWork(uint256 hash, unsigned int nBits, const Consensus::Params&)
```

Validates that a block hash satisfies the proof-of-work requirement specified by `nBits`.

**Parameters:**
- `hash`: The block hash to validate
- `nBits`: Compact representation of the target difficulty
- `params`: Consensus parameters including `powLimit`

**Returns:** `true` if the hash is valid, `false` otherwise

**Special Behavior:**
- During fuzzing (when `EnableFuzzDeterminism()` is true), this function uses a simplified check that only validates whether the most significant bit of the last byte is zero. This ensures deterministic behavior during fuzz testing.
- For normal operation, it calls `CheckProofOfWorkImpl()` for the actual validation.

### CheckProofOfWorkImpl

```cpp
bool CheckProofOfWorkImpl(uint256 hash, unsigned int nBits, const Consensus::Params& params)
```

The actual proof-of-work validation implementation.

**Algorithm:**
1. Convert `nBits` to a 256-bit target using `DeriveTarget()`
2. Check if the target is valid (not negative, not zero, not overflowed, within `powLimit`)
3. Compare the block hash to the target
4. Return `true` if `hash <= target`

### DeriveTarget

```cpp
std::optional<arith_uint256> DeriveTarget(unsigned int nBits, uint256 pow_limit)
```

Converts the compact `nBits` representation to a full 256-bit target value.

**Parameters:**
- `nBits`: Compact representation of the target
- `pow_limit`: Maximum allowed target (minimum difficulty)

**Returns:**
- `std::optional<arith_uint256>`: The target value if valid, `std::nullopt` if invalid (negative, zero, overflow, or exceeds `pow_limit`)

### GetNextWorkRequired

```cpp
unsigned int GetNextWorkRequired(const CBlockIndex* pindexLast, const CBlockHeader *pblock, const Consensus::Params& params)
```

Determines the difficulty target for the next block.

**Algorithm:**
1. If not at a difficulty adjustment interval, return the previous block's `nBits` (with special handling for testnet min-difficulty blocks)
2. If at a difficulty adjustment interval:
   - Find the first block of the current difficulty period (2016 blocks back)
   - Call `CalculateNextWorkRequired()` with the time span between the first and last blocks

**Special Cases:**
- **Testnet Min-Difficulty Rule**: If `fPowAllowMinDifficultyBlocks` is true and the block timestamp is more than 2× the target spacing from the previous block, the minimum difficulty is allowed
- **Difficulty Adjustment Interval**: By default, difficulty adjusts every 2016 blocks (approximately 2 weeks at 10-minute block intervals)

### CalculateNextWorkRequired

```cpp
unsigned int CalculateNextWorkRequired(const CBlockIndex* pindexLast, int64_t nFirstBlockTime, const Consensus::Params& params)
```

Calculates the new difficulty target based on the actual time taken for the previous difficulty period.

**Algorithm:**
1. Calculate actual timespan: `nActualTimespan = pindexLast->GetBlockTime() - nFirstBlockTime`
2. Clamp the timespan to prevent extreme changes:
   - Minimum: `nPowTargetTimespan / 4`
   - Maximum: `nPowTargetTimespan * 4`
3. Adjust the difficulty: `bnNew = bnOld * nActualTimespan / nPowTargetTimespan`
4. Ensure the new target doesn't exceed `powLimit`
5. Return the compact representation

**BIP94 (Testnet4):**
- When `enforce_BIP94` is enabled, use the first block's `nBits` instead of the last block's `nBits` for calculating the new target
- This preserves the real difficulty in the first block of each period

### PermittedDifficultyTransition

```cpp
bool PermittedDifficultyTransition(const Consensus::Params& params, int64_t height, uint32_t old_nbits, uint32_t new_nbits)
```

Validates that a difficulty transition is permitted according to consensus rules.

**Rules:**
- **Networks with min-difficulty blocks** (testnet/regtest): Always returns `true`
- **At difficulty adjustment interval**: New difficulty must be within the factor-of-4 bounds
- **Between adjustments**: Difficulty must remain unchanged

**Purpose:**
This function prevents consensus failures by ensuring block headers contain valid difficulty transitions during validation.

## Consensus Parameters

Key parameters from `Consensus::Params`:

- **`powLimit`**: Maximum target value (minimum difficulty). Mainnet uses `0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff`
- **`nPowTargetSpacing`**: Target time between blocks (600 seconds = 10 minutes)
- **`nPowTargetTimespan`**: Target time for a full difficulty period (1209600 seconds = 2 weeks)
- **`fPowAllowMinDifficultyBlocks`**: Allow minimum difficulty blocks (testnet/regtest only)
- **`fPowNoRetargeting`**: Disable difficulty retargeting (regtest only)
- **`enforce_BIP94`**: Enable BIP94 difficulty adjustment (testnet4)

### Difficulty Adjustment Interval

The difficulty adjustment interval is calculated as:

```cpp
DifficultyAdjustmentInterval() = nPowTargetTimespan / nPowTargetSpacing
```

For mainnet: `1209600 / 600 = 2016 blocks`

## Difficulty Adjustment Algorithm

Bitcoin adjusts mining difficulty every 2016 blocks to maintain an average block time of 10 minutes.

### Step-by-Step Process

1. **Check if adjustment is needed**: Only adjust at heights that are multiples of 2016
2. **Calculate actual time taken**: Measure the time between the first and last blocks of the period
3. **Clamp the adjustment**: Limit changes to a factor of 4 in either direction
4. **Calculate new target**: `new_target = old_target * actual_time / expected_time`
5. **Apply PoW limit**: Ensure the new target doesn't exceed `powLimit`

### Example

If blocks were mined:
- **Too quickly** (e.g., average 7.5 minutes): Difficulty increases (target decreases)
- **Too slowly** (e.g., average 15 minutes): Difficulty decreases (target increases)
- **At the right pace** (average 10 minutes): Difficulty stays roughly the same

### Bounds

The clamping ensures:
- **Minimum timespan**: `nPowTargetTimespan / 4` (if blocks came too fast, treat as if they took at least 3.5 days)
- **Maximum timespan**: `nPowTargetTimespan * 4` (if blocks came too slow, treat as if they took at most 8 weeks)

This prevents difficulty from changing by more than a factor of 4 in a single adjustment period.

## Target Representation

Bitcoin uses a compact representation (`nBits`) to store the difficulty target in block headers.

### Format

The 32-bit `nBits` value consists of:
- **Exponent** (8 bits): Most significant byte
- **Mantissa** (24 bits): Remaining three bytes

The target is calculated as: `target = mantissa × 256^(exponent - 3)`

### Example

`nBits = 0x1d00ffff`:
- Exponent: `0x1d` (29 decimal)
- Mantissa: `0x00ffff`
- Target: `0x00ffff × 256^(29-3) = 0x00000000ffff0000000000000000000000000000000000000000000000000000`

## Testing and Fuzzing

### Deterministic Fuzzing

When `BUILD_FOR_FUZZING=ON` is set, the PoW check becomes deterministic:

```cpp
if (EnableFuzzDeterminism()) return (hash.data()[31] & 0x80) == 0;
```

This simplified check:
- Skips the actual cryptographic verification
- Only checks if the most significant bit of the last byte is unset
- Ensures reproducible fuzz testing results
- Allows fuzzing other consensus logic without mining valid blocks

See `doc/fuzzing.md` for more details on fuzzing configuration.

### Unit Tests

The test suite `src/test/pow_tests.cpp` includes tests for:
- Normal difficulty adjustment
- PoW limit constraints
- Lower bound on actual time
- Upper bound on actual time
- Negative target rejection
- Target overflow rejection
- Difficulty transition validation

## Network-Specific Behavior

### Mainnet

- Strict difficulty adjustment every 2016 blocks
- No minimum difficulty exceptions
- `powLimit` provides an upper bound on target (lower bound on difficulty)

### Testnet

- Same base algorithm as mainnet
- **Min-difficulty rule**: If a block's timestamp is more than 20 minutes (2× target spacing) after the previous block, it may use minimum difficulty
- Allows the network to continue when hashrate drops

### Testnet4 (BIP94)

- Uses the first block's difficulty for calculations instead of the last block's
- Preserves the "real" difficulty in the first block of each period
- Prevents gaming the min-difficulty exception

### Regtest

- `fPowNoRetargeting = true`: Difficulty never adjusts
- `fPowAllowMinDifficultyBlocks = true`: Min-difficulty blocks allowed
- Useful for testing without requiring actual mining

## Security Considerations

### Why Proof-of-Work?

1. **Sybil Resistance**: Prevents attackers from cheaply creating many identities
2. **Consensus**: Nodes agree on the chain with the most accumulated work
3. **Immutability**: Changing historical blocks requires redoing all subsequent work

### Attack Vectors

- **51% Attack**: An attacker with majority hashrate can reorganize the chain
- **Timestamp Manipulation**: Limited by median-time-past and future block time rules
- **Difficulty Gaming**: Prevented by clamping adjustments to factor of 4

### Validation Order

PoW is checked early in block validation:
1. Block header syntactic validation
2. **Proof-of-work check** (CheckProofOfWork)
3. Block timestamp validation
4. Full block validation (transactions, scripts, etc.)

This ordering prevents expensive validation work on blocks with invalid PoW.

## References

- **Satoshi's Bitcoin Paper**: [https://bitcoin.org/bitcoin.pdf](https://bitcoin.org/bitcoin.pdf)
- **Bitcoin Wiki - Difficulty**: [https://en.bitcoin.it/wiki/Difficulty](https://en.bitcoin.it/wiki/Difficulty)
- **BIP94**: Testnet 4 difficulty adjustment (when applicable)

## Related Documentation

- `doc/fuzzing.md`: Fuzzing configuration and deterministic PoW checks
- `src/consensus/params.h`: Consensus parameter definitions
- `doc/developer-notes.md`: General development guidelines

## Version History

- **2026-02-16**: Initial documentation created
