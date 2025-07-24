import React, { createContext, useRef, useState, useContext, useEffect } from "react";

const audioFiles = [
    "/audio/lotr-1.mp3",
    "/audio/lotr-2.mp3",
    "/audio/lotr-3.mp3",
    "/audio/lotr-4.mp3",
    "/audio/lotr-5.mp3",
    "/audio/lotr-6.mp3",
    "/audio/lotr-7.mp3",
];

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const audioRef = useRef(null);

    // Preload all audio files on mount
    useEffect(() => {
        audioFiles.forEach(src => {
            const audio = new window.Audio();
            audio.src = src;
            audio.preload = "auto";
            audio.load();
        });
    }, []);

    const toggleAudio = () => {
        if (currentIndex === -1) {
            setCurrentIndex(0);
            setIsPlaying(true);
        } else if (audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const playNext = () => {
        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % audioFiles.length;
            setCurrentIndex(nextIndex);
            setIsPlaying(true);
        }
    };

    const playPrevious = () => {
        if (currentIndex !== -1) {
            const previousIndex = (currentIndex - 1 + audioFiles.length) % audioFiles.length;
            setCurrentIndex(previousIndex);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (currentIndex === -1 || !audio) return;
        audio.src = audioFiles[currentIndex];
        if (isPlaying) {
            audio.play();
        } else {
            audio.pause();
        }
    }, [currentIndex, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const handleEnded = () => {
            const nextIndex = (currentIndex + 1) % audioFiles.length;
            setCurrentIndex(nextIndex);
            setIsPlaying(true);
        };
        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [currentIndex]);

    return (
        <AudioContext.Provider value={{
            toggleAudio,
            playNext,
            playPrevious,
            isPlaying,
        }}>
            {children}
            <audio ref={audioRef} />
        </AudioContext.Provider>
    );
};