# Security Practices

This document outlines security best practices for working with the Bitcoin Core project.

## 🔐 Protecting Sensitive Data

### Never Commit Sensitive Information

**NEVER** commit the following to the repository:
- Private keys (`.pem`, `.key`, `.p12`, `.pfx`)
- API keys and tokens
- Passwords or credentials
- Database files with real data
- Wallet files (`wallet.dat`)
- Environment files (`.env`, `.env.local`)
- Configuration files with secrets (`secrets.json`, `credentials.json`)
- Personal notes or documentation with sensitive info

### Using .gitignore Effectively

The project's `.gitignore` file is configured to exclude sensitive files. Common patterns include:

```
# Private keys
*.pem
*.key
*.p12
*.pfx

# Environment files
.env
.env.local
*.secret

# Sensitive configuration
config.json
secrets.json
credentials.json
```

### Check Before Committing

Always review your changes before committing:

```bash
git status
git diff
```

Use `git add -p` to stage changes interactively, reviewing each chunk.

## 🔑 Managing Secrets

### GitHub Secrets

For workflows that need API keys or credentials:

1. **Add secrets in repository settings**: Settings → Secrets and variables → Actions
2. **Reference in workflows**: `${{ secrets.SECRET_NAME }}`
3. **Never echo or log secrets**: They will be automatically masked in logs

Example workflow usage:

```yaml
steps:
  - name: Use API
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: |
      # Use $API_KEY here
      # Never echo $API_KEY
```

### Environment Variables

For local development:

1. Create a `.env` file (already in `.gitignore`)
2. Load it using your environment or a tool like `dotenv`
3. Never commit the `.env` file

```bash
# .env file (never commit this)
API_KEY=your-key-here
DB_PASSWORD=your-password
```

## 🛡️ Code Security

### Input Validation

Always validate and sanitize inputs:

```cpp
// Bad
std::string user_input = GetUserInput();
ExecuteCommand(user_input);

// Good
std::string user_input = GetUserInput();
if (ValidateInput(user_input)) {
    ExecuteCommand(SanitizeInput(user_input));
}
```

### Secure Dependencies

- Regularly update dependencies
- Review security advisories
- Use lock files to ensure reproducible builds
- Run security scans in CI/CD

### Cryptographic Best Practices

- Use established cryptographic libraries (libsecp256k1, OpenSSL)
- Never implement custom cryptography
- Use secure random number generation
- Follow current best practices for key sizes and algorithms

## 🔒 Workflow Security

### Bitcoin Ownership Announcements

The `bitcoin-ownership-announcement.yml` workflow follows these security practices:

1. **No Secrets in Workflow**: Only public ENS names are stored
2. **Automated Security Scanning**: Built-in verification to detect secrets
3. **Public Data Only**: Announcements contain no private keys or credentials
4. **Pattern Matching**: Scans for:
   - Private keys (various formats)
   - Seed phrases and mnemonics
   - Passwords and API keys
   - Bitcoin/Ethereum private key patterns

### Workflow Best Practices

When creating or modifying workflows:

- Store secrets in GitHub Secrets, never in workflow files
- Use `${{ secrets.SECRET_NAME }}` syntax for secret access
- Never log or echo secret values
- Add security scanning steps to verify outputs
- Use minimal permissions (`permissions:` block)
- Enable concurrency controls to prevent race conditions

Example secure workflow pattern:

```yaml
permissions:
  contents: write  # Only what's needed

jobs:
  secure-job:
    steps:
      - name: Use secret safely
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          # Use API_KEY without echoing it
          curl -H "Authorization: Bearer $API_KEY" api.example.com
```

## 🔍 Security Reviews

### Pull Request Reviews

All code changes should be reviewed with security in mind:

- Check for sensitive data in commits
- Verify input validation
- Review authentication and authorization
- Look for injection vulnerabilities
- Check for race conditions
- Scan workflows for hardcoded secrets
- Verify workflow permissions are minimal

### Security Testing

- Run static analysis tools
- Perform fuzz testing for critical components
- Test error handling and edge cases
- Verify secure defaults
- Validate workflow security configurations

## 📋 Incident Response

If you discover a security vulnerability:

1. **Do NOT open a public issue**
2. Follow the [Security Policy](../SECURITY.md)
3. Report privately to the security team
4. Wait for acknowledgment before disclosure

## 🔄 Regular Security Maintenance

### Periodic Reviews

- Review and update `.gitignore` patterns
- Audit access controls and permissions
- Check for leaked secrets in history
- Update dependencies and security patches

### Security Scanning

Enable and monitor:
- GitHub Security Advisories
- Dependabot alerts
- Code scanning (CodeQL)
- Secret scanning

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [Bitcoin Security Documentation](../SECURITY.md)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

**Remember**: Security is everyone's responsibility. When in doubt, ask for a security review.
