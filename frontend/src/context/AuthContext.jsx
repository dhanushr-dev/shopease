import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider manages user authentication state globally.
 * Persists token and user data in localStorage.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('shopease_token');
      const savedUser = localStorage.getItem('shopease_user');
      if (savedToken && savedUser) {
        // Decode JWT token and check expiration date
        const parts = savedToken.split('.');
        let isExpired = false;
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
              isExpired = true;
            }
          } catch (e) {
            isExpired = true;
          }
        } else {
          isExpired = true;
        }

        if (isExpired) {
          console.warn('🔑 Token has expired or is invalid. Logging out.');
          localStorage.removeItem('shopease_token');
          localStorage.removeItem('shopease_user');
        } else {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          console.log('🔑 Auth restored from localStorage');
        }
      }
    } catch (err) {
      console.error('Failed to restore auth state:', err);
      localStorage.removeItem('shopease_token');
      localStorage.removeItem('shopease_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (authResponse) => {
    const { token: newToken, userId, name, email, role } = authResponse;
    const userData = { userId, name, email, role };
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('shopease_token', newToken);
    localStorage.setItem('shopease_user', JSON.stringify(userData));
    console.log('✅ User logged in:', email);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shopease_token');
    localStorage.removeItem('shopease_user');
    console.log('👋 User logged out');
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook for accessing auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
