// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthenticationService from '@/services/AuthenticationService';
import { permissions } from '@/roles/permissions';

const ProtectedRoute = ({ children, requiredRole }) => {
    const isLoggedIn = AuthenticationService.isLoggedIn();
    const userRoles = AuthenticationService.getUserRole();

    // Kiểm tra nếu user có roles phù hợp với requiredRole
    const hasPermission = userRoles.some((role) => permissions[role]?.includes(requiredRole));

    if (!isLoggedIn) return <Navigate to="/" />;
    if (!hasPermission) return <Navigate to="/404" />;

    return children;
};

export default ProtectedRoute;
