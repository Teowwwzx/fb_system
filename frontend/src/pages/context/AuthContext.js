// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // We need a library to decode the token

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check for a token in local storage when the app loads
        const token = localStorage.getItem('token');
        if (token) {
            const decodedUser = jwtDecode(token).user;
            setUser(decodedUser);
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('token', userData.token);
        setUser(userData.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};