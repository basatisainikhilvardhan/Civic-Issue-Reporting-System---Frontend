import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import issueService from "./api/issueService";

const CATEGORIES = [
  { value: "ROAD", label: "Road Damage" },
  { value: "GARBAGE", label: "Garbage" },
  { value: "STREET_LIGHT", label: "Street Light" },
  { value: "WATER", label: "Water Supply" },
  { value: "DRAINAGE", label: "Drainage" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "PUBLIC_PROPERTY", label: "Public Property" },
  { value: "TRAFFIC", label: "Traffic" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low", badgeClass: "priority-pill-low" },
  { value: "MEDIUM", label: "Medium", badgeClass: "priority-pill-medium" },
  { value: "HIGH", label: "High", badgeClass: "priority-pill-high" },
  { value: "CRITICAL", label: "Critical", badgeClass: "priority-pill-critical" },
];

function ReportIssue() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "ROAD",
    description: "",
    location: "",
    priority: "MEDIUM",
  });

  // Photo State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Submission & UI State
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [zoomLevel, setZoomLevel] = useState(14);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errorMessage) setErrorMessage("");
  };

  // Validate File (MIME + Size <= 5MB)
  const validateAndSetFile = (file) => {
    setFileError("");
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setFileError("Unsupported file type. Please upload a JPG, JPEG, or PNG image.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setFileError("File size exceeds 5 MB. Please select a smaller photograph.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChoosePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Issue Title is required.";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters long.";
    }

    if (!formData.category) {
      errors.category = "Please select a category.";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required.";
    } else if (formData.description.trim().length < 5) {
      errors.description = "Description must be at least 5 characters.";
    }

    if (!formData.location.trim()) {
      errors.location = "Issue Location / Landmark is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      setErrorMessage("Please complete all required fields (*).");
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = null;

      // 1. Upload photo if selected
      if (selectedFile) {
        try {
          const uploadResult = await issueService.uploadPhoto(selectedFile);
          if (uploadResult && uploadResult.imageUrl) {
            uploadedImageUrl = uploadResult.imageUrl;
          }
        } catch (uploadErr) {
          console.error("Photo upload failed:", uploadErr);
          const uploadMsg =
            uploadErr.response?.data?.message ||
            "Failed to upload photo evidence to server. Please try again.";
          setErrorMessage(uploadMsg);
          setLoading(false);
          return;
        }
      }

      // 2. Submit issue with imageUrl to MySQL
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        location: formData.location.trim(),
        priority: formData.priority,
        imageUrl: uploadedImageUrl,
      };

      const result = await issueService.createIssue(payload);

      setSuccessMessage("Civic issue successfully registered! Redirecting to issue details...");

      setTimeout(() => {
        if (result && result.id) {
          navigate(`/issues/${result.id}`);
        } else {
          navigate("/dboard");
        }
      }, 1200);
    } catch (err) {
      console.error("Failed to create issue:", err);
      const backendError =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not register your grievance. Please check field inputs.";
      setErrorMessage(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/log");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Citizen User";

  return (
    <div className="civic-app-layout">
      {/* =========================================================================
          TOP NAVIGATION BAR (PHASE 3)
          ========================================================================= */}
      <header className="civic-top-header">
        <div className="header-brand-side">
          <Link to="/" className="header-brand-link">
            <span className="municipal-crest-icon" role="img" aria-label="Municipality">
              🏛️
            </span>
            <div className="header-brand-text">
              <span className="header-title">Civic Issue Reporting System</span>
              <span className="header-subtitle">Municipal Services Portal</span>
            </div>
          </Link>
        </div>

        <div className="header-user-side">
          <div
            className="user-profile-badge"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            title="Account Menu"
          >
            <div className="user-avatar-circle">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="user-display-name">{displayName}</span>
            <span className="dropdown-caret">▼</span>
          </div>

          {userMenuOpen && (
            <div className="user-dropdown-menu">
              <div className="dropdown-header">
                <strong>{displayName}</strong>
                <span className="dropdown-email">{user?.email}</span>
                <span className="role-tag-small">{user?.role || "CITIZEN"}</span>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/dboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                📊 Citizen Dashboard
              </Link>
              <Link to="/report" className="dropdown-item active" onClick={() => setUserMenuOpen(false)}>
                📢 Report Issue
              </Link>
              <div className="dropdown-divider"></div>
              <button type="button" className="dropdown-item item-logout" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          BODY WITH LEFT SIDEBAR + MAIN CONTENT (PHASE 4 & 5)
          ========================================================================= */}
      <div className="civic-body-wrapper">
        {/* LEFT VERTICAL SIDEBAR */}
        <aside className="civic-left-sidebar">
          <nav className="sidebar-nav-list">
            <Link to="/dboard" className="sidebar-link">
              <span className="sidebar-icon">📊</span>
              <span className="sidebar-label">Dashboard</span>
            </Link>

            <Link to="/report" className="sidebar-link active">
              <span className="sidebar-icon">📢</span>
              <span className="sidebar-label">Report Issue</span>
            </Link>

            <Link to="/dboard" className="sidebar-link">
              <span className="sidebar-icon">📋</span>
              <span className="sidebar-label">My Issues</span>
            </Link>

            <Link to="/dboard" className="sidebar-link">
              <span className="sidebar-icon">📍</span>
              <span className="sidebar-label">Track Issue</span>
            </Link>

            <Link to="/dboard" className="sidebar-link">
              <span className="sidebar-icon">👤</span>
              <span className="sidebar-label">Profile</span>
            </Link>

            <button type="button" onClick={handleLogout} className="sidebar-link sidebar-logout-btn">
              <span className="sidebar-icon">🚪</span>
              <span className="sidebar-label">Logout</span>
            </button>
          </nav>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="civic-main-content">
          <div className="report-issue-card">
            {/* Header: Megaphone Icon, Title & Subtitle */}
            <div className="report-card-header">
              <div className="report-icon-wrapper">
                <span className="megaphone-icon" role="img" aria-label="Announcement">
                  📢
                </span>
              </div>
              <h1 className="report-main-title">Report a Civic Issue</h1>
              <p className="report-main-subtitle">
                Help municipal teams verify and resolve local problems.
              </p>
            </div>

            {/* Global Alerts */}
            {errorMessage && (
              <div className="civic-alert alert-error" role="alert">
                <span className="alert-icon">⚠️</span>
                <span className="alert-msg">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="civic-alert alert-success" role="alert">
                <span className="alert-icon">✅</span>
                <span className="alert-msg">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="report-issue-form" noValidate>
              {/* Row 1: Issue Title & Category */}
              <div className="form-row-grid">
                {/* Field: Issue Title */}
                <div className="form-col">
                  <label htmlFor="issue-title" className="civic-label">
                    Issue Title <span className="required-star">*</span>
                  </label>
                  <input
                    id="issue-title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Large pothole near college road"
                    className={`civic-input ${fieldErrors.title ? "input-has-error" : ""}`}
                  />
                  {fieldErrors.title && (
                    <span className="field-error-text">{fieldErrors.title}</span>
                  )}
                </div>

                {/* Field: Category */}
                <div className="form-col">
                  <label htmlFor="issue-category" className="civic-label">
                    Category <span className="required-star">*</span>
                  </label>
                  <select
                    id="issue-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="civic-select"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Priority Selection */}
              <div className="form-group-block">
                <label className="civic-label">
                  Priority <span className="required-star">*</span>
                </label>
                <div className="priority-options-row">
                  {PRIORITIES.map((pri) => (
                    <label
                      key={pri.value}
                      className={`priority-radio-pill ${formData.priority === pri.value ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={pri.value}
                        checked={formData.priority === pri.value}
                        onChange={handleInputChange}
                        className="priority-hidden-radio"
                      />
                      <span className={`priority-badge-dot ${pri.badgeClass}`}></span>
                      <span className="priority-pill-text">{pri.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 3: Issue Location / Landmark */}
              <div className="form-group-block">
                <label htmlFor="issue-location" className="civic-label">
                  Issue Location / Landmark <span className="required-star">*</span>
                </label>
                <div className="input-with-pin">
                  <span className="pin-icon">📍</span>
                  <input
                    id="issue-location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter street, landmark or address"
                    className={`civic-input ${fieldErrors.location ? "input-has-error" : ""}`}
                  />
                </div>
                {fieldErrors.location && (
                  <span className="field-error-text">{fieldErrors.location}</span>
                )}

                {/* Map-style visual location section */}
                <div className="map-preview-card">
                  <div className="map-canvas-visual">
                    <div className="map-grid-layer">
                      <div className="map-road road-h"></div>
                      <div className="map-road road-v"></div>
                      <div className="map-park park-1"></div>
                      <div className="map-park park-2"></div>
                    </div>

                    {/* Location Center Marker */}
                    <div className="map-center-marker" title="Selected Location">
                      <div className="marker-pin">📍</div>
                      <div className="marker-pulse"></div>
                    </div>

                    {/* Zoom in / out controls */}
                    <div className="map-zoom-controls">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
                        className="map-zoom-btn"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
                        className="map-zoom-btn"
                        title="Zoom Out"
                      >
                        −
                      </button>
                    </div>
                  </div>

                  <div className="map-confirmation-footer">
                    <span className="map-footer-icon">🗺️</span>
                    <span className="map-footer-text">
                      {formData.location.trim()
                        ? `Location selected: ${formData.location.trim()}`
                        : "Confirm the exact issue location"}
                    </span>
                    <span className="map-zoom-indicator">Zoom {zoomLevel}x</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Description with character counter */}
              <div className="form-group-block">
                <div className="label-with-counter">
                  <label htmlFor="issue-description" className="civic-label">
                    Description <span className="required-star">*</span>
                  </label>
                  <span className="char-counter-text">
                    {formData.description.length} / 1000 characters
                  </span>
                </div>
                <textarea
                  id="issue-description"
                  name="description"
                  rows="4"
                  maxLength="1000"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the issue in detail..."
                  className={`civic-textarea ${fieldErrors.description ? "input-has-error" : ""}`}
                />
                {fieldErrors.description && (
                  <span className="field-error-text">{fieldErrors.description}</span>
                )}
              </div>

              {/* Row 5: Photo Upload Section (Phase 10) */}
              <div className="form-group-block">
                <div
                  className={`photo-upload-box ${isDragging ? "dragging" : ""} ${previewUrl ? "has-photo" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/jpg"
                    style={{ display: "none" }}
                  />

                  <div className="upload-box-columns">
                    {/* Left: Upload Instructions & Button */}
                    <div className="upload-left-pane">
                      <div className="cloud-icon-circle">
                        <span className="cloud-icon" role="img" aria-label="Upload Cloud">
                          ☁️
                        </span>
                      </div>
                      <h3 className="upload-heading">Upload Photo of the Issue</h3>
                      <p className="upload-subtext">
                        Add a clear photo taken at the location (JPG, PNG, up to 5 MB)
                      </p>

                      <div className="upload-actions-group">
                        <button
                          type="button"
                          onClick={handleChoosePhotoClick}
                          className="btn-choose-photo"
                        >
                          <span className="btn-icon">📁</span>
                          <span>{selectedFile ? "Replace Photo" : "Choose Photo"}</span>
                        </button>

                        {selectedFile && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="btn-remove-photo"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>

                      {fileError && <div className="file-error-alert">⚠️ {fileError}</div>}
                    </div>

                    {/* Right: Selected Image Live Preview */}
                    <div className="upload-right-pane">
                      {previewUrl ? (
                        <div className="image-preview-wrapper">
                          <img
                            src={previewUrl}
                            alt="Selected Issue Evidence"
                            className="image-preview-element"
                          />
                          <div className="preview-meta-bar">
                            <span className="preview-file-name">
                              {selectedFile?.name || "Selected Photo"}
                            </span>
                            <span className="preview-file-size">
                              {selectedFile?.size
                                ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                                : ""}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="preview-empty-state">
                          <span className="empty-photo-icon">📷</span>
                          <span className="empty-photo-text">No image selected</span>
                          <span className="empty-photo-hint">Drag & drop photo here</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button (Phase 12) */}
              <div className="form-submit-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit-issue"
                >
                  {loading ? (
                    <>
                      <span className="submit-spinner"></span>
                      <span>Submitting Issue to Municipal Database...</span>
                    </>
                  ) : (
                    <>
                      <span className="send-icon" role="img" aria-label="Send">
                        ✈️
                      </span>
                      <span>Submit Issue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ReportIssue;
