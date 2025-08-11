"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import { useApp } from "../../contexts/AppContext";
import Loading from "../../components/Common/Loading/Loading";
import BottomActions from "../../components/BottomActions/BottomActions.jsx";
import styles from "./About.module.css";

const About = () => {
    const { config, loading } = useConfig();
    const { isLoading, setIsLoading } = useApp();

    useEffect(() => {
        // Only update global isLoading if the value actually changes
        if (isLoading !== (loading || !config)) {
            setIsLoading(loading || !config);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, config]);

    const isNowBefore = (yearMonth) => {
        const [y, m] = yearMonth.split("-").map(Number);
        const now = new Date();
        if (now.getFullYear() < y) return true;
        if (now.getFullYear() > y) return false;
        return now.getMonth() + 1 <= m;
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.flexTitle}>
                <img src="/favicon.png" alt="Logo" className={styles.logo} />
                <h2 className={styles.title}>GyűrűkUra 10-27</h2>
            </div>

            <p className={styles.aboutText}>
                A GyűrűkUra 10-27 fesztivál elsőként 2020-ban Sebi 14.
                szülinapján került sorra, és azóta is minden évben ebben az
                időszakban kerül megrendezésre. A Gyűrűk Ura filmek azóta már
                messze kinőtték a film fogalmát, a fesztiválra ugyanis már
                hónapokkal előre elkezdődik a felkészülés. A csipsz és kóla
                adagok egyre növekednek így a fesztiválba befektetett
                pénzösszegek is. Íme az eddigi GyűrűkUra 10-27 események rövid
                idővonala.
            </p>

            <h3 className={styles.timelineTitle}>Idővonal</h3>

            {/* Timeline visualization */}
            <Timeline about={config.about} />
            <BottomActions />
        </div>
    );
};

import { useRef } from "react";

// LastDot component (must be defined before Timeline)
const LastDot = ({ mode, absoluteTop, timelineContainerRef }) => {
    // Calculate the horizontal center of the timeline container in the viewport
    const [left, setLeft] = useState("50%");
    useEffect(() => {
        setLeft("50%");
        const updateLeft = () => {
            const container = timelineContainerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            // Center of the container relative to the viewport
            const center = rect.left + rect.width / 2;
            setLeft(`${center}px`);
        };
        updateLeft();
        window.addEventListener("scroll", updateLeft);
        window.addEventListener("resize", updateLeft);
        return () => {
            window.removeEventListener("scroll", updateLeft);
            window.removeEventListener("resize", updateLeft);
        };
    }, [mode, timelineContainerRef]);

    let className = "";
    let style = {};
    if (mode === "fixed") {
        className = `${styles.lastDot} ${styles.lastDotFixed}`;
        style = { left: "50%" };
    } else if (mode === "top") {
        className = `${styles.lastDot} ${styles.lastDotAbsoluteTop}`;
        style = { position: "absolute", top: 0, left };
    } else {
        className = `${styles.lastDot} ${styles.lastDotAbsolute}`;
        style = { position: "absolute", top: absoluteTop, left };
    }
    return <div className={className} style={style} />;
};

// Timeline component

const Timeline = ({ about }) => {
    // Parse events and sort by date
    const events = Object.entries(about)
        .map(([name, { date, location, description }]) => ({
            name,
            date,
            location,
            description,
            dateObj: new Date(date + "-01"),
        }))
        .sort((a, b) => a.dateObj - b.dateObj);

    // Timeline start and end
    const timelineStart = new Date("2020-01-01");
    const timelineEnd = events.length
        ? events[events.length - 1].dateObj
        : timelineStart;

    const totalMonths =
        (timelineEnd.getFullYear() - timelineStart.getFullYear()) * 12 +
        (timelineEnd.getMonth() - timelineStart.getMonth());

    // Height of the timeline in px
    const timelineHeight = 2000;

    // State to show only the last InfoCard
    const [onlyShowLastCard, setOnlyShowLastCard] = useState(false);

    // Calculate dot positions
    const getDotPosition = (dateObj) => {
        const monthsFromStart =
            (dateObj.getFullYear() - timelineStart.getFullYear()) * 12 +
            (dateObj.getMonth() - timelineStart.getMonth());
        return (monthsFromStart / totalMonths) * timelineHeight;
    };

    // Current date position (do not plot a dot for it)
    const now = new Date();
    const nowPosition = (() => {
        // Clamp to timeline range
        if (now < timelineStart) return 0;
        if (now > timelineEnd) return timelineHeight;
        const monthsFromStart =
            (now.getFullYear() - timelineStart.getFullYear()) * 12 +
            (now.getMonth() - timelineStart.getMonth());
        return (monthsFromStart / totalMonths) * timelineHeight;
    })();

    // Refs for each dot
    const dotRefs = useRef([]);
    const [entered, setEntered] = useState([]);

    // --- Persistent state for last infocard ---
    const [lastCardEntered, setLastCardEntered] = useState(false);
    const [lastCardAnimated, setLastCardAnimated] = useState(false);

    useEffect(() => {
        setEntered(Array(events.length).fill(false));
    }, [events.length]);

    useEffect(() => {
        const handleScroll = () => {
            const container = document.querySelector(
                `.${styles.timelineContainer}`
            );
            if (!container) return;
            const threshold = window.innerHeight * 0.2 + 8;

            setEntered((prev) => {
                let updated = [...prev];
                dotRefs.current.forEach((ref, idx) => {
                    if (ref && !updated[idx]) {
                        const rect = ref.getBoundingClientRect();
                        if (rect.top < window.innerHeight - threshold) {
                            updated[idx] = true;
                        }
                    }
                });
                return updated;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Timeline grow mask state (no animation, just instant reveal)
    const [visibleTimelineHeight, setVisibleTimelineHeight] = useState(0);
    const [maxTimelineHeight, setMaxTimelineHeight] = useState(0);

    useEffect(() => {
        const handleTimelineGrow = () => {
            const container = document.getElementById("timeline-fade");
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const vh = window.innerHeight;
            const timelineBottom = rect.bottom;
            const growStart = vh - vh * 0.2; // 1/5 vh from bottom
            let visible;
            if (timelineBottom > growStart) {
                // How much of the timeline is visible?
                // Add 8px so the last dot is fully visible (dot is 16px, centered)
                visible =
                    Math.max(0, rect.height - (timelineBottom - growStart)) + 8;
            } else {
                visible = rect.height;
            }
            setVisibleTimelineHeight(Math.min(rect.height, visible));
            setMaxTimelineHeight((prev) =>
                Math.max(prev, Math.min(rect.height, visible))
            );
        };
        window.addEventListener("scroll", handleTimelineGrow);
        handleTimelineGrow();
        return () => window.removeEventListener("scroll", handleTimelineGrow);
    }, []);

    // --- Sticky/absolute lastDot logic ---
    // States: "top" (absolute at top), "fixed" (fixed), "bottom" (absolute at bottom)
    const [lastDotMode, setLastDotMode] = useState("fixed");
    const [lastCardNode, setLastCardNode] = useState(null);
    const timelineContainerRef = useRef(null);

    useEffect(() => {
        const handleLastDotPosition = () => {
            const timeline = timelineContainerRef.current;
            if (!timeline) return;
            const rect = timeline.getBoundingClientRect();
            const fixedTop = window.innerHeight * 0.8 - 10;

            if (rect.top > fixedTop) {
                // Timeline is below the fixed point: lastDot at top of timeline
                setLastDotMode("top");
            } else if (rect.bottom <= fixedTop + 10) {
                // Timeline bottom is above the fixed point: lastDot at bottom
                setLastDotMode("bottom");
            } else {
                // Timeline covers the fixed point: lastDot fixed
                setLastDotMode("fixed");
            }
        };
        window.addEventListener("scroll", handleLastDotPosition, {
            passive: true,
        });
        handleLastDotPosition();
        return () =>
            window.removeEventListener("scroll", handleLastDotPosition);
    }, []);

    // --- Track if last infocard has ever appeared ---
    useEffect(() => {
        if (lastDotMode === "bottom" && !lastCardEntered) {
            setLastCardEntered(true);
            setLastCardAnimated(true);
            // Remove animation after a short delay (simulate one-time animation)
            setTimeout(() => setLastCardAnimated(false), 600);
        }
    }, [lastDotMode, lastCardEntered]);

    // Smooth scroll to lastCardNode when both lastDotMode is "bottom" and lastCardNode is available
    const prevLastDotMode = React.useRef(lastDotMode);

    // Scroll every time lastDotMode transitions to "bottom" and lastCardNode is set
    // (removed duplicate prevLastDotMode declaration)
    useEffect(() => {
        if (lastDotMode === "bottom" && lastCardNode) {
            // Hide all but last card
            setOnlyShowLastCard(true);

            // Calculate scroll target (center + 20px)
            const rect = lastCardNode.getBoundingClientRect();
            const scrollTarget =
                window.scrollY +
                rect.top +
                rect.height / 2 -
                window.innerHeight / 2 +
                30;

            // Smooth scroll only (no scroll prevention, no forced reset)
            window.scrollTo({ top: scrollTarget, behavior: "smooth" });
        } else {
            setOnlyShowLastCard(false);
        }
    }, [lastDotMode, lastCardNode]);

    // Position for the last dot (absolute at the end of the timeline)
    const lastDotAbsoluteTop = timelineHeight - 10;

    return (
        <div
            className={styles.timelineContainer}
            id="timeline-fade"
            ref={timelineContainerRef}
        >
            <div
                className={styles.timelineGrowMask}
                style={{
                    height: timelineHeight || 0,
                    maxHeight: timelineHeight,
                    overflow: "hidden",
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    pointerEvents: "none",
                }}
            >
                {/* Filled part of the line */}
                <div
                    className={styles.timelineLineFilled}
                    style={{
                        height: nowPosition,
                        top: 0,
                    }}
                />
                {/* Unfilled part of the line */}
                <div
                    className={styles.timelineLineUnfilled}
                    style={{
                        height: timelineHeight - nowPosition,
                        top: nowPosition,
                    }}
                />
                {/* No dots in the mask */}
            </div>
            {events
                .slice(0, -1)
                .map((event, idx) =>
                    entered[idx] ? (
                        <InfoCard
                            key={event.name}
                            event={event}
                            idx={idx}
                            top={getDotPosition(event.dateObj) - 8}
                            animate={!entered.slice(0, idx).includes(true)}
                        />
                    ) : null
                )}
            {/* Dots rendered outside the mask, animated in sync with InfoCards */}
            {events.slice(0, -1).map((event, idx) => {
                // Mark as future if event is after or in the same month as now
                const eventYear = event.dateObj.getFullYear();
                const eventMonth = event.dateObj.getMonth();
                const nowYear = now.getFullYear();
                const nowMonth = now.getMonth();
                const isFuture =
                    eventYear > nowYear ||
                    (eventYear === nowYear && eventMonth >= nowMonth);

                // Always render a detector dot for scroll detection
                // Only render the visible/animated dot if entered[idx] is true
                return (
                    <React.Fragment key={event.name + "-frag"}>
                        <div
                            key={event.name + "-detector"}
                            className={styles.timelineDotDetector}
                            style={{
                                top: getDotPosition(event.dateObj) - 8,
                            }}
                            ref={(el) => (dotRefs.current[idx] = el)}
                        />
                        <div
                            key={event.name}
                            className={
                                isFuture
                                    ? `${styles.timelineDot} ${styles.timelineDotFuture} ${styles.timelineDotEntered}`
                                    : `${styles.timelineDot} ${styles.timelineDotEntered}`
                            }
                            style={{
                                top: getDotPosition(event.dateObj) - 8,
                            }}
                        />
                    </React.Fragment>
                );
            })}
            {/* --- Last Dot --- */}
            <LastDot
                mode={lastDotMode}
                absoluteTop={lastDotAbsoluteTop}
                timelineContainerRef={timelineContainerRef}
            />
            {/* --- Last Event InfoCard (centered, persistent) --- */}
            {lastCardEntered && events.length > 0 && (
                <InfoCard
                    key={events[events.length - 1].name + "-last"}
                    event={events[events.length - 1]}
                    idx={events.length - 1}
                    top={lastDotAbsoluteTop + window.innerHeight * 0.5}
                    centered={true}
                    animate={lastCardAnimated}
                    onMount={setLastCardNode}
                    style={onlyShowLastCard ? { zIndex: 9999 } : {}}
                />
            )}
        </div>
    );
};

/**
 * InfoCard component
 * @param {object} props
 * @param {object} props.event
 * @param {number} props.idx
 * @param {number} props.top
 * @param {boolean} [props.centered]
 */
const InfoCard = ({ event, idx, top, centered = false, onMount = null }) => {
    // Alternate side: even = right, odd = left, unless centered
    const side = centered ? "center" : idx % 2 === 0 ? "right" : "left";
    const year = event.date.split("-")[0];

    // Ref and state for dynamic height
    const cardRef = useRef(null);
    const contentRef = useRef(null);
    const logoContainerRef = useRef(null);
    const [offset, setOffset] = useState(0);
    const { config } = useConfig();

    useEffect(() => {
        if (onMount && centered && cardRef.current) {
            onMount(cardRef.current);
        }
        // Only run when onMount, centered, or the ref changes
    }, [onMount, centered]);

    // For dynamic logo sizing
    useEffect(() => {
        if (!centered) return;
        function resizeLogoContainer() {
            if (
                cardRef.current &&
                contentRef.current &&
                logoContainerRef.current
            ) {
                const PADDING = 50;
                const cardHeight = cardRef.current.offsetHeight;
                const contentHeight = contentRef.current.offsetHeight;
                const remaining = cardHeight - contentHeight - PADDING;
                // Prevent negative or too small
                logoContainerRef.current.style.height = `${
                    (remaining > 0 ? remaining : 0) <= 200
                        ? remaining > 0
                            ? remaining
                            : 0
                        : 200
                }px`;
                logoContainerRef.current.style.paddingTop = `${PADDING}px`;
            }
        }
        resizeLogoContainer();
        window.addEventListener("resize", resizeLogoContainer);
        return () => window.removeEventListener("resize", resizeLogoContainer);
    }, [centered, config]);

    useEffect(() => {
        if (cardRef.current) {
            setOffset(cardRef.current.offsetHeight / 2);
        }
    }, []);

    // Center horizontally if centered, otherwise use left/right
    let cardClass = styles.infoCard;
    if (side === "center") {
        cardClass += ` ${styles.infoCardCenter}`;
    } else {
        cardClass += ` ${
            styles[`infoCard${side.charAt(0).toUpperCase() + side.slice(1)}`]
        }`;
    }

    let style = { top: top - offset };
    if (side === "center") {
        style.left = "50%";
        style.transform = "translateX(-50%)";
    }

    return (
        <div ref={cardRef} className={cardClass} style={style}>
            <div ref={contentRef}>
                <div className={styles.infoCardTitle}>{event.name}</div>
                <div
                    className={`${styles.infoCardMeta} ${
                        centered ? styles.infoCardMetaCentered : ""
                    }`}
                >
                    <span className={styles.infoCardYear}>{year}</span>-
                    <span className={styles.infoCardLocation}>
                        {event.location}
                    </span>
                </div>
                <div className={styles.infoCardDesc}>{event.description}</div>
                {centered && (
                    <div className={styles.aboutCurrent}>
                        {config.about_current_text}
                    </div>
                )}
            </div>
            {centered && (
                <div
                    className={styles.infoCardLogoContainer}
                    ref={logoContainerRef}
                    style={{ overflow: "hidden" }}
                >
                    <img
                        src="/favicon.png"
                        alt="Logo"
                        className={styles.infoCardLogo}
                        style={{
                            height: "100%",
                            width: "auto",
                            maxWidth: "100%",
                            objectFit: "contain",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default About;
