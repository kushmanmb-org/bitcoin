# Kushmanmb.org Website

This directory contains the website for https://kushmanmb.org, built with security-first practices and modern web standards.

## 🔒 Security Features

- **Content Security Policy (CSP)**: Strict CSP headers on all pages
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **No External Dependencies**: All resources served from same origin
- **HTTPS Only**: Enforced secure connections
- **No Tracking**: No analytics or third-party tracking
- **Secure External Links**: All external links use rel="noopener noreferrer"

## 📁 Directory Structure

```
website/
├── index.html          # Main homepage
├── css/
│   └── style.css      # Main stylesheet with security-focused design
├── js/
│   └── main.js        # Secure JavaScript with XSS prevention
├── docs/
│   ├── about.html     # About page
│   ├── security.html  # Security practices page
│   └── documentation.html  # Documentation page
└── assets/            # Static assets (images, fonts, etc.)
```

## 🚀 Deployment

The website is deployed automatically via GitHub Actions with self-hosted runners:

- **Automated Security Scanning**: Every deployment includes security checks
- **Self-Hosted Runners**: Enhanced security and control
- **GitHub Pages**: Automatic deployment to GitHub Pages
- **Production Deployment**: Manual approval required for production

### Deployment Workflow

1. Push changes to the `website/` directory
2. GitHub Actions triggers security scan
3. Build process validates HTML and security headers
4. Deployment to staging (automatic) or production (manual approval)
5. Post-deployment security verification

## 🛠️ Local Development

To run the website locally:

```bash
# Option 1: Python HTTP Server
cd website
python3 -m http.server 8000

# Option 2: Node.js HTTP Server
cd website
npx http-server -p 8000

# Option 3: PHP Built-in Server
cd website
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## ✅ Security Checklist

Before deploying changes, ensure:

- [ ] All HTML files include CSP headers
- [ ] All HTML files include X-Frame-Options
- [ ] No hardcoded credentials or API keys
- [ ] All external links have rel="noopener noreferrer"
- [ ] No sensitive data in HTML, CSS, or JS files
- [ ] JavaScript includes XSS prevention measures
- [ ] HTTPS is enforced (no mixed content)
- [ ] Security scanning passes
- [ ] HTML validation passes

## 🔐 Content Security Policy

All pages implement a strict CSP:

```
default-src 'self'; 
script-src 'self' 'unsafe-inline'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
font-src 'self'; 
connect-src 'self'; 
frame-ancestors 'none';
```

Note: `'unsafe-inline'` is used for inline styles and scripts. In production, consider using nonces or hashes for better security.

## 🏗️ Building for Production

The website is designed to be static and requires no build process. However, you can optimize for production:

```bash
# Minify CSS (optional)
npx clean-css-cli css/style.css -o css/style.min.css

# Minify JavaScript (optional)
npx terser js/main.js -o js/main.min.js

# Validate HTML
npx html-validate "**/*.html"
```

## 📝 Adding New Pages

When adding new pages:

1. Copy the template structure from existing pages
2. Ensure all security headers are included in `<head>`
3. Update navigation menu in all pages
4. Add the page to the sitemap (if implemented)
5. Test security headers
6. Run security scan before committing

## 🔍 Testing Security

Test security headers locally:

```bash
# Check security headers (requires curl)
curl -I http://localhost:8000/index.html

# Scan for hardcoded credentials
grep -r -i "password\|secret\|api_key" . --include="*.html" --include="*.js" --include="*.css"

# Validate HTML
npx html-validate "**/*.html"
```

## 🌐 Browser Support

The website supports:

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## 📄 License

Released under the MIT License. See [COPYING](../COPYING) for details.

## 🤝 Contributing

When contributing to the website:

1. Follow the security checklist above
2. Test locally before submitting PR
3. Ensure all security headers are present
4. No external dependencies without security review
5. Update documentation if adding new pages

## 📚 Resources

- [SECURITY_PRACTICES.md](../SECURITY_PRACTICES.md) - Comprehensive security guidelines
- [GitHub Workflow](../.github/workflows/deploy-website.yml) - Deployment workflow
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security) - Web security best practices

## 🐛 Known Issues

None at this time.

## 📞 Contact

For issues or questions:
- Open an issue: https://github.com/kushmanmb-org/bitcoin/issues
- Security issues: See [SECURITY.md](../SECURITY.md)

---

**Note**: This website prioritizes security and privacy. No tracking, no external dependencies, no unnecessary JavaScript. Keep it simple, keep it secure.
