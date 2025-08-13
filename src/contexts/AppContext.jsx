"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/apiService";

const AppContext = createContext();
const USER_ID_COOKIE_KEY = "user_id";

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    const [isServerError, setIsServerError] = useState(false);
    const [confettiStatus, setConfettiStatus] = useState(0);
    const [editedUser, setEditedUser] = useState(null);
    const [consentAccepted, setConsentAccepted] = useState(false);

    const USER_ID_COOKIE_KEY = "user_id";
    const USER_ID_COOKIE_DAYS = 1;

    const [favoriteDrinkOptions, setFavoriteDrinkOptions] = useState([]);
    const [favoriteChipsOptions, setFavoriteChipsOptions] = useState([]);

    const [mostFavoriteDrinks, setMostFavoriteDrinks] = useState([]);
    const [mostFavoriteChips, setMostFavoriteChips] = useState([]);
    const [options, setOptions] = useState({ drink: [], chips: [] });

    const getFavorites = (profiles, type) => {
        if (!Array.isArray(profiles)) return [];

        return profiles.reduce((acc, profile) => {
            const items = profile?.favorites?.[type];
            return Array.isArray(items) ? [...acc, ...items] : acc;
        }, []);
    };

    const getMostCommonItems = (items) => {
        if (!Array.isArray(items) || !items.length) return [];

        const frequency = items.reduce((acc, item) => {
            if (typeof item === "string" && item.trim()) {
                acc[item] = (acc[item] || 0) + 1;
            }
            return acc;
        }, {});

        if (!Object.keys(frequency).length) return [];

        const maxFrequency = Math.max(...Object.values(frequency));

        return Object.entries(frequency)
            .filter(([_, count]) => count === maxFrequency)
            .map(([item]) => item)
            .sort();
    };

    useEffect(() => {
        if (!Array.isArray(profiles)) {
            setMostFavoriteDrinks([]);
            setMostFavoriteChips([]);
            return;
        }

        const drinkFavorites = getFavorites(profiles, "drinks");
        const chipsFavorites = getFavorites(profiles, "chips");

        setMostFavoriteDrinks(getMostCommonItems(drinkFavorites));
        setMostFavoriteChips(getMostCommonItems(chipsFavorites));
    }, [profiles]);

    useEffect(() => {
        const fetchOptions = () => {
            setIsLoading(true);
            fetch(`${API_BASE}/options?t=${Date.now()}`)
                .then((res) => res.json())
                .then((data) => {
                    setOptions(data.options || { drink: [], chips: [] });
                    setIsLoading(false);
                })
                .catch((err) => {
                    setOptions({ drink: [], chips: [] });
                    setIsLoading(false);
                });
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        if (user) {
            setFavoriteDrinkOptions(user?.favorites?.drinks ?? []);
            setFavoriteChipsOptions(user?.favorites?.chips ?? []);
        }
    }, [user]);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const cookieString = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith(`${USER_ID_COOKIE_KEY}=`));
                if (cookieString) {
                    const value = cookieString.split("=")[1];
                    const rememberedUserID =
                        value === "none" ? null : parseInt(value);
                    if (rememberedUserID) {
                        const currentProfiles = await apiService.getProfiles(
                            false
                        );
                        const userExists = currentProfiles.find(
                            (p) => p.id === rememberedUserID
                        );

                        if (userExists) {
                            setUser(userExists);
                            setIsAuthenticated(true);
                            setProfiles(currentProfiles);
                        }
                    }
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };

        initializeUser();
    }, []);

    const loadProfiles = async (withPin = false) => {
        try {
            const profilesData = await apiService.getProfiles(withPin);
            setProfiles(profilesData);
            // Always update the current user to the latest from profiles if logged in
            if (user && profilesData.length > 0) {
                const updatedUser = profilesData.find((p) => p.id === user.id);
                if (updatedUser) {
                    setUser(updatedUser);
                }
            }
            return profilesData;
        } catch (error) {
            return [];
        }
    };

    const selectUser = (selectedUser) => {
        setUser(selectedUser);
        setIsAuthenticated(false);
    };

    const setUserIDCookie = (id = "none") => {
        const d = new Date();
        d.setTime(d.getTime() + USER_ID_COOKIE_DAYS * 24 * 60 * 60 * 1000);
        document.cookie = `${USER_ID_COOKIE_KEY}=${id};expires=${d.toUTCString()};path=/;SameSite=Strict`;
    };

    const authenticate = async (userId, pin) => {
        try {
            const isValid = await apiService.checkProfilePin(userId, pin);
            if (isValid) {
                setIsAuthenticated(true);
                if (consentAccepted) {
                    setUserIDCookie(user.id);
                }
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    // Updates a profile, then always updates both profiles and the current user (if affected)
    const updateProfile = async (updatedUser, updateType = "") => {
        try {
            const result = await apiService.updateProfile(
                updatedUser.id,
                updatedUser,
                updateType
            );

            // Update profiles list for everyone
            const updatedProfiles = profiles.map((p) =>
                p.id === updatedUser.id ? updatedUser : p
            );
            setProfiles(updatedProfiles);

            // Always update the current user context if the updated profile is the logged-in user
            if (user && updatedUser.id === user.id) {
                setUser(updatedUser);
            }

            return true;
        } catch (error) {
            return false;
        }
    };

    // Refreshes the current user from the latest profiles (fetches and updates both)
    const refreshCurrentUser = async (withPin = false) => {
        const profilesData = await loadProfiles(withPin);
        if (user && profilesData.length > 0) {
            const updatedUser = profilesData.find((p) => p.id === user.id);
            if (updatedUser) {
                setUser(updatedUser);
            }
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };


    const favoriteDrink = (drinkName) => {
        if (!user) return;
        setIsLoading(true);
        const isFavorite = !favoriteDrinkOptions.includes(drinkName);
        const newUser = JSON.parse(JSON.stringify(user));

        newUser.favorites = {
            ...(newUser.favorites ?? {}),
            drinks: isFavorite
                ? [...(newUser.favorites?.drinks ?? []), drinkName]
                : (newUser.favorites?.drinks ?? []).filter(
                      (d) => d !== drinkName
                  ),
            chips: newUser.favorites?.chips ?? [],
        };

        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
            now.getDate()
        )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
            now.getSeconds()
        )}`;

        newUser.notifications.push(["Kedvenc elmentve 🎉!", date]);

        const success = updateProfile(newUser, "favorite");
        setFavoriteDrinkOptions(newUser.favorites.drinks);
        setIsLoading(false);
    };

    const favoriteChips = (chipsName) => {
        if (!user) return;
        setIsLoading(true);
        const isFavorite = !favoriteChipsOptions.includes(chipsName);
        const newUser = JSON.parse(JSON.stringify(user));

        newUser.favorites = {
            ...(newUser.favorites ?? {}),
            drinks: newUser.favorites?.drinks ?? [],
            chips: isFavorite
                ? [...(newUser.favorites?.chips ?? []), chipsName]
                : (newUser.favorites?.chips ?? []).filter(
                      (c) => c !== chipsName
                  ),
        };

        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
            now.getDate()
        )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
            now.getSeconds()
        )}`;

        // newUser.notifications.push(["Kedvenc elmentve 🎉!", date]);

        const success = updateProfile(newUser, "favorite");
        setFavoriteChipsOptions(newUser.favorites.chips);
        setIsLoading(false);
    };

    const value = {
        user,
        isAuthenticated,
        profiles,
        isLoading,
        isNotFound,
        isServerError,
        isAdmin: user?.admin === true,
        confettiStatus,
        editedUser,
        consentAccepted,
        favoriteDrinkOptions,
        favoriteChipsOptions,
        mostFavoriteDrinks,
        mostFavoriteChips,
        options,
        loadProfiles,
        refreshCurrentUser,
        selectUser,
        authenticate,
        updateProfile,
        setIsLoading,
        setIsNotFound,
        setIsServerError,
        setConfettiStatus,
        setEditedUser,
        setConsentAccepted,
        setUserIDCookie,
        logout,
        favoriteDrink,
        favoriteChips,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
