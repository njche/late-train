const Ballot = artifacts.require("Ballot");
const BallotFactory = artifacts.require("BallotFactory");

module.exports = function(deployer) {
  // deployer.deploy(Ballot, ["yes","no"]);
  deployer.deploy(BallotFactory);
};
