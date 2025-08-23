"use client";

import { useParams } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { useNavigation } from "../../contexts/NavigationContext";
import { useNavigate } from "react-router-dom";
import NotFound from "../NotFound/NotFound";
import BottomActions from "../../components/BottomActions/BottomActions";
import styles from "./Seat.module.css";

const Seat = () => {
    const { userId } = useParams();
    const { user, profiles } = useApp();

    const { back } = useNavigation();
    const navigate = useNavigate();
    
    const handleBack = () => {
        back([/^\/nasirend$/, /^\/adatok$/], '/nasirend');
    }

    if (isNaN(userId)) {
        return (
            <NotFound />
        );
    }

    const profileData = profiles[Number(userId)-1]

    if (profileData === undefined) {
        return (
            <NotFound />
        )
    }

    if (profileData.seat_image === undefined || profileData.seat_image === "") {
        return (
            <div className={styles.container}>
                <p className={styles.text}>
                    Ennek a felhasználónak még nincs meg az ülőhelye.
                </p>
                <button
                    className={styles.backButton}
                    onClick={handleBack}
                >
                    Vissza
                </button>
                <BottomActions />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                {profileData.id === user.id
                    ? "Ülőhely"
                    : `${profileData.user} ülőhelye`}
            </h1>
            <div className={styles.seatImageContainer}>
                <img
                    src={`https://gyurukura1027-backend.onrender.com/uploads/${profileData.seat_image}`}
                    alt="Seat"
                    className={styles.seatImage}
                />
                <button
                    className={styles.backButton}
                    onClick={handleBack}
                >
                    Vissza
                </button>
            </div>
            <BottomActions />
        </div>
    );
};

export default Seat;
