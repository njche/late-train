import React, { useEffect } from "react";
import { useState, useContext } from "react/cjs/react.development";
import { dateContext } from "../Contexts/DateContext";

const Time = () => {
    const [time, setTime] = useState('')
    const [start, setStart] = useContext(dateContext)
    
    function currentTime() {
        let date = new Date(); 
        let hh = date.getUTCHours() + 1;
        let mm = date.getUTCMinutes();
        let ss = date.getUTCSeconds();
        let session = "CET Local Time"
        
        hh = (hh > 23) ? hh = "0" : hh;
        hh = (hh < 10) ? "0" + hh : hh;
        mm = (mm < 10) ? "0" + mm : mm;
        ss = (ss < 10) ? "0" + ss : ss;
          
        setTime(hh + ":" + mm + ":" + ss + " " + session)
        let t = setTimeout(function(){ currentTime() }, 1000);
    
      }

    useEffect(() => {
        currentTime()
        console.log(start)
    }, [])

    return (
        <div>
            {time}
        </div>
    )
}

export default Time