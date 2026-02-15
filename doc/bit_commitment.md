# Bit Commitment Scheme

## Overview

This implementation provides a cryptographic bit commitment scheme for Bitcoin Core. A commitment scheme allows a party to commit to a value while keeping it hidden, with the ability to reveal and verify the value later.

## API

### `generate_bit_commitments`

```cpp
std::vector<std::vector<uint8_t>> generate_bit_commitments(
    const std::vector<uint8_t>& bits,
    const std::vector<uint8_t>& nonce);
```

**Description**: Generates cryptographic commitments for a sequence of bits.

**Parameters**:
- `bits`: Vector of bit values (each element must be 0 or 1)
- `nonce`: Random nonce for unpredictability (32 bytes recommended)

**Returns**: Vector of commitments, one per bit (each 32 bytes)

**Example**:
```cpp
#include <crypto/bit_commitment.h>

std::vector<uint8_t> bits = {0, 1, 1, 0, 1};
std::vector<uint8_t> nonce(32, 0x42);  // Use a secure random nonce in production

auto commitments = generate_bit_commitments(bits, nonce);
// commitments.size() == 5, each commitment is 32 bytes
```

### `verify_bit_commitment`

```cpp
bool verify_bit_commitment(
    const std::vector<uint8_t>& commitment,
    uint8_t bit,
    const std::vector<uint8_t>& nonce,
    size_t index);
```

**Description**: Verifies a bit commitment.

**Parameters**:
- `commitment`: The commitment to verify (must be 32 bytes)
- `bit`: The revealed bit value (0 or 1)
- `nonce`: The nonce used in commitment generation
- `index`: The bit index in the original sequence

**Returns**: `true` if the commitment is valid, `false` otherwise

**Example**:
```cpp
bool valid = verify_bit_commitment(commitments[0], bits[0], nonce, 0);
// valid == true if commitment matches
```

## Commitment Scheme

Each commitment is computed as:
```
commitment = SHA256(nonce || index || bit)
```

Where:
- `nonce`: Random bytes to make commitments unpredictable
- `index`: 8-byte little-endian representation of the bit position
- `bit`: Single byte (0 or 1)

## Security Properties

1. **Hiding**: The commitment reveals no information about the bit value without the nonce
2. **Binding**: Cannot create two different valid commitments for the same index
3. **Uniqueness**: Each bit position gets a unique commitment due to index inclusion
4. **Timing Attack Resistance**: Uses constant-time comparison for verification

## Use Cases

- **Coin flipping protocols**: Commit to a bit without revealing it
- **Zero-knowledge proofs**: Commit to secret values that can be revealed later
- **Secure multi-party computation**: Hide intermediate values during computation
- **Version bits signaling**: Cryptographically commit to future activation signals

## Implementation Notes

- Uses Bitcoin Core's CSHA256 hasher for consistency
- Supports variable-length nonces (though 32 bytes recommended)
- All commitments are 32 bytes (SHA256 output size)
- Index is included to prevent commitment reuse across different positions

## Testing

Run the test suite:
```bash
./test_bitcoin --run_test=bit_commitment_tests
```

The test suite includes:
- Basic commitment generation and verification
- Invalid input handling (wrong bit, nonce, or index)
- Uniqueness and determinism tests
- Edge cases (empty vectors, large sequences)
- Variable nonce size support

## Performance

- **Generation**: O(n) where n is the number of bits
- **Verification**: O(1) per commitment
- **Memory**: 32 bytes per commitment

## References

- [Commitment Schemes (Wikipedia)](https://en.wikipedia.org/wiki/Commitment_scheme)
- [SHA-256](https://en.wikipedia.org/wiki/SHA-2)
- [Bitcoin Core Crypto Library](../crypto/)
