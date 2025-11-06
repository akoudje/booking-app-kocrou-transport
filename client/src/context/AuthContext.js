import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// 🔗 URL de base de ton API backend
const API_URL = "http://localhost:5000/api/auth";

// 🧩 Création du contexte
export const AuthContext = createContext();

// ✅ Provider global d’authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Persiste les données d'auth dans localStorage
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  // ✅ Fonction d’inscription
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password });
      console.log("✅ Inscription réussie :", res.data);
      return true;
    } catch (err) {
      console.error("❌ Erreur d'inscription :", err);
      setError(err.response?.data?.message || "Erreur d'inscription");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction de connexion
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { user, token } = res.data;
      setUser(user);
      setToken(token);
      return true;
    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError(err.response?.data?.message || "Erreur de connexion");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Déconnexion
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ Vérifie automatiquement le token (optionnel)
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
