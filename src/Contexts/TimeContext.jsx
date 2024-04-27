import React, { useState } from 'react'

const initialContext = ''

export const timeContext = React.createContext()

const TimeContext = ({ children }) => {
    const [state, setState] = useState(initialContext)

    return (
        <timeContext.Provider value={[state, setState]}>
            {children}
        </timeContext.Provider>
    )
}

export default TimeContext