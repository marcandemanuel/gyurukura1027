"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import PinInput from "../Common/PinInput/PinInput";
import ConsentCookies from "../Common/ConsentCookies";
import { apiService } from "../../services/apiService";
import styles from "./DeviceGuard.module.css";
import { usePinRequest } from "../../contexts/PinRequestContext";

const DEVICE_COOKIE_KEY = "device_remembered";
const DEVICE_COOKIE_DAYS = 180;

function setDeviceCookie() {
    const d = new Date();
    d.setTime(d.getTime() + (DEVICE_COOKIE_DAYS*24*60*60*1000));
    document.cookie = `${DEVICE_COOKIE_KEY}=1;expires=${d.toUTCString()};path=/;SameSite=Strict`;
}
function getDeviceCookie() {
    return document.cookie.split(';').some(c => c.trim().startsWith(DEVICE_COOKIE_KEY + '='));
}
function deleteDeviceCookie() {
    document.cookie = `${DEVICE_COOKIE_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
}

const DeviceGuard = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [needsPin, setNeedsPin] = useState(false);
    const [pinError, setPinError] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const [consentAccepted, setConsentAccepted] = useState(null); // null = not chosen, true/false = chosen
    const { isLoading, setIsLoading } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsPinRequestActive } = usePinRequest();
    const consentHandledRef = useRef(false);

    // Effect: Set pin request active when needsPin changes
    useEffect(() => {
        if (needsPin) {
            setIsPinRequestActive(true);
        } else if (!isChecking && !isLoading) {
            setIsPinRequestActive(false);
        }
    }, [needsPin, isChecking, isLoading, setIsPinRequestActive]);

    // On mount, check for device cookie and device session validity
    useEffect(() => {
        const checkDeviceAndSession = async () => {
            if (isLoading || hasChecked) return;

            if (!getDeviceCookie()) {
                setIsPinRequestActive(true);
                setShowConsent(true);
                setIsChecking(false);
                setHasChecked(true);
                // Redirect to main page if not already there
                if (location.pathname !== "/") {
                    navigate("/", { replace: true });
                }
                return;
            }

            // Device cookie present, check backend for device session
            setIsChecking(true);
            try {
                // This should return { valid: true, user: {...} } if session is valid
                const response = await apiService.checkDeviceToken();
                if (response && response.valid && response.user) {
                    // Auto sign in user and allow navigation
                    // Set user and isAuthenticated in context
                    if (typeof window !== "undefined") {
                        // Defensive: avoid SSR issues
                        const event = new CustomEvent("deviceguard-autosignin", { detail: response.user });
                        window.dispatchEvent(event);
                    }
                    setIsChecking(false);
                    setNeedsPin(false);
                    setIsPinRequestActive(false);
                    setHasChecked(true);
                } else {
                    // Device recognized but no valid session, redirect to /profilok
                    setIsChecking(false);
                    setNeedsPin(false);
                    setIsPinRequestActive(false);
                    setHasChecked(true);
                    if (location.pathname !== "/profilok") {
                        navigate("/profilok", { replace: true });
                    }
                }
            } catch (e) {
                // On error, treat as not recognized
                setIsChecking(false);
                setNeedsPin(false);
                setIsPinRequestActive(false);
                setHasChecked(true);
                if (location.pathname !== "/") {
                    navigate("/", { replace: true });
                }
            }
        };

        checkDeviceAndSession();
        // eslint-disable-next-line
    }, [isLoading, hasChecked, location.pathname, navigate, setIsPinRequestActive]);

    // After consent is handled, if declined, go to PIN (do not remember device)
    // If accepted, go to PIN, and after correct PIN, remember device
    const handleConsentAccept = () => {
        setShowConsent(false);
        setConsentAccepted(true);
        setNeedsPin(true);
    };
    const handleConsentDecline = () => {
        setShowConsent(false);
        setConsentAccepted(false);
        setNeedsPin(true);
    };

    const handlePinComplete = async (pin) => {
        setIsLoading(true)
        try {
            const isValid = await apiService.checkAdminPin(pin);
            if (isValid) {
                await apiService.registerDeviceToken();
                if (consentAccepted) {
                    setDeviceCookie();
                }
                setIsLoading(false);
                setNeedsPin(false);
                setPinError(false);
            } else {
                setIsLoading(false);
                setPinError(true);
            }
        } catch (error) {
            setIsLoading(false);
            setPinError(true);
        }
    };

    // Show loading while checking or app is initializing
    if (isChecking || isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div
                    className={styles.loadingDot}
                    style={{ backgroundColor: "#9C8028" }}
                ></div>
                <div
                    className={styles.loadingDot}
                    style={{ backgroundColor: "#9C8028" }}
                ></div>
                <div
                    className={styles.loadingDot}
                    style={{ backgroundColor: "#9C8028" }}
                ></div>
            </div>
        );
    }

    if (showConsent) {
        return (
            <ConsentCookies
                onAccept={handleConsentAccept}
                onDecline={handleConsentDecline}
            />
        );
    }

    if (needsPin) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    marginTop: 64.8
                }}
            >
                <PinInput
                    title="Add meg a PIN-kódot"
                    onComplete={handlePinComplete}
                    clearError={() => setPinError(false)}
                    error={pinError}
                />
            </div>
        );
    }

    return children;
};

export default DeviceGuard;
