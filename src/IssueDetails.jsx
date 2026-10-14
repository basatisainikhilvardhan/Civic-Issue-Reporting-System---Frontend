import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import authService from "./api/authService";
import issueService from "./api/issueService";
import { getAssetUrl } from "./api/axiosConfig";

function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState({ success: "", error: "" });

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const issueData = await issueService.getIssueById(id);
      setIssue(issueData);
      setStatusToUpdate(issueData.status);

      // Fetch or extract history
      try {
        const histData = await issueService.getStatusHistory(id);
        setHistory(Array.isArray(histData) ? histData : []);
      } catch (hErr) {
        if (issueData.statusHistory) {
          setHistory(issueData.statusHistory);
        }
      }
    } catch (err) {
      console.error("Error fetching issue details:", err);
      if (err.response && err.response.status === 401) {
        authService.logout();
        navigate("/log");
      } else if (err.response && err.response.status === 403) {
        setError("Access Denied: You are not authorized to inspect this grievance record.");
      } else if (err.response && err.response.status === 404) {
        setError("Record Not Found: Issue #" + id + " does not exist in the database.");
      } else {
        setError("Could not retrieve issue details from the Spring Boot backend.");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/log");
      return;
    }
    setCurrentUser(user);
    fetchDetails();
  }, [fetchDetails, navigate]);

  const handleAdminStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateFeedback({ success: "", error: "" });

    if (!statusToUpdate) {
      setUpdateFeedback({ success: "", error: "Please select a target status." });
      return;
    }

    setUpdating(true);
    try {
      await issueService.updateIssueStatus(id, {
        status: statusToUpdate,
        remarks: remarks.trim() || `Status updated to ${statusToUpdate} via Admin Portal`,
      });

      setUpdateFeedback({
        success: `Status updated successfully to ${statusToUpdate}! History record logged in MySQL.`,
        error: "",
      });
      setRemarks("");
      // Re-fetch to update details and timeline
      await fetchDetails();
    } catch (err) {
      console.error("Failed to update status:", err);
      const backendErr =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update issue status.";
      setUpdateFeedback({ success: "", error: backendErr });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="details-page-container">
        {loading ? (
          <div className="loading-state" style={{ minHeight: "400px" }}>
            <div className="spinner"></div>
            <p>Querying grievance details and audit timeline from MySQL...</p>
          </div>
        ) : error ? (
          <div className="card error-card">
            <span className="error-icon">⚠️</span>
            <h2>Unable to Load Grievance</h2>
            <p className="error-description">{error}</p>
            <div className="error-actions" style={{ maxWidth: "260px", margin: "1rem auto 0 auto" }}>
              <button onClick={() => navigate(-1)} className="btn btn-secondary btn-block">
                ← Go Back
              </button>
              <Link to="/dboard" className="btn btn-primary btn-block">
                Citizen Dashboard
              </Link>
            </div>
          </div>
        ) : issue ? (
          <div className="details-layout-grid">
            {/* Main Details Column */}
            <div className="details-main-column">
              {/* Back navigation */}
              <div className="breadcrumb-nav">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="breadcrumb-back-btn"
                >
                  ← Back to Previous
                </button>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Grievance #{issue.id}</span>
              </div>

              {/* Header Card */}
              <div className="card details-header-card">
                <div className="details-meta-top">
                  <div className="issue-id-badge">
                    <span>CASE FILE #{issue.id}</span>
                  </div>
                  <div className="badges-group">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </div>

                <h1 className="issue-full-title">{issue.title}</h1>

                <div className="meta-info-grid">
                  <div className="meta-box">
                    <span className="meta-box-label">Category</span>
                    <span className="meta-box-value category-pill">
                      {issue.category}
                    </span>
                  </div>

                  <div className="meta-box">
                    <span className="meta-box-label">Location Landmark</span>
                    <span className="meta-box-value">📍 {issue.location}</span>
                  </div>

                  <div className="meta-box">
                    <span className="meta-box-label">Reported By</span>
                    <span className="meta-box-value">
                      👤 {issue.reportedByEmail || issue.reportedByName || "Citizen"}
                    </span>
                  </div>

                  <div className="meta-box">
                    <span className="meta-box-label">Submitted On</span>
                    <span className="meta-box-value">
                      📅 {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="card details-desc-card">
                <h3 className="section-title">Grievance Description</h3>
                <p className="description-text">{issue.description}</p>

                {issue.imageUrl && (
                  <div className="evidence-box">
                    <h4>Attached Visual Evidence</h4>
                    <img
                      src={getAssetUrl(issue.imageUrl)}
                      alt="Civic Issue Proof"
                      className="evidence-photo"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status History Timeline */}
              <div className="card history-card">
                <div className="history-header">
                  <h3 className="section-title">Audit Trail & Status History</h3>
                  <span className="history-count-pill">{history.length} Transitions</span>
                </div>

                {history.length === 0 ? (
                  <div className="empty-history">
                    <span className="empty-icon">⏳</span>
                    <p>No lifecycle status changes recorded yet. Initial status is <strong>{issue.status}</strong>.</p>
                  </div>
                ) : (
                  <div className="timeline-container">
                    {history.map((hist, index) => (
                      <div key={hist.id || index} className="timeline-entry">
                        <div className="timeline-node">
                          <span className="node-marker">{index + 1}</span>
                        </div>
                        <div className="timeline-bubble">
                          <div className="bubble-header">
                            <div className="bubble-status-shift">
                              {hist.oldStatus && (
                                <>
                                  <StatusBadge status={hist.oldStatus} />
                                  <span className="shift-arrow">➔</span>
                                </>
                              )}
                              <StatusBadge status={hist.newStatus} />
                            </div>
                            <span className="bubble-timestamp">
                              {hist.changedAt
                                ? new Date(hist.changedAt).toLocaleString()
                                : "Recently"}
                            </span>
                          </div>

                          {hist.remarks && (
                            <div className="bubble-remarks">
                              <strong>Audit Remarks:</strong> {hist.remarks}
                            </div>
                          )}

                          <div className="bubble-author">
                            <span>Recorded by: </span>
                            <strong>
                              {hist.changedByEmail || hist.changedByName || "Municipal Authority"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column */}
            <aside className="details-sidebar-column">
              {currentUser?.role === "ADMIN" ? (
                <div className="card admin-action-card">
                  <div className="admin-card-tag">🛡️ Administrative Action</div>
                  <h3>Update Issue Status</h3>
                  <p className="admin-instruction">
                    Execute a lifecycle transition. This updates the issue in MySQL and records an audit entry in the status history table.
                  </p>

                  {updateFeedback.success && (
                    <div className="alert alert-success" style={{ padding: "0.6rem 0.8rem", fontSize: "0.85rem" }}>
                      ✅ {updateFeedback.success}
                    </div>
                  )}

                  {updateFeedback.error && (
                    <div className="alert alert-error" style={{ padding: "0.6rem 0.8rem", fontSize: "0.85rem" }}>
                      ⚠️ {updateFeedback.error}
                    </div>
                  )}

                  <form onSubmit={handleAdminStatusUpdate} className="admin-status-form">
                    <div className="form-group">
                      <label htmlFor="target-status">Target Status *</label>
                      <select
                        id="target-status"
                        value={statusToUpdate}
                        onChange={(e) => setStatusToUpdate(e.target.value)}
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
                      <label htmlFor="audit-remarks">Audit Remarks</label>
                      <textarea
                        id="audit-remarks"
                        rows="3"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g. Field inspection completed. Work order issued to zonal sanitary department."
                        className="form-textarea"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="btn btn-primary btn-block btn-lg"
                    >
                      {updating ? (
                        <>
                          <span className="btn-spinner"></span>
                          <span>Updating MySQL...</span>
                        </>
                      ) : (
                        "Save Status Transition"
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="card citizen-info-sidebar">
                  <div className="sidebar-icon">📋</div>
                  <h3>Redressal Information</h3>
                  <p>
                    Your grievance has been safely logged in the central city registry.
                    Officers inspect new issues and dispatch field crews based on severity priority.
                  </p>
                  <div className="service-level-guarantee">
                    <span className="guarantee-icon">🛡️</span>
                    <span className="guarantee-text">
                      Track status history in real-time as inspection progresses.
                    </span>
                  </div>
                  <Link
                    to="/report"
                    className="btn btn-secondary btn-block"
                    style={{ marginTop: "1.25rem" }}
                  >
                    + Report Another Issue
                  </Link>
                </div>
              )}
            </aside>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default IssueDetails;
