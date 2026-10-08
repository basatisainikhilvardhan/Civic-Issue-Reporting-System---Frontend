import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "./context/AuthContext";

function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="error-page-container">
        <div className="card error-card">
          <div className="error-icon">🛑</div>
          <h1 className="error-code">403 Forbidden</h1>
          <h2>Access Restricted to Administrators</h2>
          <p className="error-description">
            You do not possess the required administrative clearance to access this management console.
            Frontend route protection blocks unauthorized navigation, and backend Spring Security enforces role authorization.
          </p>

          <div className="user-access-info">
            <p>
              Signed in as: <strong>{user?.email || "Unknown User"}</strong>
            </p>
            <p>
              Assigned role: <span className="role-pill role-citizen">{user?.role || "CITIZEN"}</span>
            </p>
          </div>

          <div className="error-actions" style={{ maxWidth: "280px", margin: "0 auto" }}>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary btn-block"
            >
              ← Go Back
            </button>
            <Link to="/dboard" className="btn btn-primary btn-block">
              Return to Citizen Dashboard
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/log");
              }}
              className="btn btn-secondary btn-block"
            >
              Sign In with Admin Account
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Unauthorized;
