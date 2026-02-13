# API Documentation

API reference and documentation for Bitcoin Core.

## 📖 Overview

Bitcoin Core provides several APIs for interacting with the system:

## 🔌 RPC API

The JSON-RPC API provides programmatic access to Bitcoin Core.

### Documentation

See the comprehensive [JSON-RPC interface documentation](../doc/JSON-RPC-interface.md) for:
- Available RPC commands
- Request/response formats
- Authentication
- Examples

### Quick Reference

```bash
# Get blockchain info
bitcoin-cli getblockchaininfo

# Get wallet balance
bitcoin-cli getbalance

# Send transaction
bitcoin-cli sendtoaddress <address> <amount>
```

## 🌐 REST API

The REST API provides a lightweight HTTP interface.

### Documentation

See the [REST interface documentation](../doc/REST-interface.md) for:
- Available endpoints
- Request formats
- Response formats
- Examples

### Endpoints

- `/rest/tx/<txid>` - Transaction information
- `/rest/block/<hash>` - Block information
- `/rest/chaininfo` - Blockchain information

## 🔄 ZMQ Interface

The ZMQ interface provides real-time notifications.

### Documentation

See the [ZMQ documentation](../doc/zmq.md) for:
- Setup instructions
- Available topics
- Message formats
- Examples

### Topics

- `zmqpubhashtx` - Transaction hashes
- `zmqpubhashblock` - Block hashes
- `zmqpubrawblock` - Raw block data
- `zmqpubrawtx` - Raw transaction data

## 📚 Additional Resources

- [RPC Help](https://bitcoin.org/en/developer-reference#remote-procedure-calls-rpcs)
- [REST API](https://bitcoin.org/en/developer-reference#http-rest)
- [Developer Documentation](../doc/developer-notes.md)

## 🔒 Security

When using APIs:

- Always use authentication for RPC
- Use HTTPS for REST API in production
- Never expose RPC/REST to the public internet
- Use firewall rules to restrict access
- Store credentials securely (see [Private Data Handling](Private-Data-Handling.md))

---

For detailed API documentation, refer to the [doc](../doc/) directory and online resources.
