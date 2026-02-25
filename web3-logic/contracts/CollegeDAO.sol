// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CollegeDAO is Ownable {
    IERC20 public voteToken;

    enum VotingType { TOKEN_WEIGHTED, QUADRATIC }

    struct ProposalConfig {
        uint256 minTokensToPropose;
        uint256 proposalFee;
        bool feeRefundable;
    }

    struct Proposal {
        string ipfsHash;
        uint256 amount;
        address payable recipient;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
        address proposer;
        VotingType votingType;
        uint256 feePaid;
    }

    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public voted;
    mapping(uint256 => mapping(address => uint256)) public tokensUsed; // For quadratic

    ProposalConfig public config;

    event ProposalCreated(uint256 id, string ipfsHash, uint256 amount, address recipient, uint256 deadline, VotingType votingType);
    event Voted(uint256 id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 id, bool success);

    constructor(address _voteToken) Ownable(msg.sender) {
        voteToken = IERC20(_voteToken);
        config = ProposalConfig(100 * 10**18, 0.01 ether, true); // Default config
    }

    function setConfig(uint256 _minTokens, uint256 _fee, bool _refundable) external onlyOwner {
        config = ProposalConfig(_minTokens, _fee, _refundable);
    }

    function createProposal(
        string memory _ipfsHash,
        uint256 _amount,
        address payable _recipient,
        uint256 _duration,
        VotingType _votingType
    ) external payable {
        require(voteToken.balanceOf(msg.sender) >= config.minTokensToPropose, "Insufficient governance tokens");
        
        if (config.proposalFee > 0) {
            require(msg.value == config.proposalFee, "Incorrect proposal fee");
        }

        proposals.push(
            Proposal({
                ipfsHash: _ipfsHash,
                amount: _amount,
                recipient: _recipient,
                yesVotes: 0,
                noVotes: 0,
                deadline: block.timestamp + _duration,
                executed: false,
                proposer: msg.sender,
                votingType: _votingType,
                feePaid: msg.value
            })
        );
        emit ProposalCreated(proposals.length - 1, _ipfsHash, _amount, _recipient, block.timestamp + _duration, _votingType);
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function vote(uint256 id, bool support, uint256 tokenAmount) external {
        require(id < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[id];
        require(block.timestamp <= p.deadline, "Voting closed");
        require(!voted[id][msg.sender], "Already voted"); // Simple single vote for now

        uint256 weight = 0;

        if (p.votingType == VotingType.TOKEN_WEIGHTED) {
            weight = voteToken.balanceOf(msg.sender);
            require(weight > 0, "No voting rights");
        } else {
            // Quadratic: User must "commit" usage. 
            // In a real system, we transferFrom. 
            // For this design, let's assume 'tokenAmount' is what they want to use.
            // require(tokenAmount > 0, "Must commit tokens");
            // voteToken.transferFrom(msg.sender, address(this), tokenAmount);
            // tokensUsed[id][msg.sender] = tokenAmount;
            
            // SIMPLIFIED MVP: Just use balance square root without transfer
            // This prevents "losing" tokens but still counts as Q-voting logic
            // "Quadratic Voting" usually means Cost = Votes^2. 
            // If "Power = Sqrt(Balance)", that's "Quadratic Influence"
            // The prompt says: "Voting Power = Sqrt(ERC-20 balance used)"
            // I will implement "Power = Sqrt(Balance)" to keep it frictionless for MVP unless Transfer is strictly needed
            
            // Prompt: "Quadratic Voting: voting power = √(ERC-20 balance used for that proposal)"
            // "token.transferFrom(msg.sender, address(this), tokensUsed);" in logic snippet
            // OK, I will implement transfer.
            require(tokenAmount > 0, "Must commit tokens");
            voteToken.transferFrom(msg.sender, address(this), tokenAmount);
            weight = sqrt(tokenAmount);
        }

        voted[id][msg.sender] = true;
        
        if (support) {
            p.yesVotes += weight;
        } else {
            p.noVotes += weight;
        }
        
        emit Voted(id, msg.sender, support, weight);
    }

    function execute(uint256 id) external {
        Proposal storage p = proposals[id];
        require(block.timestamp > p.deadline, "Voting active");
        require(!p.executed, "Executed");
        
        p.executed = true;

        if (p.yesVotes > p.noVotes) {
            (bool success, ) = p.recipient.call{value: p.amount}("");
            require(success, "Transfer failed"); 
            emit ProposalExecuted(id, true);
        } else {
            emit ProposalExecuted(id, false);
        }

        // Refund Fee logic
        if (config.feeRefundable && p.feePaid > 0 && p.yesVotes > p.noVotes) {
            payable(p.proposer).transfer(p.feePaid);
        } else if (p.feePaid > 0) {
             // Keep fee in treasury (this contract)
        }
    }

    function getProposalsCount() external view returns (uint256) {
        return proposals.length;
    }

    receive() external payable {}
}
