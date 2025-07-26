"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { apiService } from "../services/apiService"

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

const SESSION_TIMEOUT = 60000
const SESSION_KEY = "lotr_session"

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const [isServerError, setIsServerError] = useState(false)
  const [confettiStatus, setConfettiStatus] = useState(0)
  const [editedUser, setEditedUser] = useState(null)

  // Save session to localStorage
  const saveSession = (userData, isAuth, unloadTime = null) => {
    const session = {
      user: userData,
      isAuthenticated: isAuth,
      lastUnloadTime: unloadTime, // Time when page was unloaded
      createdTime: Date.now(), // When session was created (for reference)
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  // Update session with unload time
  const updateSessionUnloadTime = () => {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (sessionData && user && isAuthenticated) {
      try {
        const session = JSON.parse(sessionData)
        session.lastUnloadTime = Date.now()
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      } catch (error) {
        console.error("Failed to update session unload time:", error)
      }
    }
  }

  // Load session from localStorage
  const loadSession = () => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      const now = Date.now()

      console.log(session);

      // If there's an unload time, check if timeout has passed since then
      if (session.lastUnloadTime) {
        const timeSinceUnload = now - session.lastUnloadTime
        if (timeSinceUnload > SESSION_TIMEOUT) {
          localStorage.removeItem(SESSION_KEY)
          return null
        }
      }

      return session
    } catch (error) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
  }

  // Clear session
  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setIsAuthenticated(false)
  }

  // Handle page unload - save the unload timestamp
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateSessionUnloadTime()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Page is being hidden (tab switch, minimize, etc.)
        updateSessionUnloadTime()
      }
    }

    // Listen for page unload events
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("pagehide", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("pagehide", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [user, isAuthenticated])

  // Initialize session on app load
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check if device token is valid first
        const isKnownDevice = await apiService.checkDeviceToken()

        if (isKnownDevice) {
          // Try to restore session
          const session = loadSession()

          if (session && session.user) {
            // Validate that the user still exists in profiles
            const currentProfiles = await apiService.getProfiles(false)
            const userExists = currentProfiles.find((p) => p.id === session.user.id)

            if (userExists) {
              // Update user data with current profile data
              setUser(userExists)
              setIsAuthenticated(session.isAuthenticated)
              setProfiles(currentProfiles)

              // Clear the unload time since we're back online
              saveSession(userExists, session.isAuthenticated, null)
            } else {
              clearSession()
            }
          } else {
          }
        } else {
          // Device not recognized, clear any existing session
          clearSession()
        }
      } catch (error) {
        console.error("Failed to initialize session:", error)
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [])

  // Loads all profiles and updates both profiles and the current user (if logged in)
  const loadProfiles = async (withPin = false) => {
    try {
      const profilesData = await apiService.getProfiles(withPin)
      setProfiles(profilesData)
      // Always update the current user to the latest from profiles if logged in
      if (user && profilesData.length > 0) {
        const updatedUser = profilesData.find((p) => p.id === user.id)
        if (updatedUser) {
          setUser(updatedUser)
          saveSession(updatedUser, isAuthenticated, null)
        }
      }
      return profilesData
    } catch (error) {
      console.error("Failed to load profiles:", error)
      return []
    }
  }

  const selectUser = (selectedUser) => {
    setUser(selectedUser)
    setIsAuthenticated(false)
    saveSession(selectedUser, false, null)
  }

  const authenticate = async (userId, pin) => {
    try {
      const isValid = await apiService.checkProfilePin(userId, pin)
      if (isValid) {
        setIsAuthenticated(true)
        saveSession(user, true, null)
        return true
      }
      return false
    } catch (error) {
      console.error("Authentication failed:", error)
      return false
    }
  }

  // Updates a profile, then always updates both profiles and the current user (if affected)
  const updateProfile = async (updatedUser, updateType='') => {
    try {
      const result = await apiService.updateProfile(updatedUser.id, updatedUser, updateType);

      // Update profiles list for everyone
      const updatedProfiles = profiles.map((p) => (p.id === updatedUser.id ? updatedUser : p));
      setProfiles(updatedProfiles);

      // Always update the current user context if the updated profile is the logged-in user
      if (user && updatedUser.id === user.id) {
        setUser(updatedUser);
        saveSession(updatedUser, isAuthenticated, null);
      }

      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return false;
    }
  }

  const logout = () => {
    clearSession()
  }

  // Refreshes the current user from the latest profiles (fetches and updates both)
  const refreshCurrentUser = async (withPin = false) => {
    const profilesData = await loadProfiles(withPin)
    if (user && profilesData.length > 0) {
      const updatedUser = profilesData.find((p) => p.id === user.id)
      if (updatedUser) {
        setUser(updatedUser)
        saveSession(updatedUser, isAuthenticated, null)
      }
    }
  }

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
    loadProfiles,
    refreshCurrentUser,
    selectUser,
    authenticate,
    updateProfile,
    logout,
    setIsLoading,
    setIsNotFound,
    setIsServerError,
    setConfettiStatus,
    setEditedUser
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
