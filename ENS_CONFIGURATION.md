# kushmanmb.eth ENS Configuration

## Overview

This document describes the Ethereum Name Service (ENS) integration for the **kushmanmb.eth** domain within the Bitcoin Core project repository.

## ENS Domain Information

- **ENS Name**: kushmanmb.eth
- **Purpose**: Identity and blockchain integration for the kushmanmb.org Bitcoin Core project
- **Network**: Ethereum Mainnet

## ENS Resolution

The kushmanmb.eth ENS name resolves to an Ethereum address that can be queried using various Ethereum APIs, including Etherscan.

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
# Using Etherscan V2 API with eth_call (as specified in problem statement)
curl "https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_call&to=0xAEEF46DB4855E25702F8237E8f403FddcaF931C0&data=0x70a08231000000000000000000000000e16359506c028e51f16be38986ec5746251e9724&tag=latest&apikey=YourApiKeyToken"
```

#### 3. Via ENS Registry Contract

```bash
# ENS Registry (Mainnet): 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
# ENS Public Resolver: 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
```

## Integration with Workflows

The kushmanmb.eth ENS name is integrated into GitHub Actions workflows for:

1. **Etherscan API Integration** (`.github/workflows/etherscan-apiv2.yml`)
   - Queries blockchain data associated with kushmanmb.eth
   - Resolves ENS name to Ethereum address
   - Fetches account balance, transactions, and contract data

2. **Website Deployment** (`.github/workflows/deploy-website.yml`)
   - Uses kushmanmb.eth as the primary identity marker
   - Links website to blockchain identity

## Configuration

### Setting the Resolved Address

**IMPORTANT**: Before using the Etherscan API workflow, you must update the Ethereum address for kushmanmb.eth.

The workflow contains a placeholder zero address that will cause it to fail with a clear error message until updated.

**Steps to configure**:

1. **Find the resolved address** using one of these methods:

   **Method A: ENS App**
   ```
   Visit: https://app.ens.domains/kushmanmb.eth
   Copy the ETH address shown
   ```

   **Method B: Etherscan**
   ```
   Visit: https://etherscan.io/enslookup-search?search=kushmanmb.eth
   Copy the resolved address
   ```

   **Method C: Command Line** (requires Foundry)
   ```bash
   cast resolve-name kushmanmb.eth
   ```

2. **Update the workflow file**:

   Edit `.github/workflows/etherscan-apiv2.yml` and replace the zero address:

   ```yaml
   # Change from:
   KUSHMANMB_ADDRESS="0x0000000000000000000000000000000000000000"
   
   # To your actual address:
   KUSHMANMB_ADDRESS="0xYourActualAddressHere"
   ```

3. **Commit and push** the change:

   ```bash
   git add .github/workflows/etherscan-apiv2.yml
   git commit -m "Configure kushmanmb.eth resolved address"
   git push
   ```

4. **Test the workflow**:
   - Go to Actions tab
   - Run "Etherscan API Integration (kushmanmb.eth)" workflow
   - Verify it completes successfully

**Validation**: The workflow includes automatic validation that will fail with a helpful error message if the zero address is detected, preventing accidental use of invalid configuration.

### API Keys

To query Etherscan API for kushmanmb.eth data:

1. Get an API key from https://etherscan.io/myapikey
2. Add it as a repository secret:
   - Go to repository Settings → Secrets and variables → Actions
   - Create a new secret named `ETHERSCAN_API_KEY`
   - Paste your API key

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

ENS supports various record types:

- **ETH Address**: Primary Ethereum address
- **BTC Address**: Bitcoin address (if set)
- **Email**: Contact email (if set)
- **URL**: Website URL (e.g., https://kushmanmb.org)
- **Avatar**: Profile image
- **Description**: Text description
- **Keywords**: Searchable tags

### Setting Records

Records can be set via:
- ENS Manager App: https://app.ens.domains/
- ENS contracts directly via Web3
- ENS management libraries (ethers.js, web3.js)

## Verification

### Verify ENS Resolution

```bash
# Check current resolution (requires API key)
curl "https://api.etherscan.io/api?module=account&action=balance&address=RESOLVED_ADDRESS&tag=latest&apikey=YOUR_API_KEY"
```

### Verify ENS Records

```javascript
// Using ethers.js
const resolver = await provider.getResolver('kushmanmb.eth');
const address = await resolver.getAddress();
const url = await resolver.getText('url');
const email = await resolver.getText('email');
console.log({ address, url, email });
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

If the Ethereum address for kushmanmb.eth changes:

1. Update ENS records via ENS Manager
2. Update workflow configuration:
   ```bash
   # Edit .github/workflows/etherscan-apiv2.yml
   # Update KUSHMANMB_ADDRESS variable
   ```
3. Test the workflow to verify new address works
4. Commit and push changes

## Troubleshooting

### ENS Not Resolving

```bash
# Check if ENS name is registered
curl "https://api.etherscan.io/api?module=ens&action=lookup&name=kushmanmb.eth"

# Verify resolver is set
# Check on https://app.ens.domains/kushmanmb.eth
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

**ENS Name**: kushmanmb.eth  
**Last Updated**: 2026-02-14  
**Maintainer**: kushmanmb.org team  
**Version**: 1.0.0
