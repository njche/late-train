import React, { useEffect, useContext } from "react"
import { timeContext } from "../Contexts/TimeContext"
console.log(import.meta.env)
function Time() {
    const [time, setTime] = useContext(timeContext)
    
    async function currentTime() {
        const response = await fetch(import.meta.env.VITE_REACT_APP_API_HOST + '/time')
        const json = await response.json()
        setTime(json.data) 
        setTimeout(currentTime, 1000)
      }

      // add logic to hide duration until start time

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