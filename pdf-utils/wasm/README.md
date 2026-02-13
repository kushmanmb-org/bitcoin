# Bitcoin PDF Utils - WASM Module

## Overview

This WebAssembly (WASM) module provides utilities for generating and processing Bitcoin-related PDF documents in web browsers. It is built with Rust and compiled to WASM for high performance and security.

## Security Features

### Input Validation
- All inputs are validated before processing
- Transaction IDs are checked for valid hexadecimal format
- Length limits prevent buffer overflow attacks
- XSS and injection attack prevention

### Secure Build Process
- Uses optimized release builds with security flags
- Implements panic abort for security
- Link-time optimization (LTO) enabled
- Minimal binary size through aggressive optimization

### Safe Dependencies
- Only uses well-maintained, audited crates
- Dependencies are version-pinned for reproducibility
- Regular security audits recommended

## Prerequisites

Before building the WASM module, ensure you have:

1. **Rust** (latest stable version)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **wasm-pack** (WASM build tool)
   ```bash
   cargo install wasm-pack
   ```

3. **wasm32 target** (if not already installed)
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

## Building the WASM Module

### Quick Build

```bash
# From the pdf-utils/wasm directory
./generate_wasm.sh
```

The script will:
- ✅ Verify all prerequisites
- ✅ Validate project structure
- ✅ Clean previous builds
- ✅ Build optimized WASM binary
- ✅ Verify build output
- ✅ Sanitize build artifacts

### Manual Build

If you prefer to build manually:

```bash
# Standard build
wasm-pack build --target web --release

# Development build (with debug info)
wasm-pack build --target web --dev
```

## Output

After building, the `pkg/` directory will contain:

```
pkg/
├── bitcoin_pdf_utils_bg.wasm      # The WASM binary
├── bitcoin_pdf_utils.js            # JavaScript bindings
├── bitcoin_pdf_utils.d.ts          # TypeScript definitions
└── package.json                    # NPM package metadata
```

## Usage in Frontend

### Installation

Copy the `pkg` directory to your frontend project or publish to a package registry.

### JavaScript/TypeScript Integration

```javascript
import init, { greet, generate_bitcoin_transaction_pdf } from './pkg/bitcoin_pdf_utils.js';

// Initialize the WASM module
await init();

// Use the functions
const greeting = greet("Alice");
console.log(greeting);

// Generate PDF for a transaction
try {
  const result = generate_bitcoin_transaction_pdf("abc123def456");
  console.log(result);
} catch (error) {
  console.error("PDF generation failed:", error);
}
```

### Security Considerations for Frontend Integration

1. **Same-Origin Policy**: Ensure WASM files are served from the same origin
2. **HTTPS Only**: Always serve WASM over HTTPS in production
3. **Content Security Policy**: Configure CSP headers appropriately
4. **Input Sanitization**: Validate all user inputs before passing to WASM functions
5. **Error Handling**: Always wrap WASM calls in try-catch blocks

## Development

### Running Tests

```bash
# Run Rust unit tests
cargo test

# Run WASM-specific tests
wasm-pack test --headless --firefox
```

### Code Quality

```bash
# Format code
cargo fmt

# Lint code
cargo clippy -- -D warnings

# Check for security vulnerabilities
cargo audit
```

## Security Best Practices

### Before Deploying

- [ ] Run security audit: `cargo audit`
- [ ] Update all dependencies to latest secure versions
- [ ] Review all TODO and FIXME comments
- [ ] Test with various inputs including edge cases
- [ ] Verify error handling covers all scenarios
- [ ] Review build output for unexpected artifacts
- [ ] Check WASM binary size (should be minimal)

### Dependency Management

```bash
# Check for outdated dependencies
cargo outdated

# Update dependencies
cargo update

# Audit for known vulnerabilities
cargo audit
```

### Regular Maintenance

- Update Rust toolchain monthly
- Audit dependencies quarterly
- Review security advisories weekly
- Rotate any secrets or tokens used in CI/CD

## Troubleshooting

### Build Fails

**Error**: `wasm-pack: command not found`
```bash
cargo install wasm-pack
```

**Error**: `target not found`
```bash
rustup target add wasm32-unknown-unknown
```

### WASM Module Too Large

1. Ensure release build is used: `--release` flag
2. Check `Cargo.toml` optimization settings
3. Review dependencies for unnecessary features
4. Consider using `wasm-opt` for further optimization:
   ```bash
   wasm-opt -Oz -o optimized.wasm input.wasm
   ```

### Runtime Errors

1. Check browser console for JavaScript errors
2. Verify WASM module initialized: `await init()`
3. Check MIME type is correct: `application/wasm`
4. Verify CSP allows WASM execution

## Contributing

When contributing to this module:

1. Follow Rust coding standards
2. Add tests for new functionality
3. Update documentation
4. Run security checks before submitting PR
5. Never commit sensitive data or credentials

## License

This project is licensed under the MIT License - see the [COPYING](../../COPYING) file for details.

## Additional Resources

- [Rust and WebAssembly Book](https://rustwasm.github.io/docs/book/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [WebAssembly Security](https://webassembly.org/docs/security/)
- [Bitcoin Core Documentation](../../doc/)

## Support

For security issues, please see [SECURITY.md](../../SECURITY.md)

For general questions, please open an issue in the repository.
