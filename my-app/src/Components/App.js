import React, { useState, useEffect, useContext } from 'react'
import { stopContext } from '../Contexts/StopContext'
import { dateContext } from '../Contexts/DateContext'
import { statusContext } from '../Contexts/StatusContext'
import { timeContext } from '../Contexts/TimeContext'
import '../Styles/App.css'

function App() {
  const [stops, setStops] = useContext(stopContext)
  const [start, setStart] = useContext(dateContext)
  const [status, setStatus] = useContext(statusContext)
  const [time, setTime] = useContext(timeContext)
  const [duration, setDuration] = useState({})
  const [hour, setHour] = useState(0)
  
  const fetchTrip = async () => {   
    // API call for trip details
    const response = await fetch('http://localhost:8080/info');
    const json = await response.json()
    // Grabbing time for DateContext
    setStart({ origin: {
      plannedDateTime: json.data.legs[0].origin.plannedDateTime.slice(11,19)
    },
      destination: {
        plannedDateTime: json.data.legs[0].destination.plannedDateTime.slice(11,19)
      }
    });
    setStops(json.data.legs[json.data.legs.length - 1].stops)
}

  useEffect(() => {
    fetchTrip();
    console.log('fetched!')
    console.log(stops)
  }, [status])

  useEffect(() => {
    let startTimeMinutes = start.origin.plannedDateTime.slice(3,5)
    let startTimeSeconds = start.origin.plannedDateTime.slice(6,8)

    setDuration({ 
      seconds: (parseInt(time.slice(6,8)) - parseInt(startTimeSeconds)),
      minutes: (parseInt(time.slice(3,5)) - parseInt(startTimeMinutes)),
      hours: hour
    })
    
    if (duration.minutes == 59 || -1) {
      duration.minutes - duration.seconds === -59 || 0 ? setHour(hour + 1) : setHour(hour)
    } else {
      setHour(hour)
    }


}, [time])
  
    // gettreininformatie_2, idea for feature. Not high priority


  return (
      <div>
        <div className="App-header">
          <p>Departure: {start.origin.plannedDateTime} CET</p>
          <p>ETA Arrival: {start.destination.plannedDateTime} CET</p>
        </div>
        <div className="Trip-current">
          <h1 className="Trip-header">
            Current trip
          </h1>
          <div className="Trip-child">
            Duration: 
              <p>
                +{duration.hours < 10 ? "0" + duration.hours : duration.hours}:
                {duration.minutes < 0 ? duration.minutes + 60: duration.minutes < 10 ? "0" + duration.minutes : duration.minutes}:
                {duration.seconds < 10 ? "0" + duration.seconds : duration.seconds}
              </p>
          </div>
          <div className="Trip-child">
            Stops: {stops.length != undefined ? stops.map((stop) => <div className="Stops">{stop.name}</div>) : <div>Loading</div>}
          </div>
        </div>
        {/* <div className="Trip-previous">
          <h1 className="Trip-header">
            Previous trip
          </h1>
          <div className="Trip-child">
            Duration:
          </div>
          <div className="Trip-child">
            Stop Count:
          </div>
        </div> */}
      </div>
  );
}

export default App;
