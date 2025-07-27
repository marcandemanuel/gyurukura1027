import React, { createContext, useContext, useEffect, useState } from "react";
import Loading from "../components/Common/Loading/Loading";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const ConfigContext = createContext({
    config: null,
    reloadConfig: () => {},
    loading: true,
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = () => {
        setLoading(true);
        fetch(`${API_BASE}/config?t=${Date.now()}`)
            .then((res) => res.json())
            .then((data) => {
                setConfig(data);
                setLoading(false);
            })
            .catch((err) => {
                setConfig(null);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const reloadConfig = () => {
        fetchConfig();
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <ConfigContext.Provider value={{ config, reloadConfig, loading }}>
            {children}
        </ConfigContext.Provider>
    );
};
