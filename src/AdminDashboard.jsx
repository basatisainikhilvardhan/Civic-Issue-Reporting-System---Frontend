import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import authService from "./api/authService";
import issueService from "./api/issueService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const loadDashboardStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await issueService.getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin dashboard stats:", err);
      if (err.response && err.response.status === 403) {
        setError("HTTP 403 Forbidden: Administrative role required to access this endpoint.");
      } else if (err.response && err.response.status === 401) {
        authService.logout();
        navigate("/log");
      } else {
        setError("Error communicating with Spring Boot dashboard API on localhost:8080.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate("/log");
      return;
    }
    setUser(currentUser);

    if (currentUser.role !== "ADMIN") {
      setError("Authorization Error: Only accounts with the ADMIN role can access this portal.");
      setLoading(false);
      return;
    }

    loadDashboardStats();
  }, [loadDashboardStats, navigate]);

  const total = stats?.totalIssues ?? stats?.total ?? 0;
  const newCount = stats?.newIssues ?? stats?.NEW ?? 0;
  const assignedCount = stats?.assignedIssues ?? stats?.ASSIGNED ?? 0;
  const inProgressCount = stats?.inProgressIssues ?? stats?.IN_PROGRESS ?? 0;
  const resolvedCount = stats?.resolvedIssues ?? stats?.RESOLVED ?? 0;
  const rejectedCount = stats?.rejectedIssues ?? stats?.REJECTED ?? 0;

  const getPercent = (count) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dashboard-header-card">
          <div className="header-titles">
            <span className="admin-console-tag">🛡️ Administrative Executive Console</span>
            <h1 className="dashboard-title">System Metrics & Overview</h1>
            <p className="dashboard-subtitle">
              Real database counts aggregated directly from MySQL through Spring Data JPA repository queries.
            </p>
          </div>
          <div className="header-action-group">
            <button
              onClick={loadDashboardStats}
              className="btn btn-secondary"
              title="Re-query MySQL database"
            >
              🔄 Refresh Metrics
            </button>
            <Link to="/admin/issues" className="btn btn-primary btn-lg">
              ⚙️ Manage All Issues →
            </Link>
          </div>
        </div>

        {error ? (
          <div className="card error-card" style={{ marginTop: "1.5rem" }}>
            <span className="error-icon">🛑</span>
            <h2>Access Restricted</h2>
            <p className="error-description">{error}</p>
            {user?.role !== "ADMIN" && (
              <div style={{ marginTop: "1.25rem" }}>
                <Link to="/dboard" className="btn btn-primary">
                  Go to Citizen Dashboard
                </Link>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="loading-state" style={{ minHeight: "350px" }}>
            <div className="spinner"></div>
            <p>Querying real-time database counts from MySQL...</p>
          </div>
        ) : (
          <>
            {/* Primary KPI Metric Cards Grid */}
            <div className="admin-stats-grid">
              <div className="kpi-card kpi-total">
                <div className="kpi-icon">📊</div>
                <div className="kpi-content">
                  <span className="kpi-label">Total System Issues</span>
                  <span className="kpi-number">{total}</span>
                  <span className="kpi-meta">100% of reported civic records</span>
                </div>
              </div>

              <div className="kpi-card kpi-new">
                <div className="kpi-icon">●</div>
                <div className="kpi-content">
                  <span className="kpi-label">NEW Issues</span>
                  <span className="kpi-number">{newCount}</span>
                  <span className="kpi-meta">{getPercent(newCount)}% • Awaiting triage</span>
                </div>
              </div>

              <div className="kpi-card kpi-assigned">
                <div className="kpi-icon">📋</div>
                <div className="kpi-content">
                  <span className="kpi-label">ASSIGNED Issues</span>
                  <span className="kpi-number">{assignedCount}</span>
                  <span className="kpi-meta">{getPercent(assignedCount)}% • Assigned to dept</span>
                </div>
              </div>

              <div className="kpi-card kpi-progress">
                <div className="kpi-icon">⚡</div>
                <div className="kpi-content">
                  <span className="kpi-label">IN_PROGRESS</span>
                  <span className="kpi-number">{inProgressCount}</span>
                  <span className="kpi-meta">{getPercent(inProgressCount)}% • Under repair</span>
                </div>
              </div>

              <div className="kpi-card kpi-resolved">
                <div className="kpi-icon">✓</div>
                <div className="kpi-content">
                  <span className="kpi-label">RESOLVED</span>
                  <span className="kpi-number">{resolvedCount}</span>
                  <span className="kpi-meta">{getPercent(resolvedCount)}% • Successfully fixed</span>
                </div>
              </div>

              <div className="kpi-card kpi-rejected">
                <div className="kpi-icon">✕</div>
                <div className="kpi-content">
                  <span className="kpi-label">REJECTED</span>
                  <span className="kpi-number">{rejectedCount}</span>
                  <span className="kpi-meta">{getPercent(rejectedCount)}% • Invalid/duplicate</span>
                </div>
              </div>
            </div>

            {/* Distribution Visualizer Card */}
            <div className="card distribution-card">
              <div className="distribution-header">
                <div>
                  <h3 className="section-title">Status Distribution Breakdown</h3>
                  <p className="distribution-subtitle">
                    Visual proportion of municipal issues across their lifecycle stages
                  </p>
                </div>
                <Link to="/admin/issues" className="btn-link">
                  View full list →
                </Link>
              </div>

              {total === 0 ? (
                <div className="empty-state" style={{ padding: "1.5rem" }}>
                  <p>No issues have been reported yet. Baseline total is 0.</p>
                </div>
              ) : (
                <>
                  <div className="progress-bar-container">
                    <div
                      className="bar-segment bar-new"
                      style={{ width: `${getPercent(newCount)}%` }}
                      title={`NEW: ${newCount} (${getPercent(newCount)}%)`}
                    ></div>
                    <div
                      className="bar-segment bar-assigned"
                      style={{ width: `${getPercent(assignedCount)}%` }}
                      title={`ASSIGNED: ${assignedCount} (${getPercent(assignedCount)}%)`}
                    ></div>
                    <div
                      className="bar-segment bar-progress"
                      style={{ width: `${getPercent(inProgressCount)}%` }}
                      title={`IN_PROGRESS: ${inProgressCount} (${getPercent(inProgressCount)}%)`}
                    ></div>
                    <div
                      className="bar-segment bar-resolved"
                      style={{ width: `${getPercent(resolvedCount)}%` }}
                      title={`RESOLVED: ${resolvedCount} (${getPercent(resolvedCount)}%)`}
                    ></div>
                    <div
                      className="bar-segment bar-rejected"
                      style={{ width: `${getPercent(rejectedCount)}%` }}
                      title={`REJECTED: ${rejectedCount} (${getPercent(rejectedCount)}%)`}
                    ></div>
                  </div>

                  <div className="legend-grid">
                    <div className="legend-item">
                      <span className="legend-color legend-new"></span>
                      <span>NEW: <strong>{newCount}</strong> ({getPercent(newCount)}%)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color legend-assigned"></span>
                      <span>ASSIGNED: <strong>{assignedCount}</strong> ({getPercent(assignedCount)}%)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color legend-progress"></span>
                      <span>IN_PROGRESS: <strong>{inProgressCount}</strong> ({getPercent(inProgressCount)}%)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color legend-resolved"></span>
                      <span>RESOLVED: <strong>{resolvedCount}</strong> ({getPercent(resolvedCount)}%)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color legend-rejected"></span>
                      <span>REJECTED: <strong>{rejectedCount}</strong> ({getPercent(rejectedCount)}%)</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Action Navigation Banner */}
            <div className="admin-actions-banner">
              <div>
                <h3>Admin Issue Management Board</h3>
                <p>Filter by status, search by keyword, assign departments, and update remediation remarks.</p>
              </div>
              <Link to="/admin/issues" className="btn btn-primary btn-lg">
                Open Issue Management Board →
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default AdminDashboard;
