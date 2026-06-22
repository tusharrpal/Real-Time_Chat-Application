import React, { createContext, useContext, useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('chat-token') || null);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setAuthUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAuthUser(data);
        } else {
          // Token is likely invalid or expired
          logout();
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const signup = async (username, email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      localStorage.setItem('chat-token', data.token);
      setToken(data.token);
      setAuthUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        profilePic: data.profilePic,
      });

      return data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('chat-token', data.token);
      setToken(data.token);
      setAuthUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        profilePic: data.profilePic,
      });

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('chat-token');
    setToken(null);
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ authUser, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
