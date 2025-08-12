"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import MovieCard from "./MovieCard";
import PinInput from "../../components/Common/PinInput/PinInput";
import BottomActions from "../../components/BottomActions/BottomActions.jsx";
import styles from "./Home.module.css";
import ActionRow from "../../components/Common/ActionRow";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const Home = () => {
    const [message, setMessage] = useState("Loading...");
    const [showPinChange, setShowPinChange] = useState(false);
    const [pinChangeStep, setPinChangeStep] = useState("create");
    const [tempPin, setTempPin] = useState("");
    const [pinError, setPinError] = useState(false);
    const [pinChangeConfirmMissed, setPinChangeConfirmMissed] = useState(0);
    const {
        user,
        loadProfiles,
        refreshCurrentUser,
        isAuthenticated,
        updateProfile,
        logout,
    } = useApp();
    const navigate = useNavigate();
    const config = useConfig();

    const movies = [
        "Váratlan Utazás",
        "Smaug Pusztasága",
        "Az Öt Sereg Csatája",
        "A Gyűrű Szövetsége",
        "A Két Torony",
        "A Király Visszatér",
    ];

    movies[config.birthday_on_movie_id] += " 🎂";

    const isAdmin = user?.admin || false;

    function mapNotifsWithUniqueIds(notifs, prev = []) {
        const prevMap = {};
        for (const n of prev) {
            const key = `${n.msg}|${n.date}`;
            if (!prevMap[key]) prevMap[key] = [];
            prevMap[key].push(n.id);
        }

        const idCounts = {};
        return (notifs || []).map(([msg, date]) => {
            const key = `${msg}|${date}`;
            idCounts[key] = (idCounts[key] || 0) + 1;
            let id;
            if (prevMap[key] && prevMap[key].length >= idCounts[key]) {
                id = prevMap[key][idCounts[key] - 1];
            } else {
                id = `notif_${key}_${Date.now()}_${Math.random()}`;
            }
            return { id, msg, date };
        });
    }

    const [notifications, setNotifications] = useState([]);
    const [dismissing, setDismissing] = useState([]);
    const notifRefs = React.useRef({});

    const notificationsCopiedRef = React.useRef(false);

    useEffect(() => {
        if (
            !notificationsCopiedRef.current &&
            user.notifications &&
            user.notifications.length > 0
        ) {
            setNotifications(mapNotifsWithUniqueIds(user.notifications));
            const updatedUser = { ...user, notifications: [] };
            updateProfile(updatedUser, "no_notifications").then(() => {
                refreshCurrentUser();
            });
            notificationsCopiedRef.current = true;
        }

        if (user.notifications && user.notifications.length === 0) {
            notificationsCopiedRef.current = false;
        }
    }, [user.notifications]);

    const handleDismissNotification = (notifId) => {
        const firstRects = {};
        Object.entries(notifRefs.current).forEach(([id, ref]) => {
            if (ref && ref.current) {
                firstRects[id] = ref.current.getBoundingClientRect();
            }
        });

        setDismissing((prev) => [...prev, notifId]);

        setTimeout(() => {
            setNotifications((prevNotifs) => {
                const idx = prevNotifs.findIndex((n) => n.id === notifId);
                if (idx === -1) return prevNotifs;
                const updated = [...prevNotifs];
                updated.splice(idx, 1);

                setTimeout(() => {
                    Object.entries(notifRefs.current).forEach(([id, ref]) => {
                        if (ref && ref.current && firstRects[id]) {
                            const lastRect =
                                ref.current.getBoundingClientRect();
                            const dy = firstRects[id].top - lastRect.top;
                            if (dy !== 0) {
                                ref.current.style.transition = "none";
                                ref.current.style.transform = `translateY(${dy}px)`;

                                void ref.current.offsetWidth;
                                ref.current.style.transition =
                                    "transform 0.4s cubic-bezier(0.4,0,0.2,1)";
                                ref.current.style.transform = "";
                            }
                        }
                    });
                }, 0);

                return updated;
            });
            setDismissing((prev) => prev.filter((k) => k !== notifId));
        }, 400);
    };

    const firstMountRef = React.useRef(true);

    useEffect(() => {
        fetch(`${API_BASE}/health`)
            .then((res) => res.json())
            .then((data) => {
                setMessage(
                    `✅ Connected! Backend: ${data.backend_ip}:${data.backend_port}`
                );
            })
            .catch((err) => {
                setMessage(
                    "❌ Backend connection failed. Make sure Flask is running on port 2020."
                );
            });

        if (isAdmin) {
            refreshCurrentUser(true);
        } else {
            refreshCurrentUser(false);
        }

        if (firstMountRef.current) {
            firstMountRef.current = false;
        }
    }, [isAdmin]);

    const handleEdit = (movieId) => {
        navigate(`/rendeles/${movieId}`);
    };

    const handleMovieInfo = (movieId) => {
        navigate(`/film/${movieId}`);
    };

    const handleChangeProfile = () => {
        logout();
        navigate("/profilok");
    };

    const handleChangePIN = () => {
        setShowPinChange(true);
        setPinChangeStep("create");
        setTempPin("");
        setPinError(false);
    };

    const handlePinChangeComplete = async (pin) => {
        if (pinChangeStep === "create") {
            setTempPin(pin);
            setPinChangeStep("confirm");
            setPinError(false);
        } else if (pinChangeStep === "confirm") {
            if (pin === tempPin) {
                const now = new Date();
                const pad = (n) => n.toString().padStart(2, "0");
                const date = `${now.getFullYear()}-${pad(
                    now.getMonth() + 1
                )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
                    now.getMinutes()
                )}:${pad(now.getSeconds())}`;

                const updatedUser = { ...user, pin };
                updatedUser.notifications.push(["PIN módosítva", date]);
                const success = await updateProfile(updatedUser, "pin_changed");
                if (success) {
                    setShowPinChange(false);
                    setPinChangeStep("create");
                    setTempPin("");
                    setPinError(false);
                } else {
                    setPinError(true);
                    setTimeout(() => setPinError(false), 2000);
                }
            } else {
                const newMissed = pinChangeConfirmMissed + 1;
                setPinChangeConfirmMissed(newMissed);
                if (newMissed >= 3) {
                    setPinChangeStep("create");
                    setTempPin("");
                    setPinChangeConfirmMissed(0);
                    setPinError(true);
                    setTimeout(() => setPinError(false), 1000);
                } else {
                    setPinError(true);
                    setTimeout(() => setPinError(false), 1000);
                }
            }
        }
    };

    const handleCancelPinChange = () => {
        setShowPinChange(false);
        setPinChangeStep("create");
        setTempPin("");
        setPinError(false);
    };

    const handleViewData = () => {
        navigate("/adatok");
    };

    const handleViewSeat = () => {
        navigate(`/ulohely/${user.id}`);
    };

    if (!user || !isAuthenticated) {
        return null;
    }

    if (showPinChange) {
        return (
            <div className={styles.container}>
                <div className={styles.pinChangeContainer}>
                    <PinInput
                        title={user.admin ? `${user.user} - Admin` : user.user}
                        subtitle={
                            pinChangeStep === "create"
                                ? "Hozz létre egy PIN-kódot"
                                : "Add meg újra a PIN-kódot"
                        }
                        onComplete={handlePinChangeComplete}
                        clearError={() => setPinError(false)}
                        error={pinError}
                    />
                </div>
                <button
                    className={styles.actionButton}
                    onClick={handleCancelPinChange}
                >
                    Mégsem
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Nasirend - {user.user}</h2>

            <div className={styles.movieList}>
                {movies.map((movie, id) => (
                    <div className={styles.movieCard} key={id}>
                        <MovieCard
                            id={id}
                            movie={movie}
                            userProfile={user}
                            onEdit={() => handleEdit(id)}
                            onInfo={(e) => {
                                e.stopPropagation();
                                handleMovieInfo(id);
                            }}
                        />
                    </div>
                ))}
            </div>

            <ActionRow label="Action Row">
                <button
                    className={styles.actionButton}
                    onClick={handleChangeProfile}
                >
                    Vissza
                </button>
                <button
                    className={styles.actionButton}
                    onClick={() => handleEdit(0)}
                >
                    Szerkesztés
                </button>
                <button
                    className={styles.actionButton}
                    onClick={handleChangePIN}
                >
                    PIN megváltoztatása
                </button>
                <button
                    className={styles.actionButton}
                    onClick={handleViewData}
                >
                    {isAdmin ? "Kezelőpult" : "Mások választásai"}
                </button>
                {user.seat_image && (
                    <button
                        className={styles.actionButton}
                        onClick={handleViewSeat}
                    >
                        Ülőhely
                    </button>
                )}
            </ActionRow>

            {notifications && notifications.length > 0 && (
                <div className={styles.notificationStack}>
                    {notifications.map((notif) => (
                        <div
                            className={`${styles.notificationItem} ${
                                dismissing.includes(notif.id)
                                    ? styles.dismissing
                                    : ""
                            }`}
                            key={notif.id}
                            ref={
                                notifRefs.current[notif.id] ||
                                (notifRefs.current[notif.id] =
                                    React.createRef())
                            }
                            onClick={() => handleDismissNotification(notif.id)}
                        >
                            <span className={styles.notification}>
                                {notif.msg}
                            </span>
                            <span className={styles.date}>{notif.date}</span>
                            <button
                                className={styles.closeButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDismissNotification(notif.id);
                                }}
                            >
                                <img
                                    src="/images/close.png"
                                    alt="close"
                                    className={styles.closeImage}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <BottomActions />
        </div>
    );
};

export default Home;
