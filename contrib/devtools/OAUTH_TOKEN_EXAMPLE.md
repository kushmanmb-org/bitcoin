# GitHub OAuth Token Response Example

This file demonstrates the OAuth token response format used by GitHub's OAuth flow.

## OAuth Token Response Format

When using GitHub OAuth authentication flow, the token response follows this standardized format:

### Response Headers
```
Accept: application/json
Content-Type: application/json
```

### Response Body
```json
{
  "access_token": "gho_16C7e42F292c6912E7710c838347Ae178B4a",
  "token_type": "bearer",
  "scope": "repo,gist"
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | The OAuth access token (prefix: gho_) |
| `token_type` | string | Token type, always "bearer" for OAuth |
| `scope` | string | Comma-separated list of authorized scopes |

## Token Prefixes

GitHub uses different prefixes for different token types:

- `gho_*` - OAuth access tokens
- `ghp_*` - Personal Access Tokens (PAT)
- `ghs_*` - Server-to-server tokens
- `ghu_*` - User-to-server tokens
- `ghr_*` - Refresh tokens

## Using the Access Token

The access token is used in the Authorization header for API requests:

```
Authorization: Bearer gho_16C7e42F292c6912E7710c838347Ae178B4a
```

## Example Usage with fetch-github-api.js

```bash
# Export the access token from the OAuth response
export GITHUB_TOKEN="gho_16C7e42F292c6912E7710c838347Ae178B4a"

# Make an API request
export REQUEST_PATH="/user"
node contrib/devtools/fetch-github-api.js
```

## Common Scopes

| Scope | Description |
|-------|-------------|
| `repo` | Full control of private repositories |
| `repo:status` | Access commit status |
| `public_repo` | Access public repositories |
| `gist` | Create gists |
| `user` | Read/write user profile data |
| `user:email` | Access user email addresses |
| `workflow` | Update GitHub Action workflows |

## Security Notes

1. **Never commit tokens to version control**
   - Tokens should only be stored in environment variables or secure vaults
   - Use `.gitignore` to exclude files containing tokens

2. **Use minimum required scopes**
   - Only request scopes necessary for your application
   - More scopes = greater security risk if token is compromised

3. **Rotate tokens regularly**
   - Generate new tokens periodically
   - Revoke old tokens when no longer needed

4. **Monitor token usage**
   - Check rate limit headers in API responses
   - Review access logs in GitHub settings

## Related Documentation

- [GitHub API Integration](GITHUB_API_README.md)
- [Main README](../../README.md)
- [Security Practices](../../SECURITY_PRACTICES.md)
