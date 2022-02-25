import React, { useEffect } from "react";
import { useState, useContext } from "react/cjs/react.development";
import { dateContext } from "../Contexts/DateContext";
import { timeContext } from "../Contexts/TimeContext";

const Time = () => {
    const [time, setTime] = useContext(timeContext)
    const [duration, setDuration] = useState('')
    const [start, setStart] = useContext(dateContext)
    
    function currentTime() {
        let date = new Date(); 
        let hh = date.getUTCHours() + 1;
        let mm = date.getUTCMinutes();
        let ss = date.getUTCSeconds();
        hh = (hh > 23) ? hh = "0" : hh;
        hh = (hh < 10) ? "0" + hh : hh;
        mm = (mm < 10) ? "0" + mm : mm;
        ss = (ss < 10) ? "0" + ss : ss;
        setTime(hh + ":" + mm + ":" + ss)
        let t = setTimeout(function(){ currentTime() }, 1000);
    
      }

    useEffect(() => {
        currentTime()
    }, [])

    useEffect(() => {
        let startTimeH = start.origin.plannedDateTime.slice(0,2)
        let startTimeM = start.origin.plannedDateTime.slice(3,5)
        let startTimeS = start.origin.plannedDateTime.slice(6,8)
        setDuration((parseInt(time.slice(6,8)) - parseInt(startTimeS)))
    }, [time])

    return (
        <div>
            {time} CET Local Time
            <div>{duration}</div>
        </div>
    )
}

export default Time