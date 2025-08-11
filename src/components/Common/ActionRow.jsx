import React, { useRef, useEffect, useState } from "react";
import styles from "./ActionRow.module.css";


const ActionRow = ({ children, className = "" }) => {
    const [open, setOpen] = useState(false);
    const [showHamburger, setShowHamburger] = useState(false);
    const rowRef = useRef(null);

    // Detect if the row is wrapped (multi-line)
    useEffect(() => {
        function checkWrapped() {
            if (!rowRef.current) return;
            const el = rowRef.current;
            const buttons = Array.from(el.querySelectorAll("button"));
            if (buttons.length <= 1) {
                setShowHamburger(false);
                setOpen(true);
                return;
            }
            // If any button is on a different line (offsetTop) than the first, it's wrapped
            const firstTop = buttons[0]?.offsetTop;
            const isWrapped = buttons.some((btn) => btn.offsetTop !== firstTop);
            setShowHamburger(isWrapped);
            // If not wrapped, always show row
            if (!isWrapped) setOpen(true);
        }
        checkWrapped();
        window.addEventListener("resize", checkWrapped);
        return () => window.removeEventListener("resize", checkWrapped);
    }, [children]);

    // If not wrapped, just show the row as normal
    if (!showHamburger) {
        return (
            <div className={`${styles.actionRowWrapper} ${className}`}>
                <div
                    ref={rowRef}
                    className={styles.actions}
                    style={{ display: "flex" }}
                >
                    {children}
                </div>
            </div>
        );
    }

    // If wrapped, show hamburger to toggle show/hide
    return (
        <div
            className={`${styles.actionRowWrapper} ${className} ${open ? styles.wrapperOpen : styles.wrapperClosed}`}
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
                {children}
            </div>
        </div>
    );
};

export default ActionRow;
