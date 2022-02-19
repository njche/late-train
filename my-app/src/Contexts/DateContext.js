import React, { useState } from 'react'

const initialContext = {
    origin: {
        plannedDateTime: ''
    },
    destination: {
        plannedDateTime: ''
    }
}

export const dateContext = React.createContext();

const DateContext = ({ children }) => {
    const [state, setState] = useState(initialContext);

    return (
        <dateContext.Provider value={[state, setState]}>
            {children}
        </dateContext.Provider>
    )
}

export default DateContext