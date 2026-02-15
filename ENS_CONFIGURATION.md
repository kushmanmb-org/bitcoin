# ENS Configuration for kushmanmb-org/bitcoin

## Overview

This document describes the Ethereum Name Service (ENS) integration for multiple ENS domains within the Bitcoin Core project repository.

## ENS Domain Information

### Primary ENS Identities

- **ENS Name**: kushmanmb.eth
  - **Network**: Ethereum Mainnet
  - **Purpose**: Primary identity for the kushmanmb.org Bitcoin Core project
  - **Status**: Active

- **ENS Name**: kushmanmb.base.eth
  - **Network**: Base L2 (Ethereum Layer 2)
  - **Purpose**: Layer 2 identity for Base network integration
  - **Status**: Active

- **ENS Name**: Yaketh.eth
  - **Network**: Ethereum Mainnet
  - **Purpose**: Secondary identity and collaboration
  - **Status**: Active

### Associated Email Addresses

- **Kushmanmb@gmx.com** - Primary contact email
- **mattbrace92@gmail.com** - Secondary contact email

These identities are consolidated in the repository's `.mailmap` file for consistent git attribution.

## ENS Resolution

All ENS names (kushmanmb.eth, kushmanmb.base.eth, Yaketh.eth) resolve to Ethereum addresses that can be queried using various Ethereum APIs, including Etherscan.

### Network-Specific Resolution

- **kushmanmb.eth** and **Yaketh.eth**: Resolve on Ethereum Mainnet (Chain ID: 1)
- **kushmanmb.base.eth**: Resolves on Base L2 network (Chain ID: 8453)

### Resolution Methods

#### 1. Via Web3 Provider

```javascript
// Using ethers.js
const provider = new ethers.providers.InfuraProvider('mainnet');
const address = await provider.resolveName('kushmanmb.eth');
console.log('kushmanmb.eth resolves to:', address);
```

#### 2. Via Etherscan API

```bash
# Ethereum Mainnet - kushmanmb.eth
curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=getaddress&name=kushmanmb.eth&apikey=YourApiKeyToken"

# Ethereum Mainnet - Yaketh.eth
curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=getaddress&name=Yaketh.eth&apikey=YourApiKeyToken"

# Base L2 - kushmanmb.base.eth
curl "https://api.basescan.org/api?module=ens&action=getaddress&name=kushmanmb.base.eth&apikey=YourBaseScanApiKey"
```

#### 3. Via ENS Registry Contract

```bash
# ENS Registry (Mainnet): 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
# ENS Public Resolver: 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
```

## Integration with Workflows

The ENS names are integrated into GitHub Actions workflows for:

1. **Etherscan API Integration** (`.github/workflows/etherscan-apiv2.yml`)
   - Queries blockchain data associated with kushmanmb.eth
   - Resolves ENS name to Ethereum address
   - Fetches account balance, transactions, and contract data

2. **Website Deployment** (`.github/workflows/deploy-website.yml`)
   - Uses kushmanmb.eth as the primary identity marker
   - Links website to blockchain identity

3. **CodeQL Analysis** (`.github/workflows/Kushmanmb.eth`)
   - Includes ownership metadata for all ENS identities
   - Documents repository creator and primary contacts

### Multi-Identity Management

All workflows recognize the following identities as authorized contributors:
- kushmanmb.eth (Primary)
- kushmanmb.base.eth (Base L2)
- Yaketh.eth (Secondary)
- Kushmanmb@gmx.com (Primary email)
- mattbrace92@gmail.com (Secondary email)

## Configuration

### Automatic ENS Resolution

**NEW**: The Etherscan API workflow now automatically resolves ENS names to their Ethereum addresses!

No manual configuration is required. The workflow uses Etherscan's ENS lookup API to dynamically resolve the ENS name each time it runs.

**How it works**:

1. **Automatic Resolution**: When the workflow runs, it automatically calls Etherscan's ENS API V2:
   ```bash
   # Primary identity (kushmanmb.eth)
   curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=getaddress&name=kushmanmb.eth&apikey=YOUR_KEY"
   
   # Secondary identity (Yaketh.eth)
   curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=getaddress&name=Yaketh.eth&apikey=YOUR_KEY"
   
   # Base L2 identity (kushmanmb.base.eth)
   curl "https://api.basescan.org/api?module=ens&action=getaddress&name=kushmanmb.base.eth&apikey=YOUR_BASE_KEY"
   ```

2. **Dynamic Address**: The resolved address is stored in the `RESOLVED_ADDRESS` environment variable and used for all subsequent API calls.

3. **Error Handling**: If resolution fails, the workflow provides clear error messages explaining potential causes:
   - ENS name not registered
   - No address record set
   - API connectivity issues

**Prerequisites**:

API keys required for full multi-identity support:
1. **Etherscan API Key** (for kushmanmb.eth and Yaketh.eth):
   - Get an API key from https://etherscan.io/myapikey
   - Add it as a repository secret named `ETHERSCAN_API_KEY`

2. **BaseScan API Key** (for kushmanmb.base.eth):
   - Get an API key from https://basescan.org/myapikey
   - Add it as a repository secret named `BASESCAN_API_KEY`

**Testing the workflow**:
- Go to Actions tab
- Run "Etherscan API Integration (kushmanmb.eth)" workflow
- The workflow will automatically resolve and use the current ENS address

**Verification**: You can verify the resolved address in the workflow output logs and in the resulting JSON file under the `resolved_address` field.

### API Keys

To query blockchain APIs for all ENS identities:

1. **Etherscan API** (for kushmanmb.eth and Yaketh.eth):
   - Get an API key from https://etherscan.io/myapikey
   - Add it as a repository secret named `ETHERSCAN_API_KEY`

2. **BaseScan API** (for kushmanmb.base.eth):
   - Get an API key from https://basescan.org/myapikey
   - Add it as a repository secret named `BASESCAN_API_KEY`

3. **Adding secrets**:
   - Go to repository Settings → Secrets and variables → Actions
   - Create new secrets with the appropriate names
   - Paste your API keys

## Privacy Considerations

### Public Data

ENS names and their resolved addresses are public on the Ethereum blockchain. The following information is publicly visible:

- ENS name (kushmanmb.eth)
- Resolved Ethereum address
- Transaction history of the resolved address
- Token balances
- Contract interactions

### Best Practices

1. **Separate Addresses for Different Purposes**
   - Use different addresses for testing, development, and production
   - Consider using separate addresses for different types of transactions

2. **Monitor ENS Records**
   - Regularly verify ENS records haven't been modified
   - Set up alerts for changes to ENS configuration

3. **Secure ENS Management**
   - Protect private keys associated with ENS controller address
   - Use hardware wallets for ENS management
   - Enable multi-signature if managing valuable assets

4. **API Key Security**
   - Never commit Etherscan API keys to the repository
   - Use GitHub Secrets for all API keys
   - Rotate API keys regularly

## ENS Records and Configuration

### Standard Records

ENS supports various record types for all identities:

- **ETH Address**: Primary Ethereum address
- **BTC Address**: Bitcoin address (if set)
- **Email**: Contact email
  - kushmanmb.eth: Kushmanmb@gmx.com
  - Yaketh.eth: Associated with kushmanmb identity
- **URL**: Website URL (e.g., https://kushmanmb.org)
- **Avatar**: Profile image
- **Description**: Text description
- **Keywords**: Searchable tags

### Identity Consolidation

The `.mailmap` file in the repository root consolidates all git identities:
- Maps all ENS addresses to a canonical identity
- Consolidates email addresses
- Ensures consistent git history attribution
- Follows git best practices for multi-identity management

### Setting Records

Records can be set via:
- ENS Manager App: https://app.ens.domains/
- ENS contracts directly via Web3
- ENS management libraries (ethers.js, web3.js)

## Verification

### Verify ENS Resolution

```bash
# Check kushmanmb.eth resolution
curl "https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=RESOLVED_ADDRESS&tag=latest&apikey=YOUR_API_KEY"

# Check Yaketh.eth resolution
curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=getaddress&name=Yaketh.eth&apikey=YOUR_API_KEY"

# Check kushmanmb.base.eth resolution
curl "https://api.basescan.org/api?module=ens&action=getaddress&name=kushmanmb.base.eth&apikey=YOUR_BASE_KEY"
```

### Verify ENS Records

```javascript
// Using ethers.js for all identities
const identities = ['kushmanmb.eth', 'Yaketh.eth'];

for (const ens of identities) {
  const resolver = await provider.getResolver(ens);
  const address = await resolver.getAddress();
  const url = await resolver.getText('url');
  const email = await resolver.getText('email');
  console.log(`${ens}:`, { address, url, email });
}

// For Base L2
const baseProvider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
const baseResolver = await baseProvider.getResolver('kushmanmb.base.eth');
const baseAddress = await baseResolver.getAddress();
console.log('kushmanmb.base.eth:', { address: baseAddress });
```

## Maintenance

### Regular Checks

- **Monthly**: Verify ENS records are correct
- **Quarterly**: Review and rotate API keys
- **Annual**: Review ENS configuration and update as needed

### ENS Renewal

ENS names must be renewed periodically:
- Check expiration date: https://app.ens.domains/kushmanmb.eth
- Renew before expiration to prevent loss of the name
- Consider setting up auto-renewal

### Updating Resolved Address

The workflow automatically resolves ENS names each time it runs, so no manual updates are needed when the Ethereum address for kushmanmb.eth changes.

**How address updates are handled**:

1. **Automatic Detection**: Each workflow run queries the current ENS record
2. **Always Current**: The workflow always uses the latest resolved address
3. **No Configuration**: No workflow file edits needed

**Monitoring changes**:

To track when the resolved address changes:
- Check the `resolved_address` field in `data/etherscan/latest.json`
- Compare historical data files in `data/etherscan/data-YYYY-MM-DD-HH-MM-SS.json`
- Review workflow logs for the resolved address

**Manual override** (optional):

If you need to query a specific address instead of using ENS resolution, you can:
1. Fork the workflow
2. Modify the resolution step to use a hardcoded address
3. This is not recommended as it defeats the purpose of ENS

## Troubleshooting

### ENS Not Resolving

```bash
# Check if ENS names are registered (using V2 API)
curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=lookup&name=kushmanmb.eth"
curl "https://api.etherscan.io/v2/api?chainid=1&module=ens&action=lookup&name=Yaketh.eth"

# Check Base L2 registration
curl "https://api.basescan.org/api?module=ens&action=lookup&name=kushmanmb.base.eth"

# Verify resolver is set
# Check on https://app.ens.domains/kushmanmb.eth
# Check on https://app.ens.domains/Yaketh.eth
# Check on Base ENS manager for kushmanmb.base.eth
```

### API Errors

- **Error 1001**: Invalid API key - check `ETHERSCAN_API_KEY` secret
- **Error 1002**: Rate limit exceeded - upgrade API plan or add delays
- **Error 1005**: Gas estimation failed - check if address is valid contract

### Workflow Failures

Check workflow logs:
```bash
# View in GitHub Actions tab or via GitHub CLI
gh run list --workflow=etherscan-apiv2.yml
gh run view <run-id> --log
```

## Resources

- **ENS Documentation**: https://docs.ens.domains/
- **ENS Manager**: https://app.ens.domains/
- **Etherscan API Documentation**: https://docs.etherscan.io/
- **Ethers.js ENS Guide**: https://docs.ethers.org/v5/api/providers/provider/#Provider-ens
- **OpenZeppelin ENS Guide**: https://docs.openzeppelin.com/contracts/4.x/api/token/ens

## Support

For issues related to:
- **ENS Domain**: Contact ENS support or community forums
- **Etherscan API**: Visit https://etherscan.io/contactus
- **Workflow Configuration**: Open an issue in this repository

---

**Primary ENS**: kushmanmb.eth  
**Base L2 ENS**: kushmanmb.base.eth  
**Secondary ENS**: Yaketh.eth  
**Primary Email**: Kushmanmb@gmx.com  
**Secondary Email**: mattbrace92@gmail.com  
**Last Updated**: 2026-02-15  
**Maintainer**: kushmanmb.org team  
**Version**: 2.0.0
