# Bitcoin Core Announcements

This file records significant project announcements. For release-specific notes, see the
[`doc/release-notes/`](doc/release-notes/) directory. For ongoing development priorities,
see [`ROADMAP.md`](ROADMAP.md).

---

## 2025-10 — Bitcoin Core v30.0 Released

Bitcoin Core **v30.0** is now available. This major release includes P2P improvements,
wallet enhancements, and continued work on the CMake-based build system.

- Download: https://bitcoincore.org/en/download/
- Release notes: [doc/release-notes/release-notes-30.0.md](doc/release-notes/release-notes-30.0.md)

Subsequent maintenance releases v30.1 and v30.2 are also available and recommended
for all node operators running v30.x.

---

## Ongoing — v31.0 Development in Progress

The `master` branch is actively targeting the next major release, **v31.0** (planned
for approximately mid-2026). Key areas of work include:

- Cluster mempool implementation
- Package relay refinements
- Silent payments (BIP 352) wallet support progress
- CMake build system modernisation
- Descriptor wallet improvements
- **Hard fork (block weight doubling)** at mainnet block height **1,050,000**

### Hard Fork: Block Weight Limit Doubled at Height 1,050,000

This release includes a **hard fork** that doubles the maximum block weight from
4,000,000 to 8,000,000 weight units, activating at block height **1,050,000** on
mainnet (approximately 2027).

**What changes:**
- The consensus-enforced block weight limit is raised from
  4,000,000 to 8,000,000 weight units at the activation height.
- Miners may produce blocks up to 8,000,000 weight units post-activation by setting
  `-blockmaxweight=8000000` in their node configuration.
- All other consensus rules (SegWit weight accounting, sigop limits, coinbase
  maturity, proof-of-work, etc.) remain unchanged.

**Activation heights:**

| Network  | Activation height      |
|----------|------------------------|
| Mainnet  | 1,050,000              |
| Testnet  | 3,000,000              |
| Testnet4 | 1 (genesis)            |
| Signet   | 1 (genesis)            |
| Regtest  | Inactive by default    |

**⚠️ Node operators must upgrade before block 1,050,000 to remain on the
canonical chain. Nodes running software older than v31.0 will not accept blocks
produced under the new weight limit and will fork off the main chain.**

Contributors and reviewers are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and
[ROADMAP.md](ROADMAP.md) for details.

---

## Security Notifications

To receive security and update notifications for Bitcoin Core, subscribe to the
announcement mailing list:

  https://bitcoincore.org/en/list/announcements/join/

To report a vulnerability, see [SECURITY.md](SECURITY.md).

---

## Repository

This repository is maintained by **kushmanmb** under the
[kushmanmb-org](https://github.com/kushmanmb-org) organization. See
[OWNERSHIP.md](OWNERSHIP.md) for full ownership and identity documentation.
