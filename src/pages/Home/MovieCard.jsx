"use client"
import styles from "./MovieCard.module.css"

const STATUS_COLORS = {
  Eldöntetlen: "rgba(0, 0, 0, 0.2)",
  Elfogadva: "rgba(0, 75, 0, 0.2)",
  Teljesítve: "rgba(0, 75, 0, 0.2)",
  Elutasítva: "rgba(75, 0, 0, 0.2)",
}

const STATUS_BORDER_COLORS = {
  Eldöntetlen: "#9C8028",
  Elfogadva: "rgb(0, 200, 0)",
  Teljesítve: "rgb(0, 200, 0)",
  Elutasítva: "rgb(200, 0, 0)",
}

const TRANSLATIONS = {
    Elfogadva: "accepted",
    Teljesítve: "completed",
    Elutasítva: "declined"
}

const MovieCard = ({ id, movie, userProfile, onEdit, onInfo }) => {
  const dayData = userProfile[`day${id}`] || ["", ""]
  const statusData = userProfile[`acday${id}`] || ["Eldöntetlen", "Eldöntetlen"]

  const isEmpty = !dayData[0] && !dayData[1]
  const missingDrink = !dayData[0] && dayData[1]
  const missingChips = dayData[0] && !dayData[1]

  // Determine overall status for styling
  const getOverallStatus = () => {
    if (statusData[0] === statusData[1] && statusData[0] !== "Eldöntetlen") {
      return statusData[0]
    }
    if (statusData[0] !== statusData[1]) {
      if (statusData.includes("Elutasítva")) return "Elutasítva"
      if (statusData.includes("Teljesítve") && statusData.includes("Elfogadva")) return "Elfogadva"
    }
    return "Eldöntetlen"
  }

  const overallStatus = getOverallStatus()

  const cardStyle = {
      backgroundColor: STATUS_COLORS["Eldöntetlen"], // can be changed to overallStatus
      boxShadow: `0px 0px 6px ${STATUS_BORDER_COLORS["Eldöntetlen"]}`, // can be changed to overallStatus
  };

  const renderContent = () => {
    if (isEmpty) {
      return (
        <>
          <span className={styles.movieTitle} onClick={onInfo}>
            {movie}:
          </span>
          <span className={styles.error}> Válassz innit és csipszet</span>
        </>
      )
    }

    if (missingDrink) {
      return (
        <>
          <span className={styles.movieTitle} onClick={onInfo}>
            {movie}:
          </span>{" "}
          {dayData[1]} és <span className={styles.error}>válassz innit</span>
        </>
      )
    }

    if (missingChips) {
      return (
        <>
          <span className={styles.movieTitle} onClick={onInfo}>
            {movie}:
          </span>{" "}
          {dayData[0]} és <span className={styles.error}>válassz csipszet</span>
        </>
      )
    }

    return (
      <>
        <span className={styles.movieTitle} onClick={onInfo}>
          {movie}:
        </span>{" "}
        {dayData[0]} és {dayData[1]}
      </>
    )
  }

  return (
      <button className={styles.movieCard} style={cardStyle} onClick={onEdit}>
          {renderContent()}
          {overallStatus !== "Eldöntetlen" && (
              <img
                  src={`/images/${TRANSLATIONS[overallStatus]}.png`}
                  alt={TRANSLATIONS[overallStatus]}
                  className={styles.statusImage}
              />
          )}
      </button>
  );
}

export default MovieCard
