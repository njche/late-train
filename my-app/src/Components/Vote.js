import React from 'react'
import { userVoteYes, userVoteNo, whoWon, initialized } from './Web3'

function Vote() {

  return (
      <div className="Vote-current">
        <h1 className="Vote-header">
          Vote
        </h1>
          {
            initialized === true ? <div className="Trip-child">            
              <button onClick={() => userVoteYes()}>Yes</button>
              <button onClick={() => userVoteNo()}>No</button>
              <button onClick={() => whoWon()}>Winner</button>
            </div> 
            : 
            <div className="Trip-child">            
              Connect wallet with MetaMask to vote on the Etheruem blockchain.
            </div>
          }
      </div>
  )
}

export default Vote