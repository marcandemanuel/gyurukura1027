"use client"
import styles from "./MovieCard.module.css"

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
      <button className={styles.movieCard} onClick={onEdit}>
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
