# OnChain Project Setup Documentation

This document records the setup process and choices made during the initialization of the onchain project using the community-recommended `create-onchain` scaffolding tool.

## Setup Command

```bash
npx create-onchain@latest
```

## Version Information

- Tool: `create-onchain@1.1.2`
- Date: February 15, 2026
- Node.js: v24.13.0
- npm: 11.6.2
- yarn: 1.22.22

## Interactive Setup Choices

### 1. Project Name
**Question:** Project name:  
**Choice:** `bitcoin-onchain-app`  
**Reasoning:** Chosen to clearly identify this as a Bitcoin-related onchain application while maintaining consistency with project naming conventions.

### 2. Coinbase Developer Platform API Key
**Question:** Enter your Coinbase Developer Platform Client API Key: (optional)  
**Choice:** Skipped (no API key provided)  
**Reasoning:** Left blank as it's optional and can be configured later when needed for production use. The API key can be added to the `.env` file when available.

### 3. Anonymous Usage Data
**Question:** Share anonymous usage data to help improve create-onchain?  
**Choice:** `no`  
**Reasoning:** Opted out of sharing anonymous usage data to maintain privacy and minimize external data collection.

## Generated Project Structure

The scaffolding tool created the following structure in `/bitcoin-onchain-app/`:

```
bitcoin-onchain-app/
├── README.md                 # Project documentation
├── .env                      # Environment variables (template)
├── .gitignore               # Git ignore rules
├── .prettierrc              # Prettier configuration
├── eslint.config.mjs        # ESLint configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── app/                     # Next.js app directory
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.module.css
│   ├── page.tsx
│   └── rootProvider.tsx
└── public/                  # Static assets
    └── sphere.svg
```

## Integrations & Frameworks

The generated project includes the following integrations and frameworks:

### Integrations
- **Base** - Coinbase's Layer 2 blockchain solution

### Frameworks
- **Wagmi** - React Hooks for Ethereum
- **React** (v19.0.0) - UI framework
- **Next.js** (v15.3.4) - React framework for production
- **ESLint** (v9) - Code linting

## Key Dependencies

### Production Dependencies
- `@coinbase/onchainkit@latest` - OnchainKit library for blockchain interactions
- `@tanstack/react-query@^5.81.5` - Data fetching and state management
- `next@15.3.4` - Next.js framework
- `react@^19.0.0` - React library
- `react-dom@^19.0.0` - React DOM renderer
- `viem@^2.31.6` - TypeScript Ethereum library
- `wagmi@^2.16.3` - React Hooks for Ethereum

### Development Dependencies
- `@types/node@^20` - TypeScript types for Node.js
- `@types/react@^19` - TypeScript types for React
- `@types/react-dom@^19` - TypeScript types for React DOM
- `eslint@^9` - Code linter
- `eslint-config-next@15.3.4` - ESLint configuration for Next.js
- `typescript@^5` - TypeScript compiler

## Dependency Installation

As per project conventions, dependencies were installed using **yarn**:

```bash
cd bitcoin-onchain-app
yarn install
```

Installation completed successfully in 72.86 seconds, creating:
- `node_modules/` directory with all dependencies
- `yarn.lock` file for dependency version locking

## Environment Configuration

The `.env` file was generated with the following template:

```env
NEXT_PUBLIC_PROJECT_NAME="bitcoin-onchain-app"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=""
```

**Note:** The `.env` file is included in `.gitignore` by default. For production deployments, configure environment variables through your hosting platform's environment variable settings.

## Available Scripts

The following npm scripts are available:

- `yarn dev` - Start development server (default: http://localhost:3000)
- `yarn build` - Build the application for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint to check code quality

## Next Steps

To start developing:

1. Navigate to the project directory:
   ```bash
   cd bitcoin-onchain-app
   ```

2. Run the development server:
   ```bash
   yarn dev
   ```

3. Open http://localhost:3000 in your browser

4. Edit `app/page.tsx` to start building your application

5. Configure the Coinbase Developer Platform API key in `.env` if needed:
   ```env
   NEXT_PUBLIC_ONCHAINKIT_API_KEY="your-api-key-here"
   ```

## Security Considerations

- The `.env` file contains sensitive configuration and is properly excluded via `.gitignore`
- API keys should never be committed to version control
- Use environment-specific configuration for different deployment environments
- Review the [OnchainKit documentation](https://docs.base.org/onchainkit) for security best practices

## References

- [OnchainKit Documentation](https://docs.base.org/onchainkit)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Base Network](https://base.org)
