# Templates Directory

This directory contains reusable templates for organization-wide consistency.

## Available Templates

### global-announcement.md

**Purpose**: Standard global announcement banner for all repositories.

**Usage**: 
- Prepend to README.md files
- Include in documentation
- Use in automated update scripts

**Content**: Official ownership statement with verified channels:
- kushmanmb.base.eth
- kushmanmb.eth
- kushmania.eth
- kushmanmb.org
- yaketh.eth

**References**:
- Used by `scripts/propagate-updates.sh`
- Used by `.github/workflows/propagate-safety-standards.yml`
- Referenced in `ORG_WIDE_UPDATE_PROCESS.md`

## Maintenance

When updating templates:
1. Update the template file in this directory
2. The changes will be automatically picked up by automation tools
3. Test changes with dry-run mode before production
4. Document any breaking changes in ORG_WIDE_UPDATE_PROCESS.md

## Adding New Templates

To add a new template:
1. Create the template file in this directory
2. Document it in this README
3. Update automation scripts to reference it
4. Update ORG_WIDE_UPDATE_PROCESS.md

---

*For questions about templates, open an issue in this repository.*
