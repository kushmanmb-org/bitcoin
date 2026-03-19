# Workflow Updates - Self-Hosted Runners and Ownership Configuration

## Overview

This document describes the updates made to all GitHub Actions workflows in the `kushmanmb-org/bitcoin` repository to support self-hosted runners and configure ownership banners.

## Changes Made

### 1. Global Ownership Banner

All workflow files now include a standardized ownership banner at the top:

```yaml
# ═══════════════════════════════════════════════════════════════════
# GLOBAL OWNERSHIP & CREATOR STATUS
# ═══════════════════════════════════════════════════════════════════
# Repository Owner: kushmanmb.eth (Ethereum Name Service)
# Creator: Kushman MB
# ENS Identifiers:
#   - Primary: kushmanmb.eth (Ethereum Mainnet)
#   - Base Network: Kushmanmb.base.eth
# 
# This workflow is part of the kushmanmb-org/bitcoin repository
# and is maintained by the repository owner and authorized contributors.
# ═══════════════════════════════════════════════════════════════════
```

This banner:
- Clearly identifies the repository owner using ENS (Ethereum Name Service) identifiers
- Establishes creator status for Kushman MB
- Links the workflow to the official kushmanmb.eth identity on both Ethereum Mainnet and Base Network
- Provides verifiable on-chain identity through ENS

### 2. Self-Hosted Runner Support

All workflows have been updated to support self-hosted runners through a configuration variable. The pattern used is:

```yaml
runs-on: ${{ vars.USE_SELF_HOSTED == 'true' && 'self-hosted' || 'ubuntu-latest' }}
```

This allows dynamic switching between:
- **Self-hosted runners**: When `USE_SELF_HOSTED` variable is set to `'true'` in repository settings
- **GitHub-hosted runners**: Falls back to GitHub-hosted runners (ubuntu-latest) when the variable is not set

### 3. Updated Workflows

The following workflow files were updated:

#### Core Workflows
1. **ci.yml** - Main CI/CD pipeline
   - Added ownership banner
   - Updated repository identifier to `kushmanmb-org/bitcoin`
   - Added `REPO_USE_SELF_HOSTED` environment variable
   - Already had advanced runner selection logic preserved

2. **codeql.yml** - Code security analysis
   - Added ownership banner
   - Added self-hosted runner support with fallback to ubuntu-latest
   - Maintains Swift/macOS-specific runner configuration

3. **Kushmanmb.eth** - CodeQL configuration file
   - Added ownership banner
   - Added self-hosted runner support
   - Maintains language-specific configurations

#### Integration Workflows
4. **bitcoin-ownership-announcement.yml** - Bitcoin ownership announcements
   - Added ownership banner
   - Updated all three jobs to support self-hosted runners:
     - `announce-ownership`
     - `verify-no-secrets`
     - `create-summary`

5. **etherscan-apiv2.yml** - Etherscan API integration
   - Added ownership banner
   - Updated `fetch-etherscan-data` job to support self-hosted runners

#### Operations Workflows
6. **open-issue.yml** - Issue creation workflow
   - Added ownership banner
   - Updated `open-issue` job to support self-hosted runners

7. **wiki-management.yml** - Wiki content management
   - Added ownership banner
   - Updated all three jobs to support self-hosted runners:
     - `validate-wiki`
     - `check-security`
     - `summary`

8. **deploy-website.yml** - Website deployment
   - Added ownership banner
   - Updated all relevant jobs to support self-hosted runners:
     - `security-scan`
     - `build`
     - `deploy-pages`
     - `post-deploy-check`
   - Preserved existing `deploy-self-hosted` job which already uses self-hosted runners

9. **self-hosted-runner-setup.yml** - Runner configuration and testing
   - Added ownership banner
   - Updated validation and summary jobs:
     - `validate-runner-config`
     - `summary`
   - Preserved platform-specific runner configurations (Linux, macOS, Windows)

## Configuration

### Enabling Self-Hosted Runners

To enable self-hosted runners for all workflows:

1. Navigate to your repository settings
2. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**
3. Create a new repository variable:
   - **Name**: `USE_SELF_HOSTED`
   - **Value**: `true`
4. Self-hosted runners must be configured with appropriate labels:
   - `self-hosted` - Basic self-hosted runner label
   - Platform-specific labels for platform-specific jobs (e.g., `linux`, `macos`, `windows`)

### Disabling Self-Hosted Runners

To use GitHub-hosted runners instead:

1. Set `USE_SELF_HOSTED` to `false`, or
2. Remove the `USE_SELF_HOSTED` variable entirely

The workflows will automatically fall back to GitHub-hosted runners.

## Benefits

### Ownership and Identity
- **Clear Attribution**: Every workflow clearly identifies the repository owner and creator
- **ENS Integration**: Links workflows to verifiable on-chain identity (kushmanmb.eth)
- **Trust and Transparency**: Establishes clear ownership and authority for the repository

### Self-Hosted Runner Advantages
- **Cost Efficiency**: Reduced GitHub Actions minutes consumption
- **Performance**: Potentially faster builds on dedicated hardware
- **Control**: Full control over the build environment
- **Privacy**: Data stays on your infrastructure
- **Customization**: Ability to pre-install tools and dependencies

### Flexibility
- **Easy Toggling**: Switch between self-hosted and GitHub-hosted runners with a single variable
- **Gradual Migration**: Test self-hosted runners without committing fully
- **Fallback Safety**: Automatic fallback to GitHub-hosted runners ensures reliability

## Security Considerations

### Self-Hosted Runners
When using self-hosted runners, ensure:
1. Runners are properly secured and isolated
2. Access controls are in place
3. Runners are regularly updated
4. Sensitive data is protected
5. Refer to [SELF_HOSTED_RUNNER_SETUP.md](SELF_HOSTED_RUNNER_SETUP.md) for detailed security practices

### ENS Identity
The ENS identifiers in the ownership banner:
- Are public information on the Ethereum blockchain
- Provide verifiable identity without exposing sensitive data
- Can be verified at:
  - https://app.ens.domains/kushmanmb.eth
  - https://app.ens.domains/Kushmanmb.base.eth

## Testing

All workflow files have been validated for:
- ✅ YAML syntax correctness
- ✅ GitHub Actions workflow schema compliance
- ✅ Proper variable substitution
- ✅ Conditional logic for runner selection

## Rollback

If issues arise with self-hosted runners:

1. **Quick Fix**: Set `USE_SELF_HOSTED` variable to `false` in repository settings
2. **Manual Rollback**: Revert the commits that introduced these changes
3. **Partial Rollback**: Modify individual workflow files to remove self-hosted runner support

## Future Enhancements

Potential improvements for consideration:
- Add runner health checks before job execution
- Implement runner-specific caching strategies
- Add telemetry for runner performance monitoring
- Create workflow-specific runner pools for better resource allocation
- Implement automatic runner scaling based on workload

## References

- [Self-Hosted Runner Setup Guide](SELF_HOSTED_RUNNER_SETUP.md)
- [ENS Configuration](ENS_CONFIGURATION.md)
- [Security Practices](SECURITY_PRACTICES.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ENS Documentation](https://docs.ens.domains/)

## Support

For issues related to:
- **Workflows**: Create an issue in this repository
- **Self-hosted runners**: Refer to SELF_HOSTED_RUNNER_SETUP.md
- **ENS configuration**: Refer to ENS_CONFIGURATION.md
- **Ownership verification**: Contact via GitHub issues with verification proof

---

**Last Updated**: 2026-02-15  
**Version**: 1.0  
**Maintained by**: kushmanmb.eth (Kushman MB)
