import React, { useRef, useEffect, useState } from "react";
import styles from "./ActionRow.module.css";


const ActionRow = ({ children, className = "" }) => {
    const [open, setOpen] = useState(false);
    const [wrapped, setWrapped] = useState(false);
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


    if (!wrapped) {
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
            >
                {children}
            </div>
        </div>
    );
};

export default ActionRow;
