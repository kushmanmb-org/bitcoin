# Identity Management and Git Consolidation

## Overview

This document describes the identity management and git consolidation strategy for the kushmanmb-org/bitcoin repository. It ensures that all contributions are properly attributed regardless of which identity (ENS address, email, or GitHub account) was used.

## Purpose

The identity consolidation serves several purposes:
1. **Consistent Attribution**: All commits are attributed to the canonical identity
2. **ENS Integration**: Blockchain identities (ENS addresses) are recognized in git history
3. **Email Consolidation**: Multiple email addresses are mapped to a single identity
4. **Historical Accuracy**: Git logs show consistent authorship across all branches

## Consolidated Identities

### Primary Identity

**Canonical Name**: Kushman MB  
**Canonical Email**: Kushmanmb@gmx.com

### ENS Addresses

1. **kushmanmb.eth**
   - Network: Ethereum Mainnet (Chain ID: 1)
   - Status: Primary ENS identity
   - Purpose: Main blockchain identity for the project

2. **kushmanmb.base.eth**
   - Network: Base L2 (Chain ID: 8453)
   - Status: Active
   - Purpose: Layer 2 identity for Base network integration

3. **Yaketh.eth**
   - Network: Ethereum Mainnet (Chain ID: 1)
   - Status: Secondary identity
   - Purpose: Collaboration and additional attribution

### Email Addresses

1. **Kushmanmb@gmx.com** (Primary)
   - Purpose: Main contact and git identity
   - Used for: Official communications, git commits

2. **mattbrace92@gmail.com** (Secondary)
   - Purpose: Alternative contact
   - Used for: Secondary communications, historical commits

### GitHub Accounts

- **193178375+Kushmanmb@users.noreply.github.com**
- **Yaketh** (GitHub username associated with the above email)

## Implementation

### Git Mailmap

The `.mailmap` file in the repository root implements the identity consolidation:

```
# Git mailmap for consolidating contributor identities
Kushman MB <Kushmanmb@gmx.com> <mattbrace92@gmail.com>
Kushman MB <Kushmanmb@gmx.com> <193178375+Kushmanmb@users.noreply.github.com>
Kushman MB <Kushmanmb@gmx.com> Yaketh <193178375+Kushmanmb@users.noreply.github.com>
```

### How It Works

Git mailmap translates commit author information in the following ways:

1. **Email Mapping**: Commits from `mattbrace92@gmail.com` appear as `Kushmanmb@gmx.com`
2. **Name and Email Mapping**: Commits from `Yaketh <193178375+Kushmanmb@users.noreply.github.com>` appear as `Kushman MB <Kushmanmb@gmx.com>`
3. **Consistent Attribution**: `git log`, `git shortlog`, and other git commands show the canonical identity

### Verification

To verify the mailmap is working correctly:

```bash
# Show git log with mailmap applied (default)
git log --format="%an <%ae>"

# Show git log without mailmap
git log --no-mailmap --format="%an <%ae>"

# Show commit count by author (with mailmap)
git shortlog -sn

# Show commit count by author (without mailmap)
git shortlog -sn --no-mailmap
```

## Workflows and Automation

### GitHub Actions Integration

The repository's GitHub Actions workflows recognize all consolidated identities:

1. **CodeQL Analysis** (`.github/workflows/Kushmanmb.eth`)
   - Includes metadata for all ENS identities
   - Documents repository ownership and creator status

2. **Etherscan API Integration** (`.github/workflows/etherscan-apiv2.yml`)
   - Automatically resolves kushmanmb.eth to Ethereum address
   - Can be extended to support Yaketh.eth and kushmanmb.base.eth

3. **Website Deployment** (`.github/workflows/deploy-website.yml`)
   - Uses kushmanmb.eth as primary identity marker

### API Keys and Secrets

For blockchain integration with all identities, the following secrets should be configured:

- `ETHERSCAN_API_KEY`: For kushmanmb.eth and Yaketh.eth on Ethereum Mainnet
- `BASESCAN_API_KEY`: For kushmanmb.base.eth on Base L2

See [ENS_CONFIGURATION.md](ENS_CONFIGURATION.md) for details.

## Configuration for Contributors

### Setting Up Git Identity

Contributors who are the identity owner should configure git with one of the recognized identities:

```bash
# Option 1: Use primary email
git config --global user.name "Kushman MB"
git config --global user.email "Kushmanmb@gmx.com"

# Option 2: Use secondary email (will be mapped via mailmap)
git config --global user.name "Kushman MB"
git config --global user.email "mattbrace92@gmail.com"

# Option 3: Local configuration (for this repository only)
cd /path/to/bitcoin
git config user.name "Kushman MB"
git config user.email "Kushmanmb@gmx.com"
```

### Signing Commits

For enhanced security, sign commits with GPG:

```bash
# Generate GPG key associated with your email
gpg --full-generate-key

# List your GPG keys
gpg --list-secret-keys --keyid-format=long

# Configure git to use your GPG key
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Add GPG key to GitHub
gpg --armor --export YOUR_KEY_ID
# Copy output and add to GitHub Settings → SSH and GPG keys
```

### Hardware Security Keys

For maximum security, use hardware-backed SSH keys:

```bash
# Generate hardware-backed SSH key (requires FIDO2/U2F device like YubiKey)
ssh-keygen -t ed25519-sk -C "Kushmanmb@gmx.com"

# Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_sk

# Add public key to GitHub
cat ~/.ssh/id_ed25519_sk.pub
```

See [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) for more security details.

## ENS Integration

### ENS Records Management

Each ENS identity should have appropriate records set:

**kushmanmb.eth** (Primary):
- ETH Address: Ethereum address
- BTC Address: Bitcoin address (optional)
- Email: Kushmanmb@gmx.com
- URL: https://kushmanmb.org (or project website)
- Avatar: Profile image
- Description: Project description

**kushmanmb.base.eth** (Base L2):
- ETH Address: Base L2 address
- Email: Kushmanmb@gmx.com
- URL: Project website
- Description: Base L2 identity

**Yaketh.eth** (Secondary):
- ETH Address: Ethereum address
- Email: Associated email
- Description: Secondary identity for collaboration

### ENS Resolution

To query ENS records:

```bash
# Ethereum Mainnet
curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=getaddress&name=kushmanmb.eth&apikey=YOUR_KEY"
curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=getaddress&name=Yaketh.eth&apikey=YOUR_KEY"

# Base L2
curl "https://api.basescan.org/api?module=ens&action=getaddress&name=kushmanmb.base.eth&apikey=YOUR_KEY"
```

## Security Considerations

### Identity Protection

1. **Private Key Security**
   - Never commit private keys associated with ENS identities
   - Use hardware wallets for ENS management
   - Enable multi-signature for critical operations

2. **Email Security**
   - Enable 2FA on all email accounts
   - Use strong, unique passwords
   - Monitor for unauthorized access

3. **GitHub Security**
   - Enable 2FA on GitHub account
   - Use SSH keys or GPG signing
   - Review security logs regularly

### Access Control

Only the identity owner (Kushman MB) should:
- Make commits using the consolidated identities
- Modify ENS records
- Update identity-related documentation
- Configure API keys for blockchain integration

### Audit Trail

All identity-related changes are tracked in git history:
- `.mailmap` changes
- ENS_CONFIGURATION.md updates
- Workflow modifications
- Security policy updates

Review the git log to audit identity management:

```bash
# Show history of .mailmap changes
git log --follow -- .mailmap

# Show history of identity-related documentation
git log --follow -- ENS_CONFIGURATION.md IDENTITY_MANAGEMENT.md
```

## Maintenance

### Regular Reviews

Identity configuration should be reviewed:
- **Quarterly**: Verify ENS records are correct
- **After security incidents**: Review and update if needed
- **When adding identities**: Update .mailmap and documentation
- **During onboarding**: Educate new contributors about identity management

### Updating Identities

To add a new identity or email to the consolidation:

1. Edit `.mailmap`:
   ```bash
   # Add line to .mailmap
   echo "Kushman MB <Kushmanmb@gmx.com> <new-email@example.com>" >> .mailmap
   ```

2. Update documentation:
   - IDENTITY_MANAGEMENT.md (this file)
   - ENS_CONFIGURATION.md (if ENS-related)
   - GIT_WORKFLOW_GUIDE.md (if workflow-related)

3. Commit and push changes:
   ```bash
   git add .mailmap IDENTITY_MANAGEMENT.md
   git commit -m "Add new identity to git consolidation"
   git push
   ```

4. Verify the mapping:
   ```bash
   git log --all --format="%an <%ae>" | sort -u
   ```

### ENS Renewal

ENS names expire and must be renewed:

1. **Check expiration dates**:
   - kushmanmb.eth: https://app.ens.domains/kushmanmb.eth
   - Yaketh.eth: https://app.ens.domains/Yaketh.eth
   - kushmanmb.base.eth: Check Base network ENS manager

2. **Set up renewal reminders**:
   - 90 days before expiration: First reminder
   - 30 days before expiration: Second reminder
   - 7 days before expiration: Urgent reminder

3. **Renew before expiration** to prevent loss of the names

## Troubleshooting

### Identity Not Recognized

If commits don't show the correct identity:

1. Verify mailmap syntax:
   ```bash
   git check-mailmap "Author Name <author@email.com>"
   ```

2. Check git configuration:
   ```bash
   git config user.name
   git config user.email
   ```

3. Ensure mailmap is committed:
   ```bash
   git ls-files .mailmap
   ```

### ENS Not Resolving

If ENS addresses don't resolve:

1. Verify ENS registration:
   ```bash
   curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=lookup&name=kushmanmb.eth"
   ```

2. Check resolver configuration:
   - Visit https://app.ens.domains/kushmanmb.eth
   - Ensure resolver is set
   - Verify address record is set

3. Test with alternative methods:
   ```javascript
   // Using ethers.js
   const address = await provider.resolveName('kushmanmb.eth');
   console.log(address);
   ```

### Multiple Identities in Logs

If git logs show multiple identities when they should be consolidated:

1. Verify mailmap is being applied:
   ```bash
   # Should show consolidated identity
   git shortlog -sn
   
   # Should show multiple identities
   git shortlog -sn --no-mailmap
   ```

2. Check mailmap format:
   - Each line should follow: `Proper Name <proper@email.com> <commit@email.com>`
   - No trailing whitespace
   - Use Unix line endings (LF, not CRLF)

3. Re-validate after changes:
   ```bash
   git commit --amend --reset-author
   ```

## Support and Contact

For questions or issues related to identity management:

- **Email**: Kushmanmb@gmx.com or mattbrace92@gmail.com
- **GitHub Issues**: https://github.com/kushmanmb-org/bitcoin/issues
- **ENS Records**: Use app.ens.domains for self-service management
- **Security Issues**: See [SECURITY.md](SECURITY.md) for responsible disclosure

## References

- [Git Mailmap Documentation](https://git-scm.com/docs/gitmailmap)
- [ENS Documentation](https://docs.ens.domains/)
- [GitHub Identity Management](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github)
- [ENS_CONFIGURATION.md](ENS_CONFIGURATION.md) - ENS-specific configuration
- [GIT_WORKFLOW_GUIDE.md](GIT_WORKFLOW_GUIDE.md) - Git workflow documentation
- [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) - Security best practices

## Version History

- **v2.0.0** (2026-02-15): Comprehensive identity consolidation with multi-ENS support
  - Added kushmanmb.base.eth (Base L2)
  - Added Yaketh.eth (Secondary identity)
  - Consolidated email addresses
  - Created comprehensive documentation

- **v1.0.0** (2026-02-14): Initial ENS configuration
  - Basic kushmanmb.eth setup
  - Initial workflow integration

---

**Last Updated**: 2026-02-15  
**Version**: 2.0.0  
**Maintained by**: Kushman MB (kushmanmb.eth)  
**Contact**: Kushmanmb@gmx.com, mattbrace92@gmail.com
