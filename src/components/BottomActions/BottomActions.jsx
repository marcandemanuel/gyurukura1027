import styles from "./BottomActions.module.css";
import { useNavigate } from "react-router-dom";
import { useNavigation } from "../../contexts/NavigationContext";
import { useApp } from "../../contexts/AppContext";

const BottomActions = () => {
    const navigate = useNavigate();
    const { confettiStatus, setConfettiStatus } = useApp();
    const excludedRoutes = ["/visszaszamlalo", "/nasiopciok", "/gyurukura1027"];
    const normalizedPath = location.pathname.toLowerCase();

    const shouldShowOnlyBack = excludedRoutes.includes(normalizedPath);
    const backFromConfetti = confettiStatus === 1;

    const { navigationPile } = useNavigation();

    // Collapsible Bottom Actions State
    const [bottomOpen, setBottomOpen] = React.useState(false);
    const [showHamburger, setShowHamburger] = React.useState(false);
    const actionsRef = React.useRef(null);

    // Overflow detection logic
    React.useEffect(() => {
        function checkOverflow() {
            if (!actionsRef.current) return;
            const el = actionsRef.current;
            // Count visible action buttons
            const actionCount = el.querySelectorAll("button").length;
            // Only show hamburger if more than 1 action and row overflows
            setShowHamburger(actionCount > 1 && el.scrollWidth > el.clientWidth);
        }
        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, []);

    const handleBack = () => {
        if (navigationPile && navigationPile.length > 1) {
            navigate(navigationPile[navigationPile.length - 2]);
        } else {
            navigate("/");
        }
    }

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
                        onClick={handleBack}
                    >
                        Vissza
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className={styles.container}>
            {showHamburger && (
                <button
                    className={styles.hamburger}
                    aria-label="Toggle Bottom Actions"
                    onClick={() => setBottomOpen((open) => !open)}
                >
                    ≡ Bottom Actions
                </button>
            )}
            <div
                ref={actionsRef}
                className={`${styles.bottomActions} ${bottomOpen ? styles.bottomOpen : styles.bottomClosed}`}
                style={{
                    display: showHamburger && !bottomOpen ? "none" : "flex"
                }}
            >
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
