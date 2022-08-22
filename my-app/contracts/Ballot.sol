// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

contract Ballot {
   
    struct Voter {
        bool voted;
        uint vote;
    }

    struct Proposal {
        string name;
        uint voteCount;
    }

    mapping(address => Voter) public voters;

    Proposal[] public proposals;

    constructor(string[] memory proposalNames) payable {

        for (uint i = 0; i < proposalNames.length; i++) {
            // 'Proposal({...})' creates a temporary
            // Proposal object and 'proposals.push(...)'
            // appends it to the end of 'proposals'.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function ballotAddress() public view returns (address) {
        return address(this);
    }

    function vote(uint proposal) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += 1;
    }

    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() public view
            returns (string memory winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}

contract BallotFactory {

    Ballot[] public ballots;
    
    function create2AndSendEther(string[] memory _proposals, bytes32 _salt) public payable {
        Ballot ballot = (new Ballot){value: msg.value, salt: _salt}(_proposals);
        ballots.push(ballot);
    }

    function getBallot(uint _index) public view returns (
        address ballotAddress,
        uint winningProposal_,
        string memory winnerName_) {
        
        Ballot ballot = ballots[_index];
        return (ballot.ballotAddress(), ballot.winningProposal(), ballot.winnerName());
    }

    function getCurrentBallot() public view returns (
        address ballotAddress,
        uint winningProposal_,
        string memory winnerName_) {
        uint length = ballots.length - 1;

        Ballot ballot = ballots[length];
        return (ballot.ballotAddress(), ballot.winningProposal(), ballot.winnerName());
    }

    function voteCurrentBallot(uint _vote) public {
        uint length = ballots.length - 1;
        
        Ballot ballot = ballots[length];
        ballot.vote(_vote);
    }
}