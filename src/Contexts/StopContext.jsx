import React, { useState } from 'react'

const initialContext = []

export const stopContext = React.createContext();

const StopContext = ({ children }) => {
    const [state, setState] = useState(initialContext);

    return (
        <stopContext.Provider value={[state, setState]}>
            {children}
        </stopContext.Provider>
    )
}

export default StopContext