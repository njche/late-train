// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

// import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

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
    address creator;
    bool closed;
    bool active;
    uint addressCount;
    uint start;
    uint end;
    Proposal[] public proposals;

    constructor(uint start_, uint end_) {
        closed = false;
        active = false;
        creator = msg.sender;
        start = start_;
        end = end_;

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

    function vote(uint proposal, address user) public {
        require(closed == true, "Voting is closed.");
        Voter storage sender = voters[user];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        require(sender.vote < 2, "Vote only yes or no.");
        addresses[addressCount] = user;
        addressCount += 1;
        proposals[proposal].voteCount += 1;
    }

    function ballotAddress() public view returns (address) {
        return address(this);
    }
    
    function ballotVoters() public view returns (address[] memory) {
        require(addressCount > 0, "No addresses have voted yet.");
        address[] memory voterArray = new address[](addressCount);
        for (uint i = 0; i < addressCount; i++) {
            voterArray[i] = addresses[i];
        }
        return voterArray;
    }

    function ballotVotersInfo() public view returns (bytes[] memory) {
        bytes[] memory voterInfo = new bytes[](addressCount);
        for (uint i = 0; i < addressCount; i++) {
            voterInfo[i] = toBytes(voters[addresses[i]].vote);
        }
        return voterInfo;
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = proposals[0].voteCount;

        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount != 0) {
                if (proposals[p].voteCount > winningVoteCount) {
                    winningVoteCount = proposals[p].voteCount;
                    winningProposal_ = p;
                }
            }
        }

        if (proposals[0].voteCount == proposals[1].voteCount) {
            winningProposal_ = proposals.length - 1;
        }

        if (winningVoteCount == 0) {
            winningProposal_ = proposals.length - 1;
        }
    }

    function winnerName() public view returns (string memory winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    function toBytes(uint256 x) private pure returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }
}