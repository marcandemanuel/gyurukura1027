"use client";

import { useParams } from "react-router-dom";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import { useApp } from "../../contexts/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useNavigation } from "../../contexts/NavigationContext.jsx";
import NotFound from "../NotFound/NotFound";
import BottomActions from "../../components/BottomActions/BottomActions.jsx";
import Loading from "../../components/Common/Loading/Loading.jsx";
import styles from "./OrderDay.module.css";

const TRANSLATIONS = {
    Elfogadva: "accepted",
    Teljesítve: "completed",
    Elutasítva: "declined",
};

const objectDiff = (dict1, dict2) => {
    const diffs = [];
    for (let i = 0; i < 6; i++) {
        if (dict1[`day${i}`][0] !== dict2[`day${i}`][0]) {
            diffs.push([i, 0]);
        }

        if (dict1[`day${i}`][1] !== dict2[`day${i}`][1]) {
            diffs.push([i, 1]);
        }
    }

    return diffs;
};

const OrderDay = () => {
    const { dayId } = useParams();
    const dayIdNumber = Number(dayId);
    const {
        user,
        updateProfile,
        editedUser,
        setEditedUser,
        isLoading,
        setIsLoading,
    } = useApp();
    const navigate = useNavigate();
    const config = useConfig();
    const [showThankyou, setShowThankyou] = useState(false);

    // Access navigationPile from NavigationContext
    const { navigationPile } = useNavigation();

    const movies = [
        "Váratlan Utazás",
        "Smaug Pusztasága",
        "Az Öt Sereg Csatája",
        "A Gyűrű Szövetsége",
        "A Két Torony",
        "A Király Visszatér",
    ];

    movies[config.birthday_on_movie_id] += " 🎂";

    const movie = movies[dayId];
    if (movie === undefined) {
        return <NotFound />;
    }

    const drinkStatus = user[`acday${dayIdNumber}`][0];
    const chipsStatus = user[`acday${dayIdNumber}`][1];

    const handleBack = () => {
        Object.entries(navigationPile).reverse().forEach(([ind, route]) => {
            if (!/^\/rendeles\/\d+$/.test(route)) {
                navigate(route)
            }
        })

        navigate('/nasirend')
    };

    const handleSave = () => {
        setIsLoading(true);
        if (!editedUser) {
            setIsLoading(false);
            handleBack();
            return;
        }

        const diffs = objectDiff(user, editedUser);

        if (!diffs) {
            setIsLoading(false);
            handleBack();
            return;
        }

        const newUser = JSON.parse(JSON.stringify(editedUser));

        diffs.forEach((diff) => {
            newUser[`acday${diff[0]}`][diff[1]] = "Eldöntetlen";
        });

        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
            now.getDate()
        )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
            now.getSeconds()
        )}`;

        newUser.notifications.push(["Köszönjük a megrendelését 🎉!", date]);

        setEditedUser(newUser);
        const success = updateProfile(newUser, "nasi_changed");
        // Immediately clear notifications from local user state to prevent duplicates
        if (success) {
            // Remove notifications from the user object in frontend state as well
            newUser.notifications = [];
            setEditedUser(newUser);
        }
        setShowThankyou(true);
        setIsLoading(false);
    };

    if (showThankyou) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Elmentve</h2>
                <p className={styles.text}>
                    Köszönjük a megrendelését! A rendelést az adminisztrátor
                    hamarosan átnézi, és értesítjük, ha rendelése állapota
                    módosul. Amennyiben még nem töltötte ki a teljes nasirendet,
                    kérjük azt legyen szíves kitölteni, hogy rendelését
                    teljesíteni tudjuk.
                </p>
                <div className={styles.actions}>
                    <button
                        className={styles.actionButton}
                        onClick={handleBack}
                    >
                        Vissza
                    </button>
                </div>
                <BottomActions />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <h2 className={styles.title}>{movie}</h2>

                    <div className={styles.inputFields}>
                        <div className={styles.inputContainer}>
                            <input
                                className={styles.inputField}
                                type="text"
                                placeholder="Inni"
                                value={
                                    editedUser
                                        ? editedUser[`day${dayId}`][0]
                                        : user[`day${dayId}`][0] || ""
                                }
                                onChange={(event) => {
                                    const newValue = event.target.value;
                                    const newUser = JSON.parse(
                                        JSON.stringify(
                                            editedUser ? editedUser : user
                                        )
                                    );
                                    newUser[`day${dayId}`][0] = newValue;
                                    setEditedUser(newUser);
                                }}
                                style={{ marginBottom: 20 }}
                            />
                            {drinkStatus !== "Eldöntetlen" && (
                                <img
                                    src={`/src/assets/images/${TRANSLATIONS[drinkStatus]}.png`}
                                    alt={TRANSLATIONS[drinkStatus]}
                                    className={styles.statusImage}
                                />
                            )}
                        </div>
                        <div className={styles.inputContainer}>
                            <input
                                className={styles.inputField}
                                type="text"
                                placeholder="Csipsz"
                                value={
                                    editedUser
                                        ? editedUser[`day${dayId}`][1]
                                        : user[`day${dayId}`][1] || ""
                                }
                                onChange={(event) => {
                                    const newValue = event.target.value;
                                    const newUser = JSON.parse(
                                        JSON.stringify(
                                            editedUser ? editedUser : user
                                        )
                                    );
                                    newUser[`day${dayId}`][1] = newValue;
                                    setEditedUser(newUser);
                                }}
                            />
                            {chipsStatus !== "Eldöntetlen" && (
                                <img
                                    src={`/src/assets/images/${TRANSLATIONS[chipsStatus]}.png`}
                                    alt={TRANSLATIONS[chipsStatus]}
                                    className={styles.statusImage}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.actionButton}
                            onClick={handleBack}
                        >
                            Vissza
                        </button>
                        {dayId !== 0 && (
                            <button
                                className={styles.actionButton}
                                onClick={() =>
                                    navigate(`/rendeles/${dayIdNumber - 1}`)
                                }
                            >
                                Előző
                            </button>
                        )}
                        {dayId !== 5 && (
                            <button
                                className={styles.actionButton}
                                onClick={() =>
                                    navigate(`/rendeles/${dayIdNumber + 1}`)
                                }
                            >
                                Következő
                            </button>
                        )}
                        <button
                            className={styles.actionButton}
                            onClick={handleSave}
                        >
                            Mentés
                        </button>
                    </div>
                    <BottomActions />
                </>
            )}
        </div>
    );
};

export default OrderDay;
