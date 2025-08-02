"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./Layout.module.css";
import AudioIsland from "../AudioIsland/AudioIsland";
import CountDownTitle from "../CountDownTitle/CountDownTitle";
import { usePinRequest } from "../../contexts/PinRequestContext";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import { triggerCollapseEffect } from "../../utils/collapseEffect";
import ConfettiEvents from "../../pages/ConfettiEvents/ConfettiEvents.jsx";
import ServerError from "../../pages/ServerError/ServerError";
import { useApp } from "../../contexts/AppContext";
import FixedRightsBox from "../Common/FixedRightsBox/FixedRightsBox";

const Layout = ({ children }) => {
    const { isPinRequestActive } = usePinRequest();
    const location = useLocation();
    const [showServerError, setShowServerError] = useState(false);
    const {
        isLoading,
        setIsNotFound,
        setIsServerError,
        isNotFound,
        isServerError,
        confettiStatus,
        setConfettiStatus,
    } = useApp();
    const { config } = useConfig();
    const [showConfetti, setShowConfetti] = useState(false);
    const [showConfettiWith, setShowConfettiWith] = useState(null);

    useEffect(() => {
        // Reset isNotFound and isServerError on every route change
        setIsNotFound(false);
        setIsServerError(false);
    }, [location.pathname, setIsNotFound, setIsServerError]);

    // Check email keys for date logic
    useEffect(() => {
        if (!config || !config.emails) return;

        // Specify the keys to check
        const emailKeys = [
            "nv_opened",
            "starts_today",
            "started",
            "ends_today",
            "birthday",
        ];

        const now = new Date();
        const timedelta = config.timezone;
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const targetTime = new Date(utcTime + timedelta * 3600000);

        let timeoutIds = [];

        let latestEvent = null;
        let latestEventTime = null;
        let futureEvents = [];

        emailKeys.forEach((key) => {
            const dateStr = config.emails[key];
            if (!dateStr) return;
            const dateObj = new Date(dateStr);

            // Check if same day
            const isSameDay =
                targetTime.getFullYear() === dateObj.getFullYear() &&
                targetTime.getMonth() === dateObj.getMonth() &&
                targetTime.getDate() === dateObj.getDate();

            if (isSameDay && confettiStatus === 0) {
                if (targetTime > dateObj) {
                    // Track the latest event that already happened
                    if (!latestEventTime || dateObj > latestEventTime) {
                        latestEventTime = dateObj;
                        latestEvent = key;
                    }
                } else if (targetTime < dateObj) {
                    // Collect all future events for timer scheduling
                    futureEvents.push({ key, dateObj });
                }
            }
        });

        // If there are multiple events that already happened, show the latest one
        if (latestEvent) {
            setConfettiStatus(1);
            setShowConfetti(true);
            setShowConfettiWith(latestEvent);
        } else if (futureEvents.length > 0) {
            // If there are multiple future events, schedule timers for all
            futureEvents.forEach(({ key, dateObj }) => {
                const remainingMs = dateObj - targetTime;
                if (remainingMs > 0) {
                    const timeoutId = setTimeout(() => {
                        setConfettiStatus(1);
                        setShowConfetti(true);
                        setShowConfettiWith(key);
                    }, remainingMs);
                    timeoutIds.push(timeoutId);
                }
            });
        }

        // Cleanup: clear all scheduled timeouts on unmount or config change
        return () => {
            timeoutIds.forEach((id) => clearTimeout(id));
        };
    }, [config, confettiStatus]);

    useEffect(() => {
        if (confettiStatus === 2) {
            setShowConfetti(false);
            setShowConfettiWith(null);
        }
    }, [confettiStatus]);

    useEffect(() => {
        // Add click tracking for collapse effect (from original)
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const evnu = currentYear - 2020 + 1;
        let timeoutId;
        let clickCount = 0;

        const handleClick = () => {
            clickCount++;
            if (clickCount === evnu && !isNotFound && !isServerError) {
                // Collapse effect
                const duration = triggerCollapseEffect();
                setTimeout(
                    () => {
                        setShowServerError(true);
                    },
                    duration > 3000 ? duration : 4000
                ); // fallback to 4s if duration is too short
            }
            timeoutId = setTimeout(() => {
                clickCount = 0;
            }, evnu * 1000);
        };

        // Add mouse click effects
        const handleMouseDown = (event) => {
            if (event.button === 0) {
                document.body.classList.add("clicked");
            }
        };

        const handleMouseUp = () => {
            document.body.classList.remove("clicked");
        };

        document.addEventListener("click", handleClick);
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mouseup", handleMouseUp);

        // Keyboard shortcuts (from original)
        const sequence = ["t", "a", "b", "u", "d", "i"];
        const sequence2 = ["c", "s", "e", "c", "s", "i"];
        let currentIndex = 0;
        let currentIndex2 = 0;

        const handleKeyDown = (event) => {
            if (
                event.key === sequence[currentIndex] &&
                (currentIndex2 === 0 || event.key !== sequence2[currentIndex2])
            ) {
                currentIndex++;
                if (currentIndex === sequence.length) {
                    // Show Tabudi easter egg
                    currentIndex = 0;
                    currentIndex2 = 0;
                }
            } else if (event.key === sequence2[currentIndex2]) {
                currentIndex2++;
                if (currentIndex2 === sequence2.length) {
                    // Show Csecsi easter egg
                    currentIndex = 0;
                    currentIndex2 = 0;
                }
            } else {
                currentIndex = 0;
                currentIndex2 = 0;
            }

            // Fullscreen toggle with 'f' key
            if (event.key === "f") {
                if (
                    document.activeElement.tagName !== "INPUT" &&
                    document.activeElement.tagName !== "TEXTAREA"
                ) {
                    if (!document.fullscreenElement) {
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        }
                    } else {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        }
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("keydown", handleKeyDown);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    if (showServerError) {
        return <ServerError />;
    }

    const shouldShowFixedElements =
        !isPinRequestActive && !isLoading && !isNotFound && !isServerError;

    return (
        <div
            className={
                shouldShowFixedElements
                    ? `${styles.layout} ${styles.withAudioIsland}`
                    : styles.layout
            }
        >
            {shouldShowFixedElements && <AudioIsland />}
            {shouldShowFixedElements && <FixedRightsBox />}
            {shouldShowFixedElements && <CountDownTitle />}
            {showConfetti && showConfettiWith ? (
                <ConfettiEvents eventName={showConfettiWith} />
            ) : (
                children
            )}
        </div>
    );
};

export default Layout;
