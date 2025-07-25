import React, { useState, useEffect } from "react";

const COOKIE_CONSENT_KEY = "cookie_consent_accepted";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      background: "#222",
      color: "#fff",
      padding: "16px",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 -2px 8px rgba(0,0,0,0.2)"
    }}>
      <span>
        This site uses cookies necessary for authentication and device recognition. By continuing to use the site, you accept the use of these cookies.
      </span>
      <button
        onClick={handleAccept}
        style={{
          marginLeft: "24px",
          padding: "8px 20px",
          background: "#9C8028",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Accept
      </button>
    </div>
  );
};

export default CookieConsent;