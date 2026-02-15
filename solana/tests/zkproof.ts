import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Zkproof } from "../target/types/zkproof";
import { assert } from "chai";
import { Keypair, SystemProgram } from "@solana/web3.js";

describe("zkproof", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Zkproof as Program<Zkproof>;
  const proofAccount = Keypair.generate();

  it("Initializes a proof account", async () => {
    await program.methods
      .initialize()
      .accounts({
        proofAccount: proofAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([proofAccount])
      .rpc();

    const account = await program.account.proofAccount.fetch(
      proofAccount.publicKey
    );

    assert.ok(account.authority.equals(provider.wallet.publicKey));
    assert.equal(account.verified, false);
    assert.equal(account.proofData.length, 0);
  });

  it("Submits a proof (prove)", async () => {
    const proofData = Buffer.from(
      "test-zero-knowledge-proof-data-at-least-32-bytes"
    );

    await program.methods
      .prove(proofData)
      .accounts({
        proofAccount: proofAccount.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.proofAccount.fetch(
      proofAccount.publicKey
    );

    assert.equal(account.verified, false);
    assert.ok(account.proofData.length > 0);
    assert.deepEqual(account.proofData, Array.from(proofData));
  });

  it("Finalizes and verifies the proof", async () => {
    await program.methods
      .finalize()
      .accounts({
        proofAccount: proofAccount.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.proofAccount.fetch(
      proofAccount.publicKey
    );

    // The proof should be verified since it meets minimum requirements
    assert.equal(account.verified, true);
  });

  it("Fails to prove with empty proof data", async () => {
    const newProofAccount = Keypair.generate();

    // Initialize new account
    await program.methods
      .initialize()
      .accounts({
        proofAccount: newProofAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newProofAccount])
      .rpc();

    // Try to submit empty proof
    try {
      await program.methods
        .prove(Buffer.from([]))
        .accounts({
          proofAccount: newProofAccount.publicKey,
          authority: provider.wallet.publicKey,
        })
        .rpc();
      assert.fail("Should have thrown error for empty proof data");
    } catch (err) {
      assert.ok(err.toString().includes("EmptyProofData"));
    }
  });

  it("Fails to finalize without proof data", async () => {
    const newProofAccount = Keypair.generate();

    // Initialize new account
    await program.methods
      .initialize()
      .accounts({
        proofAccount: newProofAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newProofAccount])
      .rpc();

    // Try to finalize without submitting proof
    try {
      await program.methods
        .finalize()
        .accounts({
          proofAccount: newProofAccount.publicKey,
          authority: provider.wallet.publicKey,
        })
        .rpc();
      assert.fail("Should have thrown error for no proof data");
    } catch (err) {
      assert.ok(err.toString().includes("NoProofData"));
    }
  });

  it("Complete workflow: initialize -> prove -> finalize", async () => {
    const workflowAccount = Keypair.generate();

    // Step 1: Initialize
    await program.methods
      .initialize()
      .accounts({
        proofAccount: workflowAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([workflowAccount])
      .rpc();

    let account = await program.account.proofAccount.fetch(
      workflowAccount.publicKey
    );
    assert.equal(account.verified, false);

    // Step 2: Prove
    const proofData = Buffer.from(
      "complete-workflow-proof-data-for-testing-purposes"
    );
    await program.methods
      .prove(proofData)
      .accounts({
        proofAccount: workflowAccount.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    account = await program.account.proofAccount.fetch(
      workflowAccount.publicKey
    );
    assert.equal(account.verified, false);
    assert.ok(account.proofData.length > 0);

    // Step 3: Finalize
    await program.methods
      .finalize()
      .accounts({
        proofAccount: workflowAccount.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    account = await program.account.proofAccount.fetch(
      workflowAccount.publicKey
    );
    assert.equal(account.verified, true);
  });
});
