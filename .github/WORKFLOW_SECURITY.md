# GitHub Actions Workflow Security Guide

## Overview

This document describes the security practices implemented in the GitHub Actions workflows for this repository to protect private data and sensitive information.

## Security Measures Implemented

### 1. API Key Protection

**Location**: `.github/workflows/etherscan-apiv2.yml`

**Measures**:
- ✅ API keys are constructed in subshells with command echoing disabled (`set +x`)
- ✅ Secrets are masked using `::add-mask::` command at the start of jobs
- ✅ Shell debugging is explicitly disabled to prevent command echoing
- ✅ All API requests use HTTPS
- ✅ Temporary files are cleaned up immediately after use
- ✅ URL construction happens in isolated subshells to minimize exposure risk

**Why**: While Etherscan requires API keys as URL parameters (not headers), we can still protect them by:
1. Constructing URLs in subshells with `set +x` to disable command echoing
2. Masking secrets at the job level using `::add-mask::`
3. Avoiding storage of URLs containing secrets in environment variables that could be logged

### 2. GitHub Actions Runtime Token Protection

**Location**: `.github/actions/configure-docker/action.yml`

**Measures**:
- ✅ `ACTIONS_RUNTIME_TOKEN` is explicitly masked using `core.setSecret()`
- ✅ Token is only exported for Docker buildkit cache operations
- ✅ Token is scoped to workflow run and expires automatically

**Why**: The runtime token is sensitive and should not appear in logs, even though it's automatically scoped and expires.

### 3. Git Credential Management

**Location**: `.github/workflows/self-hosted-runner-setup.yml`

**Measures**:
- ✅ Git credentials are cleared after each workflow run
- ✅ Credential helpers are explicitly unset
- ✅ No persistent credential storage

**Why**: Self-hosted runners may persist data between runs, so credentials must be explicitly cleared.

### 4. Secret Scanning

**Locations**:
- `.github/workflows/bitcoin-ownership-announcement.yml` (lines 248-294)
- `.github/workflows/wiki-management.yml` (lines 47-83)
- `.github/workflows/deploy-website.yml` (lines 81-105)

**Measures**:
- ✅ Automated scanning for common secret patterns
- ✅ Pattern matching for private keys, passwords, API keys
- ✅ Validation fails if potential secrets are detected
- ✅ Third-party security scanning tools (TruffleHog, Trivy)

**Why**: Multiple layers of defense prevent accidental secret commits.

### 5. Environment Variable Sanitization

**Location**: `.github/workflows/self-hosted-runner-setup.yml` (line 139)

**Measures**:
- ✅ Only safe environment variables are displayed
- ✅ Variables containing tokens, secrets, passwords are filtered out
- ✅ Explicit allow-list approach for environment display

**Why**: Environment variables may contain sensitive data and should not be dumped to logs.

### 6. Checkout Security

**Locations**: Multiple workflows

**Measures**:
- ✅ `persist-credentials: false` used in sensitive operations
- ✅ Clean checkouts to prevent cross-contamination
- ✅ Limited token scopes where possible

**Why**: Persisting credentials can lead to accidental exposure in subsequent steps.

### 7. Workspace Cleanup

**Location**: `.github/workflows/self-hosted-runner-setup.yml` (lines 142-152, 191-198)

**Measures**:
- ✅ Temporary files are removed after each run
- ✅ Private keys (`.pem`, `.key`) are explicitly deleted
- ✅ Environment files (`.env*`) are removed
- ✅ Git credential files are cleared

**Why**: Self-hosted runners persist data, so cleanup is essential to prevent data leakage.

## Secret Types Protected

### Never Logged or Exposed:
1. **API Keys** (Etherscan, etc.)
2. **GitHub Tokens** (GITHUB_TOKEN, ACTIONS_RUNTIME_TOKEN)
3. **Private Keys** (SSH, GPG, cryptocurrency)
4. **Passwords and Credentials**
5. **Seed Phrases and Mnemonics**
6. **Personal Access Tokens**

### Public Data (Safe to Log):
1. **ENS Names** (e.g., kushmanmb.eth)
2. **Public Blockchain Addresses** (after resolution)
3. **Repository Information** (commit SHAs, branch names)
4. **Workflow Run IDs**
5. **Public Configuration Values**

## Best Practices for Contributors

### When Adding New Workflows:

1. **Prefer** header-based authentication when the API supports it
   ```yaml
   # ✅ BEST (if API supports it)
   curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" "https://api.example.com/data"
   
   # ✅ ACCEPTABLE (if API requires URL parameters)
   # Use subshell with disabled echoing
   (
     set +x 2>/dev/null
     curl "https://api.example.com/data?apikey=${{ secrets.API_KEY }}" -o output.json
   )
   
   # ❌ BAD - Direct construction that could be logged
   curl "https://api.example.com/data?apikey=${{ secrets.API_KEY }}"
   ```

2. **Always** mask secrets at the start of jobs
   ```yaml
   - name: Security - Mask secrets
     run: |
       set +x  # Disable shell debugging
       echo "::add-mask::${{ secrets.MY_SECRET }}"
   ```

3. **Never** echo or log secrets
   ```yaml
   # ❌ BAD
   - run: echo "API Key is ${{ secrets.API_KEY }}"
   
   # ✅ GOOD
   - run: echo "API Key configured successfully"
   ```

4. **Use** subshells for API calls that require secrets in URLs
   ```bash
   # ✅ GOOD - Subshell with disabled echoing
   (
     set +x 2>/dev/null  # Disable debugging
     curl "https://api.example.com/data?apikey=${{ secrets.API_KEY }}" -o output.json
   )
   ```

5. **Disable** shell debugging in sensitive operations
   ```bash
   set +x  # Disable debugging
   # sensitive operations here
   ```

6. **Clear** credentials and temporary files after use
   ```bash
   git config --unset-all credential.helper
   rm -rf .git/credentials
   ```

7. **Use** `persist-credentials: false` when checking out code
   ```yaml
   - uses: actions/checkout@v6
     with:
       persist-credentials: false
   ```

### When Reviewing Pull Requests:

1. Check for hardcoded secrets or credentials
2. Verify API keys are passed via headers, not URLs
3. Ensure shell debugging is disabled for sensitive operations
4. Confirm credentials are cleared after use
5. Look for accidental secret logging (`echo`, `print`, etc.)

## Security Checklist for New Workflows

- [ ] Secrets are passed via HTTP headers, not URL parameters
- [ ] Secrets are masked using `::add-mask::` at job start
- [ ] Shell debugging is disabled (`set +x`)
- [ ] No secrets are echoed or logged
- [ ] Git credentials are cleared after use (if applicable)
- [ ] `persist-credentials: false` is used for checkout (if applicable)
- [ ] Workspace is cleaned up after job completion (for self-hosted)
- [ ] Security scanning is included (if handling user content)
- [ ] Timeouts are set to prevent runaway jobs

## Reporting Security Issues

If you discover a security vulnerability in our workflows:

1. **Do NOT** open a public issue
2. Follow the process in [SECURITY.md](../SECURITY.md)
3. Include details about the vulnerability
4. Suggest a fix if possible

## References

- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Using Secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Security Hardening for Self-Hosted Runners](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#hardening-for-self-hosted-runners)

## Last Updated

This document was last updated: 2026-02-15

---

**Note**: This is a living document. As new security measures are implemented or best practices evolve, this document will be updated accordingly.
