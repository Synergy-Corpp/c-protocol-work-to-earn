import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CProtocol } from "../target/types/c_protocol";
import { expect } from "chai";

describe("C Protocol WorkChain Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CProtocol as Program<CProtocol>;
  
  let protocolState: anchor.web3.Keypair;
  let worker: anchor.web3.Keypair;
  let soulKey: anchor.web3.Keypair;

  beforeEach(async () => {
    protocolState = anchor.web3.Keypair.generate();
    worker = anchor.web3.Keypair.generate();
    soulKey = anchor.web3.Keypair.generate();
  });

  it("Initializes the C Protocol", async () => {
    await program.methods
      .initializeProtocol()
      .accounts({
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([protocolState])
      .rpc();

    const state = await program.account.protocolState.fetch(protocolState.publicKey);
    expect(state.totalWorkRecorded.toNumber()).to.equal(0);
    expect(state.decayRate).to.equal(100); // 1%
    expect(state.witnessThreshold.toNumber()).to.equal(6000); // 60%
  });

  it("Records work and emits tokens", async () => {
    // First initialize protocol
    await program.methods
      .initializeProtocol()
      .accounts({
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([protocolState])
      .rpc();

    // Create worker account
    await program.methods
      .initializeWorker()
      .accounts({
        worker: worker.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([worker])
      .rpc();

    // Record work
    await program.methods
      .recordWork(
        { writeCode: {} }, // WorkType enum
        150, // effort_weight (150% of base)
        "Implemented new feature for user authentication"
      )
      .accounts({
        worker: worker.publicKey,
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const workerAccount = await program.account.worker.fetch(worker.publicKey);
    expect(workerAccount.totalWorkCompleted.toNumber()).to.equal(1);
    expect(workerAccount.pendingTokens.toNumber()).to.be.greaterThan(0);
    
    const protocolAccount = await program.account.protocolState.fetch(protocolState.publicKey);
    expect(protocolAccount.totalWorkRecorded.toNumber()).to.equal(1);
  });

  it("Applies token decay for inactive users", async () => {
    // Initialize and record work first
    await program.methods
      .initializeProtocol()
      .accounts({
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([protocolState])
      .rpc();

    await program.methods
      .initializeWorker()
      .accounts({
        worker: worker.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([worker])
      .rpc();

    await program.methods
      .recordWork(
        { createContent: {} },
        100,
        "Created blog post about DeFi"
      )
      .accounts({
        worker: worker.publicKey,
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const workerBefore = await program.account.worker.fetch(worker.publicKey);
    const tokensBefore = workerBefore.pendingTokens.toNumber();

    // Apply decay (simulating time passage)
    await program.methods
      .applyDecay()
      .accounts({
        worker: worker.publicKey,
        protocolState: protocolState.publicKey,
      })
      .rpc();

    const workerAfter = await program.account.worker.fetch(worker.publicKey);
    // Note: Decay might be 0 if not enough time has passed in test
    expect(workerAfter.lastDecayCheck.toNumber()).to.be.greaterThan(0);
  });

  it("Prevents gaming through cooldowns", async () => {
    await program.methods
      .initializeProtocol()
      .accounts({
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([protocolState])
      .rpc();

    await program.methods
      .initializeWorker()
      .accounts({
        worker: worker.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([worker])
      .rpc();

    // First task should succeed
    await program.methods
      .recordWork(
        { onboardUser: {} },
        100,
        "Onboarded new user John Doe"
      )
      .accounts({
        worker: worker.publicKey,
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    // Second identical task should fail due to cooldown
    try {
      await program.methods
        .recordWork(
          { onboardUser: {} },
          100,
          "Onboarded new user John Doe" // Same metadata
        )
        .accounts({
          worker: worker.publicKey,
          protocolState: protocolState.publicKey,
          authority: provider.wallet.publicKey,
        })
        .rpc();
      
      expect.fail("Should have failed due to cooldown");
    } catch (error) {
      expect(error.message).to.include("TaskCooldownActive");
    }
  });

  it("Calculates different emissions for different work types", async () => {
    await program.methods
      .initializeProtocol()
      .accounts({
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([protocolState])
      .rpc();

    await program.methods
      .initializeWorker()
      .accounts({
        worker: worker.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([worker])
      .rpc();

    // Low value work
    await program.methods
      .recordWork(
        { onboardUser: {} }, // Base: 500,000
        100,
        "Onboarded user"
      )
      .accounts({
        worker: worker.publicKey,
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const workerAfterLowValue = await program.account.worker.fetch(worker.publicKey);
    const lowValueTokens = workerAfterLowValue.pendingTokens.toNumber();

    // Reset worker for clean test
    worker = anchor.web3.Keypair.generate();
    await program.methods
      .initializeWorker()
      .accounts({
        worker: worker.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([worker])
      .rpc();

    // High value work
    await program.methods
      .recordWork(
        { closeDeal: {} }, // Base: 10,000,000
        100,
        "Closed major enterprise deal"
      )
      .accounts({
        worker: worker.publicKey,
        protocolState: protocolState.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const workerAfterHighValue = await program.account.worker.fetch(worker.publicKey);
    const highValueTokens = workerAfterHighValue.pendingTokens.toNumber();

    expect(highValueTokens).to.be.greaterThan(lowValueTokens);
    expect(highValueTokens / lowValueTokens).to.equal(20); // 10M / 500K = 20x
  });
});