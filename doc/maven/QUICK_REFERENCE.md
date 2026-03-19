# Quick Reference: Secure Package Publishing

A concise guide for safely publishing packages to GitHub Packages.

## Prerequisites Checklist

Before publishing, ensure:

- [ ] GitHub Personal Access Token (PAT) created with `write:packages` scope
- [ ] Token stored securely (environment variable, not hardcoded)
- [ ] Maven `settings.xml` configured in `~/.m2/` directory
- [ ] Multi-Factor Authentication (MFA) enabled on GitHub account
- [ ] `.gitignore` properly configured to exclude credentials
- [ ] All tests passing
- [ ] Security scans completed

## Quick Setup (5 Minutes)

### 1. Create GitHub Token

```bash
# Go to: https://github.com/settings/tokens/new
# Scopes needed: write:packages, read:packages, repo (if private)
# Save token immediately - you won't see it again!
```

### 2. Configure Environment

```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export GITHUB_TOKEN="ghp_your_token_here"' >> ~/.bashrc
source ~/.bashrc

# Verify
echo $GITHUB_TOKEN
```

### 3. Setup Maven Settings

```bash
# Create Maven directory
mkdir -p ~/.m2

# Copy template
cp doc/maven/settings.xml.template ~/.m2/settings.xml

# Edit with your GitHub username
sed -i 's/YOUR_GITHUB_USERNAME/your-actual-username/' ~/.m2/settings.xml

# Secure permissions
chmod 600 ~/.m2/settings.xml
```

### 4. Verify Configuration

```bash
# Check settings
mvn help:effective-settings | grep github

# Verify token is loaded
echo $GITHUB_TOKEN | cut -c1-10  # Shows first 10 chars only
```

## Publishing Commands

### Deploy to GitHub Packages

```bash
# Standard deployment
mvn clean deploy

# Skip tests (only if already tested)
mvn clean deploy -DskipTests

# Specific version
mvn versions:set -DnewVersion=1.0.1
mvn clean deploy
mvn versions:commit
```

### Verify Published Package

```bash
# List organization packages
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/orgs/kushmanmb-org/packages

# Check specific package
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/orgs/kushmanmb-org/packages/maven/org.kushmanmb.bitcoin
```

## Security Checklist (Pre-Publish)

Before each deployment:

- [ ] No hardcoded credentials in code
- [ ] No sensitive data in test files
- [ ] Dependencies updated and scanned
- [ ] `pom.xml` version incremented
- [ ] No `-SNAPSHOT` in release version
- [ ] `.gitignore` verified
- [ ] Commit history clean (no secrets)
- [ ] Branch protection rules followed
- [ ] Code review completed

## Common Issues & Fixes

### 401 Unauthorized

```bash
# Check token exists
echo $GITHUB_TOKEN

# Verify token hasn't expired
# Go to: https://github.com/settings/tokens

# Check settings.xml
cat ~/.m2/settings.xml | grep -A 3 "<server>"
```

### 403 Forbidden

```bash
# Verify GitHub permissions
# You need write access to kushmanmb-org/bitcoin

# Check token scopes
# Token must have 'write:packages' scope
```

### Package Not Found

```bash
# Ensure package exists
mvn dependency:get \
  -DremoteRepositories=https://maven.pkg.github.com/kushmanmb-org/bitcoin \
  -DgroupId=org.kushmanmb \
  -DartifactId=bitcoin \
  -Dversion=1.0.0
```

## Emergency: Token Compromised

If your token is exposed:

1. **Immediately revoke** at: https://github.com/settings/tokens
2. **Generate new token** with same scopes
3. **Update environment variable**: `export GITHUB_TOKEN="new_token"`
4. **Notify security team** if in organization
5. **Review access logs** for suspicious activity
6. **Document incident** for audit trail

## Best Practices Summary

### DO ✅

- Use environment variables for tokens
- Rotate tokens every 90 days
- Enable MFA on GitHub account
- Use separate tokens for dev/CI/prod
- Review `.gitignore` before commits
- Keep dependencies updated
- Run security scans regularly
- Document publishing procedures

### DON'T ❌

- Commit `settings.xml` to repository
- Hardcode tokens in any file
- Share tokens between team members
- Use tokens without expiration
- Skip security scans
- Publish without tests passing
- Use same token for everything
- Disable MFA

## Quick Commands Reference

```bash
# Check effective Maven settings
mvn help:effective-settings

# Validate pom.xml
mvn validate

# Run all tests
mvn test

# Clean and build
mvn clean package

# Deploy to GitHub Packages
mvn clean deploy

# Check for updates
mvn versions:display-dependency-updates

# Security scan
mvn org.owasp:dependency-check-maven:check

# Show dependency tree
mvn dependency:tree
```

## Environment Variables

```bash
# Required
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Optional (if needed)
export GITHUB_USERNAME="your-username"
export GPG_PASSPHRASE="your-gpg-passphrase"
```

## File Locations

```
~/.m2/settings.xml              # Maven authentication config
~/.m2/settings-security.xml     # Encrypted passwords (optional)
~/.bashrc or ~/.zshrc           # Environment variables
~/.gitconfig                    # Git configuration
```

## Additional Resources

- Full guide: [doc/maven/README.md](README.md)
- Security practices: [SECURITY_PRACTICES.md](../../SECURITY_PRACTICES.md)
- GitHub Packages docs: https://docs.github.com/en/packages
- Maven security: https://maven.apache.org/security.html

## Support

- Security issues: See [SECURITY.md](../../SECURITY.md)
- Questions: Create issue or discussion
- Vulnerabilities: security@bitcoincore.org

---

**Last Updated**: 2026-02-13  
**Review**: This guide should be reviewed quarterly and after security incidents.
