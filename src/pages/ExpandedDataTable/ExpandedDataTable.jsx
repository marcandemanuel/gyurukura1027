"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import Loading from "../../components/Common/Loading/Loading";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import { useNavigation } from "../../contexts/NavigationContext.jsx";
import NotFound from "../NotFound/NotFound";
import BottomActions from "../../components/BottomActions/BottomActions.jsx";
import styles from "./ExpandedDataTable.module.css";

function objectDiff(obj1, obj2) {
    const diff = {};
    for (const [key, value] of Object.entries(obj1)) {
        const v1 = value;
        const v2 = obj2[key];
        const isObjectOrArray = typeof v1 === "object" && v1 !== null;
        if (
            !(key in obj2) ||
            (isObjectOrArray
                ? JSON.stringify(v1) !== JSON.stringify(v2)
                : v1 !== v2)
        ) {
            diff[key] = value;
        }
    }
    return diff;
}

const ExpandedDataTable = () => {
    const { userId } = useParams();
    const { user, profiles, loadProfiles, updateProfile } = useApp();
    const isAdmin = user?.admin === true;
    const [tableProfiles, setTableProfiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const expandedProfile = Number(userId);
    const [expandedProfileData, setExpandedProfileData] = useState(
        profiles[expandedProfile]
    );

    if (expandedProfileData === undefined) {
        return (
            <NotFound />
        )
    }

    const [expandedProfileOriginal, setExpandedProfileOriginal] = useState(
        JSON.parse(JSON.stringify(expandedProfileData))
    );
    const [expandedHasChanges, setExpandedHasChanges] = useState(false);
    const navigate = useNavigate();
    const config = useConfig();

    const movies = [
        "Váratlan Utazás",
        "Smaug Pusztasága",
        "Az Öt Sereg Csatája",
        "A Gyűrű Szövetsége",
        "A Két Torony",
        "A Király Visszatér",
    ];

    movies[config.birthday_on_movie_id] += " 🎂";

    const statusKeys = ["Eldöntetlen", "Elfogadva", "Teljesítve", "Elutasítva"];
    const statusColors = [
        "transparent",
        "rgba(44, 163, 11, 0.36)",
        "rgba(44, 163, 11, 0.36)",
        "rgba(171, 36, 11, 0.36)",
    ];

    const { navigationPile } = useNavigation();

    const handleBack = () => {
        if (navigationPile && navigationPile.length > 0) {
            navigate(navigationPile[navigationPile.length - 1]);
        } else {
            navigate("/nasirend");
        }
    };

    const handleStatusClick = (day, type) => {
        if (!isAdmin || !expandedProfileData) return;

        const currentStatus = expandedProfileData[`acday${day}`][type];
        const currentIndex = statusKeys.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statusKeys.length;
        const newStatus = statusKeys[nextIndex];

        const updatedProfile = { ...expandedProfileData };
        updatedProfile[`acday${day}`][type] = newStatus;
        setExpandedProfileData(updatedProfile);
        setExpandedHasChanges(true);
    };

    const handleCommentChange = (day, type, value) => {
        if (!isAdmin || !expandedProfileData) return;

        const updatedProfile = { ...expandedProfileData };
        updatedProfile[`comment${day}`][type] = value;
        setExpandedProfileData(updatedProfile);
        setExpandedHasChanges(true);
    };

    // Check if two profiles are different (like original getDifferences logic)
    const profilesAreDifferent = (profile1, profile2) => {
        if (!profile1 || !profile2) return false;

        if (JSON.stringify(profile1) !== JSON.stringify(profile2)) {
            return true;
        }

        return false;
    };

    const handleExpandedSave = async () => {
        setLoading(true);
        const actualChanges =
            expandedHasChanges &&
            profilesAreDifferent(expandedProfileData, expandedProfileOriginal);

        if (!actualChanges) {
            setLoading(false);
            handleBack()
            return;
        }

        try {
            const updatedProfile = { ...expandedProfileData };
            Object.entries(
                objectDiff(expandedProfileData, expandedProfileOriginal)
            ).forEach(([key, value]) => {
                const type = key.slice(0, -1);
                const ind = Number(key.slice(-1));
                const notif = type === 'comment' ? (`Az adminisztrátor megjegyzést adott hozzá ${
                        [1, 5].includes(ind + 1) ? "az" : "a"
                    } ${ind + 1}. napi nasiválasztásodhoz.`) : (type === 'acday' ? `Az adminisztrátor megváltoztatta ${
                        [1, 5].includes(ind + 1) ? "az" : "a"
                    } ${ind + 1}. napi nasirendelésed állapotát.` : '')

                if (notif) {
                    const now = new Date();
                    const pad = (n) => n.toString().padStart(2, "0");
                    const date = `${now.getFullYear()}-${pad(
                        now.getMonth() + 1
                    )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
                        now.getMinutes()
                    )}:${pad(now.getSeconds())}`;

                    updatedProfile.notifications.push([notif, date]);
                }
            });

            try {
                const success = await updateProfile(updatedProfile, 'status_changed');

                if (success) {
                    setExpandedProfileData(updatedProfile);
                    setExpandedHasChanges(false);
                    setExpandedProfileOriginal(
                        JSON.parse(JSON.stringify(updatedProfile))
                    );

                    const updatedProfiles = tableProfiles.map((p) =>
                        p.id === expandedProfileData.id ? updatedProfile : p
                    );
                    setTableProfiles(updatedProfiles);
                    setLoading(false);
                    handleBack()
                } else {
                    setLoading(false);
                    handleBack()
                }
            } catch (updateError) {
                setLoading(false);
                handleBack()
            }
        } catch (error) {
            setLoading(false);
            handleBack()
        }
    };

    if (!user) {
        navigate("/profilok");
        return null;
    }

    return (
        <div className={styles.container}>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <h2 className={styles.title}>
                        {expandedProfileData.id === user.id
                            ? "Választásaid"
                            : `${expandedProfileData.user} választásai`}
                    </h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <tbody>
                                <tr>
                                    <td
                                        className={`${styles.headerCell} ${styles.dataCell}`}
                                    >
                                        Nap
                                    </td>
                                    <td
                                        className={`${styles.headerCell} ${styles.dataCell}`}
                                    >
                                        Inni
                                    </td>
                                    <td
                                        className={`${styles.headerCell} ${styles.dataCell}`}
                                    >
                                        Státusz
                                    </td>
                                    <td
                                        className={`${styles.headerCell} ${styles.dataCell}`}
                                    >
                                        Megjegyzés
                                    </td>
                                    <td
                                        className={`${styles.headerCell} ${styles.dataCell}`}
                                    >
                                        Csipsz
                                    </td>
                                    <td
                                        className={`${styles.headerCell} ${styles.dataCell}`}
                                    >
                                        Státusz
                                    </td>
                                    <td
                                        className={`${styles.headerCell} ${styles.dataCell}`}
                                    >
                                        Megjegyzés
                                    </td>
                                </tr>
                                {movies.map((movie, index) => (
                                    <tr key={index}>
                                        <td
                                            className={`${styles.nameCell} ${styles.dataCell}`}
                                            onClick={() =>
                                                navigate(`/film/${index}`)
                                            }
                                        >
                                            {movie}
                                        </td>
                                        <td
                                            className={`${styles.dayCell} ${styles.dataCell}`}
                                        >
                                            {expandedProfileData[
                                                `day${index}`
                                            ][0] || (
                                                <span className={styles.red}>
                                                    Még nincs megadva
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className={`${styles.statusCell} ${styles.dataCell}`}
                                            style={{
                                                backgroundColor:
                                                    statusColors[
                                                        statusKeys.indexOf(
                                                            expandedProfileData[
                                                                `acday${index}`
                                                            ][0]
                                                        )
                                                    ],
                                                ...(isAdmin ? { userSelect: "none" } : {})
                                            }}
                                            onClick={() =>
                                                isAdmin &&
                                                handleStatusClick(index, 0)
                                            }
                                        >
                                            {
                                                expandedProfileData[
                                                    `acday${index}`
                                                ][0]
                                            }
                                            {expandedProfileData[
                                                `acday${index}`
                                            ][0] === "Teljesítve" && (
                                                <img
                                                    src="/images/completed.png"
                                                    alt="Completed"
                                                    className={
                                                        styles.completedImage
                                                    }
                                                />
                                            )}
                                        </td>
                                        <td className={styles.dataCell}>
                                            {isAdmin ? (
                                                <input
                                                    type="text"
                                                    value={
                                                        expandedProfileData[
                                                            `comment${index}`
                                                        ][0]
                                                    }
                                                    onChange={(e) =>
                                                        handleCommentChange(
                                                            index,
                                                            0,
                                                            e.target.value
                                                        )
                                                    }
                                                    className={
                                                        styles.tableInput
                                                    }
                                                />
                                            ) : (
                                                expandedProfileData[
                                                    `comment${index}`
                                                ][0]
                                            )}
                                        </td>
                                        <td
                                            className={`${styles.dayCell} ${styles.dataCell}`}
                                        >
                                            {expandedProfileData[
                                                `day${index}`
                                            ][1] || (
                                                <span className={styles.red}>
                                                    Még nincs megadva
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className={`${styles.statusCell} ${styles.dataCell}`}
                                            style={{
                                                backgroundColor:
                                                    statusColors[
                                                        statusKeys.indexOf(
                                                            expandedProfileData[
                                                                `acday${index}`
                                                            ][1]
                                                        )
                                                    ],
                                                ...(isAdmin ? { userSelect: "none" } : {})
                                            }}
                                            onClick={() =>
                                                isAdmin &&
                                                handleStatusClick(index, 1)
                                            }
                                        >
                                            {
                                                expandedProfileData[
                                                    `acday${index}`
                                                ][1]
                                            }
                                            {expandedProfileData[
                                                `acday${index}`
                                            ][1] === "Teljesítve" && (
                                                <img
                                                    src="/images/completed.png"
                                                    alt="Completed"
                                                    className={
                                                        styles.completedImage
                                                    }
                                                />
                                            )}
                                        </td>
                                        <td className={styles.dataCell}>
                                            {isAdmin ? (
                                                <input
                                                    type="text"
                                                    value={
                                                        expandedProfileData[
                                                            `comment${index}`
                                                        ][1]
                                                    }
                                                    onChange={(e) =>
                                                        handleCommentChange(
                                                            index,
                                                            1,
                                                            e.target.value
                                                        )
                                                    }
                                                    className={
                                                        styles.tableInput
                                                    }
                                                />
                                            ) : (
                                                expandedProfileData[
                                                    `comment${index}`
                                                ][1]
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={styles.backButton}
                            onClick={handleBack}
                        >
                            Vissza
                        </button>
                        {isAdmin && (
                            <button
                                className={styles.saveButton}
                                onClick={handleExpandedSave}
                            >
                                Mentés
                            </button>
                        )}
                    </div>
                    <BottomActions />
                </>
            )}
        </div>
    );
};

export default ExpandedDataTable;
