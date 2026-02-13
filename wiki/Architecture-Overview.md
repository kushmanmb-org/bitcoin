# Architecture Overview

High-level architecture and design documentation for Bitcoin Core.

## 🏗️ System Architecture

Bitcoin Core is organized into several key components:

### Core Components

1. **Node (P2P Layer)**
   - Peer discovery and management
   - Block and transaction relay
   - Network protocol implementation

2. **Consensus Layer**
   - Block validation
   - Transaction validation
   - Script verification
   - Consensus rules enforcement

3. **Blockchain Storage**
   - Block database (LevelDB)
   - UTXO set management
   - Chainstate maintenance

4. **Wallet**
   - Key management
   - Transaction creation and signing
   - Address generation
   - Coin selection

5. **RPC/REST Interface**
   - JSON-RPC server
   - REST API
   - Command-line interface

6. **GUI (Optional)**
   - Qt-based interface
   - Transaction history
   - Wallet management

## 📂 Source Code Organization

```
src/
├── consensus/      # Consensus rules and validation
├── crypto/         # Cryptographic primitives
├── net/            # P2P networking
├── node/           # Node functionality
├── policy/         # Policy (mempool, fees)
├── primitives/     # Core data structures
├── rpc/            # RPC server and commands
├── script/         # Bitcoin Script interpreter
├── util/           # Utility functions
├── wallet/         # Wallet functionality
└── qt/             # GUI code
```

## 🔄 Data Flow

### Transaction Processing

1. Transaction received via P2P or RPC
2. Validation (syntax, consensus rules)
3. Mempool acceptance
4. Relay to peers
5. Inclusion in block
6. Blockchain validation
7. UTXO set update

### Block Processing

1. Block received via P2P
2. Header validation
3. Transaction validation
4. Consensus rule checking
5. Chainstate update
6. Block relay to peers

## 🔐 Security Model

### Validation

- Full validation of all blocks and transactions
- No trust in peers
- Cryptographic verification
- Consensus rule enforcement

### Privacy

- Peer connection management
- Transaction relay policies
- Optional Tor support
- Address reuse prevention

## 📊 Database Storage

### Block Storage

- Blocks stored on disk (blocks/ directory)
- Indexed by block hash
- Organized in sequential files (blk*.dat)

### Chainstate

- UTXO set (LevelDB)
- Efficient lookups
- Compact representation

### Wallet

- Berkeley DB or SQLite
- Encrypted private keys
- Transaction history

## 🔌 Interfaces

### Internal

- Clean separation between components
- Well-defined interfaces
- Modular design

### External

- JSON-RPC for applications
- REST API for lightweight access
- ZMQ for real-time notifications
- CLI for scripting

## 🧪 Testing

See [Automated Testing](Automated-Testing.md) for information about:
- Unit tests
- Functional tests
- Fuzz testing
- Integration tests

## 📚 Design Documents

For more detailed architecture information:

- [Developer Notes](../doc/developer-notes.md)
- [Design Documents](../doc/design/)
- [Source Code](../src/)

## 🔗 Related Documentation

- [Setup Guide](Setup-Guide.md)
- [Development Environment](Development-Environment.md)
- [CI/CD Pipeline](CI-CD-Pipeline.md)

---

This is a high-level overview. For detailed information, consult the source code and documentation in the [doc](../doc/) directory.
