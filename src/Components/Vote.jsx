import React, { useEffect, useState, useContext } from 'react'
import { timeContext } from "../Contexts/TimeContext"
import { userVoteYes, userVoteNo, initialized, howManyVotes, voteCount } from './Web3'

function Vote() {
  const [time] = useContext(timeContext)
  const [votesYes, setVotesYes] = useState('0')
  const [votesNo, setVotesNo] = useState('0')

  useEffect(() => {
    const displayVotes = (async () => {
        await howManyVotes()
        console.log(voteCount)
        setVotesYes(voteCount.yesVotes)
        setVotesNo(voteCount.noVotes)
    })

    displayVotes()
    
  }, [voteCount])

  return (
      <div className="Vote-current">
        <h1 className="Vote-header">
          Vote
        </h1>
          {
            initialized === true ? <div className="Vote-child">            
              <button className="Vote-button-yes" onClick={() => userVoteYes()}>Yes</button>
              <div className="Vote-amount">
                {votesYes} Vote(s)
              </div>
              <button className="Vote-button-no" onClick={() => userVoteNo()}>No</button>
              <div className="Vote-amount">
                {votesNo} Vote(s)
              </div>
            </div> 
            : 
            <div className="Trip-child">            
              Connect wallet with MetaMask to vote on the Goerli Ethereum Testnet.
            </div>
          }
      </div>
  )
}

export default Vote