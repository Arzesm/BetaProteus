import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Astrology from "@/pages/Astrology";
import PersonalityAnalysis from "@/pages/PersonalityAnalysis";
import Dreams from "@/pages/Dreams";
import Journal from "@/pages/Journal";
import Meditation from "@/pages/Meditation";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/NotFound";
import Psychology from "@/pages/Psychology";
import { AnimatePresence } from "framer-motion";

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Redirect for direct access to /index.html */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="astrology" element={<Astrology />} />
          <Route path="personality" element={<PersonalityAnalysis />} />
          <Route path="dreams" element={<Dreams />} />
          <Route path="journal" element={<Journal />} />
          <Route path="meditation" element={<Meditation />} />
          <Route path="chat" element={<Chat />} />
          <Route path="psychology" element={<Psychology />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;