"use client";

import styles from "./AutoComplete.module.css";
import { useEffect, useState } from "react";

const emojiMap = {
    "🍑": ["barack", "barackos"],
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
    let expandedNames = [option];

    for (const [emoji, variations] of Object.entries(emojiMap)) {
        if (option.includes(emoji)) {
            const baseText = option.replace(emoji, "").trim();
            expandedNames = variations.map(
                (variant) => `${baseText} ${variant}`
            );
        }
    }

    return expandedNames;
};

const AutoComplete = ({
    currentInput,
    options,
    favorites = [],
    mostFavorites = [],
    unit,
    heartClicked,
}) => {
    // DRAIN LOGS: Log all props at entry
    console.log("[AutoComplete] props", {
        currentInput,
        options,
        favorites,
        mostFavorites,
        unit,
        heartClicked,
    });

    const [suggestions, setSuggestions] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(null);

    useEffect(() => {
        console.log("[AutoComplete] useEffect deps", {
            currentInput,
            options,
            favorites,
            mostFavorites,
            unit,
        });

        if (!currentInput?.trim()) {
            setSuggestions([]);
            return;
        }

        const normalizedInput = normalizeText(currentInput);
        console.log("[AutoComplete] normalizedInput", normalizedInput);

        const directMatch = options.find((option) => {
            console.log("[AutoComplete] directMatch option", option);
            const expandedNames = expandOptionWithEmoji(option.name);
            console.log("[AutoComplete] expandedNames", expandedNames);
            const inputWords = normalizedInput.split(" ");
            console.log("[AutoComplete] inputWords", inputWords);

            return (
                expandedNames.some((name) => {
                    const words = normalizeText(name).split(" ");
                    console.log("[AutoComplete] expandedName words", words);

                    // LOG before .includes or .some
                    if (!option.amounts) {
                        console.log(
                            "[AutoComplete] option.amounts is undefined!",
                            option
                        );
                    }
                    if (!unit) {
                        console.log("[AutoComplete] unit is undefined!");
                    }

                    return (
                        ((inputWords.every((inputWord) =>
                            words.some((word) => word === inputWord)
                        ) &&
                            words.length === inputWords.length) ||
                            inputWords.every(
                                (inputWord) =>
                                    words.some((word) => word === inputWord) ||
                                    option.amounts.some((amount) => {
                                        return `${amount}${unit}`.startsWith(
                                            inputWord
                                        );
                                    })
                            )) &&
                        words.length === inputWords.length - 1
                    );
                }) &&
                (option.name.split(" ").length === inputWords.length ||
                    option.name.split(" ").length === inputWords.length - 1)
            );
        });

        console.log("[AutoComplete] directMatch result", directMatch);

        if (directMatch) {
            const matchedOptions = directMatch.amounts
                .filter((amount) => {
                    const inputWords = normalizedInput
                        .split(" ")
                    const allWords = new Set(
                        expandOptionWithEmoji(directMatch.name).flatMap((s) =>
                            s.split(" ")
                        )
                    );
                    console.log('[allWords]', allWords);
                    console.log("[inputWords]", inputWords);
                    const amountInDirectMatch = inputWords
                        .find((word) => !allWords.includes(word));
                    console.log('[amountInDirectMatch]', amountInDirectMatch);
                    return (
                        amountInDirectMatch &&
                        `${amount}${unit}`.startsWith(amountInDirectMatch)
                    );
                })
                .map((amount) => `${directMatch.name} ${amount}${unit}`)
                .reverse();
            console.log(
                "[AutoComplete] matchedOptions (directMatch)",
                matchedOptions
            );
            setSuggestions(matchedOptions);
        } else {
            const matchedOptions = options
                .filter((option) => {
                    const expandedNames = expandOptionWithEmoji(option.name);
                    console.log(
                        "[AutoComplete] filter expandedNames",
                        expandedNames
                    );

                    return expandedNames.some((name) => {
                        const words = normalizeText(name).split(" ");
                        const inputWords = normalizedInput.split(" ");
                        return inputWords.every((inputWord) =>
                            words.some((word) => word.startsWith(inputWord))
                        );
                    });
                })
                .map((option) => option.name)
                .sort((a, b) => {
                    // LOG before .includes
                    if (!favorites)
                        console.log(
                            "[AutoComplete] favorites is undefined before .includes(a)",
                            a
                        );
                    if (!mostFavorites)
                        console.log(
                            "[AutoComplete] mostFavorites is undefined before .includes(a)",
                            a
                        );
                    if (!favorites)
                        console.log(
                            "[AutoComplete] favorites is undefined before .includes(b)",
                            b
                        );
                    if (!mostFavorites)
                        console.log(
                            "[AutoComplete] mostFavorites is undefined before .includes(b)",
                            b
                        );

                    const scoreA = favorites.includes(a)
                        ? 2
                        : 0 + mostFavorites.includes(a)
                        ? 1
                        : 0;
                    const scoreB = favorites.includes(b)
                        ? 2
                        : 0 + mostFavorites.includes(b)
                        ? 1
                        : 0;

                    return scoreA - scoreB || a.localeCompare(b);
                });
            console.log(
                "[AutoComplete] matchedOptions (fallback)",
                matchedOptions
            );
            setSuggestions(matchedOptions);
        }
    }, [currentInput, options, favorites, mostFavorites, unit]);

    return (
        <div className={styles.autoCompleteContainer}>
            {console.log("[AutoComplete] render suggestions", suggestions)}
            {suggestions.map((suggestion, index) => (
                <div
                    key={index}
                    className={`${styles.suggestionItem} ${
                        (() => {
                            if (!mostFavorites)
                                console.log(
                                    "[AutoComplete] mostFavorites is undefined in render .includes",
                                    suggestion
                                );
                            return mostFavorites.includes(suggestion);
                        })()
                            ? styles.favoriteItem
                            : ""
                    }`}
                    onPointerEnter={() => setHoverIndex(index)}
                    onPointerLeave={() => setHoverIndex(null)}
                >
                    <span className={styles.suggestionText}>{suggestion}</span>
                    {(() => {
                        if (!favorites)
                            console.log(
                                "[AutoComplete] favorites is undefined in render .includes",
                                suggestion
                            );
                        return (
                            hoverIndex === index ||
                            favorites.includes(suggestion)
                        );
                    })() && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!heartClicked)
                                    console.log(
                                        "[AutoComplete] heartClicked is undefined!"
                                    );
                                // item is not defined, log warning
                                if (typeof item === "undefined") {
                                    console.log(
                                        "[AutoComplete] item is undefined in heartClicked"
                                    );
                                }
                                heartClicked(item?.name);
                            }}
                            className={`${styles.favoriteButton} ${
                                (() => {
                                    if (!favorites)
                                        console.log(
                                            "[AutoComplete] favorites is undefined in render .includes(item.name)"
                                        );
                                    // item is not defined, log warning
                                    if (typeof item === "undefined") {
                                        console.log(
                                            "[AutoComplete] item is undefined in render .includes(item.name)"
                                        );
                                        return false;
                                    }
                                    return favorites.includes(item.name);
                                })()
                                    ? styles.favorite
                                    : styles.notFavorite
                            }`}
                        >
                            <img
                                src={`/images/${
                                    (() => {
                                        if (!favorites)
                                            console.log(
                                                "[AutoComplete] favorites is undefined in render .includes(item.name) for img"
                                            );
                                        if (typeof item === "undefined") {
                                            console.log(
                                                "[AutoComplete] item is undefined in render .includes(item.name) for img"
                                            );
                                            return false;
                                        }
                                        return favorites.includes(item.name);
                                    })()
                                        ? "heart_filled"
                                        : "heart"
                                }.png`}
                                alt="favorite_image"
                                className={styles.favoriteImage}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AutoComplete;
