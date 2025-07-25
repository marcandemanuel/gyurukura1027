import styles from "./BottomActions.module.css";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";

const BottomActions = () => {
    const navigate = useNavigate();
    const { confettiStatus, setConfettiStatus } = useApp();
    const excludedRoutes = ["/visszaszamlalo", "/nasiopciok", "/gyurukura1027"];
    const normalizedPath = location.pathname.toLowerCase();

    const shouldShowOnlyBack = excludedRoutes.includes(normalizedPath);
    const backFromConfetti = confettiStatus === 1;

    if (backFromConfetti) {
        return (
            <div className={styles.container}>
                <div className={styles.bottomActions}>
                    <button
                        className={styles.bottomButton}
                        onClick={() => {
                            setConfettiStatus(2)
                        }}
                    >
                        Vissza
                    </button>
                </div>
            </div>
        );
    }

    if (shouldShowOnlyBack) {
        return (
            <div className={styles.container}>
                <div className={styles.bottomActions}>
                    <button
                        className={styles.bottomButton}
                        onClick={() => window.history.back()}
                    >
                        Vissza
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className={styles.container}>
            <div className={styles.bottomActions}>
                <button
                    className={styles.bottomButton}
                    onClick={() => navigate("/gyurukura1027")}
                >
                    GyűrűkUra 10-27
                </button>
                <button
                    className={styles.bottomButton}
                    onClick={() => navigate("/visszaszamlalo")}
                >
                    Visszaszámláló
                </button>
                <button
                    className={styles.bottomButton}
                    onClick={() => navigate("/nasiopciok")}
                >
                    Nasi opciók
                </button>
            </div>
        </div>
    );
};

export default BottomActions;
