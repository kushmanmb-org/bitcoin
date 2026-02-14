# Organization-Wide Security Update Process

This document describes how to propagate security and workflow updates across all repositories in the kushmanmb-org organization.

## Overview

This process ensures consistent security practices, workflow configurations, and ownership announcements across all repositories in the organization.

## Update Categories

### 1. Workflow Security Updates

**Files to Update:**
- `.github/workflows/*.yml` - All workflow files

**Key Changes:**
- Add security best practices comments at the top of each workflow
- Configure minimal permissions for GITHUB_TOKEN
- Add self-hosted runner support where appropriate
- Pin action versions to specific commits/versions
- Add job isolation for security-sensitive tasks

**Template Header for Workflows:**
```yaml
# Security Best Practices:
# - Uses self-hosted runners where appropriate
# - Minimal permissions principle
# - Regular runner maintenance required
# - Actions pinned to specific versions
# - Job isolation for security-critical tasks
```

### 2. Documentation Updates

**Files to Update:**
- `README.md` - Add global announcement
- `SECURITY.md` - Add workflow security, runner guidelines, ownership info
- `CONTRIBUTING.md` - Add security practices, ownership info
- `ANNOUNCEMENT.md` - Create if doesn't exist

**Global Announcement Template:**
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

### 3. Self-Hosted Runner Configuration

**Runner Setup:**
1. Set up hardened Linux runners
2. Configure appropriate labels:
   - `[self-hosted, linux]` - General Linux runners
   - `[self-hosted, linux, website-deployment]` - Deployment runners
   - `[self-hosted, linux, codeql]` - Security scanning runners
3. Restrict access to deployment team
4. Implement regular maintenance schedule

**Runner Security Checklist:**
- [ ] Operating system hardened and updated
- [ ] Access restricted to authorized personnel
- [ ] Audit logging enabled
- [ ] Network isolation configured
- [ ] Regular security updates scheduled
- [ ] Runner software kept up-to-date
- [ ] Secrets properly isolated

## Implementation Steps

### Manual Process

For each repository in the organization:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kushmanmb-org/[REPO-NAME]
   cd [REPO-NAME]
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b security/implement-safety-standards
   ```

3. **Update README.md:**
   - Add global announcement at the top (before first heading)
   - Ensure ownership references are present

4. **Update SECURITY.md:**
   - Add GitHub Actions Workflow Security section
   - Add Self-Hosted Runners guidelines
   - Add Ownership and Verification section
   - Add Workflow Audit Checklist

5. **Update CONTRIBUTING.md:**
   - Add ownership statement at top
   - Add Security and Workflow Practices section
   - Reference SECURITY.md for workflow guidelines

6. **Create ANNOUNCEMENT.md:**
   - Use template from this repository
   - Include all verified channels

7. **Update all workflow files:**
   - Add security best practices header
   - Configure minimal permissions
   - Add self-hosted runner support comments
   - Ensure action versions are pinned

8. **Commit and push:**
   ```bash
   git add .
   git commit -m "chore: implement organization-wide safety standards
   
   - Add global ownership announcement
   - Update workflow security practices
   - Add self-hosted runner documentation
   - Update security documentation
   - Add workflow audit guidelines"
   
   git push origin security/implement-safety-standards
   ```

9. **Create Pull Request:**
   - Title: "Implement Organization-Wide Safety Standards"
   - Reference this document
   - Request review from security team

### Automated Process (Optional)

**Option 1: Reusable Workflow**

Create a reusable workflow in a central repository (e.g., `.github` repository):

`.github/workflows/propagate-security-updates.yml`:
```yaml
name: Propagate Security Updates

on:
  workflow_dispatch:
    inputs:
      target_repo:
        description: 'Target repository (or "all" for all repos)'
        required: true
        type: string

jobs:
  propagate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout template repo
        uses: actions/checkout@v6
        with:
          repository: kushmanmb-org/bitcoin
          path: template

      - name: Generate update script
        run: |
          # Create script to update target repositories
          # This is a placeholder - implement actual update logic
          echo "Update propagation script"

      # Add steps to clone target repo, apply updates, create PR
```

**Option 2: Shell Script**

Create `scripts/propagate-updates.sh`:

```bash
#!/bin/bash
# Propagate security updates across organization repositories

set -e

ORG="kushmanmb-org"
REPOS=$(gh repo list $ORG --json name -q '.[].name')

for repo in $REPOS; do
  echo "Updating $repo..."
  
  # Clone, update, commit, push logic here
  # Similar to manual steps above
  
done
```

## Validation Checklist

After applying updates to any repository:

- [ ] Global announcement present in README.md
- [ ] ANNOUNCEMENT.md created with all official channels
- [ ] SECURITY.md includes workflow security section
- [ ] SECURITY.md includes ownership verification section
- [ ] CONTRIBUTING.md references security practices
- [ ] All workflows have security best practices comments
- [ ] Workflow permissions are minimal
- [ ] Actions are pinned to versions
- [ ] Self-hosted runner documentation present
- [ ] All ownership channels referenced correctly

## Maintenance Schedule

**Regular Updates:**
- **Weekly**: Review runner health and updates
- **Monthly**: Audit workflow permissions and action versions
- **Quarterly**: Review and rotate secrets
- **Annually**: Complete security audit of all workflows

**Immediate Actions Required:**
- Security vulnerabilities in actions
- Compromised secrets
- Runner security incidents
- Ownership changes

## Branch Protection Rules

Configure these branch protection rules for all repositories:

```yaml
# For master/main branch:
- Require pull request reviews (minimum 1)
- Require status checks to pass
- Require branches to be up to date
- Require signed commits (recommended)
- Restrict who can push to matching branches
- Require linear history (recommended)
```

## Documentation References

- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Self-Hosted Runners Security](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners#self-hosted-runner-security)
- [Token Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

## Support and Questions

For questions about this update process:
1. Open an issue in kushmanmb-org/bitcoin repository
2. Tag with `security`, `documentation`, or `workflows` label
3. Reference this document

---

*Document Version: 1.0*
*Last Updated: 2026-02-14*
