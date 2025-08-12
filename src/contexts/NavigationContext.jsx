import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const [navigationPile, setNavigationPile] = useState([]);
    const [backFromPile, setBackFromPile] = useState([]);
    const [backClicked, setBackClicked] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const back = (fallback) => {
        const currentLocation = location.pathname;
        setBackFromPile((prev) => [...prev, currentLocation]);
        const lastLocation = [...navigationPile]
            .reverse()
            .find((item) => !backFromPile.includes(item) && item !== currentLocation);
        if (lastLocation) {
            navigate(lastLocation);
        }
        navigate(fallback)
    }

    useEffect(() => {
        if (backClicked) {
            setBackClicked(false);
        } else {
            setBackFromPile([]);
        }
        setNavigationPile((prev) => {
            if (prev[prev.length - 1] === location.pathname) return prev;
            return [...prev, location.pathname];
        });
    }, [location.pathname]);

    return (
        <NavigationContext.Provider value={{ navigationPile }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => useContext(NavigationContext);
