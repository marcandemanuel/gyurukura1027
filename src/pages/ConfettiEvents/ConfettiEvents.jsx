"use client";

import React, { useEffect, useRef } from "react";
import BottomActions from "../../components/BottomActions/BottomActions";
import confetti from "canvas-confetti";
import styles from "./ConfettiEvents.module.css";

const ConfettiEvents = ({ eventName }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // === CONFIGURABLE CONSTANTS ===
        // Colors for all confetti
        const CONFETTI_COLORS = [
            "#a568f6",
            "#e63d87",
            "#00c7e4",
            "#fdd67e",
        ];
    
        [165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126];
        // How many confetti particles per top burst (density)
        const TOP_CONFETTI_PARTICLE_COUNT = 1;
        // How many confetti particles per corner shot (intensity)
        const CORNER_CONFETTI_PARTICLE_COUNT = 350;
        // Delay for the corner shot in ms
        const CORNER_CONFETTI_DELAY = 0;
    
        // Helper to shuffle colors for each burst (optional, for more randomness)
        function shuffle(array) {
            let arr = array.slice();
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }
    
        // Create a confetti instance bound to our canvas
        const myConfetti = confetti.create(canvasRef.current, {
            resize: true,
            useWorker: true,
        });
    
        // 1. Large, long-lasting shot from both bottom corners (single, slightly delayed, less dense)
        setTimeout(() => {
            myConfetti({
                particleCount: CORNER_CONFETTI_PARTICLE_COUNT,
                angle: 60,
                spread: 300,
                origin: { x: 0.05, y: 1 },
                startVelocity: 85,
                gravity: 0.8,
                ticks: 1200,
                scalar: 1.1,
                colors: CONFETTI_COLORS,
                opacity: 1,
            });
            myConfetti({
                particleCount: CORNER_CONFETTI_PARTICLE_COUNT,
                angle: 120,
                spread: 300,
                origin: { x: 0.95, y: 1 },
                startVelocity: 85,
                gravity: 0.8,
                ticks: 1200,
                scalar: 1.1,
                colors: CONFETTI_COLORS,
                opacity: 1,
            });
        }, CORNER_CONFETTI_DELAY);
    
        // 2. Continuous, non-ceasing confetti fall from the top (less dense, always all colors)
        let animationFrame;
        let isUnmounted = false;
    
        function shootTopConfetti() {
            if (isUnmounted) return;
            myConfetti({
                particleCount: TOP_CONFETTI_PARTICLE_COUNT,
                angle: 90,
                spread: 60,
                origin: { x: Math.random() * 0.9 + 0.05, y: 0 },
                startVelocity: 60,
                gravity: 0.8,
                ticks: 1200,
                scalar: 1.1,
                colors: shuffle(CONFETTI_COLORS),
                opacity: 1,
            });
            animationFrame = requestAnimationFrame(shootTopConfetti);
        }
    
        // Fire several top confetti bursts immediately to eliminate any visible delay
        for (let i = 0; i < 5; i++) {
            myConfetti({
                particleCount: TOP_CONFETTI_PARTICLE_COUNT,
                angle: 90,
                spread: 60,
                origin: { x: Math.random() * 0.9 + 0.05, y: 0 },
                startVelocity: 60,
                gravity: 0.8,
                ticks: 1200,
                scalar: 1.1,
                colors: shuffle(CONFETTI_COLORS),
                opacity: 1,
            });
        }
        shootTopConfetti();
    
        // Cleanup on unmount
        return () => {
            isUnmounted = true;
            if (animationFrame) cancelAnimationFrame(animationFrame);
            // No manual canvas cleanup needed when using useWorker: true
        };
    }, [canvasRef.current]);

    const titles = {
        nv_opened: "Elkezdődött a nasirendelés 🎉!",
        starts_today: "Ma kezdődik a GyűrűkUra 10-27 🎉!",
        started: "Kezdődik a GyűrűkUra 10-27 🎉!",
        ends_today: "Ma van a finálé 🎉!",
        birthday: "Boldog szülinapot Sebi 🎂!",
    };

    return (
        <div
            className={`${styles.container} ${styles.confettiRoot}`}
        >
            <canvas
                ref={canvasRef}
                className={styles.confettiCanvas}
            />
            <div
                className={styles.confettiTitle}
            >
                <h1>{titles[eventName]}</h1>
            </div>
            <BottomActions />
        </div>
    );
};

export default ConfettiEvents;
