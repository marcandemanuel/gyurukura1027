"use client";

import React, { useState } from "react";
import styles from "./Notification.module.css"; // Assuming your CSS module is named YourComponent.module.css

function NotificationButton({ idx, notif, updateNotifications }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        setClicked(true);
        setTimeout(() => {
            updateNotifications()
        }, 200)
    };

    return (
        <div
            className={`${styles.notificationItem} ${
                clicked ? styles.closeClicked : ""
            }`}
            key={idx}
            onClick={handleClick}
        >
            <span className={styles.notification}>{notif[0]}</span>
            <span className={styles.date}>{notif[1]}</span>
            <button
                className={styles.closeButton}
                onClick={e => {
                    e.stopPropagation();
                    handleClick();
                }}
            >
                <img
                    src="/src/assets/images/close.png"
                    alt="close"
                    className={styles.closeImage}
                />
            </button>
        </div>
    );
}

export default NotificationButton;
