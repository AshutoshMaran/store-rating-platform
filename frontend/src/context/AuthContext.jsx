import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi, logoutApi, updatePasswordApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if session exists on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        let currentRole = null;
        if (typeof window !== 'undefined') {
          if (window.location.pathname.startsWith('/admin')) currentRole = 'ADMIN';
          else if (window.location.pathname.startsWith('/owner')) currentRole = 'STORE_OWNER';
          else if (window.location.pathname.startsWith('/user')) currentRole = 'USER';
        }

        const data = await getMeApi(currentRole);
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    if (data?.user) {
      setUser(data.user);
    }
    return data?.user;
  };

  const register = async (userData) => {
    const data = await registerApi(userData);
     if (data?.user) {
    setUser(data.user);
    console.log(user);
  }
    return data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updatePassword = async (newPassword) => {
    return await updatePasswordApi({ password: newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}