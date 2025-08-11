import React, { useRef, useEffect, useState } from "react";
import styles from "./ActionRow.module.css";

/**
 * ActionRow: A reusable row for actions that collapses to a hamburger if it overflows.
 * Props:
 *   - label: string (label for hamburger, e.g. "Action Row")
 *   - children: action buttons (should be at least 2 for hamburger to appear)
 *   - className: additional class for the row (optional)
 */
const ActionRow = ({ label = "Akciók", children, className = "" }) => {
    const [open, setOpen] = useState(false);
    const rowRef = useRef(null);

    return (
        <div
            className={`${styles.actionRowWrapper} ${open ? styles.actionRowOpen : styles.actionRowClosed} ${className}`}
            ref={rowRef}
        >
            <button
                className={styles.actionButton}
                onClick={() => setOpen((o) => !o)}
                aria-label={`Toggle ${label}`}
                style={{
                    minWidth: open ? "120px" : "80px",
                    transition: "min-width 0.3s"
                }}
            >
                {label}
            </button>
            <div
                className={`${styles.actions} ${open ? styles.actionsOpen : styles.actionsClosed}`}
            >
                {children}
            </div>
        </div>
    );
};

export default ActionRow;
