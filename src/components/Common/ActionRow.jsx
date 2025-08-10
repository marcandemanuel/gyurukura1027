import React, { useRef, useEffect, useState } from "react";
import styles from "./ActionRow.module.css";

/**
 * ActionRow: A reusable row for actions that collapses to a hamburger if it overflows.
 * Props:
 *   - label: string (label for hamburger, e.g. "Action Row")
 *   - children: action buttons (should be at least 2 for hamburger to appear)
 *   - className: additional class for the row (optional)
 */
const ActionRow = ({ label = "Action Row", children, className = "" }) => {
    const [open, setOpen] = useState(false);
    const [showHamburger, setShowHamburger] = useState(false);
    const rowRef = useRef(null);

    // Check for overflow on mount and resize
    useEffect(() => {
        function checkOverflow() {
            if (!rowRef.current) return;
            const el = rowRef.current;
            const actionCount = el.querySelectorAll("button").length;
            setShowHamburger(
                actionCount > 1 && el.scrollWidth > el.clientWidth
            );
        }
        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, []);

    // If not overflowing, just show the row as normal
    if (!showHamburger) {
        return (
            <div className={`${styles.actionRowWrapper} ${className}`}>
                <div ref={rowRef} className={styles.actions} style={{ display: "flex" }}>
                    {children}
                </div>
            </div>
        );
    }

    // If overflowing, show collapsible box
    return (
        <div className={`${styles.actionRowWrapper} ${styles.fixedBottom} ${className}`}>
            <div
                className={styles.collapsibleBox}
                onClick={() => setOpen((o) => !o)}
                tabIndex={0}
                role="button"
                aria-label={`Toggle ${label}`}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") setOpen(o => !o);
                }}
            >
                {open ? (
                    <span className={styles.collapseLabel}>Close</span>
                ) : (
                    <span className={styles.collapseLabel}>Action Row</span>
                )}
            </div>
            <div
                ref={rowRef}
                className={`${styles.actions} ${open ? styles.actionsOpen : styles.actionsClosed}`}
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
