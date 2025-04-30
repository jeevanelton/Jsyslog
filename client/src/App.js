// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import EventsExplorerPage from "./pages/EventsExplorerPage";
import SettingsPanel from "./pages/SettingsPanel";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" />;
    }
    return element;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} onLogout={() => {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }} />}

        <main className="container mx-auto px-6 py-4">
          <Routes>
            <Route
              path="/login"
              element={
                user
                  ? <Navigate to="/dashboard" replace />
                  : <LoginPage onLogin={(u) => {
                    setUser(u);
                    localStorage.setItem("user", JSON.stringify(u));
                  }} />
              }
            />

            <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
            <Route path="/events" element={<ProtectedRoute element={<EventsExplorerPage />} />} />
            <Route
              path="/settings"
              element={<ProtectedRoute element={<SettingsPanel />} allowedRoles={["admin"]} />}
            />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
