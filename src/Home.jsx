import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "./context/AuthContext";

function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-badge">🏛️ Municipal Public Services Portal</div>
          <h1 className="hero-title">
            Civic Issue Reporting & Grievance Redressal System
          </h1>
          <p className="hero-subtitle">
            A transparent digital bridge between residents and city municipal administrators.
            Report civic infrastructure hazards, track field remediation, and ensure accountability in real time.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              isAdmin ? (
                <>
                  <Link to="/admin" className="btn btn-primary btn-lg">
                    📊 Open Admin Dashboard
                  </Link>
                  <Link to="/admin/issues" className="btn btn-secondary btn-lg">
                    ⚙️ Manage Reported Issues
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/report" className="btn btn-primary btn-lg">
                    📢 Report a Civic Issue
                  </Link>
                  <Link to="/dboard" className="btn btn-secondary btn-lg">
                    📋 View My Dashboard
                  </Link>
                </>
              )
            ) : (
              <>
                <Link to="/log" className="btn btn-primary btn-lg">
                  🔐 Citizen / Admin Sign In
                </Link>
                <Link to="/reg" className="btn btn-secondary btn-lg">
                  📝 New Citizen Registration
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Workflow Steps Section */}
        <section className="workflow-section">
          <div className="section-header">
            <h2>Grievance Resolution Lifecycle</h2>
            <p>Every report moves through a documented, auditable municipal lifecycle</p>
          </div>

          <div className="workflow-grid">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-icon">📍</div>
              <h3>Report Grievance</h3>
              <p>Citizens pinpoint location, select category, upload details, and submit issues securely.</p>
            </div>

            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-icon">📋</div>
              <h3>Triage & Assign</h3>
              <p>Municipal officers inspect incoming reports and assign them to responsible field departments.</p>
            </div>

            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-icon">⚡</div>
              <h3>Remediation in Progress</h3>
              <p>Field maintenance crews remediate the physical issue with tracked audit remarks.</p>
            </div>

            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-icon">✅</div>
              <h3>Verified Resolution</h3>
              <p>Work is inspected, status moves to RESOLVED, and history is permanently recorded in MySQL.</p>
            </div>
          </div>
        </section>

        {/* Problem Categories Grid */}
        <section className="categories-section">
          <div className="section-header">
            <h2>Key Municipal Coverage Areas</h2>
            <p>Direct service categories managed by this platform</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛣️</div>
              <h3>Roads & Pavements</h3>
              <p>Report dangerous potholes, broken curbs, damaged pedestrian paths, and uneven surfaces.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🗑️</div>
              <h3>Garbage & Waste</h3>
              <p>Notify waste management about overflowing dumpsters, uncollected garbage, and street litter.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Street Lighting</h3>
              <p>Report burnt-out sodium/LED fixtures, dangling wires, or dark stretches affecting neighborhood safety.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚰</div>
              <h3>Water Supply</h3>
              <p>Alert utility boards to burst pipelines, contaminated supply, low pressure, or dry taps.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌊</div>
              <h3>Drainage & Sewage</h3>
              <p>Submit reports on storm drain clogging, overflow during monsoons, and open manholes.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Public Electrical</h3>
              <p>Flag sparking transformers, exposed cables, and fallen electrical poles requiring urgent repair.</p>
            </div>
          </div>
        </section>

        {/* Demonstration Quick Navigator */}
        <section className="demo-navigator-card">
          <div className="demo-nav-header">
            <h3>🎓 Project Demonstration Quick Navigator</h3>
            <p>Access all system routes directly for examination and presentation:</p>
          </div>

          <div className="quick-links">
            <Link to="/log" className="quick-link">
              <span>🔐</span> Login Page (/log)
            </Link>
            <Link to="/reg" className="quick-link">
              <span>📝</span> Register Page (/reg)
            </Link>
            <Link to="/dboard" className="quick-link">
              <span>📋</span> Citizen Dashboard (/dboard)
            </Link>
            <Link to="/report" className="quick-link">
              <span>⚠️</span> Report Issue (/report)
            </Link>
            <Link to="/admin" className="quick-link">
              <span>📊</span> Admin Dashboard (/admin)
            </Link>
            <Link to="/admin/issues" className="quick-link">
              <span>⚙️</span> Manage Issues (/admin/issues)
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;