# Security and Privacy Practices

## Overview

This document outlines enhanced security and privacy practices for developing and publishing the Bitcoin Core project, with special emphasis on safe package management and GitHub Packages publishing.

## Table of Contents

1. [Maven/GitHub Packages Security](#maven-github-packages-security)
2. [Authentication Best Practices](#authentication-best-practices)
3. [Sensitive Data Protection](#sensitive-data-protection)
4. [Safe Development Workflow](#safe-development-workflow)
5. [Publishing Security](#publishing-security)
6. [GitHub Actions Security](#github-actions-security)
7. [Privacy Considerations](#privacy-considerations)

## Maven/GitHub Packages Security

### 1. Secure Authentication Configuration

**NEVER** commit your GitHub Personal Access Token (PAT) or credentials to the repository.

#### Setting Up Maven Authentication

Create or edit `~/.m2/settings.xml` (NOT in the repository):

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                              http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <servers>
    <server>
      <id>github</id>
      <username>YOUR_GITHUB_USERNAME</username>
      <password>${env.GITHUB_TOKEN}</password>
    </server>
  </servers>
</settings>
```

**Key Points:**
- Store `settings.xml` in your home directory (`~/.m2/`), not in the project
- Use environment variables for tokens: `${env.GITHUB_TOKEN}`
- Never hardcode passwords or tokens in configuration files
- The server `id` must match the `id` in `pom.xml` distributionManagement

### 2. GitHub Personal Access Token (PAT)

#### Creating a Secure PAT

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set appropriate scopes:
   - `write:packages` - Upload packages to GitHub Package Registry
   - `read:packages` - Download packages from GitHub Package Registry
   - `delete:packages` - Delete packages (use cautiously)
   - `repo` - Required for private repositories
4. Set an expiration date (recommended: 90 days or less)
5. Generate and **immediately** save the token securely

#### Storing the Token Securely

**Option 1: Environment Variable (Recommended)**

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`):

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

Then reload: `source ~/.bashrc`

**Option 2: Encrypted Credentials**

Use Maven's password encryption:

```bash
# Create master password
mvn --encrypt-master-password your_master_password

# Encrypt your token
mvn --encrypt-password ghp_your_token_here
```

Store in `~/.m2/settings-security.xml` (see [Maven Password Encryption](https://maven.apache.org/guides/mini/guide-encryption.html))

**Option 3: Credential Manager**

Use your OS credential manager:
- **macOS**: Keychain Access
- **Linux**: GNOME Keyring, KWallet, or pass
- **Windows**: Windows Credential Manager

### 3. Token Rotation Policy

**Mandatory practices:**

- Rotate tokens every 90 days
- Immediately revoke tokens when:
  - An authorized person leaves the team
  - A token is accidentally exposed
  - Suspicious activity is detected
- Use separate tokens for:
  - Development/testing
  - CI/CD pipelines
  - Production publishing
- Document token ownership and purpose

## Authentication Best Practices

### 1. Multi-Factor Authentication (MFA)

**Required for all team members:**

- Enable MFA on GitHub account
- Use authenticator app (Google Authenticator, Authy, 1Password)
- Store backup codes securely offline
- Never disable MFA, even temporarily

### 2. SSH Key Management

When using SSH for Git operations:

```bash
# Generate strong SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub
cat ~/.ssh/id_ed25519.pub
```

**Security measures:**
- Use passphrase-protected keys
- Rotate keys annually
- Use separate keys for different purposes
- Never commit private keys (`.gitignore` already configured)

### 3. Access Control

**Repository permissions:**
- Minimum necessary access principle
- Regular access audits
- Remove access for inactive members
- Use teams for group permissions

## Sensitive Data Protection

### 1. Pre-Commit Checks

Always verify before committing:

```bash
# Check what will be committed
git status
git diff --cached

# Review .gitignore coverage
git check-ignore -v <file>

# Search for potential secrets
git grep -i "password\|secret\|token\|key" 
```

### 2. Prohibited Content

**Never commit:**

- Private keys (`.key`, `.pem`, `id_rsa`, etc.)
- Passwords or passphrases
- API keys or tokens
- OAuth client secrets
- Database credentials
- Wallet files (`wallet.dat`, `.wallet`)
- Seed phrases or mnemonics
- Personal data (PII)
- Internal documentation marked private
- Customer data or transaction information

### 3. Accidental Exposure Response

If sensitive data is committed:

1. **DO NOT** just delete the file - it remains in history
2. Immediately revoke/rotate the exposed credentials
3. Contact repository administrators
4. Use `git filter-branch` or `BFG Repo-Cleaner` to remove from history
5. Force push (requires coordination with team)
6. Document the incident

**Example using BFG:**

```bash
# Remove sensitive file from history
bfg --delete-files sensitive-file.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Safe Development Workflow

### 1. Local Development Environment

```bash
# Clone repository
git clone https://github.com/kushmanmb-org/bitcoin.git
cd bitcoin

# Create environment file (already in .gitignore)
cat > .env << 'EOF'
# Bitcoin RPC Configuration
BITCOIN_RPC_USER=localuser
BITCOIN_RPC_PASSWORD=generate_strong_password
BITCOIN_RPC_HOST=localhost
BITCOIN_RPC_PORT=8332

# GitHub Token for packages (use actual token)
GITHUB_TOKEN=ghp_your_token_here
EOF

# Set secure permissions
chmod 600 .env

# Verify it's ignored
git check-ignore .env
```

### 2. Branch Protection

**Recommended GitHub branch protection rules:**

- Require pull request reviews (minimum 2)
- Require status checks to pass
- Require conversation resolution
- Include administrators in restrictions
- Require signed commits
- Enable "Do not allow bypassing the above settings"

### 3. Code Review Security Checklist

Before approving PRs, verify:

- [ ] No hardcoded credentials or secrets
- [ ] No sensitive data in test fixtures
- [ ] No debugging code with passwords
- [ ] No commented-out credentials
- [ ] No API keys in configuration
- [ ] Dependencies are from trusted sources
- [ ] No suspicious external URLs
- [ ] Proper input validation and sanitization
- [ ] No SQL injection vulnerabilities
- [ ] Proper error handling (no sensitive info in errors)

## Publishing Security

### 1. Package Publishing Checklist

Before publishing to GitHub Packages:

- [ ] All tests pass
- [ ] Security scanning complete (no high/critical issues)
- [ ] Dependencies audited and updated
- [ ] Version number incremented appropriately
- [ ] Release notes prepared
- [ ] `pom.xml` verified (no test/debug configurations)
- [ ] No snapshot dependencies in release
- [ ] GPG signing configured (for verification)
- [ ] Publishing credentials secured
- [ ] Backup created

### 2. Maven Deploy Command

Safe deployment process:

```bash
# Verify your configuration
mvn help:effective-settings

# Dry run (validate without deploying)
mvn clean verify

# Deploy to GitHub Packages
mvn clean deploy

# Deploy specific version
mvn versions:set -DnewVersion=1.0.1
mvn clean deploy
mvn versions:commit
```

### 3. Package Verification

After publishing:

```bash
# Verify package is accessible
mvn dependency:get \
  -DremoteRepositories=https://maven.pkg.github.com/kushmanmb-org/bitcoin \
  -DgroupId=org.kushmanmb \
  -DartifactId=bitcoin \
  -Dversion=1.0.0

# Check package metadata
curl -H "Authorization: token ${GITHUB_TOKEN}" \
  https://api.github.com/orgs/kushmanmb-org/packages/maven/org.kushmanmb.bitcoin
```

### 4. Package Security Scanning

**Before each release:**

```bash
# OWASP Dependency Check
mvn org.owasp:dependency-check-maven:check

# Snyk scanning (if configured)
snyk test

# Trivy scanning
trivy fs --security-checks vuln .
```

## GitHub Actions Security

### 1. Prevent Command Injection

GitHub Actions workflows can be vulnerable to command injection when using untrusted input in shell commands.

#### ❌ VULNERABLE Pattern

**NEVER** directly interpolate GitHub context variables in shell commands:

```yaml
# DANGEROUS - Vulnerable to command injection
- run: |
    gh issue --repo ${{ github.repository }} \
      create --title "Issue title" --body "Issue body"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Why this is dangerous:**
- `${{ github.repository }}` is interpolated directly into the shell command
- If the repository name contains special characters (e.g., backticks, semicolons), it could execute arbitrary commands
- User-controlled input from PRs, issues, or comments can be exploited

#### ✅ SECURE Pattern

**Option 1: Use GitHub Script Action (Recommended)**

```yaml
# SAFE - Uses GitHub API directly, no shell execution
- name: Create issue using GitHub Script
  uses: actions/github-script@v7
  with:
    script: |
      await github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: 'Issue title',
        body: 'Issue body'
      });
```

**Benefits:**
- No shell command execution
- Values passed as structured data, not string interpolation
- Built-in authentication and error handling
- Type-safe API

**Option 2: Use Environment Variables**

```yaml
# SAFE - Uses environment variables
- name: Create issue with gh CLI
  run: |
    gh issue --repo "$REPO_NAME" \
      create --title "$ISSUE_TITLE" --body "$ISSUE_BODY"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    REPO_NAME: ${{ github.repository }}
    ISSUE_TITLE: "Issue title"
    ISSUE_BODY: "Issue body"
```

**Benefits:**
- Environment variables are properly escaped
- No direct interpolation in shell commands
- Shell treats them as single values

### 2. Input Validation

When accepting user input in workflows, always validate and sanitize:

```yaml
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version'
        required: true
        type: string

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      # Validate input format
      - name: Validate version format
        env:
          VERSION: ${{ inputs.version }}
        run: |
          if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "Invalid version format. Expected: X.Y.Z"
            exit 1
          fi
      
      # Use validated input safely
      - name: Create release
        uses: actions/github-script@v7
        env:
          VERSION: ${{ inputs.version }}
        with:
          script: |
            const version = process.env.VERSION;
            await github.rest.repos.createRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              tag_name: `v${version}`,
              name: `Release ${version}`
            });
```

### 3. Restrict Workflow Permissions

Use the principle of least privilege for workflow permissions:

```yaml
# Minimal permissions
permissions:
  contents: read      # Read repository content
  issues: write       # Create/update issues only

jobs:
  my-job:
    runs-on: ubuntu-latest
    # Override with even more restrictive permissions if needed
    permissions:
      issues: write
      contents: none
```

**Avoid:**
```yaml
# DANGEROUS - Too permissive
permissions: write-all
```

### 4. Secure Secrets Management

**Best practices for secrets:**

```yaml
# GOOD - Secrets not exposed to shell
- name: Deploy with action
  uses: some-action@v1
  with:
    api_key: ${{ secrets.API_KEY }}

# BAD - Secret exposed in shell environment
- run: echo "API_KEY=${{ secrets.API_KEY }}" >> $GITHUB_ENV

# BAD - Secret in command output
- run: curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" https://api.example.com
```

**Safe secret usage:**

```yaml
- name: Use secret safely
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: |
    # Secret in environment, not in command line
    curl -H "Authorization: Bearer ${API_KEY}" https://api.example.com
```

### 5. Dependency Pinning

Pin action versions to specific SHA for security:

```yaml
# GOOD - Pinned to specific SHA
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1

# ACCEPTABLE - Pinned to specific version
- uses: actions/checkout@v4

# BAD - Uses mutable tag
- uses: actions/checkout@main
```

### 6. Third-Party Actions Review

Before using third-party actions:
- [ ] Review the action's source code
- [ ] Check the action's security track record
- [ ] Verify the action's permissions requirements
- [ ] Pin to a specific version or SHA
- [ ] Consider forking critical actions to your organization

### 7. Pull Request Security

**Prevent workflow execution from forks without approval:**

```yaml
on:
  pull_request_target:  # Use with caution!
    types: [opened, synchronize]

jobs:
  secure-job:
    runs-on: ubuntu-latest
    # Only run for organization members
    if: github.event.pull_request.head.repo.full_name == github.repository
```

**For public repositories:**
- Use `pull_request` trigger (not `pull_request_target`) for untrusted PRs
- Require manual approval for first-time contributors
- Never checkout untrusted PR code with write permissions

### 8. Code Scanning Integration

Integrate security scanning in workflows:

```yaml
- name: Run CodeQL Analysis
  uses: github/codeql-action/analyze@v4

- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@0.28.0
  with:
    scan-type: 'fs'
    scan-ref: '.'
```

### 9. Audit and Monitoring

Regularly review:
- Workflow run logs for suspicious activity
- Failed authentication attempts
- Unusual resource usage patterns
- Changes to workflow files

**Enable alerts:**
```yaml
# Set up workflow failure notifications
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: `Workflow failed: ${context.workflow}`,
        body: `Run: ${context.runId}`
      });
```

### 10. Security Checklist for Workflows

Before merging workflow changes:
- [ ] No direct interpolation of untrusted input in shell commands
- [ ] Secrets not exposed in logs or command outputs
- [ ] Minimal permissions assigned
- [ ] Actions pinned to specific versions
- [ ] Input validation implemented where needed
- [ ] No hard-coded credentials
- [ ] Reviewed third-party actions
- [ ] Tested in a safe environment first

## Privacy Considerations

### 1. Data Minimization

**In code and commits:**
- Use placeholder values in examples
- Anonymize test data
- Don't include real user information
- Remove debug logs with personal data
- Use synthetic data for testing

### 2. Logging Best Practices

```python
# BAD - Logs sensitive data
logger.info(f"User {username} logged in with password {password}")

# GOOD - Logs safely
logger.info(f"User authentication attempt", extra={'user_id': hash(username)})
```

### 3. Third-Party Services

When integrating external services:

- Review privacy policies
- Minimize data sharing
- Use data processing agreements
- Enable encryption in transit and at rest
- Regular privacy audits
- Document data flows

### 4. Compliance Considerations

For organizations:

- GDPR compliance for EU users
- CCPA compliance for California users  
- Data retention policies
- Right to deletion mechanisms
- Privacy impact assessments
- Regular compliance audits

## Emergency Procedures

### 1. Security Incident Response

If a security issue is discovered:

1. **Contain**: Revoke compromised credentials immediately
2. **Assess**: Determine scope of exposure
3. **Notify**: Contact security team and affected parties
4. **Remediate**: Fix vulnerability and clean up
5. **Document**: Record incident and response
6. **Review**: Conduct post-incident review

### 2. Emergency Contacts

- **Security issues**: security@bitcoincore.org
- **GitHub Security**: https://github.com/security
- **Repository admins**: [See SECURITY.md](/SECURITY.md)

### 3. Reporting Vulnerabilities

See [SECURITY.md](/SECURITY.md) for responsible disclosure process.

## Additional Resources

### Documentation

- [Maven Security](https://maven.apache.org/security.html)
- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Tools

- [git-secrets](https://github.com/awslabs/git-secrets) - Prevents committing secrets
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) - Removes sensitive data from history
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)
- [Snyk](https://snyk.io/) - Vulnerability scanning
- [Trivy](https://aquasecurity.github.io/trivy/) - Security scanner

## Review and Updates

This document should be reviewed and updated:
- Quarterly by security team
- After security incidents
- When new tools/services are adopted
- When compliance requirements change

Last Updated: 2026-02-13

---

**Remember: Security is everyone's responsibility. When in doubt, ask!**
