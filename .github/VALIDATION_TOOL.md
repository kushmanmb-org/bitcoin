# Workflow Validation Tool

This directory contains a Python script to validate GitHub Actions workflows for security best practices.

## Usage

```bash
# From repository root
python3 .github/validate-workflows.py

# Or make it executable and run directly
chmod +x .github/validate-workflows.py
./.github/validate-workflows.py
```

## What It Checks

### 1. Permissions Configuration
- ✅ Ensures workflows have explicit `permissions:` field
- ⚠️  Warns about overly broad write permissions
- ❌ Fails on `permissions: write-all`

### 2. Action Pinning
- ✅ Verifies actions are pinned to commit SHAs (40 hex characters)
- ⚠️  Warns about mutable tags (e.g., `@v6`)
- Skips local actions (starting with `./`)

**Why?** Mutable tags can be changed to point to malicious code.

**Example:**
```yaml
# ❌ Bad - mutable tag
uses: actions/checkout@v6

# ✅ Good - pinned to SHA
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v6.0.0
```

### 3. Pull Request Target Safety
- ⚠️  Flags use of `pull_request_target` trigger
- ❌ Fails if checking out PR code with `pull_request_target`

**Why?** `pull_request_target` runs with repo secrets but can execute untrusted PR code.

### 4. Secrets Handling
- ⚠️  Warns about secrets passed directly to commands
- ⚠️  Detects potential hardcoded credentials

**Example:**
```yaml
# ❌ Bad - secret in command
- run: curl -H "Authorization: ${{ secrets.TOKEN }}"

# ✅ Good - secret via environment
- env:
    TOKEN: ${{ secrets.TOKEN }}
  run: curl -H "Authorization: ${TOKEN}"
```

### 5. Input Validation
- ⚠️  Warns if `workflow_dispatch` inputs lack validation steps

### 6. Self-Hosted Runner Labels
- ⚠️  Warns if `self-hosted` runners lack security labels
- Expected labels: `ephemeral`, `isolated`, `secure`, `trusted`

## Output Format

The tool provides detailed output with emojis for quick scanning:

- ✅ No issues found
- ⚠️  Warning - should review
- ❌ Error - must fix

## Exit Codes

- `0` - All workflows passed (or only warnings)
- `1` - Critical issues found or validation errors

## CI Integration

Add to your workflow:

```yaml
- name: Validate workflow security
  run: python3 .github/validate-workflows.py
```

## False Positives

Some warnings are intentional:

1. **Write permissions**: The etherscan-apiv2.yml needs `contents: write` to commit data
2. **Pre-existing issues**: The ci.yml has issues that pre-date this security review

## Fixing Common Issues

### Pin Actions to SHA

1. Find the action on GitHub (e.g., `actions/checkout`)
2. Navigate to the release/tag you want
3. Copy the commit SHA (40 characters)
4. Update your workflow:

```yaml
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v6.0.0
```

Add a comment with the version for readability.

### Add Minimal Permissions

```yaml
permissions:
  contents: read      # Only what you need
  pull-requests: read # Explicit is better
```

### Validate Inputs

```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate inputs
        run: |
          case "${{ inputs.environment }}" in
            dev|staging|prod) echo "Valid" ;;
            *) echo "Invalid"; exit 1 ;;
          esac
```

## Dependencies

- Python 3.6+
- PyYAML (`pip install pyyaml` if not available)

The script has minimal dependencies and should work in most CI environments.

## Maintenance

Update the script when:
- New security best practices emerge
- GitHub Actions adds new features
- New vulnerability patterns are discovered

## Resources

- [GitHub Actions Security Guides](https://docs.github.com/en/actions/security-guides)
- [Action Pinning Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions)
- [Self-hosted Runner Security](../SELF_HOSTED_RUNNER_SECURITY.md)

## Contributing

To add new checks:

1. Add a function following the naming pattern `check_*`
2. Return a list of issue strings
3. Call it from `validate_workflow()`
4. Add documentation above

Example:

```python
def check_timeout(workflow: Dict) -> List[str]:
    """Check if jobs have reasonable timeouts."""
    issues = []
    jobs = workflow.get("jobs", {})
    for job_name, job_config in jobs.items():
        if "timeout-minutes" not in job_config:
            issues.append(f"⚠️ Job '{job_name}' has no timeout")
    return issues
```
