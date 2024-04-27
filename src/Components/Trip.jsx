import React, { useContext, useEffect, useState } from 'react'
import { stopContext } from '../Contexts/StopContext'
import { statusContext } from '../Contexts/StatusContext'
import '../Styles/App.css'

function Trip() {
    const [status] = useContext(statusContext)
    const [stops] = useContext(stopContext)
    const [duration, setDuration] = useState('')

    const tripDuration = async () => {
      const response = await fetch(import.meta.env.VITE_REACT_APP_API_HOST + '/time')
      const json = await response.json()
      setDuration(json.data)
      setTimeout(tripDuration, 1000)
    }

    useEffect(() => {
      tripDuration()
    }, [])

    return(
        <div className="Trip-current">
          <h1 className="Trip-header">
            Current trip
          </h1>
            {status != 'Active' ? <div>
              Waiting for departure
            </div>: 
            <div className="Trip-child">
              <p>Trip Active</p>
              Duration: {duration.durationHours < 10 ? "0" + duration.durationHours : duration.durationHours}:
                  {duration.durationMinutes < 10 ? "0" + duration.durationMinutes : duration.durationMinutes}:
                  {duration.durationSeconds < 10 ? "0" + duration.durationSeconds : duration.durationSeconds}
            </div>
            }
          <div className="Trip-child">
            Stops: {stops.length !== undefined ? stops.map((stop) => <div className="Stops">{stop.name}</div>) : <div>Loading</div>}
          </div>
        </div>
    )
}

export default Trip