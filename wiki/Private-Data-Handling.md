# Private Data Handling

This guide provides detailed instructions for handling private and sensitive data securely in the Bitcoin Core project.

## 🎯 Overview

Private data includes any information that should not be publicly accessible, such as:

- API keys and authentication tokens
- Private cryptographic keys
- User credentials and passwords
- Personal information
- Proprietary configuration
- Database connection strings
- Session tokens

## 🏆 Repository Ownership & Creator Badge

This repository is maintained and secured by:

**Repository Owner**: kushmanmb.eth (Ethereum Name Service)  
**Creator**: kushmanmb

### ENS Identifiers
- **Primary**: kushmanmb.eth (Ethereum Mainnet)
- **Base Network**: Kushmanmb.base.eth
- **yaketh.eth** (Ethereum Name Service)

### Ownership Verification
All ownership claims are publicly documented in the `/data/ownership/` directory and verified through:
- Timestamped announcements
- GitHub Actions workflow signatures
- ENS domain associations

⚠️ **Important**: Private keys associated with these ENS identifiers are NEVER stored in this repository or any public location. All private key management follows the security practices outlined in this document.

## 📁 File-Based Data Protection

### .gitignore Configuration

The project `.gitignore` is configured to automatically exclude sensitive files:

#### Private Keys and Certificates
```
*.pem
*.key
*.p12
*.pfx
*.crt
*.der
id_rsa
id_dsa
*.pub
```

#### Environment and Configuration
```
.env
.env.local
.env.*.local
*.secret
config.json
secrets.json
credentials.json
auth.json
```

#### Database and Wallet Files
```
*.db
*.sqlite
*.sqlite3
wallet.dat
*.wallet
```

#### Build Artifacts and Logs
```
*.log
logs/
build/
dist/
tmp/
temp/
```

### Verifying Ignored Files

Before committing, verify your sensitive files are ignored:

```bash
# Check what files are tracked
git status

# Check if a specific file is ignored
git check-ignore -v path/to/file

# List all ignored files
git status --ignored
```

### Emergency: Removing Committed Secrets

If you accidentally commit sensitive data:

1. **Immediately** rotate the exposed credentials
2. Contact the security team
3. Use `git filter-branch` or BFG Repo-Cleaner to remove the data from history
4. Force push (requires coordination with the team)

```bash
# Don't do this alone - coordinate with team first
# This rewrites history and affects all contributors
```

## 🔐 Environment-Based Configuration

### Local Development

Use environment variables for sensitive configuration:

1. Create a `.env` file in your project root (already ignored):

```bash
# .env - NEVER commit this file
BITCOIN_RPC_USER=myuser
BITCOIN_RPC_PASSWORD=mypassword
BITCOIN_RPC_HOST=localhost
BITCOIN_RPC_PORT=8332

# API Keys
ETHERSCAN_API_KEY=your_api_key_here
BLOCKCHAIN_API_KEY=your_key_here

# Database
DB_CONNECTION_STRING=postgresql://user:pass@localhost/db
```

2. Load environment variables in your application:

```cpp
// C++ example
const char* rpc_user = std::getenv("BITCOIN_RPC_USER");
if (!rpc_user) {
    throw std::runtime_error("BITCOIN_RPC_USER not set");
}
```

```python
# Python example
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file

rpc_user = os.getenv('BITCOIN_RPC_USER')
if not rpc_user:
    raise ValueError("BITCOIN_RPC_USER not set")
```

### Production Configuration

For production environments:

- Use secure secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.)
- Never hardcode credentials
- Use read-only credentials where possible
- Implement credential rotation policies

## 🔄 GitHub Actions & CI/CD

### Using Secrets in Workflows

Store sensitive data in GitHub Secrets:

1. Navigate to: Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add your secret (it will be encrypted)

Use in workflows:

```yaml
name: CI with Secrets
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      
      - name: Build with API access
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: |
          # Secrets are automatically masked in logs
          # Never echo or print secrets
          ./build.sh
```

### Best Practices for Workflow Secrets

✅ **DO**:
- Use descriptive secret names
- Document required secrets in README
- Use separate secrets for different environments
- Limit secret access to necessary workflows
- Rotate secrets regularly

❌ **DON'T**:
- Echo or log secret values
- Pass secrets as command-line arguments (visible in process lists)
- Store secrets in workflow files
- Share secrets across unrelated projects

### Example: Safe API Usage

```yaml
- name: Fetch data from API
  env:
    API_KEY: ${{ secrets.ETHERSCAN_API_KEY }}
  run: |
    # Safe: API key is in environment variable
    curl -H "Authorization: Bearer ${API_KEY}" https://api.example.com/data
    
    # UNSAFE: Would log the key
    # echo "Using key: ${API_KEY}"
```

## 🗂️ Data Classification

### Public Data
- Open source code
- Public documentation
- Non-sensitive configuration
- Public test data

### Private Data (Must be protected)
- API keys and tokens
- Private keys and certificates
- Passwords and credentials
- User data
- Financial information
- Internal configuration

### Confidential Data (Extra protection)
- Production credentials
- User private keys
- Financial transactions
- Security-related information

## 📋 Checklist for Developers

Before every commit:

- [ ] Review `git status` for unintended files
- [ ] Check `git diff` for sensitive data
- [ ] Verify `.env` files are not staged
- [ ] Ensure no hardcoded credentials
- [ ] Confirm test data uses dummy values
- [ ] No private keys in test files

Before creating a PR:

- [ ] Remove debug print statements that might log sensitive data
- [ ] Replace real API keys with placeholders in examples
- [ ] Document required environment variables
- [ ] Update `.gitignore` if adding new sensitive file types

## 🚨 Common Mistakes to Avoid

### 1. Committing Configuration Files

```bash
# Bad - committing config with secrets
git add config.json

# Good - use environment variables or secrets
git add config.example.json  # Template only
```

### 2. Logging Sensitive Data

```cpp
// Bad
LOG_INFO("API Key: " + api_key);

// Good
LOG_INFO("API connection established");
```

### 3. Hardcoded Credentials

```python
# Bad
api_key = "sk_live_1234567890abcdef"

# Good
api_key = os.getenv('API_KEY')
if not api_key:
    raise ValueError("API_KEY environment variable not set")
```

### 4. Test Data with Real Credentials

```javascript
// Bad
const testConfig = {
  apiKey: "real_production_key_123"
};

// Good
const testConfig = {
  apiKey: process.env.TEST_API_KEY || "test_key_placeholder"
};
```

## 🔍 Auditing and Monitoring

### Regular Audits

Periodically check for:

```bash
# Search for potential API keys in code
git grep -i "api[_-]key"
git grep -i "password"
git grep -i "secret"

# Check git history for sensitive patterns
git log -S "password" --all

# Use git-secrets to prevent commits with secrets
git secrets --scan
```

### Automated Scanning

Enable GitHub's security features:

- **Secret scanning**: Automatically detects secrets in code
- **Code scanning**: Identifies security vulnerabilities
- **Dependabot**: Alerts for vulnerable dependencies

## 📞 Getting Help

If you're unsure about handling sensitive data:

1. Ask in the development chat/forum (without revealing the secret)
2. Review the [Security Policy](../SECURITY.md)
3. Contact the security team directly
4. Refer to this documentation

---

**Remember**: It's easier to keep secrets out of version control than to remove them after they're committed.
