# Solana Zero-Knowledge Proof Program

A Solana smart contract (program) for submitting, verifying, and finalizing zero-knowledge proofs on the Solana blockchain.

## Overview

This program enables on-chain verification of zero-knowledge proofs, allowing users to prove knowledge of certain information without revealing the information itself. The program follows a two-phase process: **prove** and **finalize**.

## Features

- **Initialize**: Create a new proof account for storing proof data
- **Prove**: Submit zero-knowledge proof data to the blockchain
- **Finalize**: Verify and finalize the submitted proof
- **On-chain Verification**: All verification happens on-chain for transparency
- **Access Control**: Only the authority can submit and finalize proofs

## Prerequisites

Before using this program, ensure you have the following installed:

- [Rust](https://www.rust-lang.org/tools/install) (1.70.0 or later)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (1.17.0 or later)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation) (0.29.0 or later)
- [Node.js](https://nodejs.org/) (16.x or later)
- [Yarn](https://yarnpkg.com/) package manager

## Installation

1. **Install Solana CLI tools**:
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

2. **Install Anchor**:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

3. **Install dependencies**:
```bash
cd solana
yarn install
```

## Configuration

1. **Generate a Solana keypair** (if you don't have one):
```bash
solana-keygen new
```

2. **Set your Solana cluster** (localnet, devnet, testnet, or mainnet):
```bash
# For local development
solana config set --url localhost

# For devnet
solana config set --url devnet

# For mainnet
solana config set --url mainnet-beta
```

3. **Airdrop SOL** (for testing on devnet/localnet):
```bash
solana airdrop 2
```

## Building the Program

Build the Solana program:

```bash
cd solana
anchor build
```

This will compile the Rust program and generate:
- Program binary in `target/deploy/`
- IDL (Interface Definition Language) file in `target/idl/`
- TypeScript client in `target/types/`

## Deployment

### Deploy to Localnet

1. **Start a local validator**:
```bash
solana-test-validator
```

2. **Deploy the program** (in a new terminal):
```bash
cd solana
anchor deploy
```

### Deploy to Devnet

```bash
cd solana
anchor deploy --provider.cluster devnet
```

### Deploy to Mainnet

```bash
cd solana
anchor deploy --provider.cluster mainnet
```

## Usage Instructions

### 1. Initialize a Proof Account

Before you can submit proofs, you need to initialize a proof account:

```bash
anchor run initialize
```

Or using the Solana CLI:

```bash
solana program deploy target/deploy/zkproof.so
```

### 2. Prove - Submit Zero-Knowledge Proof

Submit your zero-knowledge proof data to the blockchain:

**Using Anchor client (TypeScript)**:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Zkproof } from "../target/types/zkproof";

// Initialize the program
const program = anchor.workspace.Zkproof as Program<Zkproof>;

// Your proof data (as bytes)
const proofData = Buffer.from("your-zero-knowledge-proof-data-here");

// Submit the proof
await program.methods
  .prove(proofData)
  .accounts({
    proofAccount: proofAccountPubkey,
    authority: wallet.publicKey,
  })
  .rpc();

console.log("Proof submitted successfully!");
```

**Using Solana CLI**:

```bash
# Prepare your proof data as a JSON file
echo '{"proof": "base64-encoded-proof-data"}' > proof.json

# Submit the proof
solana program invoke \
  --program-id Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS \
  --accounts proof.json
```

### 3. Finalize - Verify and Complete the Proof

After submitting the proof, finalize it to verify and complete the verification process:

**Using Anchor client (TypeScript)**:

```typescript
// Finalize the proof
await program.methods
  .finalize()
  .accounts({
    proofAccount: proofAccountPubkey,
    authority: wallet.publicKey,
  })
  .rpc();

console.log("Proof finalized and verified!");

// Check if the proof was verified
const proofAccount = await program.account.proofAccount.fetch(proofAccountPubkey);
console.log("Verified:", proofAccount.verified);
```

**Using Solana CLI**:

```bash
solana program invoke \
  --program-id Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS \
  --accounts finalize.json
```

## Complete Workflow Example

Here's a complete example of the prove and finalize workflow:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Zkproof } from "../target/types/zkproof";

async function proveAndFinalize() {
  // 1. Setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Zkproof as Program<Zkproof>;
  
  // 2. Generate a new proof account
  const proofAccount = Keypair.generate();
  
  // 3. Initialize the proof account
  await program.methods
    .initialize()
    .accounts({
      proofAccount: proofAccount.publicKey,
      authority: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([proofAccount])
    .rpc();
  
  console.log("✓ Proof account initialized");
  
  // 4. PROVE - Submit your zero-knowledge proof
  const proofData = Buffer.from(
    "your-zero-knowledge-proof-data-at-least-32-bytes-long"
  );
  
  await program.methods
    .prove(proofData)
    .accounts({
      proofAccount: proofAccount.publicKey,
      authority: provider.wallet.publicKey,
    })
    .rpc();
  
  console.log("✓ Proof submitted (prove phase complete)");
  
  // 5. FINALIZE - Verify and complete the proof
  await program.methods
    .finalize()
    .accounts({
      proofAccount: proofAccount.publicKey,
      authority: provider.wallet.publicKey,
    })
    .rpc();
  
  console.log("✓ Proof finalized (verification complete)");
  
  // 6. Check verification status
  const account = await program.account.proofAccount.fetch(
    proofAccount.publicKey
  );
  
  console.log("\nProof Status:");
  console.log("  Authority:", account.authority.toString());
  console.log("  Verified:", account.verified);
  console.log("  Proof Data Length:", account.proofData.length);
}

// Run the workflow
proveAndFinalize()
  .then(() => {
    console.log("\n✅ Complete workflow successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
```

## Testing

Run the test suite:

```bash
cd solana
anchor test
```

Run tests on a specific cluster:

```bash
anchor test --provider.cluster devnet
```

## Program Architecture

### Instructions

1. **initialize**: Creates a new proof account
   - Parameters: None
   - Accounts: proof_account, authority, system_program
   
2. **prove**: Submits zero-knowledge proof data
   - Parameters: `proof_data: Vec<u8>`
   - Accounts: proof_account, authority
   - Validation: Checks data size and authorization
   
3. **finalize**: Verifies and finalizes the proof
   - Parameters: None
   - Accounts: proof_account, authority
   - Verification: Runs on-chain verification logic

### Account Structure

**ProofAccount**:
- `authority: Pubkey` - The public key authorized to manage this proof
- `verified: bool` - Whether the proof has been verified
- `proof_data: Vec<u8>` - The zero-knowledge proof data (max 1024 bytes)

## Security Considerations

1. **Access Control**: Only the authority can submit and finalize proofs
2. **Size Limits**: Proof data is limited to 1024 bytes to prevent abuse
3. **Validation**: All inputs are validated before processing
4. **On-chain Verification**: Verification logic runs entirely on-chain
5. **Immutability**: Once finalized, proof data cannot be modified

## Error Codes

- `Unauthorized`: Caller is not the authority for this proof account
- `EmptyProofData`: Proof data is empty
- `ProofTooLarge`: Proof data exceeds maximum size (1024 bytes)
- `NoProofData`: No proof data available to verify

## Troubleshooting

### Program deployment fails

Ensure you have enough SOL in your wallet:
```bash
solana balance
solana airdrop 2  # On devnet/localnet
```

### Transaction fails with "insufficient funds"

The proof account initialization requires rent. Ensure you have enough SOL:
```bash
solana rent 1061  # Check rent requirement
```

### "Program not deployed" error

Verify the program is deployed:
```bash
solana program show Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## Advanced Topics

### Custom Verification Logic

The `verify_proof()` function in `lib.rs` contains placeholder logic. In a production system, you would implement:

1. **Parse proof data**: Extract proof components
2. **Verify signatures**: Check cryptographic signatures
3. **Validate constraints**: Ensure proof satisfies circuit constraints
4. **Public input validation**: Verify against known public inputs

Example verification implementation:

```rust
fn verify_proof(proof_data: &[u8]) -> bool {
    // 1. Parse the proof
    let proof = match parse_zkproof(proof_data) {
        Ok(p) => p,
        Err(_) => return false,
    };
    
    // 2. Verify the proof cryptographically
    match verify_zksnark(&proof) {
        Ok(true) => true,
        _ => false,
    }
}
```

### Integration with zkpdf_lib

This program can be integrated with the existing `zkpdf_lib` for PDF verification:

```rust
use zkpdf_lib::{verify_pdf_claim, PDFCircuitInput};

// In your Solana program
pub fn verify_pdf_on_chain(
    ctx: Context<VerifyPDF>,
    pdf_data: Vec<u8>,
    page: u32,
    offset: usize,
    substring: String,
) -> Result<()> {
    // Use zkpdf_lib for verification
    let input = PDFCircuitInput {
        pdf_bytes: pdf_data,
        page_number: page,
        offset,
        substring,
    };
    
    let result = verify_pdf_claim(input)
        .map_err(|_| ErrorCode::VerificationFailed)?;
    
    require!(result.verified, ErrorCode::ProofInvalid);
    
    // Store result on-chain
    ctx.accounts.proof_account.verified = true;
    Ok(())
}
```

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [zkpdf_lib Documentation](../zkpdf_lib/README.md)

## License

MIT License - See [COPYING](../COPYING) for details.

## Contributing

This Solana program is part of the broader blockchain verification ecosystem in this repository. It provides Solana-based zero-knowledge proof capabilities that complement the existing zkpdf_lib. See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review test examples in `tests/`
