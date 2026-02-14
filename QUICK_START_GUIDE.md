# Quick Start Guide: Safety Standards Implementation

This guide provides quick references for using the newly implemented safety standards.

## 🎯 For Repository Maintainers

### Setting Up Self-Hosted Runners

1. **Install Runner Software**:
   ```bash
   # On your runner machine
   mkdir actions-runner && cd actions-runner
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   ```

2. **Configure Runner**:
   ```bash
   ./config.sh --url https://github.com/kushmanmb-org/bitcoin --token YOUR_TOKEN
   ```

3. **Add Labels** (during configuration):
   - General: `self-hosted, linux`
   - Deployment: `self-hosted, linux, website-deployment`
   - Security: `self-hosted, linux, codeql`

4. **Start Runner**:
   ```bash
   ./run.sh
   # Or as a service:
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

### Configuring Branch Protection

Navigate to: Settings → Branches → Add rule

**Required settings**:
- ✅ Require pull request reviews before merging (minimum 1)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ⚠️ Require signed commits (recommended)
- ✅ Include administrators
- ⚠️ Restrict who can push to matching branches

## 📋 For Contributors

### Understanding the Global Announcement

The global announcement at the top of README.md indicates official ownership:

```markdown
> **Global Announcement:**
> Bitcoin is an officially owned and operated crypto blockchain project maintained by kushmanmb-org.
> For latest updates, policies, and contact, always consult this repository and our verified channels:
> - kushmanmb.base.eth
> - kushmanmb.eth
> - kushmania.eth
> - kushmanmb.org
> - yaketh.eth
```

**Always verify communications** through these official channels.

### Contributing Securely

Before contributing, review:
1. [SECURITY.md](SECURITY.md) - Security policies and workflow practices
2. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
3. [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) - Detailed security practices

**Key reminders**:
- Never commit secrets or credentials
- Use environment variables for sensitive data
- Follow the workflow security guidelines
- Request review for security-sensitive changes

## 🔧 For DevOps/Platform Team

### Propagating Updates Across Organization

**Option 1: Using the Shell Script** (Recommended for batch updates)

```bash
# List all repositories
./scripts/propagate-updates.sh --list

# Dry run to preview changes
./scripts/propagate-updates.sh --dry-run

# Update specific repository
./scripts/propagate-updates.sh --repo my-repo

# Update all repositories (use with caution)
./scripts/propagate-updates.sh
```

**Option 2: Using the GitHub Actions Workflow**

1. Go to: Actions → Propagate Safety Standards
2. Click "Run workflow"
3. Options:
   - Leave **target_repo** empty to list repositories
   - Set **target_repo** to update specific repository
   - Keep **dry_run** enabled to preview changes
   - Set **dry_run** to false to apply changes

**Prerequisites**:
- GitHub CLI (`gh`) installed and authenticated
- Appropriate repository permissions
- Review [ORG_WIDE_UPDATE_PROCESS.md](ORG_WIDE_UPDATE_PROCESS.md) first

### Managing Secrets

**Adding Secrets**:
1. Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name the secret (e.g., `ETHERSCAN_API_KEY`)
4. Add the secret value
5. Click "Add secret"

**Best Practices**:
- Rotate secrets every 90 days
- Use minimal scopes/permissions
- Never log secrets in workflow output
- Document which secrets are needed in SECURITY.md
- Revoke immediately if compromised

### Workflow Maintenance

**Monthly Tasks**:
- [ ] Review workflow runs for failures
- [ ] Check for action version updates
- [ ] Verify runner health and disk space
- [ ] Review security scan results

**Quarterly Tasks**:
- [ ] Rotate all secrets and tokens
- [ ] Review and update runner OS and software
- [ ] Audit workflow permissions
- [ ] Review branch protection rules

**Annually**:
- [ ] Complete security audit of all workflows
- [ ] Review self-hosted runner infrastructure
- [ ] Update security documentation
- [ ] Train team on security practices

## 🔍 Quick Reference: Workflow Security

### Minimal Permissions Template

```yaml
permissions:
  contents: read      # Read repository content
  issues: write       # Write to issues (if needed)
  pull-requests: read # Read PRs (if needed)
```

### Self-Hosted Runner Template

```yaml
jobs:
  my-job:
    runs-on: [self-hosted, linux]
    # For specific purposes:
    # runs-on: [self-hosted, linux, website-deployment]
```

### Secrets Usage Template

```yaml
- name: Use secret
  env:
    API_KEY: ${{ secrets.MY_SECRET }}
  run: |
    # Secret is available in $API_KEY
    # NEVER echo or log the secret
```

## 📚 Documentation Quick Links

- **Security Policy**: [SECURITY.md](SECURITY.md)
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security Practices**: [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md)
- **Global Announcement**: [ANNOUNCEMENT.md](ANNOUNCEMENT.md)
- **Org-Wide Updates**: [ORG_WIDE_UPDATE_PROCESS.md](ORG_WIDE_UPDATE_PROCESS.md)
- **Scripts Documentation**: [scripts/README.md](scripts/README.md)
- **Templates**: [.github/templates/README.md](.github/templates/README.md)

## ❓ Getting Help

**For security issues**:
- Email: security@bitcoincore.org
- Do NOT open public GitHub issues

**For general questions**:
1. Check the documentation links above
2. Search existing GitHub issues
3. Open a new issue with the appropriate label

**For workflow/automation issues**:
1. Review [ORG_WIDE_UPDATE_PROCESS.md](ORG_WIDE_UPDATE_PROCESS.md)
2. Check workflow run logs
3. Open an issue with label: `workflows` or `automation`

## ✅ Security Checklist for New Features

Before merging new features:
- [ ] No hardcoded secrets or credentials
- [ ] Workflow uses minimal permissions
- [ ] Actions pinned to specific versions
- [ ] Security scanning passes
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Tests pass

---

**Last Updated**: 2026-02-14

*This guide is maintained as part of the organization-wide safety standards initiative.*
