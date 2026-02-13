# Building WASM Module and Frontend Application

## Overview

This guide explains how to build and run the Bitcoin Core WASM module and frontend application using safe security practices.

## Architecture

```
bitcoin/
├── pdf-utils/wasm/         # Rust WASM module
│   ├── src/                # Rust source code
│   ├── Cargo.toml          # Rust dependencies
│   ├── generate_wasm.sh    # Build script
│   └── README.md           # WASM documentation
│
└── app/                    # React frontend
    ├── src/                # React components
    ├── package.json        # Node.js dependencies
    ├── vite.config.js      # Build configuration
    └── README.md           # Frontend documentation
```

## Prerequisites

### System Requirements

1. **Rust Toolchain** (for WASM module)
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   
   # Verify installation
   rustc --version
   cargo --version
   ```

2. **wasm-pack** (WASM build tool)
   ```bash
   # Install wasm-pack
   cargo install wasm-pack
   
   # Verify installation
   wasm-pack --version
   ```

3. **Node.js and npm/yarn** (for frontend)
   ```bash
   # Check if already installed
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 9.0.0
   
   # Or use yarn
   yarn --version
   ```

## Quick Start

### Build and Run

```bash
# Build WASM module (requires Rust + wasm-pack)
cd pdf-utils/wasm && ./generate_wasm.sh && cd ../../app

# Start the frontend
yarn install
yarn dev
```

## Security Practices

### 1. Input Validation

All user inputs are validated before processing to prevent injection attacks.

### 2. Content Security Policy

The application includes strict CSP headers to prevent XSS attacks.

### 3. Build Security

- **WASM**: Built with optimizations and security flags
- **Frontend**: Production builds strip console.log and debugger statements
- **Dependencies**: Regular audits with `npm audit` / `cargo audit`

### 4. Secrets Management

**Never commit:**
- API keys or tokens
- Private keys
- Passwords or credentials
- Environment files (`.env`)

## Development Workflow

### Make Changes to WASM

```bash
cd pdf-utils/wasm
# Edit Rust code in src/
cargo test
./generate_wasm.sh
```

### Make Changes to Frontend

```bash
cd app
# Edit React code in src/
yarn lint
yarn test
```

## Production Build

```bash
# Build WASM
cd pdf-utils/wasm
./generate_wasm.sh

# Build Frontend
cd ../../app
yarn build
```

## Security Checklist

### Before Committing

- [ ] No hardcoded secrets or credentials
- [ ] All sensitive files in .gitignore
- [ ] Input validation implemented
- [ ] Tests passing

### Before Deploying

- [ ] Run security audit: `npm audit` and `cargo audit`
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CSP policy tested

## Additional Resources

- [WASM Module README](pdf-utils/wasm/README.md)
- [Frontend README](app/README.md)
- [Security Practices](SECURITY_PRACTICES.md)
- [Security Policy](SECURITY.md)

---

**Remember**: Security is everyone's responsibility. When in doubt, ask!
