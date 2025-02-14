// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DataGovernanceDAO is ERC20 {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18; // 1M Tokens
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days; // Voting duration

    struct Proposal {
        string cid;
        address proposer;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted; // Track votes per proposal
    mapping(address => bool) public isMember; // Tracks DAO members

    event ProposalSubmitted(
        uint256 indexed proposalId,
        address indexed proposer,
        string cid
    );
    event Voted(uint256 indexed proposalId, address indexed voter, bool vote);
    event ProposalExecuted(uint256 indexed proposalId, bool success);
    event MemberAdded(address indexed newMember);

    constructor() ERC20("DataGovernanceToken", "DGT") {
        _mint(msg.sender, MAX_SUPPLY);
        isMember[msg.sender] = true; // Founder is first member
    }

    /// @dev Modifier to allow only DAO members to perform certain actions
    modifier onlyMember() {
        require(isMember[msg.sender], "Not a DAO member");
        _;
    }

    /// @dev Modifier to check if a proposal exists
    modifier proposalExists(uint256 _proposalId) {
        require(
            _proposalId > 0 && _proposalId <= proposalCount,
            "Proposal does not exist"
        );
        _;
    }

    /// @dev Adds a new member (Can be extended with governance rules)
    function addMember(address _newMember) external onlyMember {
        require(!isMember[_newMember], "Already a member");
        isMember[_newMember] = true;
        emit MemberAdded(_newMember);
    }

    /// @dev Submits a proposal (Only members can submit)
    function submitProposal(string memory _cid) external onlyMember {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            cid: _cid,
            proposer: msg.sender,
            yesVotes: 0,
            noVotes: 0,
            deadline: block.timestamp + votingPeriod,
            executed: false
        });

        emit ProposalSubmitted(proposalCount, msg.sender, _cid);
    }

    /// @dev Allows members to vote on proposals
    function vote(
        uint256 _proposalId,
        bool _vote
    ) external onlyMember proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(balanceOf(msg.sender) > 0, "Must hold tokens to vote");

        hasVoted[_proposalId][msg.sender] = true;

        if (_vote) {
            proposal.yesVotes += balanceOf(msg.sender);
        } else {
            proposal.noVotes += balanceOf(msg.sender);
        }

        emit Voted(_proposalId, msg.sender, _vote);
    }

    /// @dev Executes the proposal if it has enough votes
    function executeProposal(
        uint256 _proposalId
    ) external proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp >= proposal.deadline, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(proposal.yesVotes > proposal.noVotes, "Not enough support");

        proposal.executed = true;
        emit ProposalExecuted(_proposalId, true);
    }
}
