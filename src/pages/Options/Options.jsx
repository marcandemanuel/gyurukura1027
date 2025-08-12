"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import Loading from "../../components/Common/Loading/Loading";
import BottomActions from "../../components/BottomActions/BottomActions";
import styles from "./Options.module.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const Options = () => {
    const [options, setOptions] = useState({ drink: [], chips: [] });
    const [openDrinkIndex, setOpenDrinkIndex] = useState(null);
    const [hoverDrinkIndex, setHoverDrinkIndex] = useState(null);
    const [openChipsIndex, setOpenChipsIndex] = useState(null);
    const [hoverChipsIndex, setHoverChipsIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [favoriteDrinkOptions, setFavoriteDrinkOptions] = useState([]);
    const [favoriteChipsOptions, setFavoriteChipsOptions] = useState([]);
    const { profiles, user, updateProfile } = useApp();

    const [mostFavoriteDrinks, setMostFavoriteDrinks] = useState([]);
    const [mostFavoriteChips, setMostFavoriteChips] = useState([]);

    const getFavorites = (profiles, type) => {
        if (!Array.isArray(profiles)) return [];

        return profiles.reduce((acc, profile) => {
            const items = profile?.favorites?.[type];
            return Array.isArray(items) ? [...acc, ...items] : acc;
        }, []);
    };

    const getMostCommonItems = (items) => {
        if (!Array.isArray(items) || !items.length) return [];

        const frequency = items.reduce((acc, item) => {
            if (typeof item === "string" && item.trim()) {
                acc[item] = (acc[item] || 0) + 1;
            }
            return acc;
        }, {});

        if (!Object.keys(frequency).length) return [];

        const maxFrequency = Math.max(...Object.values(frequency));

        return Object.entries(frequency)
            .filter(([_, count]) => count === maxFrequency)
            .map(([item]) => item)
            .sort();
    };

    useEffect(() => {
        if (!Array.isArray(profiles)) {
            setMostFavoriteDrinks([]);
            setMostFavoriteChips([]);
            return;
        }

        const drinkFavorites = getFavorites(profiles, "drinks");
        const chipsFavorites = getFavorites(profiles, "chips");

        setMostFavoriteDrinks(getMostCommonItems(drinkFavorites));
        setMostFavoriteChips(getMostCommonItems(chipsFavorites));
    }, [profiles]);

    useEffect(() => {
        const fetchOptions = () => {
            setLoading(true);
            fetch(`${API_BASE}/options?t=${Date.now()}`)
                .then((res) => res.json())
                .then((data) => {
                    setOptions(data.options || { drink: [], chips: [] });
                    setLoading(false);
                })
                .catch((err) => {
                    setOptions({ drink: [], chips: [] });
                    setLoading(false);
                });
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        if (user) {
            setFavoriteDrinkOptions(user?.favorites?.drinks ?? []);
            setFavoriteChipsOptions(user?.favorites?.chips ?? []);
        }
    }, [user]);

    const drinkSelected = (item, index) => {
        if (openDrinkIndex === index || hoverDrinkIndex === index) {
            const largest = item.amounts[item.amounts.length - 1];
            navigator.clipboard.writeText(`${item.name} ${largest}l`);
        }
        setOpenDrinkIndex(index);
    };

    const chipsSelected = (item, index) => {
        if (openChipsIndex === index || hoverChipsIndex === index) {
            const largest = item.amounts[item.amounts.length - 1];
            navigator.clipboard.writeText(`${item.name} ${largest}g`);
        }
        setOpenChipsIndex(index);
    };

    const copyDrinkAmount = (item, amount, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${item.name} ${amount}l`);
    };

    const copyChipsAmount = (item, amount, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${item.name} ${amount}g`);
    };

    const favoriteDrink = (drinkName) => {
        if (!user) return;
        setLoading(true);
        const isFavorite = !favoriteDrinkOptions.includes(drinkName);
        const newUser = JSON.parse(JSON.stringify(user));

        newUser.favorites = {
            ...(newUser.favorites ?? {}),
            drinks: isFavorite
                ? [...(newUser.favorites?.drinks ?? []), drinkName]
                : (newUser.favorites?.drinks ?? []).filter(
                      (d) => d !== drinkName
                  ),
            chips: newUser.favorites?.chips ?? [],
        };

        console.log(newUser.favorites);

        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
            now.getDate()
        )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
            now.getSeconds()
        )}`;

        newUser.notifications.push(["Kedvenc elmentve 🎉!", date]);

        const success = updateProfile(newUser, "favorite");
        setFavoriteDrinkOptions(newUser.favorites.drinks);
        setLoading(false);
    };

    const favoriteChips = (chipsName) => {
        if (!user) return;
        setLoading(true);
        const isFavorite = !favoriteChipsOptions.includes(chipsName);
        const newUser = JSON.parse(JSON.stringify(user));

        newUser.favorites = {
            ...(newUser.favorites ?? {}),
            drinks: newUser.favorites?.drinks ?? [],
            chips: isFavorite
                ? [...(newUser.favorites?.chips ?? []), chipsName]
                : (newUser.favorites?.chips ?? []).filter(
                      (c) => c !== chipsName
                  ),
        };

        console.log(newUser.favorites);

        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
            now.getDate()
        )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
            now.getSeconds()
        )}`;

        // newUser.notifications.push(["Kedvenc elmentve 🎉!", date]);

        const success = updateProfile(newUser, "favorite");
        setFavoriteChipsOptions(newUser.favorites.chips);
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <h2 className={styles.title}>Biztosított nasik</h2>

                    <div className={styles.content}>
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Innik</h3>
                            <div className={styles.grid}>
                                {options.drink.map((item, index) => (
                                    <div
                                        className={styles.optionContainer}
                                        key={index}
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                        onPointerEnter={() =>
                                            setHoverDrinkIndex(index)
                                        }
                                        onPointerLeave={() =>
                                            setHoverDrinkIndex(null)
                                        }
                                    >
                                        {(hoverDrinkIndex === index ||
                                            openDrinkIndex === index ||
                                            favoriteDrinkOptions.includes(
                                                item.name
                                            )) &&
                                            user && (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        favoriteDrink(
                                                            item.name
                                                        );
                                                    }}
                                                    className={`${
                                                        styles.favoriteButton
                                                    } ${
                                                        favoriteDrinkOptions.includes(
                                                            item.name
                                                        )
                                                            ? styles.favorite
                                                            : styles.notFavorite
                                                    }`}
                                                >
                                                    <img
                                                        src={`/images/${
                                                            favoriteDrinkOptions.includes(
                                                                item.name
                                                            )
                                                                ? "favorite3"
                                                                : "favorite1"
                                                        }.png`}
                                                        alt="favorite_image"
                                                        className={
                                                            styles.favoriteImage
                                                        }
                                                    />
                                                </div>
                                            )}
                                        <div
                                            className={`${styles.option} ${
                                                openDrinkIndex === index ||
                                                hoverDrinkIndex === index
                                                    ? styles.open
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                drinkSelected(item, index)
                                            }
                                            tabIndex={0}
                                            onBlur={() =>
                                                setOpenDrinkIndex(null)
                                            }
                                        >
                                            <h4 className={styles.optionTitle}>
                                                {item.name}
                                            </h4>
                                            <div className={styles.details}>
                                                <h5
                                                    className={
                                                        styles.availableIn
                                                    }
                                                >
                                                    Elérhető mennyiségek:
                                                </h5>
                                                <p className={styles.amounts}>
                                                    {item.amounts.map(
                                                        (amount, i) => (
                                                            <span
                                                                key={i}
                                                                className={
                                                                    styles.amountClickable
                                                                }
                                                                onClick={(e) =>
                                                                    copyDrinkAmount(
                                                                        item,
                                                                        amount,
                                                                        e
                                                                    )
                                                                }
                                                                tabIndex={0}
                                                            >
                                                                {amount}l
                                                                {i !==
                                                                item.amounts
                                                                    .length -
                                                                    1
                                                                    ? ", "
                                                                    : ""}
                                                            </span>
                                                        )
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Csipszek</h3>
                            <div className={styles.grid}>
                                {options.chips.map((item, index) => (
                                    <div
                                        className={styles.optionContainer}
                                        key={index}
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                        onPointerEnter={() =>
                                            setHoverChipsIndex(index)
                                        }
                                        onPointerLeave={() =>
                                            setHoverChipsIndex(null)
                                        }
                                    >
                                        {(hoverChipsIndex === index ||
                                            openChipsIndex === index ||
                                            favoriteChipsOptions.includes(
                                                item.name
                                            )) &&
                                            user && (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        favoriteChips(
                                                            item.name
                                                        );
                                                    }}
                                                    className={`${
                                                        styles.favoriteButton
                                                    } ${
                                                        favoriteChipsOptions.includes(
                                                            item.name
                                                        )
                                                            ? styles.favorite
                                                            : styles.notFavorite
                                                    }`}
                                                >
                                                    <img
                                                        src={`/images/${
                                                            favoriteChipsOptions.includes(
                                                                item.name
                                                            )
                                                                ? "favorite3"
                                                                : "favorite1"
                                                        }.png`}
                                                        alt="favorite_image"
                                                        className={
                                                            styles.favoriteImage
                                                        }
                                                    />
                                                </div>
                                            )}
                                        <div
                                            className={`${styles.option} ${
                                                openChipsIndex === index ||
                                                hoverChipsIndex === index
                                                    ? styles.open
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                chipsSelected(item, index)
                                            }
                                            tabIndex={0}
                                            onBlur={() =>
                                                setOpenChipsIndex(null)
                                            }
                                        >
                                            <h4 className={styles.optionTitle}>
                                                {item.name}
                                            </h4>
                                            <div className={styles.details}>
                                                <h5
                                                    className={
                                                        styles.availableIn
                                                    }
                                                >
                                                    Elérhető mennyiségek:
                                                </h5>
                                                <p className={styles.amounts}>
                                                    {item.amounts.map(
                                                        (amount, i) => (
                                                            <span
                                                                key={i}
                                                                className={
                                                                    styles.amountClickable
                                                                }
                                                                onClick={(e) =>
                                                                    copyChipsAmount(
                                                                        item,
                                                                        amount,
                                                                        e
                                                                    )
                                                                }
                                                                tabIndex={0}
                                                            >
                                                                {amount}g
                                                                {i !==
                                                                item.amounts
                                                                    .length -
                                                                    1
                                                                    ? ", "
                                                                    : ""}
                                                            </span>
                                                        )
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <BottomActions />
                </>
            )}
        </div>
    );
};

export default Options;
