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

  useEffect(() => {
    function checkOverflow() {
      if (!rowRef.current) return;
      const el = rowRef.current;
      const actionCount = el.querySelectorAll("button").length;
      setShowHamburger(actionCount > 1 && el.scrollWidth > el.clientWidth);
    }
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <div className={`${styles.actionRowWrapper} ${className}`}>
      {showHamburger && (
        <button
          className={styles.hamburger}
          aria-label={`Toggle ${label}`}
          onClick={() => setOpen((o) => !o)}
        >
          ≡ {label}
        </button>
      )}
      <div
        ref={rowRef}
        className={`${styles.actions} ${open ? styles.actionsOpen : styles.actionsClosed}`}
        style={{
          display: showHamburger && !open ? "none" : "flex"
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ActionRow;