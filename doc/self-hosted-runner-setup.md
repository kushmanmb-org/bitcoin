# Self-Hosted Runner Setup Guide

This guide covers setting up self-hosted GitHub Actions runners for the kushmanmb.org website deployment with enhanced security.

## Why Self-Hosted Runners?

Self-hosted runners provide:
- **Enhanced Security**: Full control over the execution environment
- **Better Performance**: Faster builds with dedicated resources
- **Custom Configuration**: Tailored to your specific needs
- **Network Access**: Direct access to internal resources
- **Cost Efficiency**: No usage limits for private repositories

## Security Considerations

⚠️ **IMPORTANT**: Self-hosted runners execute arbitrary code from your repository. Only use them in private repositories or with strict security controls.

### Security Best Practices

1. **Dedicated Environment**: Run on isolated VMs or containers
2. **No Persistent Credentials**: Use ephemeral runners when possible
3. **Network Isolation**: Restrict network access
4. **Regular Updates**: Keep runner software and OS updated
5. **Audit Logging**: Enable comprehensive logging
6. **Least Privilege**: Minimal permissions for runner service account
7. **Code Review**: All workflow changes require review

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Root or sudo access
- GitHub repository admin access
- Static IP or secure network
- 2GB+ RAM, 2+ CPU cores
- 20GB+ disk space

## Installation Steps

### 1. Create a Dedicated User

```bash
# Create runner user
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner  # If using Docker

# Set secure permissions
sudo chmod 750 /home/github-runner
```

### 2. Download and Install Runner

```bash
# Switch to runner user
sudo su - github-runner

# Create a directory for the runner
mkdir actions-runner && cd actions-runner

# Download the latest runner package
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Verify checksum (get latest from GitHub releases)
echo "29fc8cf2dab4c195bb147384e7e2c94cfd4d4022c793b346a6175435265aa278  actions-runner-linux-x64-2.311.0.tar.gz" | shasum -a 256 -c

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

### 3. Configure the Runner

```bash
# Get registration token from:
# GitHub Repo → Settings → Actions → Runners → New self-hosted runner

# Configure runner
./config.sh --url https://github.com/kushmanmb-org/bitcoin --token YOUR_TOKEN_HERE

# Add labels for website deployment
# When prompted for labels, enter: self-hosted,linux,website-deployment

# Configure runner name: kushmanmb-website-runner-01
# Configure work directory: _work (default)
```

### 4. Install as a Service

```bash
# Exit from runner user
exit

# Install service (as root/sudo)
cd /home/github-runner/actions-runner
sudo ./svc.sh install github-runner

# Start the service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

### 5. Configure Web Server (Nginx Example)

```bash
# Install Nginx
sudo apt update
sudo apt install nginx -y

# Create website directory
sudo mkdir -p /var/www/kushmanmb.org
sudo chown github-runner:www-data /var/www/kushmanmb.org
sudo chmod 755 /var/www/kushmanmb.org

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/kushmanmb.org << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name kushmanmb.org www.kushmanmb.org;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name kushmanmb.org www.kushmanmb.org;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/kushmanmb.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kushmanmb.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;

    # Document root
    root /var/www/kushmanmb.org;
    index index.html;

    # Disable server tokens
    server_tokens off;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security: Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Logging
    access_log /var/log/nginx/kushmanmb.org.access.log;
    error_log /var/log/nginx/kushmanmb.org.error.log;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/kushmanmb.org /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d kushmanmb.org -d www.kushmanmb.org

# Test auto-renewal
sudo certbot renew --dry-run
```

## Runner Labels

Configure runners with these labels:
- `self-hosted` - Indicates self-hosted runner
- `linux` - Operating system
- `website-deployment` - Specific to website deployment

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2ban Setup

```bash
# Install fail2ban
sudo apt install fail2ban -y

# Configure
sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
EOF

sudo systemctl restart fail2ban
```

### 3. Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## Monitoring

### Check Runner Status

```bash
# Check service status
sudo systemctl status actions.runner.kushmanmb-org-bitcoin.*

# View logs
sudo journalctl -u actions.runner.kushmanmb-org-bitcoin.* -f
```

## Production Checklist

Before using in production:

- [ ] Runner installed on dedicated server
- [ ] SSL certificate configured
- [ ] Firewall rules configured
- [ ] Fail2ban installed and configured
- [ ] Automatic security updates enabled
- [ ] Runner labels properly set
- [ ] Web server security headers verified
- [ ] DNS properly configured
- [ ] Test deployment successful

## References

- [GitHub Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Runner Security](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

**Security Note**: Review and update this configuration regularly. Security is an ongoing process, not a one-time setup.
