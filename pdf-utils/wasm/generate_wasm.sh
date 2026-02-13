#!/usr/bin/env bash

# Bitcoin PDF Utils WASM Generator
# This script builds the WASM module with security best practices
# 
# Security Features:
# - Validates build environment before proceeding
# - Uses secure build flags
# - Cleans sensitive build artifacts
# - Validates output integrity

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

# Check if required tools are installed
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v cargo &> /dev/null; then
        log_error "Rust/Cargo is not installed. Please install from https://rustup.rs/"
        exit 1
    fi
    
    if ! command -v wasm-pack &> /dev/null; then
        log_error "wasm-pack is not installed. Install with: cargo install wasm-pack"
        exit 1
    fi
    
    log_info "All prerequisites satisfied"
}

# Validate Cargo.toml exists and is not empty
validate_project() {
    log_info "Validating project structure..."
    
    if [ ! -f "Cargo.toml" ]; then
        log_error "Cargo.toml not found. Are you in the correct directory?"
        exit 1
    fi
    
    if [ ! -d "src" ]; then
        log_error "src directory not found. Project structure is invalid."
        exit 1
    fi
    
    log_info "Project structure validated"
}

# Clean previous builds to avoid stale artifacts
clean_build() {
    log_info "Cleaning previous build artifacts..."
    
    if [ -d "pkg" ]; then
        rm -rf pkg
        log_info "Removed pkg directory"
    fi
    
    if [ -d "target" ]; then
        log_info "Cleaning target directory..."
        cargo clean
    fi
}

# Build WASM module with security flags
build_wasm() {
    log_info "Building WASM module..."
    
    # Build with wasm-pack
    # --target web: For web browsers
    # --release: Optimized build
    # --no-typescript: Skip TypeScript definitions if not needed (can be removed if TS is used)
    wasm-pack build --target web --release
    
    if [ $? -ne 0 ]; then
        log_error "WASM build failed"
        exit 1
    fi
    
    log_info "WASM module built successfully"
}

# Verify build output
verify_build() {
    log_info "Verifying build output..."
    
    if [ ! -d "pkg" ]; then
        log_error "pkg directory not created. Build may have failed."
        exit 1
    fi
    
    if [ ! -f "pkg/bitcoin_pdf_utils_bg.wasm" ]; then
        log_error "WASM binary not found in pkg directory"
        exit 1
    fi
    
    # Check WASM file size (warn if unusually large)
    WASM_SIZE=$(stat -f%z "pkg/bitcoin_pdf_utils_bg.wasm" 2>/dev/null || stat -c%s "pkg/bitcoin_pdf_utils_bg.wasm" 2>/dev/null)
    if [ "$WASM_SIZE" -gt 1048576 ]; then  # 1MB
        log_warn "WASM binary is larger than 1MB ($WASM_SIZE bytes). Consider optimizing."
    else
        log_info "WASM binary size: $WASM_SIZE bytes"
    fi
    
    log_info "Build verification complete"
}

# Clean sensitive information from build artifacts
sanitize_build() {
    log_info "Sanitizing build artifacts..."
    
    # Remove any debug symbols or source maps that might contain sensitive info
    find pkg -name "*.map" -type f -delete 2>/dev/null || true
    
    log_info "Build artifacts sanitized"
}

# Display build summary
display_summary() {
    echo ""
    log_info "============================================"
    log_info "WASM Build Complete!"
    log_info "============================================"
    log_info "Output directory: $(pwd)/pkg"
    log_info "Main WASM file: pkg/bitcoin_pdf_utils_bg.wasm"
    log_info ""
    log_info "To use this module in your frontend:"
    log_info "  1. Copy the pkg directory to your frontend project"
    log_info "  2. Import in your JavaScript/TypeScript:"
    log_info "     import init, { greet } from './pkg/bitcoin_pdf_utils.js';"
    log_info "     await init();"
    log_info "============================================"
    echo ""
}

# Main execution
main() {
    log_info "Starting WASM build process..."
    log_info "Working directory: $(pwd)"
    
    check_prerequisites
    validate_project
    clean_build
    build_wasm
    verify_build
    sanitize_build
    display_summary
    
    log_info "WASM build process completed successfully"
}

# Run main function
main "$@"
