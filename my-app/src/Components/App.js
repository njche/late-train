import React, { useState, useEffect, useContext } from 'react'
import { stopContext } from '../Contexts/StopContext'
import { dateContext } from '../Contexts/DateContext'
import { statusContext } from '../Contexts/StatusContext'
import '../Styles/App.css'

function App() {
  const [stops, setStops] = useContext(stopContext)
  const [start, setStart] = useContext(dateContext)
  const [status, setStatus] = useContext(statusContext)
  
  const fetchTrip = async () => {   
    // API call for trip details
    const response = await fetch('http://localhost:8080/info');
    const json = await response.json()
    // Grabbing time for DateContext
    setStart({ origin: {
      plannedDateTime: json.data.legs[0].origin.plannedDateTime
    },
      destination: {
        plannedDateTime: json.data.legs[0].destination.plannedDateTime
      }
    });
    setStops(json.data.legs[json.data.legs.length - 1].stops)
}

  useEffect(() => {
    fetchTrip();
    console.log('fetched!')
  }, [status])

  
    // gettreininformatie_2, idea for feature. Not high priority


  return (
      <div className="App-header">
        <p>Departure: {start.origin.plannedDateTime} CET</p>
        <p>ETA Arrival: {start.destination.plannedDateTime} CET</p>
      </div>
  );
}

export default App;
