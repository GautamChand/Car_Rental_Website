import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

/**
 * Check if a JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Add 60 second buffer
    return payload.exp * 1000 < Date.now() + 60000;
  } catch {
    return true;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("driveelite_token");
    const storedUser = localStorage.getItem("driveelite_user");

    if (storedToken && storedUser) {
      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem("driveelite_token");
        localStorage.removeItem("driveelite_user");
      } else {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("driveelite_token");
          localStorage.removeItem("driveelite_user");
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem("driveelite_token", authToken);
      localStorage.setItem("driveelite_user", JSON.stringify(userData));

      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        phone: phone || "",
      });
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem("driveelite_token", authToken);
      localStorage.setItem("driveelite_user", JSON.stringify(userData));

      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("driveelite_token");
    localStorage.removeItem("driveelite_user");
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem("driveelite_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
