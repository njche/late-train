import React, { useEffect } from 'react'
import { userVoteYes, userVoteNo, whoWon, initialized, factoryContract } from './Web3'

function Vote() {

  useEffect(() => {

  }, [])

  return (
      <div className="Vote-current">
        <h1 className="Vote-header">
          Vote
        </h1>
          {
            initialized === true ? <div className="Vote-child">            
              <button className="Vote-button-yes" onClick={() => userVoteYes()}>Yes</button>
              <button className="Vote-button-no" onClick={() => userVoteNo()}>No</button>
              <div>
                Votes for Yes
                <div>
                  X votes
                </div>
              </div>
              <div>
                Votes for No
                <div>
                  X votes
                </div>
              </div>
              <button className="Vote-button-no" onClick={() => whoWon()}>whowon</button>
            </div> 
            : 
            <div className="Trip-child">            
              Connect wallet with MetaMask to vote on the Ethereum blockchain.
            </div>
          }
      </div>
  )
}

export default Vote