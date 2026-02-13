# Self-Hosted Runner Security Guide

This document outlines security best practices for configuring and maintaining self-hosted GitHub Actions runners for the Bitcoin Core project.

## Table of Contents
- [Overview](#overview)
- [Security Principles](#security-principles)
- [Runner Setup](#runner-setup)
- [Network Security](#network-security)
- [Access Control](#access-control)
- [Secrets Management](#secrets-management)
- [Monitoring and Auditing](#monitoring-and-auditing)
- [Incident Response](#incident-response)

## Overview

Self-hosted runners provide flexibility but require careful security configuration. Unlike GitHub-hosted runners which are ephemeral and isolated, self-hosted runners persist and may have access to internal resources.

### Key Risks
- **Code Injection**: Malicious PRs can execute arbitrary code
- **Secret Exposure**: Improper handling can leak credentials
- **Resource Access**: Runners may access internal systems
- **Persistence**: Compromised runners can affect multiple workflows

## Security Principles

### 1. Least Privilege
- Grant minimal permissions required for tasks
- Use dedicated service accounts with limited scope
- Separate runners by trust level (public PRs vs. trusted commits)

### 2. Isolation
- Run each job in a clean, isolated environment
- Use ephemeral runners when possible
- Implement network segmentation

### 3. Defense in Depth
- Multiple layers of security controls
- Assume breach mentality
- Regular security audits

## Runner Setup

### Installation

```bash
# Create dedicated user for runner
sudo useradd -m -s /bin/bash github-runner
sudo su - github-runner

# Download and verify runner
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Verify checksum (get latest from GitHub releases)
echo "EXPECTED_SHA256  actions-runner-linux-x64-2.311.0.tar.gz" | sha256sum -c

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

### Configuration

```bash
# Configure runner with minimal scope
./config.sh --url https://github.com/kushmanmb-org/bitcoin \
  --token YOUR_TOKEN \
  --name secure-runner-01 \
  --labels self-hosted,secure \
  --work _work \
  --disableupdate

# Run as service (systemd)
sudo ./svc.sh install github-runner
sudo ./svc.sh start
```

### Critical Settings

1. **Ephemeral Runners** (Recommended for untrusted code):
   ```bash
   ./config.sh --ephemeral
   ```
   Runners automatically deregister after each job.

2. **Runner Groups**:
   - Create separate groups for different trust levels
   - Assign workflows to appropriate groups
   - Restrict public PR access

3. **Disable Automatic Updates**:
   ```bash
   ./config.sh --disableupdate
   ```
   Control updates through your patch management process.

## Network Security

### Firewall Configuration

```bash
# Allow outbound HTTPS to GitHub
sudo ufw allow out 443/tcp

# Block unnecessary inbound traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH from trusted IPs only
sudo ufw allow from TRUSTED_IP to any port 22

sudo ufw enable
```

### Network Isolation

- Place runners in dedicated VLANs
- Use network policies to restrict access
- Implement egress filtering

```yaml
# Example: Restrict runner network access
# /etc/systemd/system/actions.runner.service.d/override.conf
[Service]
# Restrict network namespaces
PrivateNetwork=true
# Use specific network interface
Environment="RUNNER_NETWORK_INTERFACE=eth1"
```

## Access Control

### File System Permissions

```bash
# Restrict runner directory permissions
chmod 750 ~/actions-runner
chown -R github-runner:github-runner ~/actions-runner

# Protect configuration files
chmod 600 ~/actions-runner/.credentials
chmod 600 ~/actions-runner/.runner
```

### Process Isolation

```bash
# Run runner with limited capabilities
sudo setcap cap_net_bind_service=+ep ~/actions-runner/bin/Runner.Listener
```

### AppArmor/SELinux Profile

Create an AppArmor profile for the runner:

```
# /etc/apparmor.d/github-runner
#include <tunables/global>

/home/github-runner/actions-runner/bin/Runner.Listener {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  
  # Allow runner binary execution
  /home/github-runner/actions-runner/** r,
  /home/github-runner/actions-runner/bin/** rix,
  
  # Deny access to sensitive system areas
  deny /etc/shadow r,
  deny /root/** rw,
  deny /home/*/.ssh/** rw,
  
  # Allow work directory
  /home/github-runner/actions-runner/_work/** rw,
}
```

## Secrets Management

### Never Store Secrets in Code

```yaml
# ✗ BAD: Hardcoded secrets
- name: Deploy
  run: |
    deploy.sh --api-key=sk_live_12345

# ✓ GOOD: Use GitHub Secrets
- name: Deploy
  env:
    API_KEY: ${{ secrets.DEPLOYMENT_API_KEY }}
  run: |
    deploy.sh --api-key="${API_KEY}"
```

### Environment Variable Protection

```bash
# Mask secrets in logs
echo "::add-mask::${SECRET_VALUE}"

# Unset after use
unset API_KEY
```

### Secrets Access Control

1. **Repository Secrets**: Accessible to all workflows
2. **Environment Secrets**: Require approval for protected environments
3. **Organization Secrets**: Shared across repositories

### Secret Rotation

- Rotate secrets regularly (e.g., every 90 days)
- Automate rotation where possible
- Revoke immediately if compromise suspected

```bash
# Script: rotate-runner-token.sh
#!/bin/bash
set -euo pipefail

# Generate new registration token
NEW_TOKEN=$(gh api /repos/kushmanmb-org/bitcoin/actions/runners/registration-token --jq .token)

# Remove old runner
./config.sh remove --token "${OLD_TOKEN}"

# Re-register with new token
./config.sh --url https://github.com/kushmanmb-org/bitcoin \
  --token "${NEW_TOKEN}" \
  --name "$(hostname)" \
  --labels self-hosted,secure
```

## Workflow Security Best Practices

### 1. Limit PR Workflow Permissions

```yaml
# Restrict untrusted PR workflows to safe runners
name: PR Build
on: pull_request_target  # Use cautiously

jobs:
  build:
    # Only run on ephemeral, isolated runners
    runs-on: [self-hosted, ephemeral, untrusted]
    
    # Minimal permissions
    permissions:
      contents: read
      pull-requests: read
    
    steps:
      - uses: actions/checkout@v6
        with:
          # Check out PR code in isolated manner
          ref: ${{ github.event.pull_request.head.sha }}
```

### 2. Validate Inputs

```yaml
- name: Validate API Endpoint
  run: |
    # Whitelist allowed values
    case "${{ github.event.inputs.api_endpoint }}" in
      account|transaction|contract)
        echo "Valid endpoint: ${{ github.event.inputs.api_endpoint }}"
        ;;
      *)
        echo "Invalid endpoint"
        exit 1
        ;;
    esac
```

### 3. Avoid `pull_request_target` When Possible

- Use `pull_request` for untrusted code
- Reserve `pull_request_target` for approved workflows only
- Never checkout PR code directly with `pull_request_target`

### 4. Pin Actions to Commit SHA

```yaml
# ✗ BAD: Mutable tag
- uses: actions/checkout@v6

# ✓ GOOD: Pinned SHA
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v6.0.0
```

### 5. Scope Tokens Appropriately

```yaml
permissions:
  contents: read      # Minimal read access
  pull-requests: none # No PR access
  issues: none        # No issue access
```

## Monitoring and Auditing

### Runner Health Monitoring

```bash
#!/bin/bash
# monitor-runner-health.sh

# Check runner service status
if ! systemctl is-active --quiet actions.runner; then
  alert "Runner service is down"
fi

# Check disk space
DISK_USAGE=$(df -h /home/github-runner | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "${DISK_USAGE}" -gt 80 ]; then
  alert "Disk usage is ${DISK_USAGE}%"
fi

# Check for suspicious processes
if pgrep -f "crypto-miner|backdoor" > /dev/null; then
  alert "Suspicious process detected"
fi
```

### Audit Logging

```yaml
# Enable detailed workflow logging
- name: Log workflow start
  run: |
    echo "Workflow: ${{ github.workflow }}"
    echo "Run ID: ${{ github.run_id }}"
    echo "Actor: ${{ github.actor }}"
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
```

### Centralized Log Collection

- Ship runner logs to SIEM
- Monitor for:
  - Failed authentication attempts
  - Unusual network connections
  - Privilege escalation attempts
  - File system changes outside _work directory

```bash
# Example: Forward logs to syslog
sudo journalctl -u actions.runner -f | \
  logger -t github-runner -n siem.example.com
```

## Incident Response

### Indicators of Compromise

- Unexpected network connections
- New user accounts or SSH keys
- Cron jobs or systemd timers
- Modified system binaries
- Unusual CPU/memory usage
- Unexpected running processes

### Response Procedure

1. **Detect**: Automated monitoring alerts
2. **Isolate**: Disable runner, block network
   ```bash
   sudo ./svc.sh stop
   sudo ufw deny out to any
   ```
3. **Analyze**: Review logs, check file integrity
   ```bash
   sudo ausearch -m avc -ts recent
   sudo find /home/github-runner -mtime -1
   ```
4. **Recover**: Re-provision runner from clean image
5. **Lessons Learned**: Update security controls

### Emergency Contacts

Maintain an incident response contact list:
- Security team
- GitHub support
- Infrastructure team

## Compliance Checklist

- [ ] Runners run as dedicated, non-privileged users
- [ ] Ephemeral runners enabled for untrusted PRs
- [ ] Network isolation and egress filtering configured
- [ ] Secrets rotation schedule established
- [ ] Monitoring and alerting implemented
- [ ] Incident response plan documented
- [ ] Regular security audits scheduled
- [ ] Runner tokens rotated quarterly
- [ ] Logs shipped to SIEM
- [ ] Backup and recovery tested

## Additional Resources

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Self-hosted Runner Security](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners#self-hosted-runner-security)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Version History

- v1.0.0 (2026-02-13): Initial security guide
