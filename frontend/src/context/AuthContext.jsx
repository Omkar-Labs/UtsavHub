import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on application mount via cookie verification
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authApi.getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // User is not authenticated or token expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password, role) => {
    const data = await authApi.login({ email, password, role });
    if (data.success && data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || "Login failed");
  };

  // Register handler
  const register = async (userData) => {
    const data = await authApi.register(userData);
    if (data.success && data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || "Registration failed");
  };

  // Send OTP handler
  const sendOtp = async (email) => {
    const data = await authApi.sendOtp(email);
    return data;
  };

  // Logout handler
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("Logout error:", error.message);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    sendOtp,
    logout,
    checkAuth,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
