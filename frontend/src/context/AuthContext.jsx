import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // null means the user is logged out. 
  // If it contains data, the user is logged in.
  const [user, setUser] = useState(null); 

  // Function to log the user in
  const login = (userData) => {
    setUser(userData);
  };

  // Function to log the user out
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to easily grab auth data anywhere
export const useAuth = () => useContext(AuthContext);