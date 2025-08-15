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

    const drinkSuggestionClickInProgress = useRef(false);
    const chipsSuggestionClickInProgress = useRef(false);

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

    const movie = movies[dayId];
    if (movie === undefined) {
        return <NotFound />;
    }

    const drinkStatus = user[`acday${dayIdNumber}`][0];
    const chipsStatus = user[`acday${dayIdNumber}`][1];

    const { amountDrink, amountChips, trendingDrink, trendingChips } =
        useMemo(() => {
            const drinks = [];
            const chips = [];
            profiles.forEach((profile) => {
                const day = profile[`day${dayId}`];
                if (Array.isArray(day)) {
                    if (day[0]) drinks.push(day[0]);
                    if (day[1]) chips.push(day[1]);
                }
            });
            return {
                amountDrink: `${
                    Math.round(RUNTIMES[dayId] * RATIO_DRINK * 10) / 10
                }l`,
                amountChips: `${
                    Math.round((RUNTIMES[dayId] * RATIO_CHIPS) / 5) * 5
                }g`,
                trendingDrink: getTrending(drinks),
                trendingChips: getTrending(chips),
            };
        }, [profiles, dayId]);

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
                    <p className={styles.subtitleRow}>
                        Top választások: {trendingDrink} és {trendingChips}
                    </p>

                    <div className={styles.inputFields}>
                        <div className={styles.inputContainer}>
                            <input
                                ref={drinkInputRef}
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
                                onFocus={() => setIsDrinkFocused(true)}
                                onBlur={() => {
                                    setTimeout(() => {
                                        if (!drinkSuggestionClickInProgress.current) {
                                            setIsDrinkFocused(false);
                                        }
                                    }, 200);
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
                                            ? editedUser[`day${dayId}`][0]
                                            : user[`day${dayId}`][0] || ""
                                    }
                                    options={options.drink}
                                    favorites={favoriteDrinkOptions}
                                    mostFavorites={mostFavoriteDrinks}
                                    unit={"l"}
                                    suggestionClicked={(suggestion) => {
                                        drinkSuggestionClickInProgress.current = true;
                                        const newUser = JSON.parse(
                                            JSON.stringify(
                                                editedUser ? editedUser : user
                                            )
                                        );
                                        newUser[`day${dayId}`][0] = suggestion;
                                        setEditedUser(newUser);
                                        setTimeout(() => {
                                            setIsDrinkFocused(true);
                                            if (drinkInputRef.current) {
                                                drinkInputRef.current.focus();
                                            }
                                            // Reset the flag after focus
                                            setTimeout(() => {
                                                drinkSuggestionClickInProgress.current = false;
                                            }, 0);
                                        }, 100);
                                    }}
                                    heartClicked={favoriteDrink}
                                />
                            )}
                        </div>
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
                                onFocus={() => setIsChipsFocused(true)}
                                onBlur={() => {
                                    setTimeout(() => {
                                        if (!chipsSuggestionClickInProgress.current) {
                                            setIsChipsFocused(false);
                                        }
                                    }, 200);
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
                                            ? editedUser[`day${dayId}`][1]
                                            : user[`day${dayId}`][1] || ""
                                    }
                                    options={options.chips}
                                    favorites={favoriteChipsOptions}
                                    mostFavorites={mostFavoriteChips}
                                    unit={"g"}
                                    suggestionClicked={(suggestion) => {
                                        chipsSuggestionClickInProgress.current = true;
                                        const newUser = JSON.parse(
                                            JSON.stringify(
                                                editedUser ? editedUser : user
                                            )
                                        );
                                        newUser[`day${dayId}`][1] = suggestion;
                                        setEditedUser(newUser);
                                        setTimeout(() => {
                                            setIsChipsFocused(true);
                                            if (chipsInputRef.current) {
                                                chipsInputRef.current.focus();
                                            }
                                            // Reset the flag after focus
                                            setTimeout(() => {
                                                chipsSuggestionClickInProgress.current = false;
                                            }, 0);
                                        }, 100);
                                    }}
                                    heartClicked={favoriteChips}
                                />
                            )}
                        </div>
                    </div>

                    <ActionRow label="Action Row">
                        <button
                            className={styles.actionButton}
                            onClick={handleBack}
                        >
                            Vissza
                        </button>
                        {dayId !== 0 && (
                            <Link
                                className={styles.actionButton}
                                to={`/rendeles/${dayIdNumber - 1}`}
                                tabIndex={0}
                            >
                                Előző
                            </Link>
                        )}
                        {dayId !== 5 && (
                            <Link
                                className={styles.actionButton}
                                to={`/rendeles/${dayIdNumber + 1}`}
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
