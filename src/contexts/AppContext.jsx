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

    useEffect(() => {
        const initializeUser = async () => {
            try {
                console.log('Cookie', document.cookie)
                const cookieString = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith(`${USER_ID_COOKIE_KEY}=`));
                console.log('cookieString', cookieString);
                if (cookieString) {
                    const value = cookieString.split("=")[1];
                    const rememberedUserID = value === "none" ? null : parseInt(value);
                    console.log('rememberedUserID', rememberedUserID)
                    if (rememberedUserID) {
                        const currentProfiles = await apiService.getProfiles(
                            false
                        );
                        const userExists = currentProfiles.find(
                            (p) => p.id === rememberedUserID
                        );

                        console.log('userExists', userExists)

                        if (userExists) {
                            setUser(userExists);
                            setIsAuthenticated(true);
                            setProfiles(currentProfiles);
                        }
                    }
                }
            } catch (error) {
                console.log('Error', error)
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
        console.log("Setting userid cookie with id", id);
        const d = new Date();
        d.setTime(d.getTime() + USER_ID_COOKIE_DAYS * 24 * 60 * 60 * 1000);
        document.cookie = `${USER_ID_COOKIE_KEY}=${id};expires=${d.toUTCString()};path=/;SameSite=Strict`;
    };

    const authenticate = async (userId, pin) => {
        try {
            const isValid = await apiService.checkProfilePin(userId, pin);
            if (isValid) {
                setIsAuthenticated(true);
                console.log('consentAccepted', consentAccepted)
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
        setUserIDCookie
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
