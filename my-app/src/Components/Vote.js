import React, { useEffect, useState, useContext } from 'react'
import { userVoteYes, userVoteNo, initialized, howManyVotes, voteCount } from './Web3'
import { timeContext } from "../Contexts/TimeContext"

function Vote() {
  const [time] = useContext(timeContext)
  const [votesYes, setVotesYes] = useState('')
  const [votesNo, setVotesNo] = useState('')

  howManyVotes()

  useEffect(() => {
    const displayVotes = (() => {
      setVotesYes(voteCount.yesVotes)
      setVotesNo(voteCount.noVotes)
    })
    if (initialized == true) {
      displayVotes()
    }
  }, [time])

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