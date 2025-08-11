import styles from "./BottomActions.module.css";
import { useNavigate } from "react-router-dom";
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

    const { navigationPile } = useNavigation();

    const handleBack = () => {
        if (navigationPile && navigationPile.length > 1) {
            navigate(navigationPile[navigationPile.length - 2]);
        } else {
            navigate("/");
        }
    };

    const [open, setOpen] = useState(false);
    const [wrapped, setWrapped] = useState(false);

    const actionButtons = [
        <button
            key="gyurukura"
            className={styles.bottomButton}
            onClick={() => navigate("/gyurukura1027")}
        >
            GyűrűkUra 10-27
        </button>,
        <button
            key="visszaszamlalo"
            className={styles.bottomButton}
            onClick={() => navigate("/visszaszamlalo")}
        >
            Visszaszámláló
        </button>,
        <button
            key="nasiopciok"
            className={styles.bottomButton}
            onClick={() => navigate("/nasiopciok")}
        >
            Nasi opciók
        </button>,
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
            const isWrapped = buttons.some((btn) => btn.offsetTop !== firstTop);
            setWrapped(isWrapped);
            if (!isWrapped) setOpen(false);
        }
        checkWrapped();
        window.addEventListener("resize", checkWrapped);
        return () => window.removeEventListener("resize", checkWrapped);
    }, [children]);

    if (backFromConfetti) {
        return (
            <div className={styles.container}>
                <div className={styles.bottomActions}>
                    <button
                        className={styles.bottomButton}
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
                <div className={styles.bottomActions}>
                    <button
                        className={styles.bottomButton}
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
                        className={styles.bottomActions}
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
                    open ? styles.actionRowOpen : styles.actionRowClosed
                }`}
            >
                <button
                    className={styles.actionButton}
                    onClick={() => setOpen((o) => !o)}
                    aria-label="Toggle Akciók"
                    style={{
                        minWidth: open ? "120px" : "80px",
                        transition: "min-width 0.3s",
                    }}
                >
                    Akciók
                </button>
                <div
                    ref={rowRef}
                    className={`${styles.bottomActions} ${
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
