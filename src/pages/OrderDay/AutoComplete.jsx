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
    let expandedNames = [option.name];

    for (const [emoji, variations] of Object.entries(emojiMap)) {
        if (option.name.includes(emoji)) {
            const baseText = option.name.replace(emoji, "").trim();
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
    const [suggestions, setSuggestions] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(null);

    useEffect(() => {
        if (!currentInput?.trim()) {
            setSuggestions([]);
            return;
        }

        const normalizedInput = normalizeText(currentInput);
        const directMatch = options.find((option) => {
            const expandedNames = expandOptionWithEmoji(option.name);
            const inputWords = normalizedInput.split(" ");

            return expandedNames.some((name) => {
                const words = normalizeText(name).split(" ");

                return (
                    inputWords.every((inputWord) =>
                        words.some((word) => word === inputWord || option.amounts.some((amount) => `${amount}${unit}`.startsWith(inputWord)))
                    ) && words.length === inputWords.length
                );
            }) && (option.name.split(' ').length === inputWords.length || option.name.split(' ').length === inputWords.length - 1);
        });

        if (directMatch) {
            const matchedOptions = directMatch.amounts
                .filter((amount) => {
                    const inputWords = normalizedInput
                        .split(" ")
                        .filter((inputWord) => inputWord);
                    const amountInDirectMatch = inputWords.find((inputWord) => {
                        expandOptionWithEmoji(directMatch.name).some(
                            (expandedName) => {
                                expandedName
                                    .split(" ")
                                    .some((word) => word !== inputWord);
                            }
                        );
                    });
                    return (
                        amountInDirectMatch &&
                        amount.startsWith(amountInDirectMatch)
                    );
                })
                .map((amount) => {
                    return `${directMatch.name} ${amount}${unit}`;
                })
                .reverse();
            setSuggestions(matchedOptions);
        } else {
            const matchedOptions = options
                .filter((option) => {
                    const expandedNames = expandOptionWithEmoji(option.name);

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
            setSuggestions(matchedOptions);
        }
    }, [currentInput, options, favorites, mostFavorites, unit]);

    return (
        <div className={styles.autoCompleteContainer}>
            {suggestions.map((suggestion, index) => (
                <div
                    key={index}
                    className={`${styles.suggestionItem} ${
                        mostFavorites.includes(suggestion)
                            ? styles.favoriteItem
                            : ""
                    }`}
                    onPointerEnter={() => setHoverIndex(index)}
                    onPointerLeave={() => setHoverIndex(null)}
                >
                    <span className={styles.suggestionText}>{suggestion}</span>
                    {(hoverIndex === index ||
                        favorites.includes(suggestion)) && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                heartClicked(item.name);
                            }}
                            className={`${styles.favoriteButton} ${
                                favorites.includes(item.name)
                                    ? styles.favorite
                                    : styles.notFavorite
                            }`}
                        >
                            <img
                                src={`/images/${
                                    favorites.includes(item.name)
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
