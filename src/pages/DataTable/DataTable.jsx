"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import Loading from "../../components/Common/Loading/Loading";
import { useConfig } from "../../contexts/ConfigContext.jsx";
import { apiService } from "../../services/apiService";
import FileUploader from "../../components/Common/FileUploader/FileUploader";
import BottomActions from "../../components/BottomActions/BottomActions.jsx";
import styles from "./DataTable.module.css";

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

const DataTable = () => {
    const { user, profiles, loadProfiles, refreshCurrentUser, updateProfile } = useApp();
    const isAdmin = user?.admin === true; // Get admin status directly from user
    const [tableProfiles, setTableProfiles] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalProfiles, setOriginalProfiles] = useState([]);
    const [animatingIndex, setAnimatingIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const tableRef = useRef(null);
    const navigate = useNavigate();
    const config = useConfig();
    // Use an array of refs, one per profile row
    const uploaderRefs = useRef([]);
    const [selectedFileName, setSelectedFileName] = useState("");

    const statusKeys = ["Eldöntetlen", "Elfogadva", "Teljesítve", "Elutasítva"];
    const statusColors = [
        "transparent",
        "rgba(44, 163, 11, 0.36)",
        "rgba(44, 163, 11, 0.36)",
        "rgba(171, 36, 11, 0.36)",
    ];

    useEffect(() => {
        if (isAdmin) {
            loadProfiles(true);
        } else {
            loadProfiles(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        setTableProfiles(JSON.parse(JSON.stringify(profiles)));
        setOriginalProfiles(JSON.parse(JSON.stringify(profiles)));
    }, [profiles]);

    const expandProfile = (profileIndex) => {
        navigate(`/adatok/${profileIndex}`);
    };

    // Calculate status dot type based on original logic
    const aDot = (profile, ind) => {
        if (
            isAdmin &&
            profile[`acday${ind}`].includes("Eldöntetlen") &&
            profile[`day${ind}`].some((str) => str !== "") &&
            !profile.admin
        ) {
            return "new";
        }

        if (
            profile[`acday${ind}`][0] === profile[`acday${ind}`][1] &&
            profile[`acday${ind}`][0] !== "Eldöntetlen"
        ) {
            return profile[`acday${ind}`][0];
        }

        if (profile[`acday${ind}`][0] !== profile[`acday${ind}`][1]) {
            if (profile[`acday${ind}`].includes("Elutasítva"))
                return "Elutasítva";
            if (
                profile[`acday${ind}`].includes("Teljesítve") &&
                profile[`acday${ind}`].includes("Elfogadva")
            )
                return "Elfogadva";
        }

        return "none";
    };

    const formatDayContent = (profile, day) => {
        const dayData = profile[`day${day}`];
        if (!dayData[0] && !dayData[1]) {
            return <span className={styles.red}>Nincs inni és csipsz</span>;
        }
        if (!dayData[0]) {
            return (
                <>
                    {dayData[1]} és{" "}
                    <span className={styles.red}>nincs inni</span>
                </>
            );
        }
        if (!dayData[1]) {
            return (
                <>
                    {dayData[0]} és{" "}
                    <span className={styles.red}>nincs csipsz</span>
                </>
            );
        }
        return `${dayData[0]} és ${dayData[1]}`;
    };

    // Check if two profiles are different (like original getDifferences logic)
    const profilesAreDifferent = (profile1, profile2) => {
        if (!profile1 || !profile2) return false;

        // Compare all relevant fields
        const fieldsToCompare = ["user", "pin", "admin", "seat_image"];
        for (const field of fieldsToCompare) {
            if (profile1[field] !== profile2[field]) return true;
        }

        // Compare day arrays and status arrays and comments
        for (let i = 0; i <= 5; i++) {
            const day1 = profile1[`day${i}`] || [];
            const day2 = profile2[`day${i}`] || [];
            const acday1 = profile1[`acday${i}`] || [];
            const acday2 = profile2[`acday${i}`] || [];
            const comment1 = profile1[`comment${i}`] || [];
            const comment2 = profile2[`comment${i}`] || [];

            if (JSON.stringify(day1) !== JSON.stringify(day2)) return true;
            if (JSON.stringify(acday1) !== JSON.stringify(acday2)) return true;
            if (JSON.stringify(comment1) !== JSON.stringify(comment2))
                return true;
        }

        return false;
    };

    // Check if main table profiles have actually changed
    const mainTableHasActualChanges = () => {
        if (tableProfiles.length !== originalProfiles.length) return true;

        for (let i = 0; i < tableProfiles.length; i++) {
            if (profilesAreDifferent(tableProfiles[i], originalProfiles[i])) {
                return true;
            }
        }
        return false;
    };

    const notifyUser = async (profileIndex) => {
        setAnimatingIndex(profileIndex);
        const profile = tableProfiles[profileIndex];
        try {
            const now = new Date();
            const pad = (n) => n.toString().padStart(2, "0");
            const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
                now.getDate()
            )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
                now.getSeconds()
            )}`;

            profile.notifications.push(["Töltse ki a nasirendjét", date]);
            const success = await updateProfile(profile, "notify_user");
        } catch (error) {}
    };

    const createTable = () => {
        if (!tableProfiles.length) return null;

        const tableKeys = isAdmin
            ? [
                "Név",
                "ID",
                "1. nap",
                "2. nap",
                "3. nap",
                "4. nap",
                "5. nap",
                "6. nap",
                "Ülőhely",
                "PIN",
                "Admin",
            ]
            : [
                "Név",
                "1. nap",
                "2. nap",
                "3. nap",
                "4. nap",
                "5. nap",
                "6. nap",
                "Ülőhely",
                "Admin",
            ];

        if (isAdmin) {
            tableKeys[config.birthday_on_movie_id + 2] += " 🎂";
        } else {
            tableKeys[config.birthday_on_movie_id + 1] += " 🎂";
        }

        // Ensure uploaderRefs is the correct length
        if (uploaderRefs.current.length !== tableProfiles.length) {
            uploaderRefs.current = Array(tableProfiles.length)
                .fill()
                .map((_, i) => uploaderRefs.current[i] || React.createRef());
        }

        return (
            <table className={styles.table} ref={tableRef}>
                <tbody>
                    {/* Header row */}
                    <tr>
                        {tableKeys.map((key, index) => (
                            <td
                                key={key}
                                className={`${styles.headerCell} ${styles.dataCell}`}
                                style={{
                                    borderLeft:
                                        index === 0 ? "none" : undefined,
                                    borderRight:
                                        index === tableKeys.length - 1
                                            ? "none"
                                            : undefined,
                                }}
                            >
                                {key}
                            </td>
                        ))}
                    </tr>

                    {/* Data rows */}
                    {tableProfiles.map((profile, profileIndex) => (
                        <tr key={profile.id}>
                            {/* Name cell */}
                            <td
                                className={`${styles.dataCell} ${styles.userCell}`}
                            >
                                <div className={styles.flexContainer}>
                                    <div
                                        className={styles.imageBox}
                                        onClick={() =>
                                            expandProfile(profileIndex)
                                        }
                                    >
                                        <img
                                            src="/images/arrow.png"
                                            alt="arrow"
                                        />
                                    </div>
                                    {isAdmin ? (
                                        <input
                                            type="text"
                                            value={profile.user}
                                            onChange={(e) => {
                                                const newProfiles = [
                                                    ...tableProfiles,
                                                ];
                                                newProfiles[profileIndex].user =
                                                    e.target.value;
                                                setTableProfiles(newProfiles);
                                                setHasChanges(true);
                                            }}
                                            className={styles.tableInput}
                                        />
                                    ) : (
                                        <span className={styles.tableName}>
                                            {profile.user}
                                        </span>
                                    )}
                                    {isAdmin && (
                                        <div
                                            className={`${styles.notifyImage} ${
                                                animatingIndex === profileIndex
                                                    ? styles.animateRing
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                notifyUser(profileIndex)
                                            }
                                        >
                                            <img
                                                src="/images/notify.png"
                                                alt="notify"
                                            />
                                        </div>
                                    )}
                                </div>
                            </td>

                            {/* ID cell (admin only) */}
                            {isAdmin && (
                                <td
                                    className={`${styles.dataCell} ${styles.idCell}`}
                                >
                                    {profile.id}
                                </td>
                            )}

                            {/* Day cells */}
                            {[0, 1, 2, 3, 4, 5].map((day) => {
                                const dotType = aDot(profile, day);
                                const colorIndex = statusKeys.indexOf(dotType);
                                const backgroundColor =
                                    colorIndex !== -1
                                        ? statusColors[colorIndex]
                                        : "transparent";

                                return (
                                    <td
                                        key={day}
                                        className={`${styles.dataCell} ${styles.dayCell}`}
                                        style={{ backgroundColor }}
                                    >
                                        {formatDayContent(profile, day)}
                                        {dotType === "Teljesítve" && (
                                            <img
                                                src="/images/completed.png"
                                                alt="Completed"
                                                className={
                                                    styles.completedImage
                                                }
                                            />
                                        )}
                                        {dotType === "new" && (
                                            <div
                                                className={`${styles.dot} ${styles.new}`}
                                            ></div>
                                        )}
                                    </td>
                                );
                            })}

                            <td
                                className={`${styles.dataCell} ${styles.fileUploadCell}`}
                            >
                                <div className={styles.flexContainer}>
                                    {(profiles[profileIndex].seat_image && profiles[profileIndex].seat_image === profile.seat_image) && (
                                        <div
                                            className={styles.imageBox}
                                            onClick={() => navigate(`/ulohely/${profileIndex}`)}
                                        >
                                            <img
                                                src="/images/arrow.png"
                                                alt="arrow"
                                            />
                                        </div>
                                    )}
                                    <FileUploader
                                        ref={uploaderRefs.current[profileIndex]}
                                        onFileChange={(file) => {
                                            setSelectedFileName(
                                                file?.name || ""
                                            );
                                            const updatedProfiles = [
                                                ...tableProfiles,
                                            ];
                                            updatedProfiles[profileIndex].seat_image = file?.name || '';
                                            setTableProfiles(updatedProfiles)
                                        }}
                                        defaultFileName={
                                            profile.seat_image || ""
                                        }
                                    />
                                </div>
                            </td>

                            {/* PIN cell (admin only) */}
                            {isAdmin && (
                                <td
                                    className={`${styles.dataCell} ${styles.pinCell}`}
                                >
                                    <input
                                        type="text"
                                        value={profile.pin || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (
                                                value === "" ||
                                                (value.length <= 4 &&
                                                    !isNaN(value))
                                            ) {
                                                const newProfiles = [
                                                    ...tableProfiles,
                                                ];
                                                if (value === "") {
                                                    delete newProfiles[
                                                        profileIndex
                                                    ].pin;
                                                } else {
                                                    newProfiles[
                                                        profileIndex
                                                    ].pin = value;
                                                }
                                                setTableProfiles(newProfiles);
                                                setHasChanges(true);
                                            }
                                        }}
                                        className={styles.tableInput}
                                        maxLength={4}
                                    />
                                </td>
                            )}

                            <td
                                className={`${styles.dataCell} ${styles.adminCell}`}
                            >
                                {profile.admin && (
                                    <img
                                        src="/images/completed.png"
                                        alt="Completed"
                                        className={styles.adminImage}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const uploadChangedFiles = async (profileIndexes) => {
        for (const idx of profileIndexes) {
            const uploaderRef = uploaderRefs.current[idx];
            if (uploaderRef && uploaderRef.current) {
                const file = uploaderRef.current.getSelectedFile();
                if (file) {
                    try {
                        await apiService.uploadFile(file);
                    } catch (err) {
                    }
                }
            }
        }
    };

    // Main table save logic - acts like back button, saves only if changes exist
    const handleSave = async () => {
        setLoading(true);
        // Check if there are actual changes
        const actualChanges = mainTableHasActualChanges();

        if (!actualChanges) {
            setLoading(false);
            navigate("/nasirend");
            return;
        }

        try {
            const now = new Date();
            const pad = (n) => n.toString().padStart(2, "0");
            const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
                now.getDate()
            )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
                now.getSeconds()
            )}`;

            const updatedTableProfiles = JSON.parse(
                JSON.stringify(tableProfiles)
            );

            const changedFileIndexes = [];

            tableProfiles.forEach((tableProfile) => {
                if (tableProfile.pin !== profiles[tableProfile.id].pin) {
                    updatedTableProfiles[tableProfile.id].notifications.push([
                        "Az admin módosította az Ön PIN-kódját",
                        date,
                    ]);
                    updatedTableProfiles[tableProfile.id].sendEmails.push('pin_changed');
                    if (
                        tableProfile.pin === "" ||
                        tableProfile.pin === undefined
                    ) {
                        updatedTableProfiles[tableProfile.id].hasPin = false;
                    }
                } else if (
                    tableProfile.user !== profiles[tableProfile.id].user
                ) {
                    updatedTableProfiles[tableProfile.id].notifications.push([
                        "Az admin módosította az Ön nevét",
                        date,
                    ]);
                    updatedTableProfiles[
                        tableProfile.id
                    ].sendEmails.push('name_changed');
                } else if (
                    tableProfile.seat_image !==
                    profiles[tableProfile.id].seat_image
                ) {
                    if (profiles.seat_image) {
                        updatedTableProfiles[tableProfile.id].notifications.push([
                            "Az admin feltöltötte az Ön ülőhelyét 🎉!",
                            date,
                        ]);
                        updatedTableProfiles[tableProfile.id].sendEmails.push(
                            "seat_created"
                        );
                        changedFileIndexes.push(tableProfile.id)
                    } else {
                        updatedTableProfiles[tableProfile.id].notifications.push([
                            "Az admin módosította az Ön ülőhelyét",
                            date,
                        ]);
                        updatedTableProfiles[tableProfile.id].sendEmails.push(
                            "seat_changed"
                        );
                        changedFileIndexes.push(tableProfile.id)
                    }
                }
            });
            // Save all profiles using the saveAllProfiles API (like original saveJSON)
            await apiService.saveAllProfiles(updatedTableProfiles);
            await uploadChangedFiles(changedFileIndexes);

            setHasChanges(false);
            setOriginalProfiles(JSON.parse(JSON.stringify(tableProfiles)));

            setLoading(false);
            // Go back to home after saving (save = back)
            // Refresh current user and profiles after saving, then navigate home
            await refreshCurrentUser(isAdmin);
            navigate("/nasirend");
        } catch (error) {
            setLoading(false);
            // Even on error, go back (save button always acts as back)
            // Even on error, still refresh and go back
            await refreshCurrentUser(isAdmin);
            navigate("/nasirend");
        }
    };

    const handleBack = () => {
        window.history.back();
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
                        {isAdmin ? "Kezelőpult" : "Mások választásai"}
                    </h2>
                    <div className={styles.tableContainer}>{createTable()}</div>
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
                                onClick={handleSave}
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

export default DataTable;
