# Etherscan API Data for kushmanmb.eth

This directory contains data fetched from the Etherscan API related to the kushmanmb.eth ENS domain.

## Contents

- `latest.json` - Most recent API query result
- `data-YYYY-MM-DD-HH-MM-SS.json` - Historical archived data with timestamps
- `ens-resolution.json` - ENS name resolution data

## Data Structure

### latest.json

```json
{
  "status": "1",
  "message": "OK",
  "result": "...",
  "timestamp": "2026-02-14T14:59:00Z",
  "ens_name": "kushmanmb.eth",
  "endpoint": "account"
}
```

### Fields

- **status**: API response status (1 = success, 0 = failure)
- **message**: Response message or error description
- **result**: Actual data from Etherscan (varies by endpoint)
- **timestamp**: When the data was fetched (ISO 8601 UTC)
- **ens_name**: The ENS name queried
- **endpoint**: Which API endpoint was used

## Automated Updates

This data is automatically updated by the GitHub Actions workflow:
- **Workflow**: `.github/workflows/etherscan-apiv2.yml`
- **Schedule**: Daily at 00:00 UTC
- **Trigger**: Can also be manually triggered

## Privacy and Security

### What's Safe to Commit

✅ Public blockchain data (balances, transactions, etc.)
✅ ENS resolution results (publicly available)
✅ API response metadata

### What Should NEVER Be Committed

❌ API keys or tokens
❌ Private keys
❌ Sensitive personal information

All sensitive data is managed via GitHub Secrets, not stored in this repository.

## Querying the Data

### In GitHub

Navigate to this directory in the repository to view files directly.

### Via Raw URL

```bash
# Get latest data
curl https://raw.githubusercontent.com/kushmanmb-org/bitcoin/master/data/etherscan/latest.json

# Get specific archived data
curl https://raw.githubusercontent.com/kushmanmb-org/bitcoin/master/data/etherscan/data-2026-02-14-00-00-00.json
```

### Via GitHub API

```bash
# Using GitHub API with authentication
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/kushmanmb-org/bitcoin/contents/data/etherscan/latest.json
```

## Using the Data

### Parse with jq

```bash
# Get ENS name
cat latest.json | jq -r '.ens_name'

# Get timestamp
cat latest.json | jq -r '.timestamp'

# Get result data
cat latest.json | jq '.result'
```

### In Python

```python
import json

with open('latest.json', 'r') as f:
    data = json.load(f)
    
print(f"ENS Name: {data['ens_name']}")
print(f"Timestamp: {data['timestamp']}")
print(f"Result: {data['result']}")
```

### In JavaScript/Node.js

```javascript
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('latest.json', 'utf8'));

console.log(`ENS Name: ${data.ens_name}`);
console.log(`Timestamp: ${data.timestamp}`);
console.log(`Result: ${data.result}`);
```

## Historical Data

Archived data files follow the naming pattern:
```
data-YYYY-MM-DD-HH-MM-SS.json
```

These files are kept for historical reference and trend analysis.

### Retention Policy

- Keep last 30 days of daily snapshots
- Monthly archives for historical reference
- Older data may be cleaned up to save space

## Troubleshooting

### Missing Files

If `latest.json` is missing, the workflow may not have run yet:
1. Check Actions tab for workflow runs
2. Manually trigger the workflow if needed
3. Verify `ETHERSCAN_API_KEY` secret is configured

### Invalid Data

If data appears invalid:
1. Check workflow logs for errors
2. Verify Etherscan API is accessible
3. Check API key validity and rate limits

### Stale Data

If data is outdated:
1. Check scheduled workflow is enabled
2. Manually trigger workflow to update immediately
3. Verify workflow has write permissions to repository

## Related Documentation

- [QUICKSTART_KUSHMANMB_ETH.md](../../QUICKSTART_KUSHMANMB_ETH.md) - Quick start guide
- [ENS_CONFIGURATION.md](../../ENS_CONFIGURATION.md) - Complete ENS configuration
- [.github/workflows/etherscan-apiv2.yml](../../.github/workflows/etherscan-apiv2.yml) - Workflow definition

## Support

For issues with this data:
1. Check workflow runs in Actions tab
2. Review Etherscan API documentation: https://docs.etherscan.io/
3. Open an issue in this repository

---

**Last Updated**: 2026-02-14  
**Data Source**: Etherscan API (https://etherscan.io/)  
**ENS Domain**: kushmanmb.eth

