# Maven Settings Template

This directory contains templates for Maven configuration files. 

**IMPORTANT: These are templates only. Never commit actual settings files with credentials!**

## settings.xml Template

Copy this template to `~/.m2/settings.xml` (your Maven home directory):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                              http://maven.apache.org/xsd/settings-1.0.0.xsd">
  
  <!-- 
    GitHub Packages Authentication
    The server ID must match the repository ID in pom.xml
  -->
  <servers>
    <server>
      <id>github</id>
      <username>YOUR_GITHUB_USERNAME</username>
      <!-- Use environment variable for token -->
      <password>${env.GITHUB_TOKEN}</password>
    </server>
  </servers>

  <!-- 
    Optional: Configure profiles for different environments
  -->
  <profiles>
    <profile>
      <id>github</id>
      <repositories>
        <repository>
          <id>central</id>
          <url>https://repo1.maven.org/maven2</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>false</enabled></snapshots>
        </repository>
        <repository>
          <id>github</id>
          <url>https://maven.pkg.github.com/kushmanmb-org/bitcoin</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>true</enabled></snapshots>
        </repository>
      </repositories>
    </profile>
  </profiles>

  <activeProfiles>
    <activeProfile>github</activeProfile>
  </activeProfiles>

</settings>
```

## Setup Instructions

### 1. Create Settings File

```bash
# Create Maven config directory if it doesn't exist
mkdir -p ~/.m2

# Copy template and edit with your credentials
cp doc/maven/settings.xml.template ~/.m2/settings.xml

# Set secure permissions
chmod 600 ~/.m2/settings.xml
```

### 2. Set Environment Variable

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`):

```bash
# GitHub Personal Access Token for Maven packages
export GITHUB_TOKEN="ghp_your_token_here"
```

Then reload:

```bash
source ~/.bashrc  # or ~/.zshrc
```

### 3. Verify Configuration

```bash
# Check effective settings
mvn help:effective-settings

# Test authentication (dry run)
mvn dependency:resolve -U
```

## Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Maven Package Publishing - Dev Laptop")
4. Set expiration (recommended: 90 days)
5. Select scopes:
   - ✅ `write:packages` - Upload packages
   - ✅ `read:packages` - Download packages
   - ✅ `repo` - Access private repositories (if needed)
6. Generate token and copy immediately
7. Store in environment variable as shown above

## Security Best Practices

- **Never commit** `settings.xml` to any repository
- **Use environment variables** for tokens, not hardcoded values
- **Rotate tokens** every 90 days
- **Use separate tokens** for different purposes (dev, CI/CD, prod)
- **Revoke immediately** if token is compromised
- **Enable MFA** on your GitHub account

## Troubleshooting

### Authentication Failed

```bash
# Check if environment variable is set
echo $GITHUB_TOKEN

# Verify settings file exists
ls -la ~/.m2/settings.xml

# Test with verbose output
mvn deploy -X
```

### Package Not Found

```bash
# Verify package exists
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/orgs/kushmanmb-org/packages
```

### Permission Denied

- Verify your GitHub user has write access to the repository
- Check token scopes include `write:packages`
- Ensure token hasn't expired

## Alternative: settings-security.xml (Encrypted)

For additional security, use Maven's password encryption:

```bash
# 1. Create master password
mvn --encrypt-master-password
# Enter your master password when prompted
# Copy the encrypted output

# 2. Create ~/.m2/settings-security.xml
cat > ~/.m2/settings-security.xml << 'EOF'
<settingsSecurity>
  <master>{PASTE_ENCRYPTED_MASTER_PASSWORD_HERE}</master>
</settingsSecurity>
EOF

# 3. Encrypt your GitHub token
mvn --encrypt-password
# Enter your GitHub token when prompted
# Copy the encrypted output

# 4. Update ~/.m2/settings.xml with encrypted password
# Replace ${env.GITHUB_TOKEN} with the encrypted value
```

See [Maven Password Encryption Guide](https://maven.apache.org/guides/mini/guide-encryption.html) for details.

## Further Reading

- [GitHub Packages Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-apache-maven-registry)
- [Maven Settings Reference](https://maven.apache.org/settings.html)
- [Security Practices](../../SECURITY_PRACTICES.md)

---

**Remember: Keep your credentials secure and never commit them to version control!**
