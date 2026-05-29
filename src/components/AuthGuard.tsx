import { Navigate, useLocation } from "react-router";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const userStr = localStorage.getItem("edu_tech_user");
    const location = useLocation();

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        const path = location.pathname;

        // 1. Guard for Global System Admin Routes (/admin/*)
        if (path.startsWith('/admin')) {
            const isSystemAdmin = user.role === 'admin' && user.plan !== 'school';
            if (!isSystemAdmin) {
                console.warn('[SECURITY] Unauthorized access attempt to System Admin page:', user.email);
                return <Navigate to="/dashboard" replace />;
            }
        }

        // 2. Guard for School Admin Routes (/school/*)
        if (path.startsWith('/school')) {
            const isSchoolAdmin = user.role === 'admin' && user.plan === 'school';
            if (!isSchoolAdmin) {
                console.warn('[SECURITY] Unauthorized access attempt to School Admin page:', user.email);
                return <Navigate to="/dashboard" replace />;
            }
        }
    } catch (e) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
