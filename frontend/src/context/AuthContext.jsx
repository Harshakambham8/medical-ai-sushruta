import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [doctor, setDoctor] = useState(() => {
    try {
      const savedDoctor = localStorage.getItem("doctor");
      return savedDoctor ? JSON.parse(savedDoctor) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  // Default to Alex Mercer (Patient) if not logged in
  useEffect(() => {
    if (!user) {
      const defaultUser = {
        id: 1,
        name: "Alex Mercer",
        email: "alex.mercer@sushruta-ai.local",
        role: "patient",
        contactInfo: "+1 (555) 382-9012"
      };
      setUser(defaultUser);
      localStorage.setItem("user", JSON.stringify(defaultUser));
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/api/auth/login", { email, password });
      const { token, user, doctor } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (doctor) {
        localStorage.setItem("doctor", JSON.stringify(doctor));
      } else {
        localStorage.removeItem("doctor");
      }

      setToken(token);
      setUser(user);
      setDoctor(doctor || null);
      return { success: true, user, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("doctor");
    setUser(null);
    setDoctor(null);
    setToken(null);
  };

  const quickSwitch = (account) => {
    const fakeToken = `sushruta_token_${account.id}_${Date.now()}`;
    const userObj = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      contactInfo: account.contact_info,
      doctorId: account.doctor_id
    };

    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(userObj));
    if (account.role === "doctor") {
      const docObj = {
        id: account.doctor_id || account.id,
        name: account.name,
        email: account.email,
      };
      localStorage.setItem("doctor", JSON.stringify(docObj));
      setDoctor(docObj);
    } else {
      localStorage.removeItem("doctor");
      setDoctor(null);
    }

    setToken(fakeToken);
    setUser(userObj);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        doctor,
        token,
        isAuthenticated: !!user,
        role: user?.role || "guest",
        loading,
        login,
        logout,
        quickSwitch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
