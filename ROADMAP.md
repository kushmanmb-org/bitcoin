# Bitcoin Core Project Roadmap

This document outlines the development priorities and upcoming milestones for the Bitcoin Core project. It is a living document, updated regularly to reflect the current state of development and community consensus.

For the release schedule and detailed release notes, see the [`doc/release-notes/`](doc/release-notes/) directory and the [release process documentation](doc/release-process.md).

---

## Current Status

**Latest Stable Release:** [v30.2](doc/release-notes/release-notes-30.2.md)  
**Current Development Branch:** `master` (targeting v31.0)  
**Repository:** https://github.com/kushmanmb-org/bitcoin  

---

## Milestones

### v30.x Maintenance (Active)
- **Goal:** Ongoing bug fixes, security patches, and backports for the v30 release series.
- **Status:** Active — v30.0, v30.1, v30.2 released.
- **Key tasks:**
  - Backport critical fixes from `master`
  - Monitor and address CVEs and security disclosures
  - Maintain compatibility with existing node operators

### v31.0 (Next Major Release)
- **Target:** Mid-2026
- **Status:** In development on `master`
- **Focus areas:**
  - P2P and mempool policy improvements (package relay, cluster mempool)
  - Wallet improvements (descriptor wallet enhancements, silent payments support progress)
  - Script and transaction improvements (TRUC/v3 transaction relay refinements)
  - Build system modernisation (CMake-based build, continued cleanup)
  - Performance: IBD speed, UTXO cache, and database tuning
  - Developer tooling and test infrastructure improvements

### v31.x Maintenance (Planned)
- **Goal:** Stable maintenance releases following v31.0
- **Status:** Planned

---

## Ongoing Priorities

The following areas receive continuous attention across all release cycles:

### Security
- Responsible disclosure and timely patching of vulnerabilities
- Ongoing fuzz testing and static analysis integration
- Security audit of consensus-critical code paths
- See [SECURITY.md](SECURITY.md) for the vulnerability reporting policy

### Testing & Quality
- Expanding unit test and functional test coverage
- Improving CI reliability across Windows, Linux, and macOS
- Fuzz testing corpus maintenance and expansion
- See [src/test/README.md](src/test/README.md) and [test/](test/) for details

### P2P Network
- Cluster mempool: improved transaction cluster management for more efficient fee estimation and eviction
- Package relay: relay transactions as packages rather than individually to improve CPFP and RBF utility
- Erlay: bandwidth-efficient transaction announcement (research/implementation ongoing)

### Wallet
- Descriptor wallets as the default and only supported wallet type
- Silent payments (BIP 352) support
- Improved PSBT (BIP 174/370) tooling and multi-sig workflow

### Consensus & Script
- Continued evaluation of CTV (BIP 119), LNHANCE, and other soft-fork proposals through community process
- Script interpreter optimizations

### Developer Experience
- Improved documentation and onboarding materials
- Refactoring for code clarity and maintainability
- CMake build system stability and cross-platform parity

---

## How to Get Involved

- Browse [open issues](https://github.com/kushmanmb-org/bitcoin/issues) for areas where help is needed
- Review open pull requests — review bandwidth is the bottleneck for development
- Join the [Bitcoin Core PR Review Club](https://bitcoincore.reviews/) for guided PR review sessions
- Participate in the `#bitcoin-core-dev` IRC channel on [Libera Chat](https://web.libera.chat/#bitcoin-core-dev)
- Read [CONTRIBUTING.md](CONTRIBUTING.md) to understand the contribution workflow

---

## Release Cadence

Bitcoin Core targets approximately one major release per year, with maintenance releases (x.y.z) issued as needed for security fixes and important bug fixes. Each major release branch is typically maintained for approximately one year.

| Release | Branch Date (approx.) | EOL (approx.) |
|---------|----------------------|--------------|
| v28.x   | Oct 2024             | Oct 2025     |
| v29.x   | Apr 2025             | Apr 2026     |
| v30.x   | Oct 2025             | Oct 2026     |
| v31.x   | ~Apr 2026 (planned)  | ~Apr 2027    |

*Dates are approximate and subject to change based on development progress.*

---

## Governance

Bitcoin Core is a free and open-source project. Roadmap items are not "assigned" or "guaranteed" — they reflect the current collective interest and work-in-progress of contributors. The roadmap is updated when significant new work begins or when priorities shift, based on contributor consensus and community feedback.

For repository-specific governance and contribution policies, see [POLICY.md](POLICY.md).
