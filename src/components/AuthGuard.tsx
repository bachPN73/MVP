import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import { BASE_URL } from "../api";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const userStr = localStorage.getItem("edu_tech_user");
    const location = useLocation();

    useEffect(() => {
        if (!userStr) return;
        try {
            const user = JSON.parse(userStr);
            // Skip checks for admin accounts as per user request
            if (user.role === 'admin') return;

            const checkSession = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/api/check-session`, {
                        headers: {
                            'X-Session-Token': user.sessionToken || '',
                            'X-User-Id': user.id || ''
                        }
                    });
                    if (response.status === 401) {
                        const data = await response.json();
                        if (data.error === 'SESSION_INVALID') {
                            localStorage.removeItem('edu_tech_user');
                            window.location.href = '/login?session_expired=true';
                        }
                    }
                } catch (e) {
                    console.error('Failed to execute periodic session check:', e);
                }
            };

            // Initial check on mount or navigation
            checkSession();

            // Run check every 15 seconds
            const intervalId = setInterval(checkSession, 15000);
            return () => clearInterval(intervalId);
        } catch (e) {
            console.error('Error parsing user session in AuthGuard effect:', e);
        }
    }, [userStr, location.pathname]);

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        const path = location.pathname;

        // 1. Guard for Global System Admin Routes (/admin/*)
        if (path.startsWith('/admin')) {
            const isSystemAdmin = user.role === 'admin' && user.plan?.toLowerCase() !== 'school';
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
