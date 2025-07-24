"use client";

import { useState, useEffect, useRef } from "react";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import { useApp } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Common/Loading/Loading";
import ConfettiEvents from "../ConfettiEvents/ConfettiEvents.jsx";
import BottomActions from "../../components/BottomActions/BottomActions.jsx";
import styles from "./Countdown.module.css";

const Countdown = () => {
    const { isLoading, setIsLoading } = useApp();
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [remainingMs, setRemainingMs] = useState(0);
    const [timerStarted, setTimerStarted] = useState(false);
    const { config } = useConfig();
    const navigate = useNavigate();

    // Set loading to true on mount
    useEffect(() => {
        setIsLoading(true);
    }, [setIsLoading]);

    useEffect(() => {
        if (!config || !config.start_time) return;
        const targetDate = new Date(config.start_time);

        let animationFrameId;
        let stopped = false;

        const update = () => {
            const now = new Date().getTime();
            const difference = targetDate.getTime() - now;
            setRemainingMs(difference > 0 ? difference : 0);

            if (difference > 0) {
                setTimeLeft((prev) => {
                    const delayed = Math.max(difference + 1000, 0);
                    const newTime = {
                        days: Math.floor(delayed / (1000 * 60 * 60 * 24)),
                        hours: Math.floor(
                            (delayed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                        ),
                        minutes: Math.floor(
                            (delayed % (1000 * 60 * 60)) / (1000 * 60)
                        ),
                        seconds: Math.floor((delayed % (1000 * 60)) / 1000),
                    };
                    if (
                        prev.days !== newTime.days ||
                        prev.hours !== newTime.hours ||
                        prev.minutes !== newTime.minutes ||
                        prev.seconds !== newTime.seconds
                    ) {
                        setIsLoading(false);
                        return newTime;
                    }
                    setIsLoading(false);
                    return prev;
                });
                if (timerStarted === false) {
                    setTimerStarted(true);
                }
                if (!stopped) {
                    animationFrameId = requestAnimationFrame(update);
                }
                setIsLoading(false);
            } else {
                // Countdown finished
                setTimeLeft({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                });
                setIsLoading(false);
                if (timerStarted === false) {
                    setTimerStarted(true);
                }
            }
        };

        animationFrameId = requestAnimationFrame(update);

        return () => {
            stopped = true;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [config && config.start_time, timerStarted]);

    const isLastSeconds = remainingMs < 10000;

    // Show confetti when countdown is done
    if (!isLoading && remainingMs === 0) {
        return (
            <div className={styles.container}>
                <ConfettiEvents eventName="started" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <div
                        className={`${styles.timer} ${
                            isLastSeconds ? styles.lastSeconds : ""
                        }`}
                    >
                        <div className={styles.timeUnit}>
                            <span className={styles.number}>
                                {String(timeLeft.days).padStart(2, "0")}
                            </span>
                            <span
                                className={`${styles.label} ${
                                    isLastSeconds ? styles.lastSeconds : ""
                                }`}
                            >
                                Nap
                            </span>
                        </div>
                        <span className={styles.separator}>:</span>
                        <div className={styles.timeUnit}>
                            <span className={styles.number}>
                                {String(timeLeft.hours).padStart(2, "0")}
                            </span>
                            <span
                                className={`${styles.label} ${
                                    isLastSeconds ? styles.lastSeconds : ""
                                }`}
                            >
                                Óra
                            </span>
                        </div>
                        <span className={styles.separator}>:</span>
                        <div className={styles.timeUnit}>
                            <span className={styles.number}>
                                {String(timeLeft.minutes).padStart(2, "0")}
                            </span>
                            <span
                                className={`${styles.label} ${
                                    isLastSeconds ? styles.lastSeconds : ""
                                }`}
                            >
                                Perc
                            </span>
                        </div>
                        <span className={styles.separator}>:</span>
                        <div className={styles.timeUnit}>
                            <span className={styles.number}>
                                {String(timeLeft.seconds).padStart(2, "0")}
                            </span>
                            <span
                                className={`${styles.label} ${
                                    isLastSeconds ? styles.lastSeconds : ""
                                }`}
                            >
                                Másodperc
                            </span>
                        </div>
                    </div>
                    <div
                        className={`${styles.msBox} ${
                            isLastSeconds ? styles.lastSeconds : ""
                        }`}
                    >
                        <div className={styles.milliSeconds}>
                            {String(remainingMs).padStart(10, "0")}
                        </div>
                    </div>
                    <BottomActions />
                </>
            )}
        </div>
    );
};

export default Countdown;
