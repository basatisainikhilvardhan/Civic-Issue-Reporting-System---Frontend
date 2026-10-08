import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="civic-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="brand-icon">🏛️</span>
              <span className="brand-text">CivicResolve</span>
            </div>
            <p className="footer-tagline">
              Online Public Grievance Redressal & Infrastructure Tracking System.
              Connecting citizens with municipal authorities for a cleaner, safer city.
            </p>
          </div>

          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/report">Report Civic Issue</Link></li>
              <li><Link to="/dboard">Citizen Dashboard</Link></li>
              <li><Link to="/admin">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Public Services</h4>
            <ul>
              <li><span>Roads & Pavements</span></li>
              <li><span>Waste Management</span></li>
              <li><span>Street Lighting</span></li>
              <li><span>Drainage & Water Supply</span></li>
            </ul>
          </div>

          <div className="footer-info-col">
            <h4>Demonstration Info</h4>
            <div className="demo-badge">College Project Demo</div>
            <p className="demo-meta">
              Built with Spring Boot 3, React 19, JWT, Spring Data JPA, and MySQL.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CivicResolve System. All rights reserved.</p>
          <div className="footer-status-pill">
            <span className="status-live-dot"></span>
            <span>REST API Online: localhost:8080</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
