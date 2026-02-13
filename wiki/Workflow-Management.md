# Workflow Management

This guide covers managing GitHub Actions workflows in the Bitcoin Core project.

## 📋 Overview

GitHub Actions workflows automate various tasks:

- Continuous Integration (CI)
- Testing
- Building
- Deployment
- Code quality checks
- Security scanning
- Data collection and processing

## 🗂️ Workflow Organization

### Existing Workflows

The project has several workflows in `.github/workflows/`:

1. **ci.yml** - Main CI pipeline
   - Runs on pull requests and pushes
   - Builds and tests across multiple platforms
   - Includes linting, unit tests, and functional tests

2. **etherscan-apiv2.yml** - API integration example
   - Scheduled data fetching
   - Manual workflow dispatch
   - Secure API key handling

### Workflow Structure

```yaml
name: Workflow Name
on:
  push:
    branches: [ master ]
  pull_request:
  workflow_dispatch:

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - name: Step name
        run: |
          # Commands here
```

## 🔐 Security in Workflows

### Protecting Secrets

**Always** use GitHub Secrets for sensitive data:

```yaml
- name: Step using secrets
  env:
    API_KEY: ${{ secrets.API_KEY }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  run: |
    # Secrets are automatically masked in logs
    ./script.sh
```

### Permissions

Explicitly define permissions for each workflow:

```yaml
permissions:
  contents: read        # Read repository contents
  pull-requests: write  # Comment on PRs
  issues: write         # Create/update issues
```

Common permission levels:
- `read` - Read-only access
- `write` - Read and write access
- `none` - No access

### Input Validation

Validate all inputs in workflow_dispatch workflows:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - development
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Validate input
        run: |
          if [[ ! "${{ inputs.environment }}" =~ ^(development|staging|production)$ ]]; then
            echo "Invalid environment"
            exit 1
          fi
```

## 🚀 Creating New Workflows

### Workflow Template

Create a new workflow file in `.github/workflows/`:

```yaml
# .github/workflows/my-workflow.yml
name: My Workflow

on:
  # Trigger on push to main branches
  push:
    branches: [ master, main ]
  # Trigger on PRs
  pull_request:
  # Allow manual trigger
  workflow_dispatch:

# Define minimum permissions needed
permissions:
  contents: read

# Prevent concurrent runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  my-job:
    name: 'Job Description'
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v6
      
      - name: Run task
        run: |
          echo "Task execution"
          # Your commands here
      
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: results
          path: output/
          retention-days: 7
```

### Best Practices

1. **Name workflows clearly**: Use descriptive names
2. **Minimize permissions**: Only grant what's needed
3. **Use concurrency control**: Prevent wasted resources
4. **Add timeouts**: Prevent runaway jobs
5. **Handle failures gracefully**: Use `if: always()` or `if: failure()`
6. **Cache dependencies**: Speed up workflows
7. **Use matrix builds**: Test multiple configurations efficiently

### Example: Multi-platform Build

```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        include:
          - os: ubuntu-latest
            artifact-name: linux-build
          - os: windows-latest
            artifact-name: windows-build
          - os: macos-latest
            artifact-name: macos-build
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v6
      
      - name: Build
        run: |
          # Build commands
          
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.artifact-name }}
          path: dist/
```

## 🔄 Workflow Triggers

### Event Triggers

```yaml
on:
  # Push to specific branches
  push:
    branches: [ master, develop ]
    paths:
      - 'src/**'
      - '!src/test/**'
  
  # Pull requests
  pull_request:
    types: [opened, synchronize, reopened]
  
  # Scheduled runs (cron syntax)
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  
  # Manual trigger
  workflow_dispatch:
    inputs:
      param:
        description: 'Parameter'
        required: false
        default: 'value'
  
  # Workflow completion
  workflow_run:
    workflows: ["CI"]
    types: [completed]
```

### Path Filtering

Run workflows only when specific files change:

```yaml
on:
  push:
    paths:
      - 'src/**/*.cpp'
      - 'src/**/*.h'
      - 'test/**'
      - '.github/workflows/ci.yml'
```

Ignore specific paths:

```yaml
on:
  push:
    paths-ignore:
      - 'docs/**'
      - '**.md'
      - '.gitignore'
```

## 📊 Monitoring Workflows

### Viewing Workflow Runs

1. Go to the "Actions" tab in your repository
2. Select a workflow from the left sidebar
3. Click on a run to see details
4. View logs for each step

### Status Badges

Add workflow status badges to README.md:

```markdown
![CI](https://github.com/username/repo/actions/workflows/ci.yml/badge.svg)
```

### Notifications

Configure notifications for workflow failures:
- Repository Settings → Notifications
- Personal Settings → Notifications → Actions

## 🛠️ Debugging Workflows

### Enable Debug Logging

Set repository secrets:
- `ACTIONS_RUNNER_DEBUG`: `true` for runner debug logs
- `ACTIONS_STEP_DEBUG`: `true` for step debug logs

### Testing Locally

Use [act](https://github.com/nektos/act) to run workflows locally:

```bash
# Install act
brew install act  # macOS
# or: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run a workflow
act push

# Run specific job
act push -j job-name

# Dry run
act push -n
```

### Common Issues

**Issue**: Secrets not working
- **Solution**: Check secret names match exactly (case-sensitive)
- **Solution**: Ensure secrets are set at the correct level (repo/org)

**Issue**: Workflow doesn't trigger
- **Solution**: Check branch names and path filters
- **Solution**: Verify event type matches trigger conditions

**Issue**: Permission denied
- **Solution**: Add required permissions to workflow
- **Solution**: Check GITHUB_TOKEN permissions in repository settings

## 📝 Workflow Examples

### Example 1: Automated Testing

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v6
      
      - name: Setup
        run: |
          sudo apt-get update
          sudo apt-get install -y build-essential
      
      - name: Build
        run: make
      
      - name: Test
        run: make test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: success()
```

### Example 2: Scheduled Data Collection

```yaml
name: Data Collection

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

permissions:
  contents: write

jobs:
  collect:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v6
      
      - name: Fetch data
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          mkdir -p data
          curl -H "Authorization: Bearer ${API_KEY}" \
            https://api.example.com/data \
            -o data/latest.json
      
      - name: Commit data
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/
          git diff --staged --quiet || git commit -m "Update data [automated]"
          git push
```

### Example 3: Release Automation

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v6
      
      - name: Build
        run: make release
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/*
          draft: false
          prerelease: false
```

## 🔗 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Marketplace Actions](https://github.com/marketplace?type=actions)

## 📞 Getting Help

- Check workflow run logs in the Actions tab
- Review existing workflows in `.github/workflows/`
- Ask in discussions or issues
- Consult [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Remember**: Always test workflows thoroughly, especially those that modify repository content or interact with external services.
