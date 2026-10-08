import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import authService from "./api/authService";

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const change = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!data.username.trim() || !data.email.trim() || !data.password.trim()) {
      setErrorMessage("Please complete all required fields (*).");
      return;
    }

    if (data.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        name: data.username.trim(),
        email: data.email.trim(),
        phone: data.phone.trim() || "9999999999",
        password: data.password,
      });

      setSuccessMessage(
        response.message || "Registration successful! Redirecting to login page..."
      );
      setTimeout(() => {
        navigate("/log");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.data) {
        const backendError =
          err.response.data.message ||
          err.response.data.error ||
          (typeof err.response.data === "string" ? err.response.data : null);
        setErrorMessage(
          backendError || "Registration failed. An account with this email may already exist."
        );
      } else {
        setErrorMessage("Network error: Could not reach Spring Boot backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="auth-page-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-icon-badge">📝</span>
            <h2>Citizen Account Registration</h2>
            <p>Join the municipal portal to report infrastructure defects in your area</p>
          </div>

          {errorMessage && (
            <div className="alert alert-error" role="alert">
              <span className="alert-icon">⚠️</span>
              <div className="alert-text">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" role="alert">
              <span className="alert-icon">✅</span>
              <div className="alert-text">{successMessage}</div>
            </div>
          )}

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label htmlFor="reg-name">Full Name *</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="reg-name"
                  name="username"
                  value={data.username}
                  onChange={change}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address *</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={change}
                  placeholder="ramesh@example.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone">Mobile Phone Number</label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  value={data.phone}
                  onChange={change}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="reg-password">Password *</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  value={data.password}
                  onChange={change}
                  placeholder="Min 6 characters"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password *</label>
                <input
                  id="reg-confirm"
                  type="password"
                  name="confirmPassword"
                  value={data.confirmPassword}
                  onChange={change}
                  placeholder="Repeat password"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg"
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Submitting to Database...</span>
                </>
              ) : (
                "Complete Citizen Registration"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/log">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;