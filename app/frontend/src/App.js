import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LaunchProvider } from "./contexts/LaunchContext";
import { useLaunch } from "./contexts/LaunchContext";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import InteractiveMap from "./components/InteractiveMap";
import RoutePlanner from "./components/RoutePlanner";
import ComparisonSlider from "./components/ComparisonSlider";
import ForensicViewer from "./components/ForensicViewer";
import FAQPage from "./components/FAQPage";
import Leaderboard from "./components/Leaderboard";
import ModerationPanel from "./components/ModerationPanel";
import ProfilePage from "./components/ProfilePage";
import CountdownWidget from "./components/CountdownWidget";
import CelebrationOverlay from "./components/CelebrationOverlay";
import LaunchBanner from "./components/LaunchBanner";
import ChatWidget from "./components/ChatWidget";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const { showCelebration } = useLaunch();
  const isWidget = location.pathname === "/widget";

  return (
    <>
      {!isWidget && <Navbar />}
      {!isWidget && <LaunchBanner />}
      <Routes>
        <Route path="/"            element={<LandingPage />} />
        <Route path="/map"         element={<InteractiveMap />} />
        <Route path="/route"       element={<RoutePlanner />} />
        <Route path="/compare"     element={<ComparisonSlider />} />
        <Route path="/forensic"    element={<ForensicViewer />} />
        <Route path="/faq"         element={<FAQPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/moderation"  element={<ModerationPanel />} />
        <Route path="/profile"     element={<ProfilePage />} />
        <Route path="/widget"      element={<CountdownWidget />} />
      </Routes>
      {!isWidget && <ChatWidget />}
      {!isWidget && showCelebration && <CelebrationOverlay />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LaunchProvider>
        <div className="App">
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </div>
      </LaunchProvider>
    </AuthProvider>
  );
}

export default App;
