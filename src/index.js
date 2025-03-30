import React, { useState, useEffect } from "react";
import "./styles.scss";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider, googleLogout } from "@react-oauth/google";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Settings from "./route-components/Settings";
import Home from "./route-components/Home";
import { gapi } from "gapi-script";
import HeaderComponent from "./components/header";
import { SCOPES, CLIENT_ID } from "./utils/constants";
import { start } from "./utils/utils";

const App = () => {
  const [gapiReady, setGapiReady] = useState(false);

  useEffect(() => {
    gapi.load("client:auth2", () => start(gapi, CLIENT_ID, SCOPES).then(() => setGapiReady(true)));
  }, []);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [expenses, setExpenses] = useState(() => {
      const savedExpenses = localStorage.getItem("expenses");
      return savedExpenses ? JSON.parse(savedExpenses) : {};
  });

  const [syncError, setSyncError] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const worker = new Worker(new URL('./utils/keepAliveWorker.js', import.meta.url));

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <HeaderComponent
          user={user}
          gapi={gapi}
          gapiReady={gapiReady}
          setSyncError={setSyncError}
          setPopoverAnchorEl={setPopoverAnchorEl}
          setExpenses={setExpenses}
          popoverAnchorEl={popoverAnchorEl}
          setUser={setUser}
          worker={worker}
          setIsSyncModalOpen={setIsSyncModalOpen}
        />
        <Routes>
          <Route path="/" element={
            <Home
              gapi={gapi}
              gapiReady={gapiReady}
              syncError={syncError}
              isSyncModalOpen={isSyncModalOpen}
              setIsSyncModalOpen={setIsSyncModalOpen}
              setSyncError={setSyncError}
              setPopoverAnchorEl={setPopoverAnchorEl}
              setExpenses={setExpenses}
              expenses={expenses}
            />
          } />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
