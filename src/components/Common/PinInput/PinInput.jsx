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
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        if (error) {
            setPins(["", "", "", ""]);
            setTimeout(() => {
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }, 100);
        }
    }, [error]);


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

    // Removed handleChange to prevent double input processing

    const handleInputChange = (index, value) => {
        // Remove all non-digit characters
        let digits = value.replace(/\D/g, "");

        // Always distribute all digits starting from the current index
        const newPins = [...pins];
        let i = index;
        for (let d = 0; d < digits.length && i < 4; d++, i++) {
            newPins[i] = digits[d];
        }
        // If only one digit, just fill the current box
        if (digits.length === 1) {
            newPins[index] = digits[0];
        }
        setPins(newPins);

        // Update hidden input
        const hiddenInput = document.querySelector('input[name="password"]');
        if (hiddenInput) hiddenInput.value = newPins.join("");

        // Move focus to next empty cell, or stay if at end
        let nextIndex = index;
        for (let j = index; j < 4; j++) {
            if (newPins[j] === "") {
                nextIndex = j;
                break;
            }
            nextIndex = j + 1;
        }
        if (nextIndex < 4 && digits.length === 1) {
            inputRefs.current[nextIndex]?.focus();
        }

        // If all cells filled, trigger onComplete
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
                newPins[index] = "";
                setPins(newPins);
            } else if (index > 0) {
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

            const nextIndex = Math.min(numbers.length, 3);
            inputRefs.current[nextIndex]?.focus();

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
                            value={pin}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            onFocus={(e) => handleFocus(index)}
                            onClick={(e) => handleClick(index)}
                            className={`${styles.pinInput} ${
                                pin ? styles.filled : styles.empty
                            }`}
                            autoComplete="one-time-code"
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
