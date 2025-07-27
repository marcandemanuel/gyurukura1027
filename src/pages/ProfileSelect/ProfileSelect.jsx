"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import BottomActions from "../../components/BottomActions/BottomActions";
import Loading from "../../components/Common/Loading/Loading";
import styles from "./ProfileSelect.module.css";

const USER_ID_COOKIE_KEY = "user_id";
const USER_ID_COOKIE_DAYS = 1;

function setUserIDCookie(id='none') {
    const d = new Date();
    d.setTime(d.getTime() + USER_ID_COOKIE_DAYS * 24 * 60 * 60 * 1000);
    document.cookie = `${USER_ID_COOKIE_KEY}=${id};expires=${d.toUTCString()};path=/;SameSite=Strict`;
}

const ProfileSelect = () => {
    const { profiles, loadProfiles, selectUser, user, isAuthenticated, consentAccepted } =
        useApp();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initProfiles = async () => {
            setLoading(true);
            await loadProfiles(false);
            setLoading(false);
        };
        initProfiles();
        if (consentAccepted) setUserIDCookie('none')
    }, []);

    // If user is already selected and authenticated, redirect to home
    useEffect(() => {
        if (user && isAuthenticated) {
            if (consentAccepted) {
                setUserIDCookie(user.id)
            }
            navigate("/nasirend", { replace: true });
        }
    }, [user, isAuthenticated, navigate]);

    const handleProfileSelect = (profile) => {
        selectUser(profile);
        navigate("/nasirend");
    };

    return (
        <div className={styles.container}>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <h2 className={styles.title}>Válassz profilt</h2>
                    <div className={styles.profileList}>
                        {profiles.map((profile) => (
                            <button
                                key={profile.id}
                                className={styles.profileButton}
                                onClick={() => handleProfileSelect(profile)}
                            >
                                {profile.user}
                            </button>
                        ))}
                    </div>
                    <BottomActions />
                </>
            )}
        </div>
    );
};

export default ProfileSelect;
