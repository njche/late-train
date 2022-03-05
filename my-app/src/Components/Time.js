import React, { useEffect, useState, useContext } from "react";
import { dateContext } from "../Contexts/DateContext";
import { timeContext } from "../Contexts/TimeContext";

function Time() {
    const [time, setTime] = useContext(timeContext)
    const [duration, setDuration] = useState('')
    const [start, setStart] = useContext(dateContext)
    
    async function currentTime() {
        const response = await fetch('http://localhost:8080/time')
        const json = await response.json()
        setTime(json.data)
        setTimeout(currentTime, 1000)   
      }

    useEffect(() => {
        currentTime()
    }, [])

    return (
        <div>
            {time.now} CET Local Time
        </div>
    )
}

export default Time