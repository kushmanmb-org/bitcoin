# GitHub Actions Self-Hosted Runner Setup

This directory contains security documentation and workflow templates for configuring self-hosted GitHub Actions runners.

## Quick Start

### For Administrators

1. **Read the Security Guide**: Start with [SELF_HOSTED_RUNNER_SECURITY.md](SELF_HOSTED_RUNNER_SECURITY.md)
2. **Review Templates**: Check [secure-runner-template.yml](workflows/secure-runner-template.yml)
3. **Configure Runners**: Follow the setup instructions
4. **Test Security**: Use the validation checklist

### For Developers

1. **Use Secure Patterns**: Follow the workflow template examples
2. **Validate Inputs**: Always validate user inputs in workflows
3. **Minimal Permissions**: Request only the permissions you need
4. **Pin Actions**: Use SHA-pinned action versions

## Documentation

- **[SELF_HOSTED_RUNNER_SECURITY.md](SELF_HOSTED_RUNNER_SECURITY.md)** - Comprehensive security guide
  - Runner installation and configuration
  - Network security and isolation
  - Secrets management
  - Monitoring and incident response
  - Compliance checklist

## Workflow Templates

### Secure Runner Template
Location: `workflows/secure-runner-template.yml`

A complete example demonstrating:
- Input validation
- Minimal permissions
- Environment isolation
- Secret handling
- Artifact scanning
- Cleanup procedures

### Enhanced Etherscan Workflow
Location: `workflows/etherscan-apiv2.yml`

Production workflow with:
- Input validation and sanitization
- Secure API key handling
- Secret scanning before commits
- Error handling and retries
- Size limits and cleanup

## Security Checklist

Use this checklist when configuring new runners:

### Initial Setup
- [ ] Create dedicated non-privileged user for runner
- [ ] Configure ephemeral runners for untrusted code
- [ ] Set up network isolation (firewall, VLANs)
- [ ] Implement AppArmor/SELinux profile
- [ ] Configure restrictive file permissions

### Workflow Security
- [ ] Validate all user inputs
- [ ] Use minimal permissions
- [ ] Pin actions to commit SHAs
- [ ] Scan artifacts for secrets
- [ ] Clean up sensitive data after jobs

### Monitoring
- [ ] Set up log forwarding to SIEM
- [ ] Configure alerting for suspicious activity
- [ ] Monitor disk space and resource usage
- [ ] Track runner health metrics

### Maintenance
- [ ] Rotate secrets quarterly
- [ ] Update runner software regularly
- [ ] Review and audit workflows monthly
- [ ] Test incident response procedures

## Common Pitfalls to Avoid

### ❌ Don't Do This

```yaml
# Bad: Using pull_request_target without isolation
on: pull_request_target
jobs:
  build:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v6  # Checks out untrusted PR code!
```

```yaml
# Bad: Hardcoded secrets
- run: curl https://api.example.com -H "Authorization: sk_live_12345"
```

```yaml
# Bad: Mutable action tags
- uses: actions/checkout@v6  # Could be changed to malicious code
```

### ✅ Do This Instead

```yaml
# Good: Separate runners for untrusted code
on: pull_request
jobs:
  build:
    runs-on: [self-hosted, ephemeral, isolated]
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # Pinned SHA
```

```yaml
# Good: Secrets from environment
- env:
    API_KEY: ${{ secrets.API_KEY }}
  run: curl https://api.example.com -H "Authorization: ${API_KEY}"
```

## Runner Labels

Configure your runners with appropriate labels:

| Label | Purpose | Security Level |
|-------|---------|----------------|
| `self-hosted` | All self-hosted runners | - |
| `ephemeral` | Auto-deregister after job | High |
| `isolated` | Network isolated | High |
| `secure` | Hardened configuration | High |
| `untrusted` | For public PR code | Medium |
| `trusted` | For approved code only | Low risk |
| `production` | Production deployments | Requires approval |

## Secrets Configuration

### Required Secrets

For the Etherscan workflow:
- `ETHERSCAN_API_KEY` - API key from etherscan.io

### Secret Naming Convention

Use clear, descriptive names:
- `{SERVICE}_{KEY_TYPE}` - e.g., `ETHERSCAN_API_KEY`
- `{ENV}_{SERVICE}_{KEY_TYPE}` - e.g., `PROD_DATABASE_PASSWORD`

### Secret Rotation Schedule

- **API Keys**: Every 90 days
- **Runner Tokens**: Every 90 days
- **Deploy Keys**: Every 180 days
- **Service Accounts**: Every 180 days

## Incident Response

### If You Suspect a Compromise

1. **Immediately**:
   ```bash
   # Stop the runner
   sudo systemctl stop actions.runner
   
   # Block network access
   sudo ufw deny out to any
   ```

2. **Investigate**:
   - Review runner logs: `journalctl -u actions.runner`
   - Check for suspicious processes: `ps aux`
   - Look for unauthorized changes: `find /home/github-runner -mtime -1`

3. **Recover**:
   - Re-provision runner from clean image
   - Rotate all secrets
   - Review and update security controls

4. **Document**:
   - Record what happened
   - Document timeline
   - Update procedures

### Contact Information

- **Security Team**: security@example.com
- **GitHub Support**: https://support.github.com
- **On-Call**: [Add your contact method]

## Testing Security Configuration

### Validate Runner Isolation

```bash
# Test network restrictions
curl -I https://example.com  # Should fail if isolated

# Test file permissions
ls -la ~/actions-runner/.credentials  # Should be 600

# Test process limits
ulimit -a  # Should show configured limits
```

### Validate Workflow Security

```bash
# Check for hardcoded secrets
git grep -i "password\|api_key\|secret" .github/workflows/

# Validate input sanitization
# Review each workflow for proper validation

# Check action versions
git grep "uses:" .github/workflows/ | grep -v "@[0-9a-f]\{40\}"  # Find non-SHA pinned
```

## Resources

### Official Documentation
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Self-hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Secrets Management](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### Security Standards
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP CI/CD Security](https://owasp.org/www-project-devsecops-guideline/)

### Tools
- [Actionlint](https://github.com/rhysd/actionlint) - Workflow linter
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - Secret scanner
- [Semgrep](https://semgrep.dev/) - Security scanning

## Contributing

When adding new workflows:

1. Follow the secure template pattern
2. Document any new secrets required
3. Add security review checklist items
4. Test in isolated environment first
5. Get security team approval for production

## Support

For questions or issues:
- Open an issue in this repository
- Contact the security team
- Review the documentation in this directory

## License

This documentation is part of the Bitcoin Core project and follows the same MIT license.

---

**Last Updated**: 2026-02-13  
**Maintained By**: Security Team
