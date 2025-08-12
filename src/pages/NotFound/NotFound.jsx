"use client";

import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import styles from "./NotFound.module.css";

const NotFound = () => {
    const navigate = useNavigate();
    const { setIsNotFound } = useApp();

    useEffect(() => {
        setIsNotFound(true);
    }, [setIsNotFound]);

    return (
        <div className={styles.container}>
            <div className={styles.notFoundTextContainer}>
                <div className={styles.notFoundTextContent}>
                    <h2 className={styles.title}>404</h2>
                    <h3 className={styles.subtitle}>
                        A szerver nem találja ezt az oldalt.
                    </h3>
                    <Link
                        className={styles.homeButton}
                        to="/"
                        tabIndex={0}
                    >
                        Kezdőlap
                    </Link>
                </div>
                <img
                    src="/images/404_top.png"
                    alt="404 illustration"
                    className={styles.notFoundImageRight}
                />
            </div>
        </div>
    );
};

export default NotFound;
