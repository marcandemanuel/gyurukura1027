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
    const [openChipsIndex, setOpenChipsIndex] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const drinkClicked = (item, index) => {
        console.log(openDrinkIndex, index);
        if (openDrinkIndex === index) {
            const largest = item.amounts[item.amounts.length - 1];
            navigator.clipboard.writeText(`${item.name} ${largest}l`);
        }
        setOpenDrinkIndex(index);
    };

    const chipsClicked = (item, index) => {
        console.log(openChipsIndex, index);
        if (openChipsIndex === index) {
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
                                        key={index}
                                        className={`${styles.option} ${
                                            openDrinkIndex === index
                                                ? styles.open
                                                : ""
                                        }`}
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                        onClick={() =>
                                            drinkClicked(item, index)
                                        }
                                        tabIndex={0}
                                        onBlur={() => setOpenDrinkIndex(null)}
                                    >
                                        <h4 className={styles.optionTitle}>
                                            {item.name}
                                        </h4>
                                        <div className={styles.details}>
                                            <h5 className={styles.availableIn}>
                                                Elérhető mennyiségek:
                                            </h5>
                                            <p className={styles.amounts}>
                                                {item.amounts.map((amount, i) => (
                                                    <span
                                                        key={i}
                                                        className={styles.amountClickable}
                                                        onClick={(e) => copyDrinkAmount(item, amount, e)}
                                                        tabIndex={0}
                                                    >
                                                        {amount}l
                                                        {i !== item.amounts.length - 1 ? ", " : ""}
                                                    </span>
                                                ))}
                                            </p>
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
                                        key={index}
                                        className={`${styles.option} ${
                                            openChipsIndex === index
                                                ? styles.open
                                                : ""
                                        }`}
                                        style={{
                                            animationDelay: `${
                                                (options.drink.length + index) *
                                                0.1
                                            }s`,
                                        }}
                                        onClick={() =>
                                            chipsClicked(item, index)
                                        }
                                        tabIndex={0}
                                        onBlur={() => setOpenChipsIndex(null)}
                                    >
                                        <h4 className={styles.optionTitle}>
                                            {item.name}
                                        </h4>
                                        <div className={styles.details}>
                                            <h5 className={styles.availableIn}>
                                                Elérhető mennyiségek:
                                            </h5>
                                            <p className={styles.amounts}>
                                                {item.amounts.map((amount, i) => (
                                                    <span
                                                        key={i}
                                                        className={styles.amountClickable}
                                                        onClick={(e) => copyChipsAmount(item, amount, e)}
                                                        tabIndex={0}
                                                    >
                                                        {amount}g
                                                        {i !== item.amounts.length - 1 ? ", " : ""}
                                                    </span>
                                                ))}
                                            </p>
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
