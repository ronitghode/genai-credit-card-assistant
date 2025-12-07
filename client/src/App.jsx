import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  const [user, setUser] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
    
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme ? savedTheme === "dark" : true;
    setIsDarkTheme(isDark);
    applyTheme(isDark);
  }, []);

  // Separate effect to apply theme changes without affecting component state
  useEffect(() => {
    applyTheme(isDarkTheme);
  }, [isDarkTheme]);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDarkTheme;
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    setIsDarkTheme(newIsDark);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Router>
      <div className="app-container">
        <div className="header">
          <div className="header-top">
            <h1>GenAI Credit Card Assistant</h1>
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDarkTheme ? "☀️" : "🌙"}
            </button>
          </div>
          <p>Handles informational queries & actions</p>
          {user && (
            <div style={{ marginTop: "0.5rem" }}>
              <span style={{ color: "var(--text-main)", marginRight: "1rem" }}>Hi, {user.username}</span>
              <button
                onClick={logout}
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <Routes>
          <Route path="/login" element={!user ? <LoginWrapper onLoginSuccess={handleAuthSuccess} /> : <Navigate to="/chat" />} />
          <Route path="/signup" element={!user ? <SignupWrapper onSignupSuccess={handleAuthSuccess} /> : <Navigate to="/chat" />} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatWindow userId={user?.username} />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

// Wrapper components to handle navigation after auth
const LoginWrapper = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  return (
    <div className="auth-section">
      <Login onLoginSuccess={(data) => {
        onLoginSuccess(data);
        navigate("/chat");
      }} />
      <div className="toggle-auth">
        Don't have an account? <button onClick={() => navigate("/signup")}>Sign Up</button>
      </div>
    </div>
  );
};

const SignupWrapper = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  return (
    <div className="auth-section">
      <Signup onSignupSuccess={(data) => {
        onSignupSuccess(data);
        navigate("/chat");
      }} />
      <div className="toggle-auth">
        Already have an account? <button onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
};

export default App;
