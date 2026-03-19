# Git Workflow Guide

## Overview

This document explains the git workflow for contributing to the kushmanmb-org/bitcoin repository.

## Branch Structure

- **master**: The main development branch. All changes must go through pull requests.
- **Feature branches**: Topic branches for specific changes (e.g., `copilot/push-master-branch`)

## Contributing Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

```bash
# Edit files
git add .
git commit -m "Descriptive commit message"
```

### 3. Push to Your Branch

```bash
# First time pushing a new branch
git push -u origin feature/your-feature-name

# Subsequent pushes
git push
```

### 4. Create a Pull Request

- Go to GitHub and create a pull request from your feature branch to `master`
- Fill in the PR template with details about your changes
- Request reviews from maintainers

### 5. Address Review Feedback

```bash
# Make changes based on feedback
git add .
git commit -m "Address review feedback"
git push
```

### 6. Merge

- Once approved, a maintainer will merge your PR into `master`
- **DO NOT** push directly to `master`

## Important Notes

### Direct Push to Master

**The command `git push -u origin master` should only be used by repository maintainers with write access.**

Regular contributors should:
1. Work on feature branches
2. Submit pull requests
3. Wait for review and approval
4. Let maintainers handle the merge

### Why We Use Pull Requests

- **Code Review**: All changes are reviewed before merging
- **CI/CD**: Automated tests run on every PR
- **Security**: Multiple layers of checks prevent accidental or malicious changes
- **Documentation**: PRs provide a record of what changed and why

### Protected Branches

The `master` branch is protected with the following rules:
- Requires pull request reviews before merging
- Requires status checks to pass
- Does not allow force pushes
- Does not allow deletions

## For Maintainers

If you are a maintainer with write access to `master`:

### Merging a Pull Request

```bash
# Update your local master
git checkout master
git pull origin master

# Merge the PR (after approval)
# This is typically done through GitHub UI, but can be done locally:
git merge --no-ff feature/branch-name
git push origin master
```

### Setting Up Upstream Tracking

```bash
# Set master to track origin/master
git branch --set-upstream-to=origin/master master

# Verify tracking
git branch -vv
```

### Emergency Hotfix

For critical fixes that need immediate deployment:

```bash
# Create hotfix branch from master
git checkout master
git pull origin master
git checkout -b hotfix/critical-fix

# Make and test your fix
git add .
git commit -m "Fix critical issue"

# Push and create PR
git push -u origin hotfix/critical-fix

# After quick review, merge to master
git checkout master
git merge --no-ff hotfix/critical-fix
git push origin master
```

## Workflow in CI/CD Environments

When working in automated environments (like GitHub Actions or Copilot):

- Use the **report_progress** tool or equivalent to commit and push changes
- Do not attempt to push directly to `master`
- Work through the PR process
- Automated systems will handle the final merge after approval

## Troubleshooting

### "Permission denied" when pushing to master

This is expected. You should be working on a feature branch instead.

### Branch not tracking remote

```bash
git branch --set-upstream-to=origin/your-branch-name your-branch-name
```

### Need to update from master

```bash
git checkout master
git pull origin master
git checkout your-feature-branch
git rebase master  # or git merge master
```

## Best Practices

1. **Keep commits atomic**: Each commit should represent one logical change
2. **Write clear commit messages**: Explain what and why, not just how
3. **Test before pushing**: Run tests locally before pushing
4. **Keep PRs focused**: One PR should address one issue or feature
5. **Update regularly**: Regularly sync your branch with master
6. **Sign your commits**: Use GPG to sign commits for authenticity

## Resources

- [CONTRIBUTING.md](CONTRIBUTING.md) - Detailed contribution guidelines
- [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) - Security best practices
- [doc/developer-notes.md](doc/developer-notes.md) - Developer notes and conventions

## Questions?

If you have questions about the workflow:
- Open an issue: https://github.com/kushmanmb-org/bitcoin/issues
- Review existing documentation in the `doc/` directory
- Check the [CONTRIBUTING.md](CONTRIBUTING.md) file

---

Last Updated: 2026-02-14
