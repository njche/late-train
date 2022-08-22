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
    mapping(uint => address) public addresses;
    uint addressCount;

    Proposal[] public proposals;

    constructor() payable {

        proposals.push(Proposal({
            name: "Yes",
            voteCount: 0
        }));

        proposals.push(Proposal({
            name: "No",
            voteCount: 0
        }));

        proposals.push(Proposal({
            name: "Tie",
            voteCount: 0
        }));
    }

    function ballotAddress() public view returns (address) {
        return address(this);
    }

    function vote(uint proposal, address user) public {
        Voter storage sender = voters[user];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        require(sender.vote < 2, "Vote only yes or no.");
        addresses[addressCount] = user;
        addressCount += 1;
        proposals[proposal].voteCount += 1;
    }
    
    function ballotVoters() public view returns (address[] memory) {
        require(addressCount > 0, "No addresses have voted yet.");
        address[] memory voterArray = new address[](addressCount);
        for (uint i = 0; i < addressCount; i++) {
            voterArray[i] = addresses[i];
        }
        return voterArray;
    }

    function toBytes(uint256 x) private pure returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }

    function ballotVotersInfo() public view returns (bytes[] memory) {
        bytes[] memory voterInfo = new bytes[](addressCount);
        for (uint i = 0; i < addressCount; i++) {
            voterInfo[i] = toBytes(voters[addresses[i]].vote);
        }
        return voterInfo;
    }

    function winningProposal() public view
            returns (uint winningProposal_) {
        uint winningVoteCount = proposals[0].voteCount;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount != 0) {
                if (proposals[p].voteCount > winningVoteCount) {
                    winningVoteCount = proposals[p].voteCount;
                    winningProposal_ = p;
                }
            }
        }
        if (winningVoteCount == 0) {
            winningProposal_ = proposals.length - 1;
        }
    }

    function winnerName() public view
            returns (string memory winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
}

contract BallotFactory {

    struct Voter {
        bool voted;
        uint vote;
    }

    Ballot[] public ballots;
    
    function create2AndSendEther(bytes32 _salt) public payable {
        Ballot ballot = (new Ballot){value: msg.value, salt: _salt}();
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
        string memory winnerName_,
        address[] memory ballotVoters_,
        bytes[] memory ballotVotersInfo_,
        uint amountOfBallots) {
        uint length = ballots.length - 1;
        amountOfBallots = ballots.length;
        Ballot ballot = ballots[length];
        return (ballot.ballotAddress(), ballot.winningProposal(), ballot.winnerName(), ballot.ballotVoters(), ballot.ballotVotersInfo(), amountOfBallots);
    }

    function voteCurrentBallot(uint _vote) public {
        uint length = ballots.length - 1;
        address user = msg.sender;
        Ballot ballot = ballots[length];
        ballot.vote(_vote, user);
    }
}