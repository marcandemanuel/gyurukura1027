import React, { createContext, useContext, useState } from "react";

const PinRequestContext = createContext(false);

export const usePinRequest = () => useContext(PinRequestContext);

export const PinRequestProvider = ({ children }) => {
    const [isPinRequestActive, setIsPinRequestActive] = useState(false);
    return (
        <PinRequestContext.Provider value={{ isPinRequestActive, setIsPinRequestActive }}>
            {children}
        </PinRequestContext.Provider>
    );
};