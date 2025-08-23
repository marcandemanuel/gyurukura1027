import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import { useNavigation } from "../../contexts/NavigationContext.jsx";
import NotFound from "../NotFound/NotFound";
import BottomActions from "../../components/BottomActions/BottomActions.jsx";
import styles from "./MovieInfo.module.css";
import ActionRow from "../../components/Common/ActionRow";

// Movie titles for display
const MOVIE_TITLES = [
    "Váratlan Utazás",
    "Smaug Pusztasága",
    "Az Öt Sereg Csatája",
    "A Gyűrű Szövetsége",
    "A Két Torony",
    "A Király Visszatér",
];

const RUNTIMES = [182, 186, 164, 208, 235, 263];
const RATIO_DRINK = 2.25 / 263;
const RATIO_CHIPS = 280 / 263;

function getTrending(arr) {
    if (!arr.length) return "";
    const freq = {};
    const original = {};
    arr.forEach((item) => {
        if (!item) return;
        const norm = item.replace(/\s+/g, "").toLowerCase();
        if (!(norm in original)) {
            original[norm] = item; // store first appearance for display
        }
        freq[norm] = (freq[norm] || 0) + 1;
    });
    let max = 0;
    let trendingNorm = "";
    Object.entries(freq).forEach(([norm, count]) => {
        if (count > max) {
            max = count;
            trendingNorm = norm;
        }
    });
    return original[trendingNorm] || "-";
}

const MovieInfo = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const { user, profiles, options } = useApp();
    const [clicked, setClicked] = useState(false);
    const movieIndex = Number(movieId) || 1;
    const movieTitle = MOVIE_TITLES[movieIndex-1] || "Ismeretlen film";

    const dayData = user[`day${movieIndex-1}`] || ["", ""];

    const isEmpty = !dayData[0] && !dayData[1];
    const missingDrink = !dayData[0] && dayData[1];
    const missingChips = dayData[0] && !dayData[1];
    const runtime = RUNTIMES[movieIndex-1];
    const config = useConfig();

    MOVIE_TITLES[config.birthday_on_movie_id] += " 🎂";

    const { back } = useNavigation();

    const handleBack = () => {
        back([/^\/nasirend$/, /^\/adatok\/\d+$/], '/nasirend');
    };

    // Compute stats from profiles
    const { amountDrink, amountChips, topDrink, topChips } =
        useMemo(() => {
            // Each profile has day0, day1, ... for each movie, which is an array [drink, chips]
            const drinks = [];
            const chips = [];
            profiles.forEach((profile) => {
                const day = profile[`day${movieIndex-1}`];
                if (Array.isArray(day)) {
                    if (day[0]) drinks.push(day[0]);
                    if (day[1]) chips.push(day[1]);
                }
            });
            return {
                amountDrink: `${
                    Math.round(RUNTIMES[movieIndex - 1] * RATIO_DRINK * 10) / 10
                }l`,
                amountChips: `${
                    Math.round((RUNTIMES[movieIndex - 1] * RATIO_CHIPS) / 5) * 5
                }g`,
                topDrink: options.top.drink[movieIndex - 1] || null,
                topChips: options.top.chips[movieIndex - 1] || null,
            };
        }, [profiles, movieIndex-1]);

    const getSubtitle = () => {
        if (isEmpty) {
            return (
                <>
                    <span className={styles.error}>
                        {" "}
                        Válassz innit és csipszet
                    </span>
                </>
            );
        }

        if (missingDrink) {
            return (
                <>
                    {dayData[1]} és{" "}
                    <span className={styles.error}>válassz innit</span>
                </>
            );
        }

        if (missingChips) {
            return (
                <>
                    {dayData[0]} és{" "}
                    <span className={styles.error}>válassz csipszet</span>
                </>
            );
        }

        return (
            <>
                {dayData[0]} és {dayData[1]}
            </>
        );
    };

    if (MOVIE_TITLES[movieIndex-1] === undefined) {
        return <NotFound />;
    }
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{movieTitle}</h1>
            <p className={styles.subtitle}>{getSubtitle()}</p>
            <div className={styles.videoSection}>
                <video
                    controls
                    className={`${styles.videoPlayer} ${clicked ? styles.clicked : ''}`}
                    autoPlay
                    muted
                    onMouseDown={() => setClicked(true)}
                    onMouseUp={() => setClicked(false)}
                >
                    <source
                        src={`/videos/${movieIndex}.mp4`}
                        type="video/mp4"
                    />
                    A videó nem elérhető.
                </video>
            </div>
            <h3 className={styles.datasTitle}>Adatok</h3>
            <div className={styles.info}>
                <div className={styles.side}>
                    <p>Hossz: {runtime} perc</p>
                    <p>Ajánlott inni mennyiség: {amountDrink}</p>
                    <p>Ajánlott csipsz mennyiség: {amountChips}</p>
                </div>
                <div className={styles.side}>
                    <p>Népszerű inni: {topDrink ? topDrink : "-"}</p>
                    <p>
                        Népszerű csipsz: {topChips ? topChips : "-"}
                    </p>
                </div>
            </div>
            <ActionRow label="Action Row">
                <button
                    className={styles.actionButton}
                    onClick={handleBack}
                >
                    Vissza
                </button>
                <Link
                    className={styles.actionButton}
                    to={`/nasirendeles/${movieIndex}`}
                    tabIndex={0}
                >
                    Nasi szerkesztése
                </Link>
            </ActionRow>
            <BottomActions />
        </div>
    );
};

export default MovieInfo;
