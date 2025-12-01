// src/contexts/UserContext.jsx
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initially, no user logged in

  const login = (userData) => setUser(userData); // Set user data when they log in
  const logout = () => setUser(null); // Clear user data when they log out

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
