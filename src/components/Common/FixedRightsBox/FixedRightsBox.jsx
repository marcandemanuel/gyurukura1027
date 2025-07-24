import React, { useRef, useState } from "react";
import { useConfig } from "../../../contexts/ConfigContext.jsx";
import styles from "./FixedRightsBox.module.css";

const FixedRightsBox = () => {
    const config = useConfig();
    const boxRef = useRef(null);
    const textRef = useRef(null);
    const [boxWidth, setBoxWidth] = useState(39); // collapsed width

    const handleMouseEnter = () => {
        if (textRef.current && boxRef.current) {
            // Calculate expanded width: logo + gap + text + paddings
            const logoWidth = 15;
            const gap = 10;
            const textWidth = textRef.current.scrollWidth;
            const padding = 20; // left + right padding (10px each)
            const expandedWidth = logoWidth + gap + textWidth + padding;
            setBoxWidth(expandedWidth);
        }
    };

    const handleMouseLeave = () => {
        setBoxWidth(39); // collapsed width
    };

    return (
        <div
            className={`${styles.fixedBox} ${boxWidth > 39 ? styles.expanded : ""}`}
            ref={boxRef}
            style={{ width: boxWidth, transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img src="/favicon.png" alt="Logo" className={styles.logo} />
            <span
                className={styles.text}
                ref={textRef}
                style={{
                    opacity: boxWidth > 39 ? 1 : 0,
                    width: boxWidth > 39 ? textRef.current?.scrollWidth : 0,
                    transition: "opacity 0.25s 0.1s, width 0.3s, margin-left 0.3s"
                }}
            >
                <span className={styles.copyright}>©</span> {config.year}{" "}
                GyűrűkUra 10-27. Minden jog fenntartva.
            </span>
        </div>
    );
};

export default FixedRightsBox;
