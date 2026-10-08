import api from "./axiosConfig";

export const issueService = {
  // Citizen: Create Issue (POST /api/issues)
  async createIssue(issueData) {
    const response = await api.post("/api/issues", issueData);
    return response.data;
  },

  // Citizen: Get My Issues (GET /api/issues/my)
  async getMyIssues() {
    const response = await api.get("/api/issues/my");
    return response.data;
  },

  // Citizen / Admin: Get Issue By Id (GET /api/issues/{id})
  async getIssueById(id) {
    const response = await api.get(`/api/issues/${id}`);
    return response.data;
  },

  // Citizen / Admin: Get Status History (GET /api/issues/{id}/history)
  async getStatusHistory(id) {
    const response = await api.get(`/api/issues/${id}/history`);
    return response.data;
  },

  // Admin: Get Dashboard Statistics (GET /api/admin/dashboard)
  async getAdminDashboard() {
    const response = await api.get("/api/admin/dashboard");
    return response.data;
  },

  // Admin: Get All Issues (GET /api/admin/issues)
  async getAllIssuesForAdmin() {
    const response = await api.get("/api/admin/issues");
    return response.data;
  },

  // Admin: Update Issue Status (PUT /api/admin/issues/{id}/status)
  async updateIssueStatus(id, { status, remarks }) {
    const response = await api.put(`/api/admin/issues/${id}/status`, {
      status,
      remarks: remarks || "",
    });
    return response.data;
  },

  // Citizen: Upload Photo (POST /api/issues/upload)
  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/issues/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default issueService;
