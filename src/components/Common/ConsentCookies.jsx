import React from "react";
import styles from "./ConsentCookies.module.css";

const ConsentCookies = ({ onAccept, onDecline }) => {
    return (
        <div className={styles.container}>
            <div className={styles.fadedBackground} />
            <div className={styles.textContainer}>
                <div className={styles.textContent}>
                    <h2 className={styles.title}>Nasik elfogadása</h2>
                    <p className={styles.subtitle}>
                        A nasik elfogadása nagyban megkönnyíti a kitöltési folyamatot, mivel a szerver meg tudja így jegyezni az eszközt.
                    </p>
                    <div className={styles.buttonRow}>
                        <button
                            onClick={onDecline}
                            className={styles.declineButton}
                        >
                            Elutasítom
                        </button>
                        <button
                            onClick={onAccept}
                            className={styles.acceptButton}
                        >
                            Elfogadom
                        </button>
                    </div>
                </div>
                <img
                    src="/images/nasik.png"
                    alt="nasik"
                    className={styles.imageRight}
                    draggable={false}
                />
            </div>
        </div>
    );
};

export default ConsentCookies;
