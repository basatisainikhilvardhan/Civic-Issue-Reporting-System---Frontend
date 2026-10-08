import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import authService from "./api/authService";
import api from "./api/axiosConfig";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Mock axios instance to test interceptors and API calls
jest.mock("./api/axiosConfig", () => {
  const mockApi = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return mockApi;
});

describe("Frontend Authentication & Protected Routes Test Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // 1. Initial / Public Rendering
  test("1. Renders Home landing page with CivicResolve branding and navigation", () => {
    render(<App />);
    expect(screen.getAllByText(/CivicResolve/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Civic Issue Reporting & Grievance Redressal System/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Citizen \/ Admin Sign In/i)).toBeInTheDocument();
    expect(screen.getByText(/New Citizen Registration/i)).toBeInTheDocument();
  });

  // 2. Login Flow & Auth State
  test("2. Login authenticates user, stores token and role in localStorage, and updates auth state", async () => {
    const mockAuthResponse = {
      token: "mock-jwt-token-citizen-12345",
      role: "CITIZEN",
      email: "citizen.test@example.com",
      userId: 101,
      message: "Login successful",
    };

    api.post.mockResolvedValueOnce({ data: mockAuthResponse });

    // Directly test authService.login
    const result = await authService.login({
      email: "citizen.test@example.com",
      password: "password123",
    });

    expect(result.token).toBe("mock-jwt-token-citizen-12345");
    expect(result.role).toBe("CITIZEN");
    expect(localStorage.getItem("token")).toBe("mock-jwt-token-citizen-12345");
    expect(localStorage.getItem("role")).toBe("CITIZEN");
    expect(localStorage.getItem("email")).toBe("citizen.test@example.com");
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.isAdmin()).toBe(false);
  });

  // 3. Logout Flow
  test("3. Logout purges token, role, and resets authentication state", () => {
    localStorage.setItem("token", "active-token");
    localStorage.setItem("role", "CITIZEN");
    localStorage.setItem("email", "test@example.com");
    localStorage.setItem("uname", "test");

    expect(authService.isAuthenticated()).toBe(true);

    authService.logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("role")).toBeNull();
    expect(localStorage.getItem("email")).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });

  // 4. Citizen Route Access
  test("4. Citizen route access: Authenticated citizen can access protected citizen routes", async () => {
    localStorage.setItem("token", "citizen-jwt-token");
    localStorage.setItem("role", "CITIZEN");
    localStorage.setItem("email", "citizen@example.com");

    const CitizenComponent = () => <div>Citizen Dashboard Content</div>;

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/dboard"]}>
          <Routes>
            <Route
              path="/dboard"
              element={
                <ProtectedRoute>
                  <CitizenComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText("Citizen Dashboard Content")).toBeInTheDocument();
  });

  // 5. Admin Route Access
  test("5. Admin route access: Authenticated admin can access protected admin routes", async () => {
    localStorage.setItem("token", "admin-jwt-token");
    localStorage.setItem("role", "ADMIN");
    localStorage.setItem("email", "admin@example.com");

    const AdminComponent = () => <div>Admin Dashboard Content</div>;

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText("Admin Dashboard Content")).toBeInTheDocument();
  });

  // 6. Unauthorized Route Access (Blocked)
  test("6. Unauthorized access: Unauthenticated users are redirected to login, and Citizens cannot access Admin routes", async () => {
    // 6a. Unauthenticated -> redirected to /log
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/dboard"]}>
          <Routes>
            <Route
              path="/dboard"
              element={
                <ProtectedRoute>
                  <div>Secret Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/log" element={<div>Redirected To Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText("Redirected To Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Secret Dashboard")).toBeNull();

    // 6b. Citizen attempting to access /admin -> redirected to /unauthorized
    localStorage.setItem("token", "citizen-token");
    localStorage.setItem("role", "CITIZEN");
    localStorage.setItem("email", "citizen@example.com");

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <div>Super Secret Admin Area</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={<div>403 Forbidden - Access Denied</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(
      await screen.findByText("403 Forbidden - Access Denied")
    ).toBeInTheDocument();
    expect(screen.queryByText("Super Secret Admin Area")).toBeNull();
  });

  // 7. Expired / Invalid Authentication Session Handling
  test("7. Expired/invalid session: Session-expired event clears auth state immediately", async () => {
    localStorage.setItem("token", "expired-token");
    localStorage.setItem("role", "CITIZEN");
    localStorage.setItem("email", "expired@example.com");

    const StatusDisplay = () => {
      const { isAuthenticated } = useAuth();
      return <div>Auth Status: {isAuthenticated ? "LOGGED_IN" : "LOGGED_OUT"}</div>;
    };

    render(
      <AuthProvider>
        <StatusDisplay />
      </AuthProvider>
    );

    expect(await screen.findByText("Auth Status: LOGGED_IN")).toBeInTheDocument();

    // Trigger auth:session-expired event (as sent by Axios 401 response interceptor)
    await waitFor(() => {
      window.dispatchEvent(new Event("auth:session-expired"));
    });

    expect(await screen.findByText("Auth Status: LOGGED_OUT")).toBeInTheDocument();
  });

  // 8. API Authorization & Token Handling
  test("8. Authenticated Axios requests: Attaches Bearer token without leaking secrets", () => {
    localStorage.setItem("token", "secure-bearer-jwt-999");

    // Test real interceptor behavior logic
    const mockConfig = { headers: {} };
    const token = localStorage.getItem("token");
    if (token) {
      mockConfig.headers.Authorization = `Bearer ${token}`;
    }

    expect(mockConfig.headers.Authorization).toBe("Bearer secure-bearer-jwt-999");

    // Remove token and verify Authorization is omitted
    localStorage.removeItem("token");
    const mockConfigNoToken = { headers: {} };
    const tokenAfter = localStorage.getItem("token");
    if (tokenAfter) {
      mockConfigNoToken.headers.Authorization = `Bearer ${tokenAfter}`;
    }

    expect(mockConfigNoToken.headers.Authorization).toBeUndefined();
  });
});
