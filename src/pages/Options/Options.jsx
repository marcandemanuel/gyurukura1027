"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import Loading from "../../components/Common/Loading/Loading";
import BottomActions from "../../components/BottomActions/BottomActions";
import styles from "./Options.module.css";

const emojiMap = {
    "🍑": ["barack", "barackos"],
    "🍐": ["körte", "körtés"],
    "🍊": ["narancs", "narancsos"],
    "🫐": ["áfonya", "áfonyás"],
    "🧀": ["sajt", "sajtos"],
    "🍒": ["meggy", "cseresznye", "meggyes", "cseresznyés"],
    "🍋": ["citrom", "citromos"],
    "🍇": ["szőlő", "szőlős"],
    "🍓": ["eper", "epres"],
    "🧂": ["só", "sós"],
    "🍕": ["pizza", "pizzás"],
    "🍅": [
        "paradicsom",
        "ketchup",
        "kecsap",
        "paradicsomos",
        "ketchupos",
        "kecsapos",
    ],
    "🌶️": ["chili", "csili", "chilis", "csilis", "csípős"],
    "🥓": ["bacon", "baconös", "békön", "békönös"],
};

const normalizeText = (text) => {
    return text.toLowerCase().trim();
};

const expandOptionWithEmoji = (option) => {
    let expandedNames = [];

    for (const [emoji, variations] of Object.entries(emojiMap)) {
        if (option.includes(emoji)) {
            const baseText = option.replace(emoji, "").trim();
            expandedNames = variations.map(
                (variant) => `${baseText} ${variant}`
            );
        }
    }

    expandedNames.push(option);

    return expandedNames;
};

const Options = () => {
    const [openDrinkIndex, setOpenDrinkIndex] = useState(null);
    const [hoverDrinkIndex, setHoverDrinkIndex] = useState(null);
    const [openChipsIndex, setOpenChipsIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const {
        user,
        favoriteDrinkOptions,
        favoriteChipsOptions,
        mostFavoriteDrinks,
        mostFavoriteChips,
        options,
        favoriteChips,
        favoriteDrink,
    } = useApp();

    const [displayedOptions, setDisplayedOptions] = useState(options)
    const [isHoverable, setIsHoverable] = useState(false);
    const [searchValue, setSearchValue] = useState('')

    useEffect(() => {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia("(hover: hover)");
            setIsHoverable(mediaQuery.matches);
        }
    }, []);

    useEffect(() => {
        if (options) {
            setLoading(false);
        }
    }, [options]);

    useEffect(() => {
        console.log(searchValue)
        const normalizedInput = searchValue.toLowerCase()
        
        if (normalizedInput === '') {
            setDisplayedOptions(options)
            return
        }

        const matchedDrinkOptions = options.drink
            .filter((option) => {
                const expandedNames = expandOptionWithEmoji(option.name);

                return expandedNames.some((name) => {
                    const words = normalizeText(name).split(" ");
                    const inputWords = normalizedInput.split(" ");
                    return (
                        inputWords.every((inputWord) =>
                            words.some((word) => word.startsWith(inputWord))
                        ) && normalizedInput !== normalizeText(name)
                    );
                });
            })
            .sort();

        const seen = new Set();
        const drinkOptions = matchedDrinkOptions.filter((item) => {
            const key = normalizeText(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const matchedChipsOptions = options.chips
            .filter((option) => {
                const expandedNames = expandOptionWithEmoji(option.name);

                return expandedNames.some((name) => {
                    const words = normalizeText(name).split(" ");
                    const inputWords = normalizedInput.split(" ");
                    return (
                        inputWords.every((inputWord) =>
                            words.some((word) => word.startsWith(inputWord))
                        ) && normalizedInput !== normalizeText(name)
                    );
                });
            })
            .sort();

        const chipsSeen = new Set();
        const chipsOptions = matchedChipsOptions.filter((item) => {
            const key = normalizeText(item);
            if (chipsSeen.has(key)) return false;
            chipsSeen.add(key);
            return true;
        });

        setDisplayedOptions({drink: drinkOptions, chips: chipsOptions})
    }, [searchValue, options]);

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

    return (
        <div className={styles.container}>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <h2 className={styles.title}>Biztosított nasik</h2>

                    <input type='text' placeholder="Keresés" onChange={(e) => setSearchValue(e.target.value)} />

                    <div className={styles.content}>
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Innik</h3>
                            <div className={styles.grid}>
                                {displayedOptions.drink.map((item, index) => (
                                    <div
                                        className={styles.optionContainer}
                                        key={index}
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                        onPointerEnter={() => {
                                            if (isHoverable)
                                                setHoverDrinkIndex(index);
                                        }}
                                        onPointerLeave={() => {
                                            if (isHoverable)
                                                setHoverDrinkIndex(null);
                                        }}
                                    >
                                        <div
                                            className={`${styles.option} ${
                                                openDrinkIndex === index
                                                    ? styles.open
                                                    : ""
                                            } ${
                                                mostFavoriteDrinks.includes(
                                                    item.name
                                                )
                                                    ? styles.favoriteItem
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
                                            {user && (
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
                                                                ? "heart_filled"
                                                                : "heart"
                                                        }.png`}
                                                        alt="favorite_image"
                                                        className={
                                                            styles.favoriteImage
                                                        }
                                                    />
                                                </div>
                                            )}
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
                                {displayedOptions.chips.map((item, index) => (
                                    <div
                                        className={styles.optionContainer}
                                        key={index}
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                    >
                                        <div
                                            className={`${styles.option} ${
                                                openChipsIndex === index
                                                    ? styles.open
                                                    : ""
                                            } ${
                                                mostFavoriteChips.includes(
                                                    item.name
                                                )
                                                    ? styles.favoriteItem
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
                                            {user && (
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
                                                                ? "heart_filled"
                                                                : "heart"
                                                        }.png`}
                                                        alt="favorite_image"
                                                        className={
                                                            styles.favoriteImage
                                                        }
                                                    />
                                                </div>
                                            )}
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
