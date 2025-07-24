import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "../../contexts/AudioProvider";
import styles from "./AudioIsland.module.css";

const AudioIsland = () => {
    const { toggleAudio, playNext, playPrevious, isPlaying } = useAudio();

    // Preload play/pause/forward/backward images
    useEffect(() => {
        const images = [
            "/src/assets/images/play.png",
            "/src/assets/images/pause.png",
            "/src/assets/images/forward.png",
            "/src/assets/images/backward.png"
        ];
        images.forEach(src => {
            const img = new window.Image();
            img.src = src;
        });
    }, []);

    const island = (
        <div className={styles.island}>
            <button
                type="button"
                className={styles.toggleButton}
                onClick={playPrevious}
            >
                <img src="/src/assets/images/backward.png" alt="Előző" />
            </button>
            <button
                type="button"
                className={styles.toggleButton}
                onClick={toggleAudio}
            >
                <img
                    src={
                        isPlaying
                            ? "/src/assets/images/pause.png"
                            : "/src/assets/images/play.png"
                    }
                    alt={isPlaying ? "Megállítás" : "Lejátszás"}
                />
            </button>
            <button
                type="button"
                className={styles.toggleButton}
                onClick={playNext}
            >
                <img src="/src/assets/images/forward.png" alt="Következő" />
            </button>
        </div>
    );

    return createPortal(island, document.body);
};

export default AudioIsland;
