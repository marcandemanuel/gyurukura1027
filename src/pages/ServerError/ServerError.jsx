"use client";

import { useNavigate } from "react-router-dom";
import styles from "./ServerError.module.css";

const ServerError = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.notFoundTextContainer}>
                <div className={styles.notFoundTextContent}>
                    <h2 className={styles.title}>500</h2>
                    <h3 className={styles.subtitle}>A szerver összeomlott.</h3>
                    <button
                        className={styles.homeButton}
                        onClick={() => window.location.href = "/"}
                    >
                        Újratöltés
                    </button>
                </div>
                <img
                    src="/images/500.png"
                    alt="500 illustration"
                    className={styles.notFoundImageRight}
                />
            </div>
        </div>
    );
};

export default ServerError;
