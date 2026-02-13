# Setup Guide

Get started with the Bitcoin Core project quickly and safely.

## 📋 Prerequisites

- Git
- Build tools (see [build instructions](../doc/README.md))
- Text editor or IDE
- GitHub account (for contributing)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kushmanmb-org/bitcoin.git
cd bitcoin
```

### 2. Check Build Requirements

Refer to platform-specific build documentation:

- [Unix/Linux](../doc/build-unix.md)
- [macOS](../doc/build-osx.md)
- [Windows](../doc/build-windows.md)
- [FreeBSD](../doc/build-freebsd.md)

### 3. Configure Environment

Create a `.env` file for local development (this file is git-ignored):

```bash
# Create .env file
cat > .env << 'EOF'
# Bitcoin RPC Configuration
BITCOIN_RPC_USER=myuser
BITCOIN_RPC_PASSWORD=mypassword
BITCOIN_RPC_HOST=localhost
BITCOIN_RPC_PORT=8332

# Optional: API Keys (if needed)
# ETHERSCAN_API_KEY=your_key_here
EOF

# Set file permissions
chmod 600 .env
```

### 4. Build the Project

```bash
# Configure
cmake -B build -DCMAKE_BUILD_TYPE=Release

# Build
cmake --build build -j$(nproc)

# Run tests
cd build
ctest
```

## 🔐 Security Setup

### Verify .gitignore

Ensure your sensitive files are ignored:

```bash
# Check if .env is ignored
git check-ignore -v .env
# Should output: .gitignore:15:.env    .env

# Check status
git status
# .env should not appear in untracked files
```

### Configure Git

Set up your Git identity:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Enable Git Hooks (Optional)

Set up pre-commit hooks to catch sensitive data:

```bash
# Copy sample hooks
cp contrib/git-hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

## 🧪 Testing Your Setup

### Run a Simple Test

```bash
# Run bitcoind version check
./build/src/bitcoind --version

# Run a quick test
./build/test/functional/test_runner.py wallet_basic.py
```

### Verify Environment Variables

```bash
# Check environment variables are loaded
source .env
echo $BITCOIN_RPC_USER
```

## 📚 Next Steps

1. Read [Contributing Guidelines](../CONTRIBUTING.md)
2. Review [Developer Notes](../doc/developer-notes.md)
3. Check [Security Practices](Security-Practices.md)
4. Explore [Private Data Handling](Private-Data-Handling.md)
5. Understand [Workflow Management](Workflow-Management.md)

## 🛠️ Development Tools

### Recommended IDE Setup

**VS Code**:
```json
// .vscode/settings.json (not committed)
{
  "files.exclude": {
    "**/.env": false,
    "**/build/": true
  },
  "C_Cpp.default.configurationProvider": "ms-vscode.cmake-tools"
}
```

**CLion**: Import CMake project directly

### Useful Scripts

```bash
# Format code
./contrib/devtools/clang-format-diff.py

# Lint Python
./test/lint/lint-all.sh

# Check includes
./contrib/devtools/bitcoin-config-includes.py
```

## ⚠️ Common Issues

### Build Failures

**Issue**: Missing dependencies
```bash
# Ubuntu/Debian
sudo apt-get install build-essential cmake ninja-build libboost-dev

# macOS
brew install cmake boost ninja
```

**Issue**: CMake configuration fails
```bash
# Clean and reconfigure
rm -rf build
cmake -B build
```

### Permission Issues

**Issue**: Can't execute scripts
```bash
chmod +x script.sh
```

## 📞 Getting Help

- Check [existing documentation](../doc/)
- Search [closed issues](../../issues?q=is%3Aissue+is%3Aclosed)
- Ask in [discussions](../../discussions)
- Review [FAQ](../doc/README.md)

## ✅ Setup Checklist

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Build successful
- [ ] Tests passing
- [ ] `.env` file created and configured
- [ ] Git identity configured
- [ ] Sensitive files verified as ignored
- [ ] Documentation reviewed

---

**Next**: Learn about [Security Practices](Security-Practices.md) to keep your development environment secure.
