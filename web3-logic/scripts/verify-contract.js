// scripts/verify-contract.js
// ──────────────────────────────────────────────
// After deploying EventDAO, run this to verify it's live on-chain.
// It creates a test proposal and reads it back.
//
// Usage:
//   set CONTRACT_ADDRESS=0xYourDeployedAddress
//   npx hardhat run scripts/verify-contract.js --network quaiTestnet
// ──────────────────────────────────────────────
const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ Set CONTRACT_ADDRESS env variable first.");
    console.error("   Example: set CONTRACT_ADDRESS=0x1234...");
    process.exit(1);
  }

  const [signer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("══════════════════════════════════════════════");
  console.log("  CONTRACT VERIFICATION");
  console.log("══════════════════════════════════════════════");
  console.log("  Network      :", hre.network.name);
  console.log("  Chain ID     :", network.chainId.toString());
  console.log("  Contract     :", contractAddress);
  console.log("  Your wallet  :", signer.address);
  console.log("══════════════════════════════════════════════\n");

  // Attach to the deployed contract
  const EventDAO = await hre.ethers.getContractFactory("EventDAO");
  const dao = EventDAO.attach(contractAddress);

  // Read current proposal count
  const countBefore = await dao.getProposalCount();
  console.log("📊 Current proposal count:", countBefore.toString());

  // Create a test proposal (1 hour voting)
  console.log("\n📝 Creating test proposal...");
  const tx = await dao.createProposal(
    "Test Proposal from CLI",
    "QmTestCID1234567890",
    3600 // 1 hour
  );
  const receipt = await tx.wait();
  console.log("✅ Proposal created!");
  console.log("   Transaction hash :", receipt.hash);
  console.log("   Block number     :", receipt.blockNumber);
  console.log("   Gas used         :", receipt.gasUsed.toString());

  // Read back the proposal
  const countAfter = await dao.getProposalCount();
  const proposal = await dao.getProposal(countAfter);

  console.log("\n📋 Proposal details on-chain:");
  console.log("   ID        :", proposal.id.toString());
  console.log("   Title     :", proposal.title);
  console.log("   IPFS CID  :", proposal.ipfsCID);
  console.log("   Proposer  :", proposal.proposer);
  console.log("   Yes Votes :", proposal.yesVotes.toString());
  console.log("   No Votes  :", proposal.noVotes.toString());
  console.log("   Finalized :", proposal.finalized);

  const statusLabels = ["Active", "Approved", "Rejected"];
  console.log("   Status    :", statusLabels[Number(proposal.status)]);

  // Vote YES on it
  console.log("\n  Casting YES vote...");
  const voteTx = await dao.vote(countAfter, true);
  const voteReceipt = await voteTx.wait();
  console.log("✅ Vote cast!");
  console.log("   Transaction hash :", voteReceipt.hash);
  console.log("   Gas used         :", voteReceipt.gasUsed.toString());

  // Confirm vote recorded
  const hasVoted = await dao.hasVoted(countAfter, signer.address);
  console.log("   Vote recorded    :", hasVoted);

  // Print explorer links
  console.log("\n══════════════════════════════════════════════");
  console.log("  🔗 VIEW TRANSACTIONS ON EXPLORER");
  console.log("══════════════════════════════════════════════");

  let explorerBase;
  if (hre.network.name === "quaiTestnet") {
    explorerBase = "https://cyprus1.colosseum.quaiscan.io";
  } else if (hre.network.name === "quaiMainnet") {
    explorerBase = "https://cyprus1.quaiscan.io";
  }

  if (explorerBase) {
    console.log(`  Contract  : ${explorerBase}/address/${contractAddress}`);
    console.log(`  Create TX : ${explorerBase}/tx/${receipt.hash}`);
    console.log(`  Vote TX   : ${explorerBase}/tx/${voteReceipt.hash}`);
  } else {
    console.log("  (Local network — no explorer available)");
  }
  console.log("══════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
