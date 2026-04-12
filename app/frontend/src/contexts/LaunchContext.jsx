import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LaunchContext = createContext({});

export function LaunchProvider({ children }) {
  const [isLaunched, setIsLaunched] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Intentional mount-only effect: URL params, localStorage flags, and axios are stable module-level values
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const params = new URLSearchParams(window.location.search);
    if (params.get("celebrate") === "1") {
      setIsLaunched(true);
      setShowCelebration(true);
      setChecked(true);
      return;
    }
    // 2. Already marked in localStorage (persisted across reloads)
    if (localStorage.getItem("gta6_launched") === "true") {
      setIsLaunched(true);
      setChecked(true);
      return;
    }
    // 3. Ask backend (auto date OR admin manual override)
    axios
      .get(`${API}/system/launch-status`)
      .then((r) => {
        if (r.data.launched) {
          setIsLaunched(true);
          localStorage.setItem("gta6_launched", "true");
          if (!localStorage.getItem("gta6_celebration_seen")) {
            setShowCelebration(true);
          }
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount-only: API constant, axios, and localStorage are stable module-level values

  const triggerLaunch = () => {
    if (isLaunched) return;
    setIsLaunched(true);
    localStorage.setItem("gta6_launched", "true");
    if (!localStorage.getItem("gta6_celebration_seen")) {
      setShowCelebration(true);
    }
  };

  const activateCelebration = () => {
    setIsLaunched(true);
    setShowCelebration(true);
    localStorage.setItem("gta6_launched", "true");
    localStorage.removeItem("gta6_celebration_seen");
  };

  const dismissCelebration = () => {
    setShowCelebration(false);
    localStorage.setItem("gta6_celebration_seen", "true");
  };

  const resetForTesting = () => {
    localStorage.removeItem("gta6_launched");
    localStorage.removeItem("gta6_celebration_seen");
    setIsLaunched(false);
    setShowCelebration(false);
  };

  return (
    <LaunchContext.Provider
      value={{ isLaunched, showCelebration, checked, triggerLaunch, activateCelebration, dismissCelebration, resetForTesting }}
    >
      {children}
    </LaunchContext.Provider>
  );
}

export const useLaunch = () => useContext(LaunchContext);
