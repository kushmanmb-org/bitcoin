# Security Policy

## Overview

Bitcoin Core is a security-critical project. This document outlines our security policy, how to report vulnerabilities, and references to additional security resources.

For comprehensive security and privacy practices, please see [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md).

## Supported Versions

See our website for versions of Bitcoin Core that are currently supported with
security updates: https://bitcoincore.org/en/lifecycle/#schedule

## Reporting a Vulnerability

To report security issues send an email to security@bitcoincore.org (not for support).

**Do not open public GitHub issues for security vulnerabilities.**

### What to Include in Your Report

When reporting a security vulnerability, please include:

- Description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Affected versions (if known)
- Any potential mitigations or workarounds you've identified
- Your contact information for follow-up questions

### Response Process

1. **Acknowledgment**: We aim to acknowledge receipt within 48 hours
2. **Assessment**: Our security team will assess the vulnerability
3. **Updates**: We'll keep you informed of our progress
4. **Resolution**: Once fixed, we'll coordinate disclosure timing with you
5. **Credit**: We acknowledge security researchers who report valid issues

## PGP Keys for Secure Communication

The following keys may be used to communicate sensitive information to developers:

| Name | Fingerprint |
|------|-------------|
| Pieter Wuille | 133E AC17 9436 F14A 5CF1  B794 860F EB80 4E66 9320 |
| Michael Ford | E777 299F C265 DD04 7930  70EB 944D 35F9 AC3D B76A |
| Ava Chow | 1528 1230 0785 C964 44D3  334D 1756 5732 E08E 5E41 |

You can import a key by running the following command with that individual's fingerprint: 

```bash
gpg --keyserver hkps://keys.openpgp.org --recv-keys "<fingerprint>"
```

Ensure that you put quotes around fingerprints containing spaces.

## Security Best Practices for Contributors

### Before Contributing

1. **Review [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md)** for detailed security guidance
2. **Check [.gitignore](.gitignore)** to understand what files should never be committed
3. **Never commit sensitive data**: private keys, API tokens, credentials, or wallet files
4. **Use secure authentication**: Employ environment variables for secrets, never hardcode them

### During Development

1. **Keep dependencies updated**: Regularly check for security updates
2. **Run security scans**: Use available security scanning tools
3. **Review code carefully**: Every change is security-critical
4. **Test thoroughly**: Ensure your changes don't introduce vulnerabilities
5. **Follow safe git practices**: Review all changes before committing

### Authentication and Secrets Management

- **Never commit tokens to git**: Use environment variables or secure credential stores
- **Rotate credentials regularly**: Update tokens and keys periodically
- **Use minimal permissions**: Grant only the permissions required for your task
- **Secure local configuration**: Keep `settings.xml`, `~/.m2/`, and similar files secure

See [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) for detailed guidance on:
- Maven/GitHub Packages authentication
- GitHub Actions security
- Privacy considerations
- Safe publishing workflows

## Additional Resources

- [CONTRIBUTING.md](CONTRIBUTING.md) - General contribution guidelines
- [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) - Comprehensive security and privacy practices
- [Bitcoin Core Security](https://bitcoincore.org/en/security-advisories/) - Past security advisories

## Security-Related Files

The following files and directories are automatically excluded from version control to protect sensitive data:

- Private keys (`*.pem`, `*.key`, `id_rsa`, etc.)
- Wallet files (`wallet.dat`, `*.wallet`, etc.)
- Configuration files (`bitcoin.conf`, `settings.json`, etc.)
- API keys and tokens
- Environment files (`.env`, `.env.local`, etc.)
- Build artifacts and temporary files

Review [.gitignore](.gitignore) for the complete list of excluded patterns.

## Contact

- **Security Issues**: security@bitcoincore.org
- **General Support**: See https://bitcoincore.org for support channels
- **Project Website**: https://bitcoincore.org
