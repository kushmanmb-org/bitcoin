# GitHub Actions Security Quick Reference

A quick reference card for developers writing GitHub Actions workflows.

## 🔒 Security Checklist

Before merging a workflow, verify:

- [ ] Permissions are minimal and explicit
- [ ] All actions are pinned to SHA commits
- [ ] User inputs are validated
- [ ] Secrets use environment variables, not inline
- [ ] Self-hosted runners have security labels
- [ ] No `pull_request_target` without isolation
- [ ] Timeouts are configured
- [ ] Sensitive data is not logged

## 📋 Quick Patterns

### Minimal Permissions Template

```yaml
permissions:
  contents: read
  pull-requests: read
```

Common permission levels:
- `none` - No access
- `read` - Read-only access
- `write` - Read and write access

### Pin Actions to SHA

```yaml
# Find SHA: Go to GitHub release → Copy commit SHA
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v6.0.0
```

💡 **Tip**: Add version comment for maintainability

### Validate Workflow Inputs

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [dev, staging, prod]  # Limit choices

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate input
        run: |
          # Double-check even with type: choice
          case "${{ inputs.environment }}" in
            dev|staging|prod) echo "✓ Valid" ;;
            *) echo "✗ Invalid"; exit 1 ;;
          esac
```

### Safe Secret Usage

```yaml
# ❌ BAD
- run: deploy.sh --token=${{ secrets.TOKEN }}

# ✅ GOOD
- env:
    DEPLOY_TOKEN: ${{ secrets.TOKEN }}
  run: |
    # Token not in command line
    deploy.sh --token="${DEPLOY_TOKEN}"
    unset DEPLOY_TOKEN  # Clean up
```

### Mask Sensitive Output

```yaml
- name: Generate token
  run: |
    TOKEN="secret_value_xyz"
    echo "::add-mask::${TOKEN}"
    echo "TOKEN=${TOKEN}" >> $GITHUB_ENV
```

### Self-Hosted Runner Labels

```yaml
# ✅ Properly labeled
runs-on: [self-hosted, linux, ephemeral, secure]

# ❌ Missing security labels
runs-on: self-hosted
```

Required labels for self-hosted:
- `ephemeral` - Auto-cleanup after job
- `secure` - Hardened configuration
- `isolated` - Network isolated

### Timeout Configuration

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # Always set reasonable timeout
```

## 🚫 Anti-Patterns to Avoid

### Never Use pull_request_target Carelessly

```yaml
# ❌ DANGEROUS - executes untrusted code with secrets
on: pull_request_target
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@SHA
        with:
          ref: ${{ github.event.pull_request.head.sha }}
```

### Don't Hardcode Secrets

```yaml
# ❌ Never do this
- run: api_key="sk_live_12345"

# ✅ Use GitHub Secrets
- env:
    API_KEY: ${{ secrets.API_KEY }}
```

### Avoid Broad Permissions

```yaml
# ❌ Too permissive
permissions: write-all

# ✅ Be specific
permissions:
  contents: read
  issues: write
```

### Don't Trust Unchecked Input

```yaml
# ❌ Command injection risk
- run: echo "Hello ${{ github.event.comment.body }}"

# ✅ Validate and sanitize
- name: Validate comment
  env:
    COMMENT: ${{ github.event.comment.body }}
  run: |
    # Validate before use
    if [[ "${COMMENT}" =~ ^[a-zA-Z0-9\ ]+$ ]]; then
      echo "Hello ${COMMENT}"
    fi
```

## 🔍 Testing Your Workflow

### Local Validation

```bash
# Validate YAML syntax
yamllint .github/workflows/your-workflow.yml

# Security check
python3 .github/validate-workflows.py
```

### Manual Testing

```yaml
# Add workflow_dispatch for manual testing
on:
  workflow_dispatch:
  pull_request:  # Your normal trigger
```

### Debug Mode

```yaml
- name: Debug context
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Actor: ${{ github.actor }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
```

## 📚 Common Scenarios

### Scenario 1: Build on PR

```yaml
name: PR Build
on: pull_request

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@SHA
      - name: Build
        run: make build
      - uses: actions/upload-artifact@SHA
        with:
          name: build-${{ github.sha }}
          path: dist/
```

### Scenario 2: Deploy with Approval

```yaml
name: Deploy
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: ${{ inputs.environment }}
      url: https://${{ inputs.environment }}.example.com
    steps:
      - uses: actions/checkout@SHA
      - name: Deploy
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: ./deploy.sh
```

### Scenario 3: Scheduled Task

```yaml
name: Daily Task
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:  # Allow manual trigger

permissions:
  contents: write  # If committing results

jobs:
  task:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@SHA
      - name: Run task
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: ./daily-task.sh
```

## 🆘 Getting Help

1. **Validation errors**: Run `python3 .github/validate-workflows.py`
2. **Security questions**: See [SELF_HOSTED_RUNNER_SECURITY.md](SELF_HOSTED_RUNNER_SECURITY.md)
3. **Setup help**: See [RUNNER_SETUP.md](RUNNER_SETUP.md)
4. **Tool documentation**: See [VALIDATION_TOOL.md](VALIDATION_TOOL.md)

## 📖 Resources

- **GitHub Docs**: https://docs.github.com/en/actions
- **Security Guides**: https://docs.github.com/en/actions/security-guides
- **Action Pinning Tool**: https://github.com/mheap/pin-github-action

## 🔄 Keeping Up to Date

Security best practices evolve. Review quarterly:

1. GitHub Security Advisories
2. Action version updates
3. New security features
4. Workflow audit results

---

**Remember**: Security is not a one-time task, it's an ongoing practice!
