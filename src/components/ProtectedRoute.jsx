import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to their respective dashboard
    return user.role === 'Admin' 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/teacher/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
