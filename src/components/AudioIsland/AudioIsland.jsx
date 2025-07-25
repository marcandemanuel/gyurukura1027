import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "../../contexts/AudioProvider";
import styles from "./AudioIsland.module.css";

import playImg from "../../assets/images/play.png";
import pauseImg from "../../assets/images/pause.png";
import forwardImg from "../../assets/images/forward.png";
import backwardImg from "../../assets/images/backward.png";

const AudioIsland = () => {
    const { toggleAudio, playNext, playPrevious, isPlaying } = useAudio();

    // Preload play/pause/forward/backward images
    useEffect(() => {
        const images = [playImg, pauseImg, forwardImg, backwardImg];
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
                <img src={backwardImg} alt="Előző" />
            </button>
            <button
                type="button"
                className={styles.toggleButton}
                onClick={toggleAudio}
            >
                <img
                    src={
                        isPlaying
                            ? pauseImg
                            : playImg
                    }
                    alt={isPlaying ? "Megállítás" : "Lejátszás"}
                />
            </button>
            <button
                type="button"
                className={styles.toggleButton}
                onClick={playNext}
            >
                <img src={forwardImg} alt="Következő" />
            </button>
        </div>
    );

    return createPortal(island, document.body);
};

export default AudioIsland;
