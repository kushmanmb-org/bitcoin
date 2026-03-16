# Website Deployment Guide

This guide provides instructions for deploying the kushmanmb.org website with security best practices.

## Overview

The kushmanmb.org website is a static site with:
- HTML, CSS, and JavaScript files
- No server-side processing required
- Security-focused headers and practices
- Automated deployment via GitHub Actions

## Deployment Options

### Option 1: GitHub Pages (Recommended for Testing)

GitHub Pages provides free hosting with HTTPS:

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch or GitHub Actions
   - Branch: `master` / `main`
   - Folder: `/website` or root

2. **Configure Custom Domain** (optional):
   - Add CNAME file to website directory
   - Configure DNS settings at your domain provider
   - Enable "Enforce HTTPS" in GitHub Pages settings

3. **Automatic Deployment**:
   - Push changes to `website/` directory
   - GitHub Actions automatically deploys
   - Verify at `https://kushmanmb-org.github.io/bitcoin/`

### Option 2: Self-Hosted Server with Nginx

For production deployment with full control:

#### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Self-hosted GitHub Actions runner (see `doc/self-hosted-runner-setup.md`)
- Domain name (kushmanmb.org)
- SSL certificate (Let's Encrypt recommended)

#### Deployment Steps

1. **Setup Self-Hosted Runner**:
   ```bash
   # Follow instructions in doc/self-hosted-runner-setup.md
   # Ensure runner has labels: self-hosted, linux, website-deployment
   ```

2. **Configure GitHub Secrets**:
   - Go to repository Settings → Secrets → Actions
   - Add deployment secrets (if needed for production)

3. **Trigger Deployment**:
   ```bash
   # Manual deployment via workflow dispatch
   # GitHub → Actions → Deploy Website → Run workflow
   # Select environment: production
   ```

4. **Verify Deployment**:
   ```bash
   # Check website is accessible
   curl -I https://kushmanmb.org
   
   # Verify security headers
   curl -I https://kushmanmb.org | grep -E "X-Frame-Options|Content-Security-Policy"
   ```

### Option 3: Other Static Hosting Services

The website can be deployed to any static hosting service:

- **Netlify**: Connect GitHub repository, set build directory to `website/`
- **Vercel**: Import repository, configure root directory as `website/`
- **Cloudflare Pages**: Connect repo, set build output to `website/`
- **AWS S3 + CloudFront**: Upload website files to S3 bucket

## Security Configuration

### Required HTTP Security Headers

Configure your web server to add these headers:

```nginx
# Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;
```

### SSL/TLS Configuration

Use Let's Encrypt for free SSL certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d kushmanmb.org -d www.kushmanmb.org

# Auto-renewal is configured automatically
# Test with: sudo certbot renew --dry-run
```

## Deployment Workflow

### Automatic Deployment Trigger

The deployment workflow triggers on:
- Push to `master`/`main` branch affecting `website/` directory
- Pull requests (builds only, no deployment)
- Manual workflow dispatch

### Workflow Steps

1. **Security Scan**: Scans for secrets and vulnerabilities
2. **Build**: Validates HTML and prepares files
3. **Deploy**: Deploys to GitHub Pages or self-hosted server
4. **Verify**: Post-deployment security checks

### Manual Deployment

To manually deploy:

```bash
# Via GitHub UI
# 1. Go to Actions → Deploy Website
# 2. Click "Run workflow"
# 3. Select branch and environment
# 4. Click "Run workflow"
```

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All HTML files validated
- [ ] Security headers present in all pages
- [ ] No hardcoded credentials
- [ ] All external links use rel="noopener noreferrer"
- [ ] SSL certificate configured
- [ ] DNS records properly set
- [ ] Firewall rules configured
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Security scan passed

## Post-Deployment Verification

After deployment, verify:

```bash
# 1. Website is accessible
curl -f https://kushmanmb.org

# 2. Security headers are present
curl -I https://kushmanmb.org | grep -E "Strict-Transport-Security|X-Frame-Options"

# 3. SSL certificate is valid
openssl s_client -connect kushmanmb.org:443 -servername kushmanmb.org < /dev/null

# 4. All pages load correctly
curl -f https://kushmanmb.org/docs/security.html
curl -f https://kushmanmb.org/docs/documentation.html
curl -f https://kushmanmb.org/docs/about.html
```

## Rollback Procedure

If deployment fails or issues are detected:

### GitHub Pages
```bash
# Revert commit
git revert <commit-hash>
git push origin master

# Or reset to previous commit
git reset --hard <previous-commit>
git push origin master --force  # Use with caution
```

### Self-Hosted Server
```bash
# Backups are created automatically in /var/backups/website/
# Restore previous version:
sudo cp -r /var/backups/website/backup-YYYYMMDD-HHMMSS/* /var/www/kushmanmb.org/
sudo systemctl reload nginx
```

## Monitoring

### Log Locations

- **Nginx Access Log**: `/var/log/nginx/kushmanmb.org.access.log`
- **Nginx Error Log**: `/var/log/nginx/kushmanmb.org.error.log`
- **GitHub Actions**: Repository → Actions tab

### Key Metrics to Monitor

- Response time
- Error rate (404, 500 errors)
- SSL certificate expiration
- Security header presence
- Disk space usage

## Troubleshooting

### Website Not Loading

1. Check DNS records:
   ```bash
   nslookup kushmanmb.org
   dig kushmanmb.org
   ```

2. Check web server status:
   ```bash
   sudo systemctl status nginx
   ```

3. Check logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Security Headers Missing

1. Verify Nginx configuration:
   ```bash
   sudo nginx -t
   ```

2. Check if headers are in configuration:
   ```bash
   grep -r "add_header" /etc/nginx/sites-enabled/
   ```

3. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

### SSL Certificate Issues

1. Check certificate expiration:
   ```bash
   sudo certbot certificates
   ```

2. Renew certificate:
   ```bash
   sudo certbot renew
   ```

3. Test auto-renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

## Maintenance

### Regular Tasks

- **Weekly**: Review access logs for anomalies
- **Monthly**: Check SSL certificate expiration
- **Quarterly**: Update runner software and dependencies
- **Annually**: Review and update security configuration

### Updates

To update the website:

1. Create a feature branch
2. Make changes to `website/` directory
3. Test locally
4. Create pull request
5. Review and merge
6. Automatic deployment triggers

## Security Best Practices

1. **Keep secrets out of repository**: Use GitHub Secrets for sensitive data
2. **Regular security scans**: Automated in CI/CD pipeline
3. **Minimal permissions**: Self-hosted runner has only required access
4. **Audit logs**: Enable and regularly review
5. **Backup regularly**: Automated backups before each deployment
6. **Monitor continuously**: Set up alerts for issues
7. **Update promptly**: Keep software and dependencies updated

## References

- [Website README](../website/README.md)
- [Self-Hosted Runner Setup](self-hosted-runner-setup.md)
- [GitHub Actions Deployment](../.github/workflows/deploy-website.yml)
- [Security Practices](../SECURITY_PRACTICES.md)

## Support

For issues:
- Open an issue: https://github.com/kushmanmb-org/bitcoin/issues
- Security concerns: See [SECURITY.md](../SECURITY.md)

---

Last Updated: 2026-02-13
