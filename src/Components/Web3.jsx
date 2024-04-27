import Web3 from "web3";

let selectedAccount

let factoryContract

export let voteCount

export let initialized

export const Web3Client = async () => {
    initialized = false;
    let provider = window.ethereum
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
    
    if (!provider) {
        console.log('Web3 not avaible on this browser')
    } else {
        initialized = true
        const networkId = await web3.eth.net.getId()
        factoryContract = new web3.eth.Contract([
            {
                "inputs": [],
                "stateMutability": "payable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "bytes32",
                        "name": "id",
                        "type": "bytes32"
                    }
                ],
                "name": "ChainlinkCancelled",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "bytes32",
                        "name": "id",
                        "type": "bytes32"
                    }
                ],
                "name": "ChainlinkFulfilled",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "bytes32",
                        "name": "id",
                        "type": "bytes32"
                    }
                ],
                "name": "ChainlinkRequested",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "create2",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "deposit",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "bytes32",
                        "name": "requestId_",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "end",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "start",
                        "type": "uint256"
                    }
                ],
                "name": "fulfill",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "bytes",
                        "name": "",
                        "type": "bytes"
                    }
                ],
                "name": "performUpkeep",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "request",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "requestId",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "bytes32",
                        "name": "requestId",
                        "type": "bytes32"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "s_end",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "s_start",
                        "type": "uint256"
                    }
                ],
                "name": "RequestEta",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint8",
                        "name": "_vote",
                        "type": "uint8"
                    }
                ],
                "name": "voteCurrentBallot",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "stateMutability": "payable",
                "type": "receive"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "ballots",
                "outputs": [
                    {
                        "internalType": "contract Ballot",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "bytes",
                        "name": "",
                        "type": "bytes"
                    }
                ],
                "name": "checkUpkeep",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "upkeepNeeded",
                        "type": "bool"
                    },
                    {
                        "internalType": "bytes",
                        "name": "",
                        "type": "bytes"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_index",
                        "type": "uint256"
                    }
                ],
                "name": "getBallotByIndex",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "ballotAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "winningProposal_",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "winnerName_",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getCurrentBallot",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "ballotAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "winningProposal_",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "winnerName_",
                        "type": "string"
                    },
                    {
                        "internalType": "address[]",
                        "name": "ballotVoters_",
                        "type": "address[]"
                    },
                    {
                        "internalType": "bytes[]",
                        "name": "ballotVotersInfo_",
                        "type": "bytes[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amountOfBallots",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getCurrentBallotVotes",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "yesVotes",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "noVotes",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "s_end",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "s_needBallot",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "s_start",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "viewEta",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ], "0xe24dA855408125ECF51280781F56BdDD2b7735F2")
    }
}

export const userVoteYes = async () => {
    if (!initialized) {
        await Web3Client()
    }

    factoryContract.methods
    .voteCurrentBallot(0)
    .send({ from: selectedAccount })
}

export const userVoteNo = async () => {
    if (!initialized) {
        await Web3Client()
    }

    factoryContract.methods
    .voteCurrentBallot(1)
    .send({ from: selectedAccount })
}

export const howManyVotes = async () => {
    if (!initialized) {
        await Web3Client()
    }

    factoryContract.methods
    .getCurrentBallotVotes()
    .call((error, result) => {
        if (error) {
            console.log(error)
        } else {
            voteCount = result
            return voteCount
        }
    })
}

