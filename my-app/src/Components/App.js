import React, { useEffect, useContext } from 'react'
import Trip from './Trip'
import Map from './Map'
import Vote from './Vote'
import { Web3Client } from './Web3'
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
    // Stops for trip
    setStops(json.data.legs[json.data.legs.length - 1].stops)
    console.log(json)
}

  useEffect(() => {
    fetchTrip();
    console.log(stops)
  }, [status])

  useEffect(() => {
    Web3Client()
  }, [])
  
    // gettreininformatie_2, idea for feature. Not high priority


  return (
      <div>
        <div className="App-header">
          <p>Departure: {start.origin.plannedDateTime} CET</p>
          <p>ETA Arrival: {start.destination.plannedDateTime} CET</p>
        </div>
        <div className="Info-container">
          <Vote />
          <Map />
          <Trip />
        </div>
      </div>
  );
}

export default App;
