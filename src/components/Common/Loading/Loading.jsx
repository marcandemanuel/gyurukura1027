"use client";

import styles from "./Loading.module.css";

const Loading = () => {
    return (
        <div className={styles.loadingContainer}>
            <div
                className={styles.loadingDot}
                style={{ backgroundColor: "#9C8028" }}
            ></div>
            <div
                className={styles.loadingDot}
                style={{ backgroundColor: "#9C8028" }}
            ></div>
            <div
                className={styles.loadingDot}
                style={{ backgroundColor: "#9C8028" }}
            ></div>
        </div>
    );
};

export default Loading;
