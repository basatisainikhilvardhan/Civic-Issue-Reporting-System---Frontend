import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/log");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="civic-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🏛️</span>
          <div className="brand-titles">
            <span className="brand-text">CivicResolve</span>
            <span className="brand-subtext">Municipal Grievance System</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>

          {isAuthenticated && user ? (
            <>
              {user.role === "ADMIN" ? (
                <>
                  <Link
                    to="/admin"
                    className={`nav-item ${isActive("/admin") ? "active" : ""}`}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    to="/admin/issues"
                    className={`nav-item ${isActive("/admin/issues") ? "active" : ""}`}
                  >
                    ⚙️ Manage Issues
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dboard"
                    className={`nav-item ${isActive("/dboard") ? "active" : ""}`}
                  >
                    📋 My Reports
                  </Link>
                  <Link
                    to="/report"
                    className="nav-btn-highlight"
                  >
                    + Report Issue
                  </Link>
                </>
              )}

              <div className="user-section">
                <div className="user-info-pill">
                  <span className="avatar-circle">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </span>
                  <div className="user-meta-text">
                    <span className="user-name-label">{user.name || user.email}</span>
                    <span
                      className={`role-pill ${
                        user.role === "ADMIN" ? "role-admin" : "role-citizen"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-logout"
                  title="Sign out of current account"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/log" className={`nav-item ${isActive("/log") ? "active" : ""}`}>
                Sign In
              </Link>
              <Link to="/reg" className="nav-btn-highlight">
                Register Citizen
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
