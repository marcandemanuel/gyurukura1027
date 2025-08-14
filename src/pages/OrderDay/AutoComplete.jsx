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
    let expandedNames = [];

    for (const [emoji, variations] of Object.entries(emojiMap)) {
        if (option.includes(emoji)) {
            const baseText = option.replace(emoji, "").trim();
            expandedNames = variations.map(
                (variant) => `${baseText} ${variant}`
            );
        }
    }

    expandedNames.push(option)

    return expandedNames;
};

const AutoComplete = ({
    currentInput,
    options,
    favorites = [],
    mostFavorites = [],
    unit,
    suggestionClicked,
    heartClicked,
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [splittedInput, setSplittedInput] = useState([]);
    const [inputText, setInputText] = useState('')

    useEffect(() => {
        setInputText(currentInput);
        const splitted = currentInput.split(/, | és /);
        if (currentInput.endsWith(' és ') || currentInput.endsWith(', ')) splitted.push('')
        setSplittedInput(splitted);
        console.log('[AutoComplete] currentInput, splitted', currentInput , ',', splitted)
        const normalizedInput = splitted && splitted.length ? normalizeText(splitted.at(-1)) : '';

        const directMatch = options.find((option) => {
            const expandedNames = expandOptionWithEmoji(option.name);
            const inputWords = normalizedInput.split(" ");

            return (
                expandedNames.some((name) => {
                    const words = normalizeText(name).split(" ");

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

        let matchedAmounts = [];
        if (directMatch) {
            matchedAmounts = directMatch.amounts
                .filter((amount) => {
                    const inputWords = normalizedInput.split(" ");
                    const allWords = expandOptionWithEmoji(
                        directMatch.name
                    ).flatMap((s) => normalizeText(s).split(" "));
                    const amountInDirectMatch = inputWords.find(
                        (word) => !allWords.includes(word)
                    ) || '';
                    return (
                        `${amount}${unit}`.startsWith(amountInDirectMatch)
                    );
                })
                .map((amount) => ({suggestion: `${directMatch.name} ${amount}${unit}`, name: directMatch.name}))
                .reverse();
        }

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
            .map((option) => ({suggestion: option.name, name: option.name}))
            .sort((a, b) => {
                const scoreA = favorites.includes(a.suggestion)
                    ? 2
                    : 0 + mostFavorites.includes(a.suggestion)
                    ? 1
                    : 0;
                const scoreB = favorites.includes(b.suggestion)
                    ? 2
                    : 0 + mostFavorites.includes(b.suggestion)
                    ? 1
                    : 0;

                return scoreB - scoreA || a.suggestion.localeCompare(b.suggestion);
            });

        let allSuggestions = [
            ...matchedAmounts,
            ...matchedOptions
        ];

        const seen = new Set();
        allSuggestions = allSuggestions.filter((item) => {
            const key = normalizeText(item.suggestion);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        setSuggestions(allSuggestions);
    }, [currentInput, options, favorites, mostFavorites, unit]);

    if (!suggestions || suggestions.length === 0) {
        return null;
    }
    
    return (
        <div className={styles.autoCompleteContainer}>
            {suggestions.map((suggestion, index) => (
                <div
                    key={index}
                    className={`${styles.suggestionItem} ${
                        mostFavorites.includes(suggestion.name)
                            ? styles.favoriteItem
                            : ""
                    }`}
                    onPointerEnter={() => setHoverIndex(index)}
                    onPointerLeave={() => setHoverIndex(null)}
                    onClick={() => {
                        console.log('suggestionClicked', suggestionClicked)
                        if (suggestionClicked) {
                            console.log('[AutoComplete] splittedInput', splittedInput)
                            console.log('[AutoComplete] inputText', inputText)
                            const lengthOfLast = splittedInput.at(-1).length;
                            const text = lengthOfLast ? inputText.slice(0, -lengthOfLast) : inputText
                            console.log('[AutoComplete] text', text)
                            suggestionClicked(`${text}${suggestion.suggestion}`)
                        }
                    }}
                >
                    <span className={styles.suggestionText}>
                        {suggestion.suggestion}
                    </span>
                    {(hoverIndex === index ||
                        favorites.includes(suggestion.name)) && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                heartClicked(suggestion.name);
                            }}
                            className={`${styles.favoriteButton} ${
                                favorites.includes(suggestion.name)
                                    ? styles.favorite
                                    : styles.notFavorite
                            }`}
                        >
                            <img
                                src={`/images/${
                                    favorites.includes(suggestion.name)
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
