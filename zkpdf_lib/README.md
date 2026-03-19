# zkpdf_lib

Zero-knowledge proof library for PDF verification.

## Overview

This library provides functionality to verify claims about PDF documents using zero-knowledge proofs. It allows you to verify that a specific substring appears at a given offset within a PDF document without revealing the entire document.

## Features

- **PDF Verification**: Verify substring presence at specific offsets in PDF documents
- **Security-First Design**: Input validation to prevent buffer overflows and attacks
- **Type-Safe API**: Strongly-typed interfaces with comprehensive error handling
- **Serialization Support**: Serde support for easy integration

## Usage

Add zkpdf_lib to your project:

```toml
[dependencies]
zkpdf_lib = { path = "../zkpdf_lib" }
```

### Basic Example

```rust
use zkpdf_lib::{verify_pdf_claim, PDFCircuitInput};

// Create input for PDF verification
let input = PDFCircuitInput {
    pdf_bytes: pdf_data,
    page_number: 0,
    offset: 100,
    substring: "Important Document".to_string(),
};

// Verify PDF
let result = verify_pdf_claim(input)?;

if result.verified {
    println!("Verification successful!");
} else {
    println!("Verification failed: substring not found at offset");
}
```

## API Reference

### `PDFCircuitInput`

Input structure for PDF verification.

**Fields:**
- `pdf_bytes: Vec<u8>` - The raw bytes of the PDF document
- `page_number: u32` - The page number to verify (0-indexed)
- `offset: usize` - The byte offset within the document
- `substring: String` - The substring to search for at the given offset

### `verify_pdf_claim(input: PDFCircuitInput)`

Verifies that a specific substring appears at a given offset within a PDF document.

**Returns:**
- `Ok(PDFVerificationProof)` - Contains verification result and metadata
- `Err(PDFVerificationError)` - If validation fails or verification cannot be performed

### `PDFVerificationProof`

Result structure containing verification details.

**Fields:**
- `verified: bool` - Whether the verification succeeded
- `page_number: u32` - The page number that was verified
- `offset: usize` - The offset that was checked
- `substring: String` - The substring that was searched for
- `metadata: String` - Additional metadata about the verification

### Error Types

- `InvalidPageNumber(u32)` - Page number exceeds maximum (10000)
- `InvalidOffset(usize)` - Offset is invalid or causes overflow
- `EmptyPDFData` - PDF data is empty
- `SubstringNotFound` - Substring not found at specified offset
- `EmptySubstring` - Substring parameter is empty
- `OffsetOutOfBounds` - Offset exceeds PDF data length

## Security Considerations

This library implements several security measures:

1. **Input Validation**: All inputs are validated before processing
2. **Bounds Checking**: Prevents buffer overflows and out-of-bounds access
3. **Overflow Prevention**: Checks for arithmetic overflows in offset calculations
4. **Resource Limits**: Limits on page numbers to prevent DoS attacks
5. **Safe Dependencies**: Uses only well-maintained, audited dependencies

## Building

```bash
cargo build
```

## Testing

```bash
cargo test
```

## License

MIT License - See [COPYING](../COPYING) for details.

## Contributing

This library is part of the Bitcoin Core project. See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
