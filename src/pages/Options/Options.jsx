"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import Loading from "../../components/Common/Loading/Loading";
import BottomActions from "../../components/BottomActions/BottomActions";
import styles from "./Options.module.css";

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

    const [isHoverable, setIsHoverable] = useState(false);

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
                                {options.chips.map((item, index) => (
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
