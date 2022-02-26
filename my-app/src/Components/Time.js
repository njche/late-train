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

    return (
        <div>
            {time} CET Local Time
        </div>
    )
}

export default Time