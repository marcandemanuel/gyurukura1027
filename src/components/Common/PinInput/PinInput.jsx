"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./PinInput.module.css";

const PinInput = ({
    title,
    subtitle,
    onComplete,
    clearError,
    showForgot = false,
    onForgot,
    error = false,
}) => {
    const [pins, setPins] = useState(["", "", "", ""]);
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        // Clear inputs on error
        if (error) {
            setPins(["", "", "", ""]);
            setTimeout(() => {
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }, 100);
        }
    }, [error]);

    const handleChange = (e) => {
        return;
    };

    const handleInputChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newPins = [...pins];
        newPins[index] = value;

        setPins(newPins);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if all pins are filled
        if (newPins.every((pin) => pin !== "")) {
            setPins(['', '', '', '']);
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
            const fullPin = newPins.join("");
            onComplete(fullPin);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            clearError()
            e.preventDefault();
            const newPins = [...pins];

            if (newPins[index]) {
                // Clear current input
                newPins[index] = "";
                setPins(newPins);
            } else if (index > 0) {
                // Move to previous input and clear it
                newPins[index - 1] = "";
                setPins(newPins);
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 3) {
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === "Enter") {
            const fullPin = pins.join("");
            if (fullPin.length === 4) {
                onComplete(fullPin);
            }
        } else if (e.key.length === 1) {
            clearError()
            handleInputChange(index, e.key);
        }
    };

    const handleFocus = (index) => {
        inputRefs.current[index].select();
    };

    const handleClick = (index) => {
        inputRefs.current[index].select();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        const numbers = pastedData.replace(/\D/g, "").slice(0, 4);

        if (numbers.length > 0) {
            const newPins = ["", "", "", ""];
            for (let i = 0; i < numbers.length && i < 4; i++) {
                newPins[i] = numbers[i];
            }
            setPins(newPins);

            // Focus the next empty input or last input
            const nextIndex = Math.min(numbers.length, 3);
            inputRefs.current[nextIndex]?.focus();

            // If all 4 digits pasted, trigger completion
            if (numbers.length === 4) {
                onComplete(numbers);
            }
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <h3 className={styles.subtitle}>{subtitle}</h3>

            <div
                className={`${styles.pinBox} ${
                    error ? styles.error : ""
                }`}
            >
                {pins.map((pin, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="password"
                        maxLength="1"
                        value={pin}
                        onChange={(e) => handleChange(e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => handleFocus(index)}
                        onClick={(e) => handleClick(index)}
                        className={`${styles.pinInput} ${
                            pin ? styles.filled : styles.empty
                        }`}
                        inputMode="numeric"
                        pattern="[0-9]"
                        autoComplete="off"
                    />
                ))}
            </div>
        </div>
    );
};

export default PinInput;
