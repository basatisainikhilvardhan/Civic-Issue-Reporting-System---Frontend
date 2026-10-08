import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import authService from "./api/authService";
import issueService from "./api/issueService";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [filterTab, setFilterTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCitizenIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await issueService.getMyIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching citizen issues:", err);
      if (err.response && err.response.status === 401) {
        authService.logout();
        navigate("/log");
      } else {
        setError("Could not load your reported issues from the database.");
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
    fetchCitizenIssues();
  }, [fetchCitizenIssues, navigate]);

  // Dynamic Metrics
  const totalReports = issues.length;
  const newCount = issues.filter((i) => i.status === "NEW").length;
  const inProgressCount = issues.filter(
    (i) => i.status === "IN_PROGRESS" || i.status === "ASSIGNED"
  ).length;
  const resolvedCount = issues.filter((i) => i.status === "RESOLVED").length;

  // Filtered Issues for table
  const displayedIssues = issues.filter((issue) => {
    let matchesTab = true;
    if (filterTab === "OPEN") {
      matchesTab = issue.status === "NEW" || issue.status === "ASSIGNED" || issue.status === "IN_PROGRESS";
    } else if (filterTab === "RESOLVED") {
      matchesTab = issue.status === "RESOLVED";
    }

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        issue.title?.toLowerCase().includes(q) ||
        issue.location?.toLowerCase().includes(q) ||
        issue.category?.toLowerCase().includes(q) ||
        String(issue.id).includes(q);
    }

    return matchesTab && matchesSearch;
  });

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-header-card">
          <div className="header-titles">
            <span className="portal-tag">Citizen Portal</span>
            <h1 className="dashboard-title">
              Welcome, {user?.name || user?.email?.split("@")[0] || "Citizen"}!
            </h1>
            <p className="dashboard-subtitle">
              Monitor your reported municipal grievances and follow live status updates directly from city departments.
            </p>
          </div>
          <div className="header-action-group">
            <Link to="/report" className="btn btn-primary btn-lg">
              + Report New Civic Issue
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">{error}</div>
          </div>
        )}

        {/* Real Dynamic Statistics from MySQL */}
        <div className="stats-row">
          <div className="stat-card stat-total">
            <div className="stat-header">
              <span className="stat-label">Total Reports</span>
              <span className="stat-icon-pill">📊</span>
            </div>
            <span className="stat-number">{totalReports}</span>
            <span className="stat-desc">Lifetime submitted</span>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-header">
              <span className="stat-label">Pending Review</span>
              <span className="stat-icon-pill">⏳</span>
            </div>
            <span className="stat-number">{newCount}</span>
            <span className="stat-desc">Awaiting triage</span>
          </div>

          <div className="stat-card stat-progress">
            <div className="stat-header">
              <span className="stat-label">In Remediation</span>
              <span className="stat-icon-pill">⚡</span>
            </div>
            <span className="stat-number">{inProgressCount}</span>
            <span className="stat-desc">Crew assigned/on-site</span>
          </div>

          <div className="stat-card stat-resolved">
            <div className="stat-header">
              <span className="stat-label">Resolved</span>
              <span className="stat-icon-pill">✅</span>
            </div>
            <span className="stat-number">{resolvedCount}</span>
            <span className="stat-desc">Closed & verified</span>
          </div>
        </div>

        {/* My Reports Section with Tabs and Filter */}
        <div className="card my-reports-card">
          <div className="card-header-bar">
            <div className="table-header-titles">
              <h2>My Reported Grievances ({issues.length})</h2>
              <span className="text-muted">Real records fetched from database</span>
            </div>

            <div className="table-controls">
              <div className="tab-pill-group">
                <button
                  type="button"
                  onClick={() => setFilterTab("ALL")}
                  className={`tab-pill ${filterTab === "ALL" ? "active" : ""}`}
                >
                  All ({issues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("OPEN")}
                  className={`tab-pill ${filterTab === "OPEN" ? "active" : ""}`}
                >
                  Active ({newCount + inProgressCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("RESOLVED")}
                  className={`tab-pill ${filterTab === "RESOLVED" ? "active" : ""}`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>

              <button
                onClick={fetchCitizenIssues}
                className="btn-refresh"
                title="Refresh from MySQL"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Search bar inside my reports */}
          {issues.length > 0 && (
            <div className="table-search-row">
              <input
                type="text"
                placeholder="Search my reports by title, location, category, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-input"
              />
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching your grievances from MySQL database...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No Grievances Submitted Yet</h3>
              <p>
                You haven't reported any public infrastructure defects yet. Notice an overflowing bin, dark street light, or road hazard?
              </p>
              <Link to="/report" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
                + Report Your First Civic Issue
              </Link>
            </div>
          ) : displayedIssues.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h3>No Matching Reports</h3>
              <p>No grievances match your current search query or filter criteria.</p>
              <button
                onClick={() => {
                  setFilterTab("ALL");
                  setSearchQuery("");
                }}
                className="btn btn-secondary"
                style={{ marginTop: "1rem" }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="civic-table">
                <thead>
                  <tr>
                    <th style={{ width: "70px" }}>ID</th>
                    <th>Issue Title</th>
                    <th>Category</th>
                    <th>Location Landmark</th>
                    <th>Priority</th>
                    <th>Current Status</th>
                    <th>Submitted On</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="cell-id">#{issue.id}</td>
                      <td>
                        <Link to={`/issues/${issue.id}`} className="issue-title-link">
                          {issue.title}
                        </Link>
                      </td>
                      <td>
                        <span className="category-tag">{issue.category}</span>
                      </td>
                      <td className="cell-location">
                        <span className="location-pin">📍</span>
                        <span title={issue.location}>{issue.location}</span>
                      </td>
                      <td>
                        <PriorityBadge priority={issue.priority} />
                      </td>
                      <td>
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="cell-date">
                        {issue.createdAt
                          ? new Date(issue.createdAt).toLocaleDateString()
                          : "Recently"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link to={`/issues/${issue.id}`} className="btn-table-action">
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default UserDashboard;