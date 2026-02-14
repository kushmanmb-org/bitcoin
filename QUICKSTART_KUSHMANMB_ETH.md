# Quick Start: kushmanmb.eth Integration

This guide provides quick instructions for using the kushmanmb.eth ENS integration in this repository.

## Using the Etherscan API Workflow

### Prerequisites

1. **Add Etherscan API Key** (Required)
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `ETHERSCAN_API_KEY`
   - Value: Your Etherscan API key from https://etherscan.io/myapikey

### Running the Workflow

1. **Go to Actions tab** in GitHub
2. **Select "Etherscan API Integration (kushmanmb.eth)"** workflow
3. **Click "Run workflow"**
4. **Choose options**:
   - **API endpoint**: Select what data to fetch
     - `account` - Get account balance for kushmanmb.eth
     - `transaction` - Get transaction history
     - `contract` - Get contract ABI (if applicable)
     - `ens_resolve` - Resolve ENS name via eth_call
   - **ENS name**: Keep default `kushmanmb.eth` or enter another ENS name
5. **Click "Run workflow"** green button

### What the Workflow Does

The workflow will:
1. Resolve the ENS name (if possible)
2. Query Etherscan API for the requested data
3. Save results to `data/etherscan/latest.json`
4. Create an archive with timestamp: `data/etherscan/data-YYYY-MM-DD-HH-MM-SS.json`
5. Commit and push the data files back to the repository
6. Generate a summary in the workflow run

### Example: Fetching Account Balance

The curl command from the problem statement is now integrated:

```bash
# This is automatically executed in the workflow:
curl "https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_call&to=0xAEEF46DB4855E25702F8237E8f403FddcaF931C0&data=0x70a08231000000000000000000000000e16359506c028e51f16be38986ec5746251e9724&tag=latest&apikey=<YOUR_KEY>"
```

## Using Self-Hosted Runners

### Quick Setup (Linux)

```bash
# 1. Download runner
mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf actions-runner-linux-x64.tar.gz

# 2. Configure runner (get token from GitHub repo settings)
./config.sh --url https://github.com/kushmanmb-org/bitcoin --token YOUR_TOKEN \
  --name "kushmanmb-runner" --labels "self-hosted,linux,X64,secure"

# 3. Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

### Testing Self-Hosted Runner

1. Go to Actions tab
2. Select "Self-Hosted Runner Configuration" workflow
3. Click "Run workflow"
4. Choose your OS (linux/macos/windows/all)
5. Run and verify in the logs

## Configuring kushmanmb.eth Address

**⚠️ REQUIRED BEFORE FIRST USE**: The workflow contains a placeholder address that must be updated.

To update the Ethereum address that kushmanmb.eth resolves to:

1. **Edit the workflow file**: `.github/workflows/etherscan-apiv2.yml`
2. **Find the variable**: `KUSHMANMB_ADDRESS` (around line 90-100)
3. **Update with resolved address**:
   ```yaml
   KUSHMANMB_ADDRESS="0xYourActualAddress"  # Replace zero address
   ```
4. **Commit and push** the change

**Why this is required**: The workflow includes validation that prevents using the zero address placeholder. This ensures you don't accidentally query invalid data.

### How to Get the Resolved Address

**Option 1: Via ENS App**
- Visit https://app.ens.domains/kushmanmb.eth
- Copy the ETH address shown

**Option 2: Via Etherscan**
- Visit https://etherscan.io/enslookup-search?search=kushmanmb.eth
- Copy the resolved address

**Option 3: Via Command Line**
```bash
# Using cast (from Foundry)
cast resolve-name kushmanmb.eth

# Using ethers-cli
ethers-ens resolve kushmanmb.eth
```

## Scheduled Runs

The Etherscan API workflow runs automatically:
- **Daily at 00:00 UTC** (midnight)
- Fetches latest data for kushmanmb.eth
- Results are committed to `data/etherscan/` directory

## Viewing Results

### In GitHub

1. Go to repository
2. Navigate to `data/etherscan/` folder
3. View `latest.json` for most recent data
4. View timestamped files for historical data

### Via API

```bash
# Get latest data
curl https://raw.githubusercontent.com/kushmanmb-org/bitcoin/master/data/etherscan/latest.json
```

### In Workflow Summary

After each run:
1. Go to Actions → Select the workflow run
2. Scroll to bottom for "Summary"
3. View the data preview and status

## Common Use Cases

### 1. Check kushmanmb.eth Balance Daily
- Let the scheduled workflow run automatically
- Check `data/etherscan/latest.json` for balance updates

### 2. Manual Balance Check
- Run workflow with `account` endpoint
- View results immediately in workflow summary

### 3. Track Transactions
- Run workflow with `transaction` endpoint
- View transaction list in results

### 4. Resolve ENS to Address
- Run workflow with `ens_resolve` endpoint
- Get the current resolved address

## Troubleshooting

### "API key not configured" Error

**Solution**: Add `ETHERSCAN_API_KEY` secret
1. Go to Settings → Secrets and variables → Actions
2. Add new secret with your API key

### Workflow Fails with API Error

**Solution**: Check API key validity
- Visit https://etherscan.io/myapikey
- Verify key is active
- Check rate limits

### ENS Name Not Resolving

**Solution**: Verify ENS registration
- Visit https://app.ens.domains/kushmanmb.eth
- Check if name is registered and has resolver set
- Update `KUSHMANMB_ADDRESS` in workflow if needed

### Self-Hosted Runner Not Connecting

**Solution**: Check runner service
```bash
# Linux/macOS
sudo systemctl status actions.runner.*.service

# Windows
.\svc.cmd status
```

## Security Reminders

✅ **DO**:
- Use GitHub Secrets for API keys
- Review workflow logs for errors only
- Keep runner software updated
- Monitor runner resource usage

❌ **DON'T**:
- Commit API keys to repository
- Log sensitive data in workflows
- Run runners as root/Administrator
- Share runner registration tokens

## Next Steps

1. **Read Full Documentation**:
   - [ENS_CONFIGURATION.md](ENS_CONFIGURATION.md) - Complete ENS guide
   - [SELF_HOSTED_RUNNER_SETUP.md](SELF_HOSTED_RUNNER_SETUP.md) - Runner setup guide
   - [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) - Security best practices

2. **Configure Your Setup**:
   - Add Etherscan API key
   - Set up self-hosted runner (optional)
   - Update kushmanmb.eth resolved address

3. **Test the Integration**:
   - Run Etherscan API workflow manually
   - Verify results in data/etherscan/
   - Check workflow summaries

## Support

- **ENS Issues**: https://docs.ens.domains/
- **Etherscan API**: https://docs.etherscan.io/
- **GitHub Actions**: https://docs.github.com/actions
- **Repository Issues**: Open an issue in this repository

---

**Quick Reference**:
- ENS Name: **kushmanmb.eth**
- Workflow: `.github/workflows/etherscan-apiv2.yml`
- Data Directory: `data/etherscan/`
- Required Secret: `ETHERSCAN_API_KEY`
