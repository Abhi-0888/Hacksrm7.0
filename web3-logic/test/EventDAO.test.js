// test/EventDAO.test.js
const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { time }    = require("@nomicfoundation/hardhat-network-helpers");

describe("EventDAO", function () {
  let eventDAO;
  let owner, voter1, voter2;

  const TITLE    = "Campus Music Festival";
  const IPFS_CID = "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy";
  const ONE_DAY  = 86400; // seconds

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    const EventDAO = await ethers.getContractFactory("EventDAO");
    eventDAO = await EventDAO.deploy();
    await eventDAO.waitForDeployment();
  });

  // ───────── Proposal Creation ─────────

  describe("createProposal", function () {
    it("should create a proposal and emit ProposalCreated", async function () {
      const tx = await eventDAO.createProposal(TITLE, IPFS_CID, ONE_DAY);
      const receipt = await tx.wait();

      expect(await eventDAO.getProposalCount()).to.equal(1n);

      const proposal = await eventDAO.getProposal(1);
      expect(proposal.title).to.equal(TITLE);
      expect(proposal.ipfsCID).to.equal(IPFS_CID);
      expect(proposal.proposer).to.equal(owner.address);
      expect(proposal.finalized).to.equal(false);
    });

    it("should reject empty title", async function () {
      await expect(
        eventDAO.createProposal("", IPFS_CID, ONE_DAY)
      ).to.be.revertedWith("EventDAO: title cannot be empty");
    });

    it("should reject empty IPFS CID", async function () {
      await expect(
        eventDAO.createProposal(TITLE, "", ONE_DAY)
      ).to.be.revertedWith("EventDAO: IPFS CID cannot be empty");
    });

    it("should reject zero voting duration", async function () {
      await expect(
        eventDAO.createProposal(TITLE, IPFS_CID, 0)
      ).to.be.revertedWith("EventDAO: voting duration must be > 0");
    });
  });

  // ───────── Voting ─────────

  describe("vote", function () {
    beforeEach(async function () {
      await eventDAO.createProposal(TITLE, IPFS_CID, ONE_DAY);
    });

    it("should allow a wallet to vote YES", async function () {
      await eventDAO.connect(voter1).vote(1, true);

      const proposal = await eventDAO.getProposal(1);
      expect(proposal.yesVotes).to.equal(1n);
      expect(proposal.noVotes).to.equal(0n);
      expect(await eventDAO.hasVoted(1, voter1.address)).to.be.true;
    });

    it("should allow a wallet to vote NO", async function () {
      await eventDAO.connect(voter1).vote(1, false);

      const proposal = await eventDAO.getProposal(1);
      expect(proposal.yesVotes).to.equal(0n);
      expect(proposal.noVotes).to.equal(1n);
    });

    it("should prevent double voting", async function () {
      await eventDAO.connect(voter1).vote(1, true);
      await expect(
        eventDAO.connect(voter1).vote(1, true)
      ).to.be.revertedWith("EventDAO: already voted");
    });

    it("should prevent voting after deadline", async function () {
      await time.increase(ONE_DAY + 1);
      await expect(
        eventDAO.connect(voter1).vote(1, true)
      ).to.be.revertedWith("EventDAO: voting period has ended");
    });

    it("should prevent voting on finalized proposal", async function () {
      await time.increase(ONE_DAY + 1);
      await eventDAO.finalizeProposal(1);
      await expect(
        eventDAO.connect(voter1).vote(1, true)
      ).to.be.revertedWith("EventDAO: proposal already finalized");
    });
  });

  // ───────── Finalization ─────────

  describe("finalizeProposal", function () {
    beforeEach(async function () {
      await eventDAO.createProposal(TITLE, IPFS_CID, ONE_DAY);
    });

    it("should finalize as Approved when yesVotes > noVotes", async function () {
      await eventDAO.connect(voter1).vote(1, true);
      await eventDAO.connect(voter2).vote(1, false);
      await eventDAO.connect(owner).vote(1, true);

      await time.increase(ONE_DAY + 1);
      await eventDAO.finalizeProposal(1);

      const proposal = await eventDAO.getProposal(1);
      expect(proposal.finalized).to.be.true;
      expect(proposal.status).to.equal(1); // Approved
    });

    it("should finalize as Rejected when noVotes >= yesVotes", async function () {
      await eventDAO.connect(voter1).vote(1, false);

      await time.increase(ONE_DAY + 1);
      await eventDAO.finalizeProposal(1);

      const proposal = await eventDAO.getProposal(1);
      expect(proposal.finalized).to.be.true;
      expect(proposal.status).to.equal(2); // Rejected
    });

    it("should reject finalization before deadline", async function () {
      await expect(
        eventDAO.finalizeProposal(1)
      ).to.be.revertedWith("EventDAO: voting period not yet ended");
    });

    it("should reject double finalization", async function () {
      await time.increase(ONE_DAY + 1);
      await eventDAO.finalizeProposal(1);
      await expect(
        eventDAO.finalizeProposal(1)
      ).to.be.revertedWith("EventDAO: proposal already finalized");
    });
  });

  // ───────── Read Functions ─────────

  describe("view functions", function () {
    it("should return correct proposal count", async function () {
      expect(await eventDAO.getProposalCount()).to.equal(0n);
      await eventDAO.createProposal(TITLE, IPFS_CID, ONE_DAY);
      expect(await eventDAO.getProposalCount()).to.equal(1n);
    });

    it("should revert for invalid proposal ID", async function () {
      await expect(eventDAO.getProposal(999)).to.be.revertedWith(
        "EventDAO: invalid proposal ID"
      );
    });
  });
});
