# Scripts Directory

This directory contains utility scripts for repository management and automation.

## Available Scripts

### propagate-updates.sh

**Purpose**: Automate propagation of security and safety standards across all repositories in the kushmanmb-org organization.

**Prerequisites**:
- [GitHub CLI (gh)](https://cli.github.com/) installed and authenticated
- Appropriate permissions to create branches and PRs in target repositories

**Usage**:
```bash
# Show help
./scripts/propagate-updates.sh --help

# List all repositories
./scripts/propagate-updates.sh --list

# Dry run (show what would be done)
./scripts/propagate-updates.sh --dry-run

# Update a specific repository
./scripts/propagate-updates.sh --repo my-repo

# Update all repositories
./scripts/propagate-updates.sh
```

**What it does**:
1. Clones target repository
2. Creates a feature branch
3. Adds global announcement to README.md
4. Copies ANNOUNCEMENT.md (if missing)
5. Updates workflow security headers
6. Commits and pushes changes
7. Creates a pull request

**Safety Features**:
- Dry-run mode for testing
- Skips archived and forked repositories
- Validates changes before committing
- Creates PRs instead of direct merges

**See Also**: [ORG_WIDE_UPDATE_PROCESS.md](../ORG_WIDE_UPDATE_PROCESS.md) for manual update procedures.

## Contributing

When adding new scripts:
1. Follow the existing naming convention (kebab-case)
2. Add executable permissions (`chmod +x`)
3. Include usage documentation in this README
4. Add error handling and dry-run modes where appropriate
5. Follow secure coding practices (no hardcoded secrets)

## Security Notes

- Scripts should never contain hardcoded credentials
- Use GitHub CLI authentication for API access
- Validate inputs before processing
- Log actions for audit purposes
- Follow least privilege principle

---

*For questions or issues with scripts, open an issue in this repository.*
