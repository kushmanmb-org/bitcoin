# Self-Hosted Runner Setup Guide

## Overview

This guide provides comprehensive instructions for setting up and managing GitHub Actions self-hosted runners with enhanced security, privacy, and cross-platform support for the Bitcoin Core project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Security Considerations](#security-considerations)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Platform-Specific Setup](#platform-specific-setup)
6. [Maintenance](#maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Privacy Best Practices](#privacy-best-practices)

## Prerequisites

### System Requirements

#### Linux Runners
- **OS**: Ubuntu 20.04+ or RHEL/CentOS 8+
- **CPU**: 4+ cores (8+ recommended for builds)
- **RAM**: 16GB minimum (32GB+ recommended)
- **Disk**: 100GB+ SSD storage
- **Network**: Stable internet connection

#### macOS Runners
- **OS**: macOS 12.0+ (Monterey or later)
- **CPU**: Apple Silicon (M1/M2) or Intel (4+ cores)
- **RAM**: 16GB minimum (32GB+ recommended)
- **Disk**: 100GB+ SSD storage
- **Xcode**: Latest stable version

#### Windows Runners
- **OS**: Windows Server 2019+ or Windows 10/11 Pro
- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 16GB minimum (32GB+ recommended)
- **Disk**: 100GB+ SSD storage
- **Visual Studio**: 2019 or 2022 with C++ build tools

### Software Dependencies

All platforms need:
- Git 2.30+
- Docker (optional, for containerized builds)
- Administrative/sudo access for installation

## Security Considerations

### Critical Security Practices

1. **Isolation**: Run each runner in an isolated environment (VM, container, or dedicated machine)
2. **Network Security**: Use firewalls and network segmentation
3. **Access Control**: Limit who can configure and access runners
4. **Credential Management**: Never store credentials on the runner filesystem
5. **Regular Updates**: Keep runner software and OS updated
6. **Audit Logging**: Enable comprehensive logging for all runner activities

### Security Checklist

- [ ] Runner is in an isolated environment (VM/container/dedicated hardware)
- [ ] Firewall is configured to allow only necessary outbound connections
- [ ] No sensitive data is stored on the runner filesystem
- [ ] Runner has minimal OS permissions (not running as root/Administrator unless necessary)
- [ ] Runner auto-updates are enabled
- [ ] Logs are collected and monitored
- [ ] Secrets are managed via GitHub Secrets, not environment variables
- [ ] Runner registration token is immediately removed after setup
- [ ] SSH access is restricted and key-based only

## Installation

### 1. Download GitHub Actions Runner

Visit the GitHub repository settings to get the latest runner package:

```
https://github.com/[owner]/[repo]/settings/actions/runners/new
```

Or download directly:

#### Linux (x64)
```bash
# Create runner directory
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download the latest runner package
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf actions-runner-linux-x64.tar.gz

# Verify checksum (recommended)
echo "29fc8cf2dab4c195bb147384e7e2c94cfd4d4022c793b346a6175435265aa278  actions-runner-linux-x64.tar.gz" | sha256sum -c
```

#### macOS (ARM64 - Apple Silicon)
```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-osx-arm64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-osx-arm64-2.311.0.tar.gz
tar xzf actions-runner-osx-arm64.tar.gz
```

#### Windows (x64)
```powershell
# Run in PowerShell as Administrator
mkdir C:\actions-runner ; cd C:\actions-runner
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-win-x64-2.311.0.zip -OutFile actions-runner-win-x64.zip
Add-Type -AssemblyName System.IO.Compression.FileSystem ; [System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64.zip", "$PWD")
```

### 2. Configure the Runner

#### Get Registration Token

Go to your repository settings:
```
https://github.com/[owner]/[repo]/settings/actions/runners/new
```

Copy the registration token (it expires after 1 hour).

#### Configure

**Linux/macOS:**
```bash
cd ~/actions-runner

# Configure the runner
./config.sh --url https://github.com/[owner]/[repo] --token [YOUR_TOKEN]

# When prompted:
# - Name: Give it a descriptive name (e.g., "linux-builder-01")
# - Labels: Add labels for targeting (e.g., "self-hosted,linux,X64,secure")
# - Work folder: Use default (_work) or specify custom path
```

**Windows:**
```powershell
cd C:\actions-runner

# Configure the runner
.\config.cmd --url https://github.com/[owner]/[repo] --token [YOUR_TOKEN]
```

**Important Configuration Options:**

```bash
# Enhanced configuration with custom labels
./config.sh \
  --url https://github.com/[owner]/[repo] \
  --token [YOUR_TOKEN] \
  --name "secure-linux-builder" \
  --labels "self-hosted,linux,X64,secure,isolated" \
  --work "_work" \
  --replace  # Replace existing runner with same name
```

### 3. Install as a Service (Recommended)

Running the runner as a service ensures it starts automatically and runs reliably.

#### Linux (systemd)

```bash
cd ~/actions-runner

# Install service (requires sudo)
sudo ./svc.sh install

# Start service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status

# Enable auto-start on boot
sudo systemctl enable actions.runner.[org]-[repo].[runner-name].service
```

#### macOS (launchd)

```bash
cd ~/actions-runner

# Install service
sudo ./svc.sh install

# Start service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

#### Windows (Service)

```powershell
# Run in PowerShell as Administrator
cd C:\actions-runner

# Install service
.\svc.cmd install

# Start service
.\svc.cmd start

# Check status
.\svc.cmd status

# Optional: Configure service to run as specific user
.\svc.cmd install [username] [password]
```

### 4. Test the Runner

Create a simple workflow to test:

```yaml
name: Test Self-Hosted Runner
on: workflow_dispatch

jobs:
  test:
    runs-on: [self-hosted, linux]  # Adjust labels as needed
    steps:
      - run: echo "Hello from self-hosted runner!"
      - run: uname -a
```

## Configuration

### Environment Variables

Configure runner behavior via environment variables:

```bash
# Linux/macOS: Add to ~/.bashrc or runner service file
export RUNNER_ALLOW_RUNASROOT=0  # Prevent running as root
export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1  # For .NET apps
export ACTIONS_RUNNER_HOOK_JOB_STARTED=/path/to/hook.sh  # Pre-job hook

# Windows: Set via System Properties or runner service
$env:RUNNER_ALLOW_RUNASROOT = "0"
```

### Runner Labels

Labels help target specific runners:

**Common Label Patterns:**
- Platform: `linux`, `macos`, `windows`
- Architecture: `X64`, `ARM64`
- Purpose: `build`, `test`, `deploy`
- Security: `secure`, `isolated`, `sandboxed`
- Environment: `production`, `staging`, `development`

**Example:**
```bash
# Configure runner with multiple labels
./config.sh \
  --labels "self-hosted,linux,X64,secure,build,production"
```

### Proxy Configuration

If your runner is behind a proxy:

```bash
# Linux/macOS
export http_proxy=http://proxy.example.com:8080
export https_proxy=http://proxy.example.com:8080
export no_proxy=localhost,127.0.0.1,.example.com

# Windows
$env:http_proxy = "http://proxy.example.com:8080"
$env:https_proxy = "http://proxy.example.com:8080"
$env:no_proxy = "localhost,127.0.0.1,.example.com"

# Configure runner with proxy
./config.sh --url [URL] --token [TOKEN] \
  --proxyurl http://proxy.example.com:8080 \
  --proxyusername [username] \
  --proxypassword [password]
```

## Platform-Specific Setup

### Linux-Specific Configuration

#### 1. User and Permissions

```bash
# Create dedicated runner user (recommended)
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner  # If using Docker

# Set up runner directory
sudo mkdir -p /opt/actions-runner
sudo chown github-runner:github-runner /opt/actions-runner

# Switch to runner user
sudo su - github-runner
cd /opt/actions-runner
```

#### 2. Docker Configuration

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add runner user to docker group
sudo usermod -aG docker github-runner

# Configure Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker
```

#### 3. Security Hardening

```bash
# Configure firewall (UFW example)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
sudo ufw enable

# Disable unnecessary services
sudo systemctl disable bluetooth.service
sudo systemctl disable cups.service

# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

#### 4. Monitoring and Logging

```bash
# Set up log rotation for runner logs
sudo tee /etc/logrotate.d/github-runner <<EOF
/opt/actions-runner/_diag/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 github-runner github-runner
}
EOF

# Monitor runner service
sudo systemctl status actions.runner.*.service
sudo journalctl -u actions.runner.*.service -f
```

### macOS-Specific Configuration

#### 1. Xcode Setup

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install full Xcode (for iOS/macOS builds)
# Download from App Store or developer.apple.com

# Accept license
sudo xcodebuild -license accept

# Set active Xcode version
sudo xcode-select --switch /Applications/Xcode.app
```

#### 2. Homebrew Configuration

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install common build dependencies
brew install git cmake ninja autoconf automake libtool
```

#### 3. Security Settings

```bash
# Disable sleep (for always-on runner)
sudo pmset -a disablesleep 1

# Enable FileVault (disk encryption)
sudo fdesetup enable

# Configure firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

### Windows-Specific Configuration

#### 1. Visual Studio Setup

```powershell
# Install Visual Studio Build Tools (via Chocolatey)
choco install visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"

# Or download Visual Studio Community/Professional from visualstudio.microsoft.com
```

#### 2. PowerShell Configuration

```powershell
# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install useful modules
Install-Module -Name Posh-Git -Scope CurrentUser -Force
Install-Module -Name PSReadLine -Scope CurrentUser -Force
```

#### 3. Security Configuration

```powershell
# Enable Windows Defender
Set-MpPreference -DisableRealtimeMonitoring $false

# Configure Windows Firewall
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Disable unnecessary services
Stop-Service -Name "Print Spooler" -Force
Set-Service -Name "Print Spooler" -StartupType Disabled
```

#### 4. Performance Optimization

```powershell
# Disable Windows Search indexing on build drives
Get-WmiObject -Class Win32_Volume -Filter "DriveLetter='C:'" | Set-WmiInstance -Arguments @{IndexingEnabled=$false}

# Configure page file for better performance
$pageFileSize = 32768  # 32GB
$pageFile = Get-WmiObject -Class Win32_PageFileSetting
$pageFile.InitialSize = $pageFileSize
$pageFile.MaximumSize = $pageFileSize
$pageFile.Put()
```

## Maintenance

### Regular Updates

#### Update Runner Software

**Linux/macOS:**
```bash
cd ~/actions-runner

# Stop the runner service
sudo ./svc.sh stop

# Download and install update
# GitHub automatically notifies runners of updates
# Or manually download and replace binaries

# Start the runner service
sudo ./svc.sh start
```

**Windows:**
```powershell
cd C:\actions-runner
.\svc.cmd stop
# Download and replace binaries
.\svc.cmd start
```

#### Enable Auto-Updates

Runners can auto-update when configured properly:

```bash
# Ensure runner service has permissions to update itself
# Updates are applied automatically between job executions
```

### Cleanup and Disk Management

```bash
# Linux/macOS cleanup script
#!/bin/bash
# save as: cleanup-runner.sh

RUNNER_WORK_DIR="/opt/actions-runner/_work"
DAYS_TO_KEEP=7

echo "Cleaning up runner workspace..."

# Remove old temporary files
find "$RUNNER_WORK_DIR" -type f -mtime +$DAYS_TO_KEEP -delete

# Clean Docker (if applicable)
docker system prune -af --volumes

# Clear package manager caches
sudo apt clean  # Ubuntu/Debian
# sudo yum clean all  # RHEL/CentOS

echo "Cleanup completed"
```

```powershell
# Windows cleanup script
# save as: Cleanup-Runner.ps1

$RunnerWorkDir = "C:\actions-runner\_work"
$DaysToKeep = 7
$CutoffDate = (Get-Date).AddDays(-$DaysToKeep)

Write-Host "Cleaning up runner workspace..."

# Remove old temporary files
Get-ChildItem -Path $RunnerWorkDir -Recurse -File | 
    Where-Object { $_.LastWriteTime -lt $CutoffDate } | 
    Remove-Item -Force

# Clean Docker (if applicable)
docker system prune -af --volumes

Write-Host "Cleanup completed"
```

### Monitoring

```bash
# Create monitoring script
#!/bin/bash
# save as: monitor-runner.sh

RUNNER_NAME="your-runner-name"
SERVICE_NAME="actions.runner.*${RUNNER_NAME}.service"

# Check service status
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "✓ Runner service is running"
else
    echo "✗ Runner service is not running"
    # Send alert or restart service
    sudo systemctl restart $SERVICE_NAME
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "⚠ Disk usage is high: ${DISK_USAGE}%"
    # Send alert
fi

# Check runner logs for errors
if journalctl -u $SERVICE_NAME --since "1 hour ago" | grep -i "error"; then
    echo "⚠ Errors found in runner logs"
    # Send alert
fi
```

### Health Checks

```yaml
# Add to cron (Linux/macOS): */15 * * * * /path/to/monitor-runner.sh
# Or create a dedicated monitoring workflow:

name: Runner Health Check
on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes

jobs:
  health-check:
    runs-on: [self-hosted, linux]
    steps:
      - name: Check runner health
        run: |
          echo "Runner is responsive"
          df -h
          free -h
```

## Troubleshooting

### Common Issues

#### Runner Not Connecting

```bash
# Check service status
sudo systemctl status actions.runner.*.service

# View recent logs
sudo journalctl -u actions.runner.*.service -n 100

# Test network connectivity
curl -I https://github.com
curl -I https://api.github.com

# Verify runner configuration
cd ~/actions-runner
cat .runner
```

#### Runner Jobs Failing

```bash
# Check runner logs
cd ~/actions-runner
tail -f _diag/Runner_*.log
tail -f _diag/Worker_*.log

# Verify dependencies
git --version
docker --version
# etc.

# Check disk space
df -h

# Check memory
free -h
```

#### Permission Issues

```bash
# Fix runner directory permissions
cd ~/actions-runner
sudo chown -R github-runner:github-runner .
sudo chmod -R 755 .

# Check Docker permissions (if applicable)
groups github-runner
sudo usermod -aG docker github-runner
```

### Debug Mode

Enable detailed logging:

```bash
# Linux/macOS
export ACTIONS_RUNNER_DEBUG=true
export ACTIONS_STEP_DEBUG=true

# Restart runner
sudo ./svc.sh restart

# Windows
$env:ACTIONS_RUNNER_DEBUG = "true"
$env:ACTIONS_STEP_DEBUG = "true"
.\svc.cmd restart
```

### Reset Runner

If the runner is in a bad state:

```bash
# Stop the runner
sudo ./svc.sh stop

# Remove and reconfigure
./config.sh remove --token [YOUR_TOKEN]
./config.sh --url [URL] --token [NEW_TOKEN]

# Reinstall service
sudo ./svc.sh install
sudo ./svc.sh start
```

## Privacy Best Practices

### Data Minimization

1. **Avoid Logging Sensitive Data**
   ```yaml
   - name: Safe logging
     run: |
       # Use secrets for sensitive data, not echo
       echo "Starting deployment..."  # OK
       # echo "${{ secrets.API_KEY }}"  # NEVER do this
   ```

2. **Clean Workspace After Jobs**
   ```yaml
   - name: Cleanup
     if: always()
     run: |
       rm -rf $RUNNER_TEMP/*
       git config --unset-all credential.helper
   ```

### Secure Secrets Management

1. **Use GitHub Secrets**: Never hardcode secrets in workflows
2. **Scope Secrets Appropriately**: Use repository, environment, or organization secrets as needed
3. **Rotate Secrets Regularly**: Update secrets periodically
4. **Audit Secret Access**: Review which workflows access which secrets

### Network Privacy

```bash
# Configure minimal outbound access
# Only allow connections to:
# - github.com
# - api.github.com
# - objects.githubusercontent.com
# - ghcr.io (if using container registry)

# Example iptables rules (Linux)
sudo iptables -A OUTPUT -d github.com -j ACCEPT
sudo iptables -A OUTPUT -d api.github.com -j ACCEPT
sudo iptables -A OUTPUT -d objects.githubusercontent.com -j ACCEPT
sudo iptables -A OUTPUT -d ghcr.io -j ACCEPT
sudo iptables -A OUTPUT -j DROP  # Drop all other outbound
```

### Audit Logging

```bash
# Enable comprehensive logging
# Linux: Configure auditd
sudo apt install auditd
sudo systemctl enable auditd
sudo systemctl start auditd

# Add audit rules for runner directory
sudo auditctl -w /opt/actions-runner -p wa -k github_runner

# View audit logs
sudo ausearch -k github_runner
```

## Additional Resources

- [GitHub Actions Self-Hosted Runner Documentation](https://docs.github.com/en/actions/hosting-your-own-runners)
- [GitHub Actions Runner Repository](https://github.com/actions/runner)
- [Security Hardening for Self-Hosted Runners](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Bitcoin Core Contributing Guide](./CONTRIBUTING.md)
- [Security Practices](./SECURITY_PRACTICES.md)

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review GitHub Actions documentation
3. Open an issue in the repository
4. Contact the infrastructure team

---

**Last Updated**: 2026-02-14
**Version**: 1.0.0
