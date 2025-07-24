"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import PinInput from "../Common/PinInput/PinInput";
import BottomActions from "../BottomActions/BottomActions";
import styles from "./AuthGuard.module.css";

const AuthGuard = ({ children }) => {
    const { user, isAuthenticated, authenticate, updateProfile, isLoading, setIsLoading } =
        useApp();
    const [pinError, setPinError] = useState(false);
    const [isCreatingPin, setIsCreatingPin] = useState(false);
    const [tempPin, setTempPin] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [missedAttempts, setMissedAttempts] = useState(0);
    const [showForgot, setShowForgot] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Only redirect if app has finished loading and no user is selected
        if (!isLoading && !user) {
            navigate("/profilok", { replace: true });
        }
    }, [user, navigate, isLoading]);

    // Don't render children if no user is selected
    if (!user) {
        return null;
    }

    if (isAuthenticated) {
        return children;
    }

    // Check if user needs to create PIN
    const needsToCreatePin = !user.hasPin && !user.pin;

    if (needsToCreatePin && !isCreatingPin) {
        setIsCreatingPin(true);
    }

    const handlePinComplete = async (pin) => {

        if (isCreatingPin) {
            if (isConfirming) {
                if (pin === tempPin) {
                    setIsLoading(true);
                    // Save new PIN and authenticate
                    const now = new Date();
                    const pad = (n) => n.toString().padStart(2, "0");
                    const date = `${now.getFullYear()}-${pad(
                        now.getMonth() + 1
                    )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
                        now.getMinutes()
                    )}:${pad(now.getSeconds())}`;

                    const updatedUser = { ...user, pin };
                    updatedUser.notifications.push(["PIN létrehozva 🎉!", date]);
                    const updateSuccess = await updateProfile(
                        updatedUser,
                        'pin_created'
                    );
                    if (updateSuccess) {
                        const authSuccess = await authenticate(user.id, pin);
                        if (authSuccess) {
                            setPinError(false);
                            setIsCreatingPin(false);
                            setIsConfirming(false);
                            setTempPin("");
                            setMissedAttempts(0);
                            setIsLoading(false);
                        }
                    }
                } else {
                    const newMissed = missedAttempts + 1;
                    setMissedAttempts(newMissed);
                    if (newMissed >= 3) {
                        setIsConfirming(false);
                        setTempPin("");
                        setMissedAttempts(0);
                        setPinError(true);
                        setTimeout(() => setPinError(false), 1000);
                    } else {
                        setPinError(true);
                        setTimeout(() => setPinError(false), 1000);
                    }
                }
            } else {
                setTempPin(pin);
                setIsConfirming(true);
                setMissedAttempts(0);
                setPinError(false);
            }
        } else {
            // Check existing PIN
            const success = await authenticate(user.id, pin);

            if (success) {
                setPinError(false);
                setMissedAttempts(0);
            } else {
                const newMissed = missedAttempts + 1;
                setMissedAttempts(newMissed);
                if (newMissed >= 3) {
                    navigate("/profilok");
                } else {
                    setPinError(true);
                    setTimeout(() => setPinError(false), 1000);
                }
            }
        }
    };

    const handleForgot = () => {
        setShowForgot(true);
    };

    const handleCancel = () => {
        navigate("/profilok");
    };

    const title = user.admin ? `${user.user} - Admin` : user.user;
    const subtitle = isCreatingPin
        ? isConfirming
            ? "Add meg újra a PIN-kódot"
            : "Hozz létre egy PIN-kódot"
        : "Add meg a PIN-kódod";

    if (showForgot) {
        return (
            <div className={styles.container}>
                <h3 className={styles.forgotText}>
                    Kérjük lépjen kapcsolatba az adminisztrátorral, Csigi Márk
                    Emánuellel.
                </h3>
                <button
                    className={styles.homeButton}
                    onClick={() => navigate("/")}
                >
                    Kezdőlap
                </button>
                <BottomActions />
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                padding: "20px",
            }}
        >
            <PinInput
                title={title}
                subtitle={subtitle}
                onComplete={handlePinComplete}
                clearError={() => setPinError(false)}
                showForgot={!isCreatingPin}
                onForgot={handleForgot}
                error={pinError}
            />
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: '30px 0 20px'
                }}
            >
                {!isCreatingPin && (
                    <button
                        onClick={handleForgot}
                        className={styles.authButton}
                    >
                        Elfelejtettem
                    </button>
                )}
                <button onClick={handleCancel} className={styles.authButton}>
                    Mégsem
                </button>
            </div>
            <BottomActions />
        </div>
    );
};

export default AuthGuard;
