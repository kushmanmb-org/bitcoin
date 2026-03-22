*The release notes draft is a temporary file that can be added to by anyone. See
[/doc/developer-notes.md#release-notes](/doc/developer-notes.md#release-notes)
for the process.*

v31.0 Release Notes Draft
===============================

Bitcoin Core version v31.0 is now available from:

  <https://bitcoincore.org/bin/bitcoin-core-31.0/>

This release includes new features, various bug fixes and performance
improvements, as well as updated translations.

Please report bugs using the issue tracker at GitHub:

  <https://github.com/bitcoin/bitcoin/issues>

To receive security and update notifications, please subscribe to:

  <https://bitcoincore.org/en/list/announcements/join/>

How to Upgrade
==============

If you are running an older version, shut it down. Wait until it has completely
shut down (which might take a few minutes in some cases), then run the
installer (on Windows) or just copy over `/Applications/Bitcoin-Qt` (on macOS)
or `bitcoind`/`bitcoin-qt` (on Linux).

Upgrading directly from a version of Bitcoin Core that has reached its EOL is
possible, but it might take some time if the data directory needs to be migrated. Old
wallet versions of Bitcoin Core are generally supported.

Compatibility
==============

Bitcoin Core is supported and tested on the following operating systems or newer:
Linux Kernel 3.17, macOS 14, and Windows 10 (version 1903). Bitcoin
Core should also work on most other Unix-like systems but is not as
frequently tested on them. It is not recommended to use Bitcoin Core on
unsupported systems.

Notable changes
===============

Mempool
-------

The mempool has been reimplemented with a new design ("cluster mempool"), to
facilitate better decision-making when constructing block templates, evicting
transactions, relaying transactions, and validating replacement transactions
(RBF). Most changes should be transparent to users, but some behavior changes
are noted:

- The mempool no longer enforces ancestor or descendant size/count limits.
  Instead, two new default policy limits are introduced governing connected
  components, or clusters, in the mempool, limiting clusters to 64 transactions
  and up to 101 kB in virtual size.  Transactions are considered to be in the
  same cluster if they are connected to each other via any combination of
  parent/child relationships in the mempool. These limits can be overridden
  using command line arguments; see the extended help (`-help-debug`)
  for more information.

- Within the mempool, transactions are ordered based on the feerate at which
  they are expected to be mined, which takes into account the full set, or
  "chunk", of transactions that would be included together (e.g., a parent and
  its child, or more complicated subsets of transactions). This ordering is
  utilized by the algorithms that implement transaction selection for
  constructing block templates; eviction from the mempool when it is full; and
  transaction relay announcements to peers.

- The replace-by-fee validation logic has been updated so that transaction
  replacements are only accepted if the resulting mempool's feerate diagram is
  strictly better than before the replacement. This eliminates all known cases
  of replacements occurring that make the mempool worse off, which was possible
  under previous RBF rules. For singleton transactions (that are in clusters by
  themselves) it's sufficient for a replacement to have a higher fee and
  feerate than the original. See
  [delvingbitcoin.org post](https://delvingbitcoin.org/t/an-overview-of-the-cluster-mempool-proposal/393#rbf-can-now-be-made-incentive-compatible-for-miners-11)
  for more information.

- Two new RPCs have been added: `getmempoolcluster` will provide the set of
  transactions in the same cluster as the given transaction, along with the
  ordering of those transactions and grouping into chunks; and
  `getmempoolfeeratediagram` will return the feerate diagram of the entire
  mempool.

- Chunk size and chunk fees are now also included in the output of `getmempoolentry`.

- The "CPFP Carveout" has been removed from the mempool logic. The CPFP carveout
  allowed one additional child transaction to be added to a package that's already
  at its descendant limit, but only if that child has exactly one ancestor
  (the package's root) and is small (no larger than 10kvB). Nothing is allowed to
  bypass the cluster count limit. It is expected that smart contracting use-cases
  requiring similar functionality employ TRUC transactions and sibling eviction
  instead going forward.

P2P and network changes
-----------------------

- Normally local transactions are broadcast to all connected peers with
  which we do transaction relay. Now, for the `sendrawtransaction` RPC
  this behavior can be changed to only do the broadcast via the Tor or
  I2P networks. A new boolean option `-privatebroadcast` has been added
  to enable this behavior. This improves the privacy of the transaction
  originator in two aspects:
  1. Their IP address (and thus geolocation) is never known to the
     recipients.
  2. If the originator sends two otherwise unrelated transactions, they
     will not be linkable. This is because a separate connection is used
     for broadcasting each transaction. (#29415)

- The `-maxorphantx` startup option has been removed. It was
  previously deprecated and has no effect anymore since v30.0. (#33872)

- Transactions participating in one-parent-one-child package relay can now have the parent
  with a feerate lower than the `-minrelaytxfee` feerate, even 0 fee. This expands the change
  from 28.0 to also cover packages of non-TRUC transactions. Note that in general the
  package child can have additional unconfirmed parents, but they must already be
  in-mempool for the new package to be relayed. (#33892)

Net
---

- `tor` has been removed as a network specification. It
  was deprecated in favour of `onion` in v0.17.0. (#34031)

Updated RPCs
------------

- The `getpeerinfo` RPC no longer returns the `startingheight` field unless
  the configuration option `-deprecatedrpc=startingheight` is used. The
  `startingheight` field will be fully removed in the next major release.
  (#34197)

New REST API
------------

- A new REST API endpoint (`/rest/blockpart/<BLOCK-HASH>.<bin|hex>?offset=<OFFSET>&size=<SIZE>`) has been introduced
  for efficiently fetching a range of bytes from block `<BLOCK-HASH>`.

Updated settings
----------------

- `-asmap` requires explicit filename. In previous releases, if `-asmap` was
  specified without a filename, this would try to load an `ip_asn.map` data
  file. Now loading an asmap file requires an explicit filename like
  `-asmap=ip_asn.map`. This change was made to make the option easier to
  understand, because it was confusing for there to be a default filename not
  actually loaded by default. Also this change makes the option more
  future-proof, because in upcoming releases, specifying `-asmap` will load
  embedded asmap data instead of an external file.

Mining IPC
----------

- The `getCoinbaseTx()` method is renamed to `getCoinbaseRawTx()` and deprecated.
  IPC clients do not use the function name, so they're not affected. (#33819)
- Adds `getCoinbaseTx()` which clients should use instead of `getCoinbaseRawTx()`. It
  contains all fields required to construct a coinbase transaction, and omits the
  dummy output which Bitcoin Core uses internally. (#33819)

Build System
------------

- The minimum supported Clang compiler version has been raised to 17.0. (#33555)

- The minimum supported GCC compiler version has been raised to 12.1. (#33842)

Low-level changes
=================

Logging
-------

- When `-logsourcelocations` is enabled, the log output now contains just the
  function name instead of the entire function signature. (#34088)

v31.0 change log
================

Credits
=======

Thanks to everyone who directly contributed to this release:


As well as to everyone that helped with translations on
[Transifex](https://explore.transifex.com/bitcoin/bitcoin/).
