import React, { useState } from 'react'

const initialContext = {}

export const statusContext = React.createContext();

const StatusContext = ({ children }) => {
    const [state, setState] = useState(initialContext);

    return (
        <statusContext.Provider value={[state, setState]}>
            {children}
        </statusContext.Provider>
    )
}

export default StatusContext