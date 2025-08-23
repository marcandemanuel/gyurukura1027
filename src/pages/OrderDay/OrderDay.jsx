"use client";

import { useParams, Link } from "react-router-dom";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import { useApp } from "../../contexts/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useMemo } from "react";
import { useNavigation } from "../../contexts/NavigationContext.jsx";
import NotFound from "../NotFound/NotFound";
import BottomActions from "../../components/BottomActions/BottomActions.jsx";
import Loading from "../../components/Common/Loading/Loading.jsx";
import styles from "./OrderDay.module.css";
import ActionRow from "../../components/Common/ActionRow";
import AutoComplete from "./AutoComplete.jsx";

const TRANSLATIONS = {
    Elfogadva: "accepted",
    Teljesítve: "completed",
    Elutasítva: "declined",
};

const RUNTIMES = [182, 186, 164, 208, 235, 263];
const RATIO_DRINK = 2 / 263;
const RATIO_CHIPS = 200 / 263;

function getTrending(arr) {
    if (!arr.length) return "";
    const freq = {};
    const original = {};
    arr.forEach((item) => {
        if (!item) return;
        const norm = item.replace(/\s+/g, "").toLowerCase();
        if (!(norm in original)) {
            original[norm] = item; // store first appearance for display
        }
        freq[norm] = (freq[norm] || 0) + 1;
    });
    let max = 0;
    let trendingNorm = "";
    Object.entries(freq).forEach(([norm, count]) => {
        if (count > max) {
            max = count;
            trendingNorm = norm;
        }
    });
    return original[trendingNorm] || null;
}

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
        profiles,
        user,
        updateProfile,
        editedUser,
        setEditedUser,
        isLoading,
        setIsLoading,
        favoriteDrinkOptions,
        favoriteChipsOptions,
        mostFavoriteDrinks,
        mostFavoriteChips,
        options,
        favoriteDrink,
        favoriteChips,
    } = useApp();
    const config = useConfig();
    const [showThankyou, setShowThankyou] = useState(false);
    const [isDrinkFocused, setIsDrinkFocused] = useState(false);
    const [isChipsFocused, setIsChipsFocused] = useState(false);

    const drinkInputRef = useRef(null);
    const chipsInputRef = useRef(null);

    const { back } = useNavigation();

    const movies = [
        "Váratlan Utazás",
        "Smaug Pusztasága",
        "Az Öt Sereg Csatája",
        "A Gyűrű Szövetsége",
        "A Két Torony",
        "A Király Visszatér",
    ];

    movies[config.birthday_on_movie_id] += " 🎂";

    const movie = movies[dayIdNumber-1];
    if (movie === undefined) {
        return <NotFound />;
    }

    const drinkStatus = user[`acday${dayIdNumber-1}`][0];
    const chipsStatus = user[`acday${dayIdNumber-1}`][1];

    const { amountDrink, amountChips, topDrink, topChips } = useMemo(() => {
        const drinks = [];
        const chips = [];
        profiles.forEach((profile) => {
            const day = profile[`day${dayIdNumber-1}`];
            if (Array.isArray(day)) {
                if (day[0]) drinks.push(day[0]);
                if (day[1]) chips.push(day[1]);
            }
        });
        return {
            amountDrink: `${
                Math.round(RUNTIMES[dayIdNumber-1] * RATIO_DRINK * 10) / 10
            }l`,
            amountChips: `${
                Math.round((RUNTIMES[dayIdNumber-1] * RATIO_CHIPS) / 5) * 5
            }g`,
            topDrink: options.top.drink[dayIdNumber-1] || null,
            topChips: options.top.chips[dayIdNumber-1] || null,
        };
    }, [profiles, dayIdNumber-1]);

    const handleBack = () => {
        back([/^\/nasirend$/, /^\/film\/\d+$/], "/nasirend");
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
        if (success) {
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
                <ActionRow label="Action Row">
                    <button
                        className={styles.actionButton}
                        onClick={handleBack}
                    >
                        Vissza
                    </button>
                </ActionRow>
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
                    <p className={styles.subtitleRow}>
                        Ajánlott mennyiségek: {amountDrink} inni és{" "}
                        {amountChips} csipsz
                    </p>
                    {topDrink && topChips && (
                        <p
                            className={styles.subtitleRow}
                            onClick={() => {
                                const newUser = JSON.parse(
                                    JSON.stringify(
                                        editedUser ? editedUser : user
                                    )
                                );
                                newUser[`day${dayIdNumber-1}`][0] = topDrink;
                                newUser[`day${dayIdNumber-1}`][1] = topChips;
                                setEditedUser(newUser);

                                if (drinkInputRef.current) {
                                    drinkInputRef.current.value = topDrink;
                                }

                                if (chipsInputRef.current) {
                                    chipsInputRef.current.value = topChips;
                                }
                            }}
                        >
                            Top választás: {topDrink} és {topChips}
                        </p>
                    )}

                    <div className={styles.inputFields}>
                        <div
                            className={styles.inputWithAutoComplete}
                            onFocus={() => {
                                setIsDrinkFocused(true);
                            }}
                            onBlur={() => {
                                setIsDrinkFocused(false);
                            }}
                        >
                            <div className={styles.inputContainer}>
                                <input
                                    ref={drinkInputRef}
                                    className={styles.inputField}
                                    type="text"
                                    placeholder="Inni"
                                    value={
                                        editedUser
                                            ? editedUser[`day${dayIdNumber-1}`][0]
                                            : user[`day${dayIdNumber-1}`][0] || ""
                                    }
                                    onChange={(event) => {
                                        const newValue = event.target.value;
                                        const newUser = JSON.parse(
                                            JSON.stringify(
                                                editedUser ? editedUser : user
                                            )
                                        );
                                        newUser[`day${dayIdNumber-1}`][0] = newValue;
                                        setEditedUser(newUser);
                                    }}
                                />
                                {drinkStatus !== "Eldöntetlen" && (
                                    <img
                                        src={`/images/${TRANSLATIONS[drinkStatus]}.png`}
                                        alt={TRANSLATIONS[drinkStatus]}
                                        className={styles.statusImage}
                                    />
                                )}
                            </div>
                            <div className={styles.autoComplete}>
                                {isDrinkFocused && (
                                    <AutoComplete
                                        currentInput={
                                            editedUser
                                                ? editedUser[`day${dayIdNumber-1}`][0]
                                                : user[`day${dayIdNumber-1}`][0] || ""
                                        }
                                        options={options.drink}
                                        favorites={favoriteDrinkOptions}
                                        mostFavorites={mostFavoriteDrinks}
                                        unit={"l"}
                                        suggestionClicked={(suggestion) => {
                                            const newUser = JSON.parse(
                                                JSON.stringify(
                                                    editedUser
                                                        ? editedUser
                                                        : user
                                                )
                                            );
                                            newUser[`day${dayIdNumber-1}`][0] =
                                                suggestion;
                                            setEditedUser(newUser);
                                            setIsDrinkFocused(true);
                                            if (drinkInputRef.current) {
                                                drinkInputRef.current.value =
                                                    suggestion;
                                                drinkInputRef.current.focus();
                                            }
                                        }}
                                        heartClicked={favoriteDrink}
                                    />
                                )}
                            </div>
                        </div>
                        <div
                            className={styles.inputWithAutoComplete}
                            onFocus={() => setIsChipsFocused(true)}
                            onBlur={() => setIsChipsFocused(false)}
                        >
                            <div
                                className={styles.inputContainer}
                                style={{ marginTop: 30 }}
                            >
                                <input
                                    ref={chipsInputRef}
                                    className={styles.inputField}
                                    type="text"
                                    placeholder="Csipsz"
                                    value={
                                        editedUser
                                            ? editedUser[`day${dayIdNumber-1}`][1]
                                            : user[`day${dayIdNumber-1}`][1] || ""
                                    }
                                    onChange={(event) => {
                                        const newValue = event.target.value;
                                        const newUser = JSON.parse(
                                            JSON.stringify(
                                                editedUser ? editedUser : user
                                            )
                                        );
                                        newUser[`day${dayIdNumber-1}`][1] = newValue;
                                        setEditedUser(newUser);
                                    }}
                                />
                                {chipsStatus !== "Eldöntetlen" && (
                                    <img
                                        src={`/images/${TRANSLATIONS[chipsStatus]}.png`}
                                        alt={TRANSLATIONS[chipsStatus]}
                                        className={styles.statusImage}
                                    />
                                )}
                            </div>
                            <div className={styles.autoComplete}>
                                {isChipsFocused && (
                                    <AutoComplete
                                        currentInput={
                                            editedUser
                                                ? editedUser[`day${dayIdNumber-1}`][1]
                                                : user[`day${dayIdNumber-1}`][1] || ""
                                        }
                                        options={options.chips}
                                        favorites={favoriteChipsOptions}
                                        mostFavorites={mostFavoriteChips}
                                        unit={"g"}
                                        suggestionClicked={(suggestion) => {
                                            const newUser = JSON.parse(
                                                JSON.stringify(
                                                    editedUser
                                                        ? editedUser
                                                        : user
                                                )
                                            );
                                            newUser[`day${dayIdNumber-1}`][1] =
                                                suggestion;
                                            setEditedUser(newUser);
                                            setIsChipsFocused(true);
                                            if (chipsInputRef.current) {
                                                chipsInputRef.current.value =
                                                    suggestion;
                                                chipsInputRef.current.focus();
                                            }
                                        }}
                                        heartClicked={favoriteChips}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <ActionRow label="Action Row">
                        <button
                            className={styles.actionButton}
                            onClick={handleBack}
                        >
                            Vissza
                        </button>
                        {dayIdNumber !== 1 && (
                            <Link
                                className={styles.actionButton}
                                to={`/nasirendeles/${dayIdNumber - 1}`}
                                tabIndex={0}
                            >
                                Előző
                            </Link>
                        )}
                        {dayIdNumber !== movies.length && (
                            <Link
                                className={styles.actionButton}
                                to={`/nasirendeles/${dayIdNumber + 1}`}
                                tabIndex={0}
                            >
                                Következő
                            </Link>
                        )}
                        <button
                            className={styles.actionButton}
                            onClick={handleSave}
                        >
                            Mentés
                        </button>
                    </ActionRow>
                    <BottomActions />
                </>
            )}
        </div>
    );
};

export default OrderDay;
