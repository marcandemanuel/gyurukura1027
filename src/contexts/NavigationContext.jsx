import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const [navigationPile, setNavigationPile] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    const back = (regexArray, fallback) => {
        if (navigationPile.length < 2) {
            navigate(fallback);
            return;
        }
        const lastItem = navigationPile[navigationPile.length - 2];
        const isMatch = regexArray.some((regex) => regex.test(lastItem));
        if (isMatch) {
            navigate(lastItem);
        } else {
            navigate(fallback);
        }
    }

    useEffect(() => {
        setNavigationPile((prev) => {
            if (prev[prev.length - 1] === location.pathname) return prev;
            return [...prev, location.pathname];
        });
    }, [location.pathname]);

    return (
        <NavigationContext.Provider value={{ navigationPile, back }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => useContext(NavigationContext);
