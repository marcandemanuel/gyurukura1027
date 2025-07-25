import React from "react";

const ConsentCookies = ({ onAccept, onDecline }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      {/* Faded background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.2)",
          zIndex: 1
        }}
      />
      {/* Modal card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "80vw",
          height: "80vh",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "32px"
        }}
      >
        <h2 style={{ marginBottom: 24 }}>Cookie Consent</h2>
        <p style={{ fontSize: 18, marginBottom: 32, textAlign: "center" }}>
          This site uses cookies to remember your device for authentication. Do you accept the use of cookies for this purpose?
        </p>
        <div style={{ display: "flex", gap: 32 }}>
          <button
            onClick={onAccept}
            style={{
              padding: "12px 32px",
              background: "#9C8028",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            style={{
              padding: "12px 32px",
              background: "#ccc",
              color: "#222",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentCookies;