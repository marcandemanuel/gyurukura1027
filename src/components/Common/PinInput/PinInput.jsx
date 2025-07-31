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
    username = "",
}) => {
    const [pins, setPins] = useState(["", "", "", ""]);
    const [isPinChanged, setIsPinChanged] = useState(false);
    const inputRefs = useRef([]);
    const passwordInputRef = useRef(null);

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

    // Autofill support removed: do not allow password managers to save or autofill PIN

    const handleHiddenPasswordChange = (e) => {
        const autofilledPIN = e.target.value;
        if (
            autofilledPIN &&
            autofilledPIN.length === 4 &&
            /^\d{4}$/.test(autofilledPIN)
        ) {
            setPins(autofilledPIN.split(""));
            onComplete(autofilledPIN);
            setTimeout(() => setPins(["", "", "", ""]), 100);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        // Autofill: if 4 digits are pasted/filled at once, distribute them
        if (value && value.length === 4 && /^\d{4}$/.test(value)) {
            setPins(value.split(""));
            // Update hidden input
            const hiddenInput = document.querySelector(
                'input[name="password"]'
            );
            if (hiddenInput) hiddenInput.value = value;
            onComplete(value);
            setTimeout(() => setPins(["", "", "", ""]), 100);
            return;
        }
        // Normal single digit input
        document.querySelector('input[name="password"]').value = pins.join("");
        setIsPinChanged(true);
    };

    const handleInputChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newPins = [...pins];
        newPins[index] = value;

        setPins(newPins);
        // Update hidden password input with the latest value
        const hiddenInput = document.querySelector('input[name="password"]');
        if (hiddenInput) {
            hiddenInput.value = newPins.join("");
        }
        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if all pins are filled
        if (newPins.every((pin) => pin !== "")) {
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
            const fullPin = newPins.join("");
            onComplete(fullPin);
            setPins(["", "", "", ""]);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            clearError();
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
                setPins(["", "", "", ""]);
            }
        } else if (e.key.length === 1) {
            clearError();
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
                setPins(["", "", "", ""]);
            }
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    name="username"
                    value={username}
                    readOnly
                    hidden
                />
                <input
                    type="password"
                    name="password"
                    value={pins.join("")}
                    onInput={handleHiddenPasswordChange}
                    onChange={handleHiddenPasswordChange}
                    hidden
                />

                <h2 className={styles.title}>{title}</h2>
                <h3 className={styles.subtitle}>{subtitle}</h3>

                <div
                    className={`${styles.pinBox} ${error ? styles.error : ""}`}
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
                            autocomplete="one-time-code"
                            inputMode="numeric"
                            pattern="[0-9]"
                            name={`pininput-${index}`}
                        />
                    ))}
                </div>
            </form>
        </div>
    );
};

export default PinInput;
