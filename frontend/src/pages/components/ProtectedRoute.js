import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // --- This is the core logic ---
    // We'll check for a 'token' in the browser's local storage.
    // This is a common way to see if a user is logged in.
    const isAuthenticated = localStorage.getItem('token');

    // If the user is authenticated (the token exists), we render the
    // child routes using the <Outlet /> component.
    // If not, we redirect them to the /login page.
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;