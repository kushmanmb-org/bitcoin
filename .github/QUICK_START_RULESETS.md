# Quick Start Guide: Setting Up Branch Protection and Security Rulesets

This guide will help you quickly set up the branch protection and security rulesets for your Bitcoin Core repository.

## Prerequisites

- Repository admin access
- GitHub CLI (`gh`) installed (optional, but recommended)
- Basic understanding of Git and GitHub

## Step 1: Review the Rulesets

The repository includes the following pre-configured rulesets in `.github/rulesets/`:

1. **branch-protection-main.json** - Protects main/master branch
2. **branch-protection-release.json** - Protects release branches
3. **branch-protection-dev.json** - Protects development branches
4. **tag-protection.json** - Protects version tags
5. **security-checks.json** - Applies security checks to all branches

Review each file to understand the protection rules.

## Step 2: Customize for Your Repository

Before applying, customize the rulesets for your specific needs:

### A. Update Status Check Names

Edit each ruleset to match your CI/CD workflow job names:

```json
"required_status_checks": [
  {
    "context": "your-actual-workflow-name",
    "integration_id": null
  }
]
```

Find your workflow names by checking `.github/workflows/` or running:
```bash
gh api /repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/runs | \
  jq -r '.workflow_runs[0].check_suite_id'
```

### B. Configure Bypass Actors

Determine which users/teams need bypass permissions and get their IDs:

```bash
# Get organization teams
gh api /orgs/YOUR_ORG/teams

# Get team ID
gh api /orgs/YOUR_ORG/teams/TEAM_NAME | jq .id
```

Update the `bypass_actors` section with appropriate IDs and roles.

### C. Adjust Review Requirements

Based on your team size, adjust:
- `required_approving_review_count`: Number of required reviewers
- `require_code_owner_review`: Enable/disable CODEOWNERS requirement
- `dismiss_stale_reviews_on_push`: Auto-dismiss old reviews

## Step 3: Update CODEOWNERS

Edit `.github/CODEOWNERS` to reflect your team structure:

```
# Replace with actual GitHub usernames or teams
* @your-org/maintainers

/src/consensus/ @your-org/consensus-team
/src/wallet/ @your-org/wallet-team
```

## Step 4: Validate the Configuration

Run the validation script to ensure all rulesets are properly formatted:

```bash
python3 .github/validate-rulesets.py
```

Fix any issues reported before proceeding.

## Step 5: Apply Rulesets to Repository

### Option A: Using GitHub Web UI (Recommended for First-Time Setup)

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Rules** → **Rulesets**
3. Click **New ruleset** → **New branch ruleset**
4. Use the following settings based on each JSON file:

For **branch-protection-main.json**:
- Name: "Main Branch Protection"
- Enforcement status: Active
- Target branches: 
  - Add pattern: `main`
  - Add pattern: `master`
- Rules:
  - ✅ Require a pull request before merging
    - Required approvals: 2
    - Dismiss stale pull request approvals when new commits are pushed
    - Require review from Code Owners
    - Require approval of the most recent reviewable push
  - ✅ Require status checks to pass
    - Add your workflow check names
    - ✅ Require branches to be up to date before merging
  - ✅ Block force pushes
  - ✅ Require signed commits
  - ✅ Require linear history
  - (Continue for all rules in the JSON)

5. Save the ruleset
6. Repeat for other rulesets (release, dev, tag, security)

### Option B: Using GitHub API

```bash
# Set your repo details
OWNER="your-org"
REPO="bitcoin"

# Apply main branch protection
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO/rulesets \
  --input .github/rulesets/branch-protection-main.json

# Apply release branch protection
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO/rulesets \
  --input .github/rulesets/branch-protection-release.json

# Apply dev branch protection
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO/rulesets \
  --input .github/rulesets/branch-protection-dev.json

# Apply tag protection
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO/rulesets \
  --input .github/rulesets/tag-protection.json

# Apply security checks
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO/rulesets \
  --input .github/rulesets/security-checks.json
```

### Option C: Using a Script

Create a script to apply all rulesets:

```bash
#!/bin/bash
# apply-rulesets.sh

set -e

OWNER="${1:-your-org}"
REPO="${2:-bitcoin}"

echo "Applying rulesets to $OWNER/$REPO..."

for ruleset in .github/rulesets/*.json; do
  echo "Applying $(basename $ruleset)..."
  gh api --method POST \
    -H "Accept: application/vnd.github+json" \
    /repos/$OWNER/$REPO/rulesets \
    --input "$ruleset"
  echo "✅ Applied $(basename $ruleset)"
done

echo "All rulesets applied successfully!"
```

Make it executable and run:
```bash
chmod +x apply-rulesets.sh
./apply-rulesets.sh your-org bitcoin
```

## Step 6: Enable Security Features

Enable additional GitHub security features:

1. **Dependabot**
   - Go to Settings → Security → Dependabot
   - Enable Dependabot alerts
   - Enable Dependabot security updates

2. **Code Scanning**
   - The CodeQL workflow is already configured in `.github/workflows/codeql.yml`
   - Verify it's running on pull requests

3. **Secret Scanning**
   - Go to Settings → Security → Secret scanning
   - Enable secret scanning
   - Enable push protection

## Step 7: Set Up GPG Signing (Required)

Since rulesets require signed commits, ensure all contributors set up GPG signing:

1. **Generate GPG Key**:
   ```bash
   gpg --full-generate-key
   # Select RSA and RSA, 4096 bits, appropriate expiration
   ```

2. **Configure Git**:
   ```bash
   gpg --list-secret-keys --keyid-format=long
   # Note your key ID
   
   git config --global user.signingkey YOUR_KEY_ID
   git config --global commit.gpgsign true
   git config --global tag.gpgsign true
   ```

3. **Add to GitHub**:
   ```bash
   gpg --armor --export YOUR_KEY_ID | gh gpg-key add -
   # Or manually add in GitHub Settings → SSH and GPG keys
   ```

4. **Test Signing**:
   ```bash
   git commit --allow-empty -m "Test signed commit"
   git log --show-signature -1
   ```

## Step 8: Test the Configuration

Create a test pull request to verify the rulesets are working:

```bash
# Create a test branch
git checkout -b test-branch-protection

# Make a small change
echo "# Test" >> test-file.md
git add test-file.md
git commit -S -m "Test branch protection"

# Push and create PR
git push -u origin test-branch-protection
gh pr create --title "Test: Branch Protection" --body "Testing ruleset configuration"
```

Verify that:
- Pull request requires reviews
- Status checks are required
- Force push is blocked
- Commit signature is verified

## Step 9: Document and Communicate

1. **Update your CONTRIBUTING.md**:
   - Add section on branch protection policies
   - Link to SECURITY_MANAGEMENT.md
   - Include GPG signing requirements

2. **Notify the Team**:
   - Send announcement about new protection rules
   - Provide link to this Quick Start Guide
   - Schedule training if needed

3. **Create a Wiki Page** (optional):
   - Detailed workflow examples
   - Troubleshooting guide
   - FAQ section

## Step 10: Monitor and Adjust

After deployment:

1. **Monitor Compliance**:
   ```bash
   # Check ruleset bypass usage
   gh api /repos/$OWNER/$REPO/rulesets | jq '.[] | {name, enforcement}'
   ```

2. **Collect Feedback**:
   - Are rules too strict or too lenient?
   - Are status checks completing in reasonable time?
   - Do teams need additional bypass permissions?

3. **Iterate**:
   - Update rulesets based on feedback
   - Re-run validation script
   - Apply updates via API or UI

## Troubleshooting

### Issue: Status checks not found

**Solution**: Update the `context` names in rulesets to match your actual workflow job names. Check `.github/workflows/` for the correct names.

### Issue: Cannot push to protected branch

**Solution**: 
1. Verify your commits are signed: `git log --show-signature`
2. Ensure all required checks pass
3. Get required reviews before merging

### Issue: Bypass not working

**Solution**: Verify bypass actor IDs are correct. Repository roles:
- 1 = Admin
- 2 = Maintain
- 3 = Write
- 4 = Triage
- 5 = Read

### Issue: Ruleset conflicts

**Solution**: GitHub applies rulesets in order. More specific rules override general ones. Check for overlapping conditions.

## Additional Resources

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GPG Signing Guide](https://docs.github.com/en/authentication/managing-commit-signature-verification)
- [Security Management Guide](.github/SECURITY_MANAGEMENT.md)
- [Rulesets README](.github/rulesets/README.md)

## Getting Help

- Review documentation in `.github/rulesets/README.md`
- Check `.github/SECURITY_MANAGEMENT.md` for detailed guidance
- Open an issue for questions
- Contact repository maintainers

---

**Last Updated**: 2024  
**Version**: 1.0.0
