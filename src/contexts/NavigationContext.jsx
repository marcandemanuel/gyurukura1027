import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [navigationPile, setNavigationPile] = useState([]);
  const location = useLocation();

  useEffect(() => {
    setNavigationPile((prev) => {
      // Avoid duplicate consecutive entries
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