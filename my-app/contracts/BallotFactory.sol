// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./Ballot.sol";

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';

contract BallotFactory is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    struct Voter {
        bool voted;
        uint vote;
    }

    Ballot[] public ballots;
    bytes32 private jobId;
    uint public start;
    uint public end;
    uint private fee;

    event RequestEta(bytes32 indexed requestId, uint end, uint start);

    constructor() {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        jobId = 'ca98366cc7314957b8c012c72f05aeeb';
        fee = (1 * LINK_DIVISIBILITY) / 10;
    }

    function request() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        req.add('get', 'api here');
        req.add('endPath', 'data,UnixSecondsArrivalTime');
        req.add('startPath', 'data,UnixSecondsStartTime');
        req.addInt('times', 1);
        return sendChainlinkRequest(req, fee);
    }
    
    function fulfill(bytes32 _requestId, uint _end, uint _start) public recordChainlinkFulfillment(_requestId) {
        emit RequestEta(_requestId, _end, _start);
        end = _end;
        start = _start;
    }

    function viewEta() public view returns (uint, uint) {
        return (end, start);
    }
    
    function create2(bytes32 _salt) public {
        Ballot ballot = (new Ballot){salt: _salt}(end, start);
        ballots.push(ballot);
    }

    function getBallot(uint _index) public view returns (
        address ballotAddress,
        uint winningProposal_,
        string memory winnerName_) {
        Ballot ballot = ballots[_index];
        return (ballot.ballotAddress(),
            ballot.winningProposal(), 
            ballot.winnerName());
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
        return (ballot.ballotAddress(), 
            ballot.winningProposal(), 
            ballot.winnerName(), 
            ballot.ballotVoters(), 
            ballot.ballotVotersInfo(), 
            amountOfBallots);
    }

    function voteCurrentBallot(uint _vote) public {
        uint length = ballots.length - 1;
        address user = msg.sender;
        Ballot ballot = ballots[length];
        ballot.vote(_vote, user);
    }
}