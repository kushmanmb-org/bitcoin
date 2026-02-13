# Branch Protection and Security Rulesets

This directory contains GitHub repository rulesets that define branch protection rules, tag protection, and security policies for the Bitcoin Core repository.

## Overview

GitHub Rulesets provide a declarative way to manage branch protection, tag protection, and other repository policies. These rulesets help ensure code quality, security, and maintain the integrity of the Bitcoin Core codebase.

## Ruleset Files

### 1. Main Branch Protection (`branch-protection-main.json`)
Applies comprehensive protection to the main/master branch:
- **Required Reviews**: 2 approving reviews required
- **Code Owner Review**: Required for changes affecting code ownership areas
- **Status Checks**: CodeQL, build, test, and security scan must pass
- **Restrictions**: 
  - Branch deletion prevented
  - Force pushes blocked
  - Requires commit signatures
  - Requires linear history
- **Stale Reviews**: Dismissed when new commits are pushed

### 2. Release Branch Protection (`branch-protection-release.json`)
Protects release branches (release/*, v*):
- **Required Reviews**: 2 approving reviews required
- **Code Owner Review**: Required
- **Status Checks**: All CI/CD checks must pass
- **Restrictions**:
  - Branch deletion prevented
  - Force pushes blocked
  - Requires commit signatures
- **No Bypass**: No bypass actors allowed

### 3. Tag Protection (`tag-protection.json`)
Protects version tags (v*, all tags):
- **Creation**: Restricted to authorized users
- **Update**: Blocked to prevent tag modification
- **Deletion**: Prevented to maintain version history
- **Signatures**: Required for tag creation
- **Bypass**: Only repository admins can bypass

### 4. Development Branch Protection (`branch-protection-dev.json`)
Basic protection for development branches:
- **Required Reviews**: 1 approving review required
- **Status Checks**: Build and test must pass
- **Restrictions**: Branch deletion prevented
- **Flexible**: Less strict for active development

### 5. Security and Compliance (`security-checks.json`)
Security rules applicable to all branches:
- **Security Scans**: CodeQL and dependency scanning required
- **Applies To**: All branches except automated bot branches
- **No Bypass**: Ensures security checks are always performed

## Safe Practices

### 1. Enabling Rulesets
These ruleset files serve as templates. To enable them in your GitHub repository:

1. Go to repository Settings → Rules → Rulesets
2. Click "New ruleset" → "New branch ruleset" or "New tag ruleset"
3. Use the JSON configurations from these files as reference
4. Adjust actor IDs and contexts to match your repository's specific setup

**Note**: GitHub does not currently support importing rulesets directly from JSON files in the repository. These files serve as documentation and configuration templates.

### 2. Customization Guidelines

When customizing rulesets:
- **Actor IDs**: Update bypass_actors to match your repository roles
- **Status Checks**: Adjust context names to match your CI/CD workflow names
- **Review Requirements**: Modify based on team size and workflow
- **Branch Patterns**: Update ref_name patterns to match your branching strategy

### 3. Security Best Practices

- **Commit Signatures**: Always require GPG signed commits for protected branches
- **Status Checks**: Ensure all security scans complete before merging
- **Review Requirements**: Enforce code owner reviews for critical code paths
- **No Force Push**: Prevent history rewriting on protected branches
- **Linear History**: Maintain clean commit history
- **Stale Review Dismissal**: Ensure reviews are current with latest code

### 4. Bypass Actors

Configure bypass actors carefully:
- **Repository Admins**: May need bypass for emergency fixes
- **Bots**: Dependabot/Renovate may need bypass for automated updates
- **Use Pull Request Mode**: Prefer "pull_request" over "always" bypass mode
- **Minimize Bypasses**: Keep the number of bypass actors minimal

### 5. Testing Rulesets

Before enforcing rulesets in production:
1. Set enforcement to "evaluate" mode initially
2. Monitor for any issues or conflicts
3. Adjust rules based on team feedback
4. Switch to "active" enforcement once validated

## Ruleset Management Workflow

### Adding New Protection Rules

1. Create a new JSON file in this directory
2. Define the ruleset configuration
3. Document the purpose and rules
4. Test in evaluation mode
5. Enable in the repository settings

### Modifying Existing Rules

1. Update the JSON configuration file
2. Document changes in commit message
3. Review with team before applying
4. Update the ruleset in repository settings
5. Communicate changes to the team

### Reviewing Ruleset Effectiveness

Regularly review:
- Number of bypasses used
- Status check failure rates
- Time to merge pull requests
- Team feedback on friction points

## Integration with CI/CD

Ensure your CI/CD workflows align with ruleset requirements:

- **Status Check Names**: Match the contexts defined in rulesets
- **Required Checks**: Include all security scans (CodeQL, dependency scanning)
- **Build and Test**: Ensure comprehensive test coverage
- **Performance**: Optimize CI/CD to complete within reasonable time

## References

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Branch Protection Best Practices](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Requiring Commit Signatures](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)

## Support

For questions or issues with rulesets:
1. Check the GitHub Rulesets documentation
2. Review this README for guidance
3. Consult with repository maintainers
4. Open an issue for discussion

## Version History

- v1.0.0 - Initial ruleset configurations for branch protection, tag protection, and security
