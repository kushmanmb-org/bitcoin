# Bitcoin Ownership Announcement Workflow

## Overview

The Bitcoin Ownership Announcement workflow (`bitcoin-ownership-announcement.yml`) is a GitHub Actions workflow that creates timestamped, verifiable announcements of Bitcoin ownership associated with Ethereum Name Service (ENS) identifiers.

## Purpose

This workflow serves to:

1. **Public Declaration**: Publicly declare the association between this repository and specific ENS names
2. **Timestamped Records**: Create verifiable, timestamped records of ownership claims
3. **Cross-Chain Verification**: Enable cross-chain identity verification between Bitcoin and Ethereum ecosystems
4. **Transparency**: Maintain a transparent history of ownership announcements

## ENS Names

The workflow is configured to announce ownership associated with:

- **Kushmanmb.base.eth** - ENS name on Base Network
- **kushmanmb.eth** - ENS name on Ethereum Mainnet

## Workflow Triggers

The workflow can be triggered in three ways:

### 1. Manual Trigger (workflow_dispatch)
- Navigate to Actions → Bitcoin Ownership Announcement → Run workflow
- Select the announcement type (ownership, verification, or status)
- The workflow will execute and create a new announcement

### 2. Scheduled Execution
- Automatically runs weekly on Monday at 00:00 UTC
- Creates regular ownership verification records
- Maintains continuous chain of custody documentation

### 3. Push to Master
- Triggers when the workflow file itself is updated
- Ensures the workflow configuration changes are tested

## Security Features

### Safe Practices Implemented

1. **No Secrets in Code**: The workflow contains NO private keys, seed phrases, or wallet credentials
2. **Public Information Only**: Only public ENS names are stored in the workflow
3. **Automated Verification**: Built-in security scanning to detect any accidentally committed secrets
4. **Pattern Matching**: Checks for forbidden patterns like:
   - Private keys (various formats)
   - Seed phrases
   - Mnemonics
   - Passwords
   - Bitcoin/Ethereum private key formats

### Security Jobs

The workflow includes multiple security-focused jobs:

1. **announce-ownership**: Creates the announcement with public data only
2. **verify-no-secrets**: Scans all generated files for potential secrets
3. **create-summary**: Creates a summary with verification details

## Output Files

The workflow creates the following files:

### Announcement Documents
- **Location**: `data/ownership/announcement-{DATE}.md`
- **Content**: Timestamped ownership declaration
- **Format**: Markdown with structured metadata

### Index File
- **Location**: `data/ownership/README.md`
- **Content**: Index of all announcements
- **Updates**: Automatically updated with each new announcement

## Announcement Structure

Each announcement includes:

```markdown
# Bitcoin Ownership Announcement

**Date**: YYYY-MM-DD
**Timestamp**: ISO 8601 timestamp

## Ownership Declaration
- Primary ENS Names
- Security notices
- Verification information

## Repository Metadata
- Repository name
- Workflow run ID
- Commit SHA
- Actor

## Purpose and Disclaimer
```

## Usage Examples

### Manual Announcement
```bash
# Via GitHub UI:
# 1. Go to Actions tab
# 2. Select "Bitcoin Ownership Announcement"
# 3. Click "Run workflow"
# 4. Select announcement type
# 5. Click "Run workflow" button
```

### Viewing Announcements
```bash
# List all announcements
ls -la data/ownership/

# View the latest announcement
cat data/ownership/announcement-$(date +%Y-%m-%d).md

# View the index
cat data/ownership/README.md
```

## Verification Process

To verify an announcement:

1. **Check Commit Signature**: Verify the commit is signed by GitHub Actions
2. **Review Workflow Run**: Check the workflow run details in GitHub Actions
3. **Validate Timestamps**: Ensure timestamps are consistent
4. **ENS Resolution**: Optionally verify ENS names resolve correctly on their respective chains

## Integration with Other Workflows

This workflow complements:

- **etherscan-apiv2.yml**: For Ethereum-related data fetching
- **wiki-management.yml**: For documentation management
- **ci.yml**: For continuous integration testing

## Troubleshooting

### Workflow Fails on Security Check
- **Cause**: Potential secret detected in announcement
- **Solution**: Review the generated files, remove any sensitive data
- **Prevention**: Never add real private keys or credentials to the workflow

### Announcement Not Created
- **Cause**: Git push may have failed
- **Solution**: Check workflow logs for error messages
- **Common Issues**: Permission problems, merge conflicts

### ENS Names Not Found
- **Cause**: Typo in ENS name or ENS resolution issue
- **Solution**: Verify ENS names are correctly spelled in the workflow file

## Best Practices

1. **Regular Reviews**: Periodically review generated announcements
2. **Security Audits**: Audit the workflow file for any hardcoded secrets
3. **Access Control**: Limit who can manually trigger workflows
4. **Monitoring**: Monitor workflow runs for unexpected behavior
5. **Backup**: Keep backups of announcement history

## Maintenance

### Updating ENS Names
To update the ENS names:

1. Edit `.github/workflows/bitcoin-ownership-announcement.yml`
2. Update the `ENS_BASE` and `ENS_MAINNET` variables
3. Test the workflow manually
4. Commit and push changes

### Changing Schedule
To change the weekly schedule:

1. Edit the `cron` expression in the workflow file
2. Use [crontab.guru](https://crontab.guru/) to verify syntax
3. Test with manual trigger first

## Compliance and Legal

- This workflow creates public declarations only
- No financial transactions are performed
- Announcements are for informational purposes
- Does not constitute financial or legal advice
- Ownership claims should be verified through cryptographic means

## Related Documentation

- [Security Practices](Security-Practices.md)
- [Workflow Management](Workflow-Management.md)
- [Private Data Handling](Private-Data-Handling.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Contact

For questions or issues:
1. Open a GitHub Issue
2. Reference the specific workflow run
3. Provide relevant logs (excluding any sensitive data)

---

**Last Updated**: 2026-02-13  
**Workflow Version**: 1.0  
**Maintained By**: Repository Administrators
