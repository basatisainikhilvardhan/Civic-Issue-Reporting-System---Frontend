import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "./context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [data, setData] = useState({
    uname: "",
    psw: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const from = location.state?.from?.pathname || null;

  const change = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const prefillDemo = (email, password) => {
    setData({ uname: email, psw: password });
    setErrorMessage("");
    setSuccessMessage(`Demo credentials loaded for ${email}`);
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!data.uname.trim() || !data.psw.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const authData = await login({
        email: data.uname.trim(),
        password: data.psw.trim(),
      });

      setSuccessMessage(
        `Authenticated as ${authData.role}! Loading portal...`
      );

      setTimeout(() => {
        if (from && from !== "/log" && from !== "/reg" && from !== "/unauthorized") {
          navigate(from, { replace: true });
        } else if (authData.role === "ADMIN") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dboard", { replace: true });
        }
      }, 400);
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data) {
        const backendError =
          err.response.data.message ||
          err.response.data.error ||
          (typeof err.response.data === "string" ? err.response.data : null);
        setErrorMessage(backendError || "Invalid email or password.");
      } else {
        setErrorMessage("Network error: Could not reach Spring Boot backend. Please check your connection.");
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
            <span className="auth-icon-badge">🔐</span>
            <h2>Sign In to CivicResolve</h2>
            <p>Access your citizen reports or administrative management console</p>
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
              <label htmlFor="login-email">Registered Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  id="login-email"
                  type="email"
                  name="uname"
                  value={data.uname}
                  onChange={change}
                  placeholder="name@example.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="login-password"
                  type="password"
                  name="psw"
                  value={data.psw}
                  onChange={change}
                  placeholder="Enter your secret password"
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
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* College Demo Quick Fill Helper */}
          <div className="demo-credentials-card">
            <span className="demo-badge-small">College Demo Helper</span>
            <p className="demo-hint-text">
              Quickly pre-fill test credentials for presentation:
            </p>
            <div className="demo-btn-group">
              <button
                type="button"
                onClick={() => prefillDemo("citizen@example.com", "password123")}
                className="btn-demo-fill"
              >
                👤 Pre-fill Citizen
              </button>
              <button
                type="button"
                onClick={() => prefillDemo("admin@example.com", "Admin@123")}
                className="btn-demo-fill"
              >
                🛡️ Pre-fill Admin
              </button>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              New Citizen? <Link to="/reg">Create an account to report issues</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;