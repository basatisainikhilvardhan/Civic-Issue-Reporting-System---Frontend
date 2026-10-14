import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import authService from "./api/authService";
import issueService from "./api/issueService";
import { getAssetUrl } from "./api/axiosConfig";

function AdminIssueManagement() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal status update state
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState({ success: "", error: "" });

  const fetchAllIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await issueService.getAllIssuesForAdmin();
      const list = Array.isArray(data) ? data : [];
      setIssues(list);
    } catch (err) {
      console.error("Failed to load issues for admin:", err);
      if (err.response && err.response.status === 403) {
        setError("HTTP 403 Forbidden: Administrative clearance required.");
      } else if (err.response && err.response.status === 401) {
        authService.logout();
        navigate("/log");
      } else {
        setError("Could not retrieve issue records from the database.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/log");
      return;
    }
    if (user.role !== "ADMIN") {
      setError("Access Restricted: This view is reserved for Administrators.");
      setLoading(false);
      return;
    }
    fetchAllIssues();
  }, [fetchAllIssues, navigate]);

  // Dynamic status count calculations for filter tabs
  const countAll = issues.length;
  const countNew = issues.filter((i) => i.status === "NEW").length;
  const countAssigned = issues.filter((i) => i.status === "ASSIGNED").length;
  const countInProgress = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const countResolved = issues.filter((i) => i.status === "RESOLVED").length;
  const countRejected = issues.filter((i) => i.status === "REJECTED").length;

  // Filter and search effect
  useEffect(() => {
    let result = [...issues];
    if (statusFilter !== "ALL") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q) ||
          i.reportedByEmail?.toLowerCase().includes(q) ||
          String(i.id).includes(q)
      );
    }
    setFilteredIssues(result);
  }, [issues, statusFilter, searchQuery]);

  const openStatusModal = (issue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setRemarks("");
    setFeedback({ success: "", error: "" });
  };

  const closeStatusModal = () => {
    setSelectedIssue(null);
    setRemarks("");
    setFeedback({ success: "", error: "" });
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssue || !newStatus) return;

    setUpdating(true);
    setFeedback({ success: "", error: "" });
    try {
      await issueService.updateIssueStatus(selectedIssue.id, {
        status: newStatus,
        remarks:
          remarks.trim() ||
          `Status transitioned to ${newStatus} via Admin Issue Management`,
      });
      setFeedback({
        success: `Issue #${selectedIssue.id} updated to ${newStatus}! Audit record stored.`,
        error: "",
      });
      await fetchAllIssues();
      setTimeout(() => {
        closeStatusModal();
      }, 1000);
    } catch (err) {
      console.error("Failed to update status:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update status.";
      setFeedback({ success: "", error: msg });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="dashboard-container">
        {/* Header Bar */}
        <div className="dashboard-header-card">
          <div className="header-titles">
            <span className="admin-console-tag">🛡️ Administrative Action Board</span>
            <h1 className="dashboard-title">Civic Grievance Management</h1>
            <p className="dashboard-subtitle">
              Inspect municipal issues across all wards, filter by lifecycle status, and execute audited status transitions.
            </p>
          </div>
          <div className="header-action-group">
            <Link to="/admin" className="btn btn-secondary">
              📊 System Dashboard
            </Link>
            <button
              onClick={fetchAllIssues}
              className="btn btn-primary"
              title="Refresh from MySQL"
            >
              🔄 Refresh List
            </button>
          </div>
        </div>

        {error ? (
          <div className="card error-card">
            <span className="error-icon">🛑</span>
            <h2>Access Restricted</h2>
            <p className="error-description">{error}</p>
            <div style={{ marginTop: "1rem" }}>
              <Link to="/dboard" className="btn btn-primary">
                Return to Citizen Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filter and Search Bar Card */}
            <div className="card admin-filter-card">
              <div className="search-bar-col">
                <label htmlFor="search-issues">Search Grievances:</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔍</span>
                  <input
                    id="search-issues"
                    type="text"
                    placeholder="Search by title, location landmark, category, ID, citizen email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="filter-tabs-col">
                <label>Filter by Status:</label>
                <div className="tab-pill-group">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className={`tab-pill ${statusFilter === "ALL" ? "active" : ""}`}
                  >
                    All ({countAll})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("NEW")}
                    className={`tab-pill ${statusFilter === "NEW" ? "active" : ""}`}
                  >
                    NEW ({countNew})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ASSIGNED")}
                    className={`tab-pill ${statusFilter === "ASSIGNED" ? "active" : ""}`}
                  >
                    ASSIGNED ({countAssigned})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("IN_PROGRESS")}
                    className={`tab-pill ${statusFilter === "IN_PROGRESS" ? "active" : ""}`}
                  >
                    IN_PROGRESS ({countInProgress})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("RESOLVED")}
                    className={`tab-pill ${statusFilter === "RESOLVED" ? "active" : ""}`}
                  >
                    RESOLVED ({countResolved})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("REJECTED")}
                    className={`tab-pill ${statusFilter === "REJECTED" ? "active" : ""}`}
                  >
                    REJECTED ({countRejected})
                  </button>
                </div>
              </div>
            </div>

            {/* Issues Table Card */}
            <div className="card my-reports-card">
              <div className="card-header-bar">
                <h2>
                  Grievances ({filteredIssues.length} of {issues.length})
                </h2>
                {statusFilter !== "ALL" && (
                  <span className="active-filter-badge">
                    Filtered by: {statusFilter}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading grievances from database...</p>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🔍</span>
                  <h3>No Grievances Found</h3>
                  <p>No civic records match the current filter or search criteria.</p>
                  {(statusFilter !== "ALL" || searchQuery) && (
                    <button
                      onClick={() => {
                        setStatusFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="btn btn-secondary"
                      style={{ marginTop: "1rem" }}
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="civic-table">
                    <thead>
                      <tr>
                        <th style={{ width: "70px" }}>ID</th>
                        <th>Subject & Category</th>
                        <th>Location</th>
                        <th>Reported By</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th style={{ textAlign: "right", minWidth: "170px" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map((issue) => (
                        <tr key={issue.id}>
                          <td className="cell-id">#{issue.id}</td>
                          <td>
                            <div className="issue-title-cell">
                              <Link
                                to={`/issues/${issue.id}`}
                                className="issue-title-link"
                              >
                                {issue.title}
                              </Link>
                              <span className="category-tag">{issue.category}</span>
                            </div>
                          </td>
                          <td className="cell-location">
                            <span className="location-pin">📍</span>
                            <span title={issue.location}>{issue.location}</span>
                          </td>
                          <td className="cell-reporter">
                            👤 {issue.reportedByEmail || issue.reportedByName || "Citizen"}
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
                              : "N/A"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => openStatusModal(issue)}
                              className="btn-action-update"
                            >
                              Update Status
                            </button>
                            <Link
                              to={`/issues/${issue.id}`}
                              className="btn-table-action"
                            >
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
          </>
        )}

        {/* Modal for Status Transition */}
        {selectedIssue && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Update Grievance #{selectedIssue.id}</h3>
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="btn-close-modal"
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-issue-preview">
                  <span className="preview-label">Subject:</span>
                  <p className="preview-title">{selectedIssue.title}</p>
                  {selectedIssue.imageUrl && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <span className="preview-label">Photo Evidence:</span>
                      <img
                        src={getAssetUrl(selectedIssue.imageUrl)}
                        alt="Evidence"
                        style={{ maxWidth: "100%", maxHeight: "160px", borderRadius: "6px", display: "block", marginTop: "4px", objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>

                {feedback.success && (
                  <div className="alert alert-success" style={{ padding: "0.6rem 0.8rem", fontSize: "0.85rem" }}>
                    ✅ {feedback.success}
                  </div>
                )}
                {feedback.error && (
                  <div className="alert alert-error" style={{ padding: "0.6rem 0.8rem", fontSize: "0.85rem" }}>
                    ⚠️ {feedback.error}
                  </div>
                )}

                <form onSubmit={handleStatusSubmit} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="modal-status">Target Lifecycle Status *</label>
                    <select
                      id="modal-status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="NEW">NEW</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-remarks">Audit Remarks / Remediation Note</label>
                    <textarea
                      id="modal-remarks"
                      rows="3"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Zonal officer dispatched team for on-site repair."
                      className="form-textarea"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={closeStatusModal}
                      className="btn btn-secondary"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn btn-primary"
                    >
                      {updating ? (
                        <>
                          <span className="btn-spinner"></span>
                          <span>Saving...</span>
                        </>
                      ) : (
                        "Save to MySQL"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default AdminIssueManagement;
