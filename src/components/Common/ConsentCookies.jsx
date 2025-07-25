import React from "react";
import styles from "./ConsentCookies.module.css";

const ConsentCookies = ({ onAccept, onDecline }) => {
  return (
      <div className={styles.overlay}>
          <div className={styles.fadedBackground} />
          <div className={styles.modalCard}>
              <h2 className={styles.title}>Nasik elfogadása</h2>
              <p className={styles.text}>
                  Ha nem akarod mindig megadni itt a PIN-kódot, fogadd el a nasikat, hogy a szerver meg tudja jegyezni az eszközödet.
              </p>
              <div className={styles.buttonRow}>
                  <button onClick={onDecline} className={styles.declineButton}>
                      Elutasítom
                  </button>
                  <button onClick={onAccept} className={styles.acceptButton}>
                      Elfogadom
                  </button>
              </div>
              <img
                  src="/images/nasik.png"
                  alt="nasik"
                  className={styles.imageRight}
                  draggable={false}
              />
          </div>
      </div>
  );
};

export default ConsentCookies;