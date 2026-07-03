import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function homeForRole(role) {
    if (role === 'EMPLOYEE') return '/my-profile';
    if (role === 'HR_MANAGER') return '/employees';
    return '/dashboard';
}

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to={homeForRole(user.role)} replace />;
    }

    return children;
}