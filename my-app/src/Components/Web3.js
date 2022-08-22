import Web3 from "web3";
import BallotContractBuild from 'contracts/Ballot.json'
import BallotFactoryContractBuild from 'contracts/BallotFactory.json'

let selectedAccount;

let factoryContract;

export let initialized = false;

export const Web3Client = async () => {
    let provider = window.ethereum;
    if (typeof provider !== 'undefined') {
        provider
            .request({ method: 'eth_requestAccounts' })
            .then(accounts => {
                selectedAccount = accounts[0]
                console.log(`selectedAccount is ${accounts[0]}`)
            })
            .catch((err) => {
                console.log(err)
                return
            });
        window.ethereum.on('accountsChanged', function (accounts) {
            console.log(`current account is ${accounts[0]}`)
        })
    }
    const web3 = new Web3(provider)

    console.log(BallotContractBuild.networks)
    console.log(BallotFactoryContractBuild.networks)
    
    if (!provider) {
        initialized = false;
        console.log('Web3 not avaible on this browser')
    } else {
        const networkId = await web3.eth.net.getId()
        factoryContract = new web3.eth.Contract(BallotFactoryContractBuild.abi, "0x08Cf814FC5AfFB4D910E422F076431fC80b957f1");
        console.log(BallotFactoryContractBuild.networks)
        console.log(BallotFactoryContractBuild.updatedAt)
        console.log(factoryContract.methods)
        initialized = true;
    }
}

export const userVoteYes = async () => {
    if (!initialized) {
        await Web3Client()
    }

    factoryContract.methods
    .voteCurrentBallot(0)
    .send({ from: selectedAccount });
}

export const userVoteNo = async () => {
    if (!initialized) {
        await Web3Client()
    }

    factoryContract.methods
    .voteCurrentBallot(1)
    .send({ from: selectedAccount });
}

export const whoWon = async () => {
    if (!initialized) {
        await Web3Client()
    }

    console.log(factoryContract.methods
    .getCurrentBallot()
    .send({ from: selectedAccount }))
}

