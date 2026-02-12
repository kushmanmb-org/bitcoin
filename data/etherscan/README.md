# Etherscan API v2 Data

This directory contains data fetched from Etherscan's API v2 by the automated GitHub Actions workflow.

## Overview

The Etherscan API v2 integration workflow automatically fetches blockchain data from Etherscan and commits it to this repository. This enables:

- Historical tracking of blockchain data
- Automated data collection
- Integration with CI/CD pipelines

## Workflow Configuration

The workflow is configured in `.github/workflows/etherscan-apiv2.yml` and includes:

- **Write Permissions**: The workflow has `contents: write` permission to commit data back to the repository
- **Schedule**: Runs daily at 00:00 UTC (can be adjusted)
- **Manual Trigger**: Can be manually triggered via workflow_dispatch
- **API Key**: Requires `ETHERSCAN_API_KEY` secret to be configured

## Setup Instructions

1. **Get an API Key**:
   - Sign up at [Etherscan.io](https://etherscan.io/)
   - Generate an API key from [My API Keys](https://etherscan.io/myapikey)

2. **Configure Repository Secret**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add a new repository secret named `ETHERSCAN_API_KEY`
   - Paste your Etherscan API key as the value

3. **Run the Workflow**:
   - Navigate to Actions tab
   - Select "Etherscan API v2 Integration" workflow
   - Click "Run workflow"

## Files

- `latest.json` - Most recent data fetch
- `data-YYYY-MM-DD-HH-MM-SS.json` - Historical data snapshots

## Permissions

The workflow requires the following GitHub Actions permissions:
- `contents: write` - To commit data files to the repository
- `pull-requests: write` - To create/update PRs if needed
- `issues: write` - To create issues for failures

## API Documentation

For more information about Etherscan's API v2, visit:
- [Etherscan API Documentation](https://docs.etherscan.io/)

## Notes

- Data is automatically committed with descriptive commit messages
- Historical data files are retained with timestamps
- Workflow artifacts are available for 30 days after each run
- Failed runs will not commit partial/invalid data
