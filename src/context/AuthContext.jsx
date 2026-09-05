// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ไม่มี token เก็บไว้เลย = ไม่ได้ล็อกอินแน่ๆ ไม่ต้องยิง request ไปเช็คให้เสียเวลา
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api.get('/auth/me.php')
      .then((data) => {
        if (data.logged_in) {
          setUser(data);
        } else {
          clearToken(); // token หมดอายุ/ไม่ถูกต้องแล้ว เคลียร์ทิ้งไปเลย
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await api.post('/auth/login.php', { username, password });
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout.php', {});
    } finally {
      clearToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
