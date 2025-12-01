import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const PrivateRoute = ({ element }) => {
    const { user } = useUser();

    return user ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
