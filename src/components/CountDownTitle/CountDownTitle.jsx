import styles from "./CountDownTitle.module.css";
import { useConfig } from "../../contexts/ConfigContext.jsx";

const CountDownTitle = () => {
    const {config} = useConfig()
    return (
        <div className={styles.container}>
            <h2 className={styles.countdownTitle}>{config.count_down_title}</h2>
        </div>
    );
};

export default CountDownTitle;
