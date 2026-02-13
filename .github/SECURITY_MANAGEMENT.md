# Security and Branch Protection Management Guide

## Overview

This document provides comprehensive guidance on managing security and branch protection for the Bitcoin Core repository. It covers the implementation, maintenance, and best practices for using GitHub Rulesets and security workflows.

## Table of Contents

1. [Branch Protection Strategy](#branch-protection-strategy)
2. [Security Rulesets](#security-rulesets)
3. [Required Status Checks](#required-status-checks)
4. [Code Review Requirements](#code-review-requirements)
5. [Commit Signature Verification](#commit-signature-verification)
6. [Security Workflows](#security-workflows)
7. [Incident Response](#incident-response)
8. [Best Practices](#best-practices)

## Branch Protection Strategy

### Protected Branches

The following branches have protection rules enforced:

1. **Main/Master Branch**
   - Highest level of protection
   - Requires 2 approving reviews
   - All status checks must pass
   - No force pushes or deletions
   - Requires signed commits
   - Linear history enforced

2. **Release Branches** (release/*, v*)
   - Same protection as main branch
   - No bypass actors allowed
   - Critical for version integrity

3. **Development Branches** (dev, develop, development)
   - Moderate protection
   - Requires 1 approving review
   - Basic status checks
   - Allows faster iteration

### Branch Naming Conventions

Follow these conventions for automatic protection:
- `main` or `master` - Primary branch
- `release/*` - Release preparation branches
- `v*` - Version-specific branches
- `dev`, `develop`, `development` - Development branches
- `feature/*` - Feature branches (no automatic protection)
- `hotfix/*` - Critical fixes (follow release protection)

## Security Rulesets

### Ruleset Components

Each ruleset includes:
- **Target**: Branch or tag protection
- **Conditions**: Ref patterns to match
- **Rules**: Protection rules to enforce
- **Bypass Actors**: Who can bypass rules and under what conditions
- **Enforcement**: Active or evaluation mode

### Applying Rulesets

To apply rulesets to your repository:

1. **Via GitHub UI**:
   - Navigate to Settings → Rules → Rulesets
   - Create new ruleset
   - Use JSON files in `.github/rulesets/` as templates
   - Configure actors and contexts for your repository

2. **Via GitHub API**:
   ```bash
   # Create a ruleset via API
   curl -X POST \
     -H "Authorization: token YOUR_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/OWNER/REPO/rulesets \
     -d @.github/rulesets/branch-protection-main.json
   ```

3. **Via GitHub CLI**:
   ```bash
   # List existing rulesets
   gh api /repos/OWNER/REPO/rulesets
   
   # Create new ruleset
   gh api --method POST /repos/OWNER/REPO/rulesets \
     --input .github/rulesets/branch-protection-main.json
   ```

## Required Status Checks

### Security Checks

All protected branches require these security checks to pass:

1. **CodeQL Analysis**
   - Automated code scanning
   - Detects security vulnerabilities
   - Runs on all PRs and pushes

2. **Dependency Review**
   - Scans for vulnerable dependencies
   - Checks license compatibility
   - Runs on pull requests

3. **Secret Scanning**
   - Detects exposed secrets and credentials
   - Uses Gitleaks for comprehensive scanning
   - Runs on all commits

4. **Security Audit**
   - Trivy vulnerability scanner
   - SARIF results uploaded to Security tab
   - Fails on critical/high severity issues

### Build and Test Checks

1. **CI Build**
   - Compiles on multiple platforms
   - Verifies build system integrity

2. **Test Suite**
   - Unit tests
   - Functional tests
   - Integration tests

3. **Linting**
   - Code style verification
   - Security linting with Semgrep

## Code Review Requirements

### Review Process

1. **Number of Reviewers**
   - Main/Release: 2 approving reviews
   - Development: 1 approving review

2. **Code Owner Review**
   - Required for main and release branches
   - Defined in `.github/CODEOWNERS`
   - Ensures domain expertise

3. **Review Thread Resolution**
   - All comments must be resolved
   - Ensures all feedback is addressed

4. **Stale Review Dismissal**
   - New commits dismiss old approvals
   - Ensures reviews are current

### Reviewer Responsibilities

- Verify functionality works as intended
- Check for security vulnerabilities
- Ensure code quality and maintainability
- Validate test coverage
- Review documentation updates

## Commit Signature Verification

### Why Require Signatures

- Verifies commit author identity
- Prevents unauthorized commits
- Maintains chain of trust
- Required for protected branches

### Setting Up GPG Signing

1. **Generate GPG Key**:
   ```bash
   gpg --full-generate-key
   # Select RSA, 4096 bits
   # Set appropriate expiration
   ```

2. **Configure Git**:
   ```bash
   git config --global user.signingkey YOUR_KEY_ID
   git config --global commit.gpgsign true
   git config --global tag.gpgsign true
   ```

3. **Add to GitHub**:
   - Export public key: `gpg --armor --export YOUR_KEY_ID`
   - Add to GitHub Settings → SSH and GPG keys

4. **Verify Signatures**:
   ```bash
   git log --show-signature
   git verify-commit HEAD
   git verify-tag v1.0.0
   ```

## Security Workflows

### Automated Security Scanning

The `.github/workflows/security-checks.yml` workflow provides:

1. **Dependency Review** - Runs on pull requests
2. **Secret Scanning** - Runs on all commits
3. **Vulnerability Scanning** - Trivy scanner
4. **Security Linting** - Semgrep rules
5. **Permissions Check** - File permission validation
6. **Signature Verification** - Commit signature checks

### Manual Security Reviews

Conduct manual security reviews for:
- Cryptographic code changes
- Authentication/authorization changes
- Network protocol modifications
- Consensus rule changes

## Incident Response

### Security Vulnerability Reporting

Follow the process in `SECURITY.md`:
1. Email security@bitcoincore.org
2. Use GPG encryption for sensitive details
3. Wait for acknowledgment
4. Coordinate disclosure timeline

### Emergency Procedures

For critical security issues:
1. Notify security team immediately
2. May require bypass of protection rules
3. Document all bypass actions
4. Post-incident review required

### Rollback Procedures

If a security issue is merged:
1. Create hotfix branch
2. Revert problematic changes
3. Fast-track review process
4. Deploy fix to all affected versions

## Best Practices

### For Contributors

1. **Always Sign Commits**
   - Configure GPG signing in Git
   - Verify signatures before pushing

2. **Run Security Checks Locally**
   ```bash
   # Run CodeQL locally
   codeql database create db --language=cpp
   codeql database analyze db
   
   # Run Semgrep
   semgrep --config=auto .
   
   # Check for secrets
   gitleaks detect --source .
   ```

3. **Review Security Guidelines**
   - Read SECURITY.md
   - Follow secure coding practices
   - Document security considerations

### For Maintainers

1. **Review Rulesets Regularly**
   - Quarterly review of effectiveness
   - Update based on team feedback
   - Adjust bypass actors as needed

2. **Monitor Security Alerts**
   - Check GitHub Security tab daily
   - Triage Dependabot alerts
   - Respond to secret scanning alerts

3. **Enforce Security Practices**
   - Require security reviews for sensitive code
   - Ensure all checks pass before merge
   - Document security decisions

### For Administrators

1. **Manage Bypass Actors**
   - Minimize bypass permissions
   - Audit bypass usage
   - Remove unused bypass actors

2. **Update Security Workflows**
   - Keep actions up to date
   - Add new security tools
   - Improve detection capabilities

3. **Team Training**
   - Security awareness training
   - Tool usage documentation
   - Incident response drills

## Configuration Management

### Updating Rulesets

When modifying rulesets:
1. Update JSON file in `.github/rulesets/`
2. Test in evaluation mode first
3. Document changes
4. Communicate to team
5. Apply via GitHub Settings
6. Monitor for issues

### Version Control

- All ruleset changes tracked in Git
- Include rationale in commit messages
- Review changes as code
- Maintain changelog

### Backup and Recovery

- Rulesets stored in repository
- Can be restored from Git history
- Export current settings periodically
- Document critical configurations

## Compliance and Auditing

### Audit Trail

Maintain records of:
- Ruleset changes and rationale
- Bypass usage and justification
- Security incidents and responses
- Review process metrics

### Reporting

Generate regular reports on:
- Merge compliance rates
- Security check pass/fail rates
- Review time metrics
- Incident frequency

## Resources

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Git Commit Signing](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)
- [Bitcoin Core Security Process](SECURITY.md)

## Support and Feedback

For questions or improvements:
1. Open an issue for discussion
2. Propose changes via pull request
3. Contact security team for sensitive matters
4. Participate in security reviews

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-13  
**Maintained By**: Bitcoin Core Security Team
