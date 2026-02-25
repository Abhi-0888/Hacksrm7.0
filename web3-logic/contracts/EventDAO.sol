// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  EventDAO
 * @notice Fully on-chain DAO for event proposal creation, voting, and
 *         finalization.  Designed for deployment on Quai Network.
 *
 * @dev    - One vote per wallet per proposal (msg.sender identity).
 *         - Proposal descriptions are stored as IPFS CIDs to keep
 *           calldata small and gas costs low.
 *         - No ownership backdoors; no upgradeability.
 */
contract EventDAO {
    // ───────────────────── Enums ─────────────────────
    enum ProposalStatus {
        Active,
        Approved,
        Rejected
    }

    // ───────────────────── Structs ───────────────────
    struct Proposal {
        uint256 id;
        address proposer;
        string  title;
        string  ipfsCID;        // IPFS content-identifier for full description
        uint256 yesVotes;
        uint256 noVotes;
        uint256 voteEndTime;
        bool    finalized;
        ProposalStatus status;
    }

    // ───────────────────── State ─────────────────────
    uint256 public proposalCount;

    /// @dev proposalId => Proposal
    mapping(uint256 => Proposal) private proposals;

    /// @dev proposalId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) private hasVotedMapping;

    // ───────────────────── Events ────────────────────
    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        string  title,
        string  ipfsCID,
        uint256 voteEndTime
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool    support
    );

    event ProposalFinalized(
        uint256 indexed proposalId,
        ProposalStatus  status
    );

    // ───────────────────── Modifiers ─────────────────
    modifier validProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "EventDAO: invalid proposal ID");
        _;
    }

    // ═════════════════════════════════════════════════
    //              WRITE FUNCTIONS
    // ═════════════════════════════════════════════════

    /**
     * @notice Create a new event proposal.
     * @param  _title       Short human-readable title (stored on-chain).
     * @param  _ipfsCID     IPFS CID pointing to the full proposal description.
     * @param  _votingDuration  Duration in seconds for which voting stays open.
     * @return proposalId   The ID assigned to this proposal.
     */
    function createProposal(
        string calldata _title,
        string calldata _ipfsCID,
        uint256 _votingDuration
    ) external returns (uint256 proposalId) {
        require(bytes(_title).length > 0, "EventDAO: title cannot be empty");
        require(bytes(_ipfsCID).length > 0, "EventDAO: IPFS CID cannot be empty");
        require(_votingDuration > 0, "EventDAO: voting duration must be > 0");

        proposalCount++;
        proposalId = proposalCount;

        proposals[proposalId] = Proposal({
            id:          proposalId,
            proposer:    msg.sender,
            title:       _title,
            ipfsCID:     _ipfsCID,
            yesVotes:    0,
            noVotes:     0,
            voteEndTime: block.timestamp + _votingDuration,
            finalized:   false,
            status:      ProposalStatus.Active
        });

        emit ProposalCreated(proposalId, msg.sender, _title, _ipfsCID, block.timestamp + _votingDuration);
    }

    /**
     * @notice Cast a vote on an active proposal.
     * @param  _proposalId  The proposal to vote on.
     * @param  _support     true = YES, false = NO.
     */
    function vote(uint256 _proposalId, bool _support)
        external
        validProposal(_proposalId)
    {
        Proposal storage p = proposals[_proposalId];

        require(!p.finalized, "EventDAO: proposal already finalized");
        require(block.timestamp <= p.voteEndTime, "EventDAO: voting period has ended");
        require(!hasVotedMapping[_proposalId][msg.sender], "EventDAO: already voted");

        hasVotedMapping[_proposalId][msg.sender] = true;

        if (_support) {
            p.yesVotes++;
        } else {
            p.noVotes++;
        }

        emit VoteCast(_proposalId, msg.sender, _support);
    }

    /**
     * @notice Finalize a proposal after its voting deadline.
     *         Anyone can call this – no privileged role required.
     * @param  _proposalId  The proposal to finalize.
     */
    function finalizeProposal(uint256 _proposalId)
        external
        validProposal(_proposalId)
    {
        Proposal storage p = proposals[_proposalId];

        require(!p.finalized, "EventDAO: proposal already finalized");
        require(block.timestamp > p.voteEndTime, "EventDAO: voting period not yet ended");

        p.finalized = true;

        if (p.yesVotes > p.noVotes) {
            p.status = ProposalStatus.Approved;
        } else {
            p.status = ProposalStatus.Rejected;
        }

        emit ProposalFinalized(_proposalId, p.status);
    }

    // ═════════════════════════════════════════════════
    //              READ / VIEW FUNCTIONS
    // ═════════════════════════════════════════════════

    /**
     * @notice Retrieve full details of a proposal.
     */
    function getProposal(uint256 _proposalId)
        external
        view
        validProposal(_proposalId)
        returns (Proposal memory)
    {
        return proposals[_proposalId];
    }

    /**
     * @notice Return the total number of proposals created.
     */
    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }

    /**
     * @notice Check whether a wallet has already voted on a proposal.
     */
    function hasVoted(uint256 _proposalId, address _voter)
        external
        view
        validProposal(_proposalId)
        returns (bool)
    {
        return hasVotedMapping[_proposalId][_voter];
    }
}
