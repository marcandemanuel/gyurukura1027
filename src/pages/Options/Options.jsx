"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import Loading from "../../components/Common/Loading/Loading";
import BottomActions from "../../components/BottomActions/BottomActions";
import styles from "./Options.module.css";

const Options = () => {
    const [options, setOptions] = useState({ drink: [], chips: [] });
    const [openDrinkIndex, setOpenDrinkIndex] = useState(null);
    const [openChipsIndex, setOpenChipsIndex] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/options");
                const data = await res.json();
                setOptions(data.options || { drink: [], chips: [] });
            } catch (err) {
                console.error("Failed to load options:", err);
            }
            setLoading(false);
        };
        fetchOptions();
    }, []);

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
                                            setOpenDrinkIndex(
                                                openDrinkIndex === index
                                                    ? null
                                                    : index
                                            )
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
                                                {item.amounts
                                                    .map(
                                                        (amount) => `${amount}l`
                                                    )
                                                    .join(", ")}
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
                                            setOpenChipsIndex(
                                                openChipsIndex === index
                                                    ? null
                                                    : index
                                            )
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
                                                {item.amounts
                                                    .map(
                                                        (amount) => `${amount}g`
                                                    )
                                                    .join(", ")}
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
