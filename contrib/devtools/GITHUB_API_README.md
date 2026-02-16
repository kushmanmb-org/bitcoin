# GitHub API Integration

This directory contains tools for interacting with the GitHub API, supporting OAuth access tokens and Personal Access Tokens (PAT) for programmatic access to GitHub resources.

## Overview

The GitHub API integration provides:
- OAuth access token authentication
- Personal Access Token (PAT) support
- Bearer token authorization header handling
- Multiple HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Secure credential management via environment variables
- Rate limit tracking and display

## Files

- `fetch-github-api.js` - Node.js implementation with OAuth token support
- `fetch-github-api.sh` - Shell wrapper for the Node.js script
- `test-github-api.js` - Test suite for GitHub API functionality (if available)

## Prerequisites

- Node.js (v14 or later recommended)
- GitHub OAuth token or Personal Access Token

## Authentication

### OAuth Access Token

GitHub OAuth tokens are obtained through the OAuth flow and have the format:
```json
{
  "access_token": "gho_16C7e42F292c6912E7710c838347Ae178B4a",
  "token_type": "bearer",
  "scope": "repo,gist"
}
```

The `access_token` value is used for API authentication.

### Token Types

GitHub supports several token prefixes:
- `gho_*` - OAuth access tokens
- `ghp_*` - Personal Access Tokens (PAT)
- `ghs_*` - Server-to-server tokens
- `ghu_*` - User-to-server tokens
- `ghr_*` - Refresh tokens

## Getting Started

### 1. Obtain a GitHub Token

**Option A: Personal Access Token (Recommended for Scripts)**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select required scopes (e.g., `repo`, `gist`, `read:user`)
4. Generate and copy the token

**Option B: OAuth Access Token (for Applications)**
1. Create a GitHub OAuth App in your account settings
2. Implement the OAuth flow to obtain an access token
3. Use the returned `access_token` for API requests

### 2. Set Environment Variables

```bash
export GITHUB_TOKEN="gho_16C7e42F292c6912E7710c838347Ae178B4a"
export REQUEST_METHOD="GET"
export REQUEST_PATH="/user"
export REQUEST_HOST="api.github.com"  # Optional, defaults to api.github.com
```

### 3. Make API Requests

#### Using Node.js Script Directly

```bash
node contrib/devtools/fetch-github-api.js
```

#### Using Shell Wrapper

```bash
./contrib/devtools/fetch-github-api.sh
```

#### Using Command Line Arguments

```bash
node contrib/devtools/fetch-github-api.js \
  --token "gho_xxxxx" \
  --method GET \
  --path "/user"
```

## Usage Examples

### Get Authenticated User Information

```bash
export GITHUB_TOKEN="gho_xxxxx"
export REQUEST_PATH="/user"
node contrib/devtools/fetch-github-api.js
```

### List User Repositories

```bash
export REQUEST_PATH="/user/repos"
node contrib/devtools/fetch-github-api.js
```

### Get Repository Information

```bash
export REQUEST_PATH="/repos/bitcoin/bitcoin"
node contrib/devtools/fetch-github-api.js
```

### Create an Issue (POST Request)

```bash
export REQUEST_METHOD="POST"
export REQUEST_PATH="/repos/owner/repo/issues"
export REQUEST_BODY='{"title":"Bug Report","body":"Description of the bug"}'
node contrib/devtools/fetch-github-api.js
```

### List Pull Requests

```bash
export REQUEST_PATH="/repos/bitcoin/bitcoin/pulls"
node contrib/devtools/fetch-github-api.js
```

### Get Rate Limit Status

```bash
export REQUEST_PATH="/rate_limit"
node contrib/devtools/fetch-github-api.js
```

## API Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | Yes | - | GitHub OAuth token or Personal Access Token |
| `REQUEST_METHOD` | No | `GET` | HTTP method (GET, POST, PUT, PATCH, DELETE) |
| `REQUEST_PATH` | Yes | - | API endpoint path (e.g., `/user`, `/repos/owner/repo`) |
| `REQUEST_HOST` | No | `api.github.com` | API hostname |
| `REQUEST_BODY` | No | - | Request body for POST/PUT/PATCH (JSON string) |

### Command Line Arguments

| Argument | Description |
|----------|-------------|
| `--token <token>` | GitHub OAuth or Personal Access Token |
| `--method <method>` | HTTP method |
| `--path <path>` | API endpoint path |
| `--host <host>` | API hostname |
| `--body <json>` | Request body (JSON string) |
| `--help`, `-h` | Display help information |

## Response Format

The script displays:
1. Request details (method, host, path)
2. HTTP status code
3. Response headers
4. Response body (formatted JSON)
5. Rate limit information (limit, remaining, reset time)

Example output:
```
=== GitHub API Response ===
Status: 200

Headers:
{
  "content-type": "application/json; charset=utf-8",
  "x-ratelimit-limit": "5000",
  "x-ratelimit-remaining": "4999",
  ...
}

Body:
{
  "login": "username",
  "id": 12345,
  "type": "User",
  ...
}

=========================

Rate Limit Information:
  Limit: 5000
  Remaining: 4999
  Reset: 2026-02-16T07:00:00.000Z
```

## Rate Limits

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated requests**: 60 requests per hour

The script automatically displays rate limit information in the response.

## Security Best Practices

1. **Never commit tokens to version control**
   - Use environment variables for credentials
   - Add token files to `.gitignore`

2. **Use minimum required scopes**
   - Only request scopes necessary for your use case
   - Review token permissions regularly

3. **Rotate tokens periodically**
   - Generate new tokens and revoke old ones
   - Use expiration dates when available

4. **Store tokens securely**
   - Use encrypted storage or secret managers
   - Avoid hardcoding tokens in scripts

5. **Monitor token usage**
   - Check rate limit headers
   - Review access logs in GitHub settings

## Troubleshooting

### Error: GITHUB_TOKEN is required
- Ensure the `GITHUB_TOKEN` environment variable is set
- Verify the token is not empty or malformed

### Error: 401 Unauthorized
- Check that your token is valid and not expired
- Verify the token has required scopes for the endpoint
- Ensure the token format is correct (gho_*, ghp_*, etc.)

### Error: 403 Forbidden
- You may have exceeded the rate limit
- The token may lack necessary permissions
- Some endpoints require specific scopes

### Error: 404 Not Found
- Verify the API endpoint path is correct
- Check if the resource exists
- Ensure you have access to the resource

## Additional Resources

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub Authentication](https://docs.github.com/en/rest/authentication)
- [OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## Related Tools

- `fetch-cdp-api.js` - Coinbase Developer Platform API client
- `fetch-erc20-events.js` - Etherscan API client for ERC20 events

## License

Copyright (c) 2026 The Bitcoin Core developers
Distributed under the MIT software license.
