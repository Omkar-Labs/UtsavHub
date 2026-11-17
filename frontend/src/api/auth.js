import api from "./axios";

export const authApi = {
  // Send OTP to email
  sendOtp: async (email) => {
    const res = await api.post("/auth/send-otp", { email });
    return res.data;
  },

  // Register new user (Student or Admin) with OTP
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },

  // Login
  login: async ({ email, password, role }) => {
    const res = await api.post("/auth/login", { email, password, role });
    return res.data;
  },

  // Get current authenticated user profile
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  // Refresh access token
  refreshToken: async () => {
    const res = await api.post("/auth/refresh-token");
    return res.data;
  },

  // Logout and clear tokens
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },
};
