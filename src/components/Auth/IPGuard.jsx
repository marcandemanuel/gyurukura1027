"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import PinInput from "../Common/PinInput/PinInput";
import { apiService } from "../../services/apiService";
import styles from "./IPGuard.module.css";
import { usePinRequest } from "../../contexts/PinRequestContext";

const IPGuard = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [needsPin, setNeedsPin] = useState(false);
    const [pinError, setPinError] = useState(false);
    const { isLoading } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsPinRequestActive } = usePinRequest();

    // Effect: Set pin request active when needsPin changes
    useEffect(() => {
        if (needsPin) {
            setIsPinRequestActive(true);
        } else if (!isChecking && !isLoading) {
            setIsPinRequestActive(false);
        }
    }, [needsPin, isChecking, isLoading, setIsPinRequestActive]);
    useEffect(() => {
        checkAccess();
    }, [isLoading]);

    const checkAccess = async () => {
        // Wait for app context to finish loading
        if (isLoading) return;

        try {
            const isKnown = await apiService.checkIP();
            if (isKnown) {
                setIsChecking(false);
                setNeedsPin(false);
            } else {
                setNeedsPin(true);
                setIsChecking(false);
            }
        } catch (error) {
            setNeedsPin(true);
            setIsChecking(false);
        }
    };

    const handlePinComplete = async (pin) => {
        try {
            const isValid = await apiService.checkAdminPin(pin);
            if (isValid) {
                await apiService.saveIP();
                setNeedsPin(false);
                setPinError(false);
                // Don't redirect here, let the user stay on their intended route
            } else {
                setPinError(true);
            }
        } catch (error) {
            setPinError(true);
        }
    };

    // Show loading while checking IP and app is initializing
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

    if (needsPin) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
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

export default IPGuard;
