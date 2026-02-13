# Bitcoin Core - Frontend Application

## Overview

This is a secure frontend application for Bitcoin Core, built with React and Vite. It demonstrates the integration of WebAssembly modules for Bitcoin-related functionality while following security best practices.

## Security Features

### Built-in Security Measures

1. **Content Security Policy (CSP)**
   - Strict CSP headers in HTML
   - Prevents XSS attacks
   - Allows WASM execution with `wasm-unsafe-eval`

2. **Security Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin

3. **Input Validation**
   - All user inputs are validated before processing
   - Transaction ID validation (hex format, length limits)
   - Prevention of injection attacks

4. **Build Security**
   - Console logs removed in production builds
   - Debugger statements stripped
   - Minified and optimized output
   - Source maps disabled by default for production

5. **Dependency Security**
   - Regular security audits via `npm audit`
   - Version pinning for reproducibility
   - Only well-maintained packages

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0

## Installation

### Using npm

```bash
cd app
npm install
```

### Using yarn

```bash
cd app
yarn install
```

## Development

### Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Development Features

- Hot Module Replacement (HMR)
- Fast refresh for React components
- Detailed error messages
- Development tools enabled

## Building for Production

### Create Production Build

```bash
npm run build
# or
yarn build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## Integrating WASM Module

### Step 1: Build the WASM Module

```bash
cd ../pdf-utils/wasm
./generate_wasm.sh
cd ../../app
```

### Step 2: Copy WASM Package

```bash
# Copy the WASM package to the app
cp -r ../pdf-utils/wasm/pkg ./wasm-pkg
```

### Step 3: Update App.jsx

Uncomment the WASM loading code in `src/App.jsx`:

```javascript
// In the loadWasm function, uncomment:
const wasm = await import('../wasm-pkg/bitcoin_pdf_utils.js');
await wasm.default();
setWasmModule(wasm);
setWasmLoaded(true);
```

## Testing

```bash
npm run test
# or
yarn test
```

## Code Quality

### Linting

```bash
npm run lint
# or
yarn lint
```

### Formatting

```bash
npm run format
# or
yarn format
```

### Security Audit

```bash
npm run security-audit
# or
yarn security-audit
```

## Project Structure

```
app/
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── index.html               # HTML entry point with security headers
├── vite.config.js           # Vite configuration with security settings
├── .eslintrc.cjs            # ESLint configuration with security rules
├── .prettierrc              # Prettier configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Security Best Practices

### Before Deployment

- [ ] Run security audit: `npm audit`
- [ ] Update all dependencies to latest secure versions
- [ ] Enable HTTPS in production
- [ ] Configure proper CSP headers on your server
- [ ] Review and test all security features
- [ ] Remove or secure any debug endpoints
- [ ] Set appropriate CORS policies
- [ ] Implement rate limiting on API endpoints
- [ ] Enable security monitoring and logging

### Environment Variables

Create a `.env` file for environment-specific configuration (already in .gitignore):

```bash
# Example .env file (DO NOT commit this file)
VITE_API_URL=https://api.example.com
VITE_ENVIRONMENT=production
```

**Important**: Only use `VITE_` prefix for variables that should be exposed to the client. Never put sensitive data in client-side environment variables.

### Deployment Considerations

1. **HTTPS Only**
   - Always deploy with HTTPS
   - Use HSTS headers
   - Redirect HTTP to HTTPS

2. **Server Configuration**
   ```nginx
   # Example Nginx configuration
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       # Security headers
       add_header X-Frame-Options "DENY" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;
       
       # CSP header
       add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
       
       # Serve static files
       location / {
           root /var/www/app/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Regular Updates**
   - Update dependencies weekly
   - Monitor security advisories
   - Apply patches promptly
   - Test updates in staging first

## Troubleshooting

### Development Server Won't Start

1. Check Node.js version: `node --version` (should be >= 18.0.0)
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check for port conflicts (port 3000)

### WASM Module Not Loading

1. Verify WASM module is built: check `../pdf-utils/wasm/pkg/`
2. Verify WASM module is copied to app: check `./wasm-pkg/`
3. Check browser console for loading errors
4. Verify CSP allows WASM: `script-src 'wasm-unsafe-eval'`

### Build Fails

1. Clear build cache: `rm -rf dist`
2. Update dependencies: `npm update`
3. Check for TypeScript/ESLint errors

### Security Audit Shows Vulnerabilities

1. Review the vulnerability details: `npm audit`
2. Update affected packages: `npm update`
3. For breaking changes: `npm audit fix`
4. For manual intervention: `npm audit fix --force` (use with caution)

## Performance Optimization

### Bundle Size

Monitor bundle size with:

```bash
npm run build
# Check dist/ directory size
```

### Optimization Tips

1. Use dynamic imports for code splitting
2. Lazy load components
3. Optimize images (use WebP format)
4. Enable compression on server (gzip/brotli)
5. Use CDN for static assets
6. Implement caching strategies

## Contributing

When contributing to this application:

1. Follow React best practices
2. Write tests for new features
3. Run linter and fix warnings
4. Update documentation
5. Never commit sensitive data
6. Test security features

## License

This project is part of Bitcoin Core and is licensed under the MIT License - see the [COPYING](../COPYING) file for details.

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [WebAssembly Security](https://webassembly.org/docs/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Support

For security issues, please see [SECURITY.md](../SECURITY.md)

For general questions, please open an issue in the repository.
