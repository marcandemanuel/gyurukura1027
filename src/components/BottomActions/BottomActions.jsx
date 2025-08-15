import styles from "./BottomActions.module.css";
import { useNavigate, Link } from "react-router-dom";
import { useNavigation } from "../../contexts/NavigationContext";
import { useApp } from "../../contexts/AppContext";
import React, { useRef, useEffect, useState } from "react";

const BottomActions = () => {
    const navigate = useNavigate();
    const { confettiStatus, setConfettiStatus } = useApp();
    const excludedRoutes = ["/visszaszamlalo", "/nasiopciok", "/gyurukura1027"];
    const normalizedPath = location.pathname.toLowerCase();

    const shouldShowOnlyBack = excludedRoutes.includes(normalizedPath);
    const backFromConfetti = confettiStatus === 1;

    const { back } = useNavigation();

    const handleBack = () => {
        back([], '/')
    };

    const [open, setOpen] = useState(false);
    const [wrapped, setWrapped] = useState(false);

    const actionButtons = [
        <Link
            key="gyurukura"
            className={styles.bottomButton}
            to="/gyurukura1027"
            tabIndex={0}
        >
            GyűrűkUra 10-27
        </Link>,
        <Link
            key="visszaszamlalo"
            className={styles.bottomButton}
            to="/visszaszamlalo"
            tabIndex={0}
        >
            Visszaszámláló
        </Link>,
        <Link
            key="nasiopciok"
            className={styles.bottomButton}
            to="/nasiopciok"
            tabIndex={0}
        >
            Nasi opciók
        </Link>,
    ];

    const rowRef = useRef(null);

    useEffect(() => {
        function checkWrapped() {
            if (!rowRef.current) return;
            const el = rowRef.current;
            const buttons = Array.from(el.querySelectorAll("button"));
            if (buttons.length <= 1) {
                setWrapped(false);
                setOpen(false);
                return;
            }
            const firstTop = buttons[0]?.offsetTop;
            if (firstTop === 0) {
                return
            }
            const isWrapped = buttons.some((btn) => btn.offsetTop !== firstTop);
            setWrapped(isWrapped);
            if (!isWrapped) setOpen(false);
        }
        checkWrapped();
        window.addEventListener("resize", checkWrapped);
        return () => window.removeEventListener("resize", checkWrapped);
    }, [actionButtons]);

    if (backFromConfetti) {
        return (
            <div className={styles.container}>
                <div className={styles.actions}>
                    <button
                        className={`${styles.bottomButton} ${styles.backButton}`}
                        onClick={() => {
                            setConfettiStatus(2);
                        }}
                    >
                        Vissza
                    </button>
                </div>
            </div>
        );
    }

    if (shouldShowOnlyBack) {
        return (
            <div className={styles.container}>
                <div className={styles.actions}>
                    <button
                        className={`${styles.bottomButton} ${styles.backButton}`}
                        onClick={handleBack}
                    >
                        Vissza
                    </button>
                </div>
            </div>
        );
    }

    if (!wrapped) {
        return (
            <div className={styles.container}>
                <div className={`${styles.actionRowWrapper}`}>
                    <div
                        ref={rowRef}
                        className={styles.actions}
                        style={{ display: "flex" }}
                    >
                        {actionButtons}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div
                className={`${styles.actionRowWrapper} ${
                    open ? styles.wrapperOpen : styles.wrapperClosed
                }`}
            >
                <button
                    className={`${open ? styles.closeButton : styles.openButton}`}
                    onClick={() => setOpen((o) => !o)}
                >
                    Akciók
                </button>
                <div
                    ref={rowRef}
                    className={`${styles.actions} ${
                        open ? styles.actionsOpen : styles.actionsClosed
                    }`}
                    style={{
                        display: open ? "flex" : "none",
                    }}
                >
                    {actionButtons}
                </div>
            </div>
        </div>
    );
};

export default BottomActions;
