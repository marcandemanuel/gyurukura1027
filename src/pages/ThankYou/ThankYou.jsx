"use client";

import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import styles from "./ThankYou.module.css";

const ThankYou = () => {
    const navigate = useNavigate();
    const { user } = useApp();

    const handleHome = () => {
        navigate("/nasirend");
    };

    if (!user) {
        navigate("/profilok");
        return null;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Elmentve</h2>
            <p className={styles.text}>
                Köszönjük a megrendelését! A rendelést az adminisztrátor
                hamarosan átnézi, és értesítjük, ha rendelése állapota módosul.
                Amennyiben még nem töltötte ki a teljes nasirendet, kérjük azt legyen szíves kitölteni, hogy rendelését
                teljesíteni tudjuk.
            </p>
            <button className={styles.button} onClick={handleHome}>
                Rendben
            </button>
        </div>
    );
};

export default ThankYou;
