import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import ScrollToTop from "./components/ScrollToTop";
import AuthGuard from "./components/AuthGuard";

// Tối ưu Code Splitting: Lazy load tất cả các trang để giảm dung lượng file bundle ban đầu
const Landing = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/LoginPage"));
const Register = lazy(() => import("./pages/RegisterPage"));
const GuidePublic = lazy(() => import("./pages/GuidePublicPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Library = lazy(() => import("./pages/LibraryPage"));
const FindWithAI = lazy(() => import("./pages/FindWithAI"));
const MaterialDetail = lazy(() => import("./pages/MaterialDetail"));
const PresentationMode = lazy(() => import("./pages/PresentationModePage"));
const Guide = lazy(() => import("./pages/GuidePage"));
const Profile = lazy(() => import("./pages/ProfilePage"));
const Pricing = lazy(() => import("./pages/PricingPage"));
const PricingPublic = lazy(() => import("./pages/PricingPublicPage"));
const Payment = lazy(() => import("./pages/PaymentPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPassword = lazy(() => import("./pages/ResetPasswordPage"));
const PresentationIntroPage = lazy(() => import("./pages/PresentationIntroPage"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMaterialsPage = lazy(() => import("./pages/admin/AdminMaterialsPage"));
const AdminLessonsPage = lazy(() => import("./pages/admin/AdminLessonsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminSchoolsPage = lazy(() => import("./pages/admin/AdminSchoolsPage"));
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"));
const AdminAIConfigPage = lazy(() => import("./pages/admin/AdminAIConfigPage"));

// School Pages
const SchoolDashboard = lazy(() => import("./pages/school/SchoolDashboard"));
const JoinSchoolPage = lazy(() => import("./pages/JoinSchoolPage"));

// Pro Vault Page
const VaultPage = lazy(() => import("./pages/VaultPage"));

const NotFound = lazy(() => import("./pages/NotFound"));

// Loading spinner component that adapts background color to prevent bright flashing (nháy nháy) between routes
function PageLoader() {
    // Detect if we are loading an internal app page (which is dark-themed) or public page (light-themed)
    const isApp = typeof window !== 'undefined' && (
        window.location.pathname.includes('/dashboard') ||
        window.location.pathname.includes('/library') ||
        window.location.pathname.includes('/find-ai') ||
        window.location.pathname.includes('/pricing-app') ||
        window.location.pathname.includes('/guide-app') ||
        window.location.pathname.includes('/profile') ||
        window.location.pathname.includes('/material/') ||
        window.location.pathname.includes('/payment/') ||
        window.location.pathname.includes('/admin') ||
        window.location.pathname.includes('/school') ||
        window.location.pathname.includes('/vault') ||
        window.location.pathname.includes('/join-school')
    );

    if (isApp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050b1a] text-white transition-all duration-300">
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                    <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
                    <p className="text-indigo-400 text-xs font-black tracking-widest uppercase animate-pulse font-mono">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900 transition-all duration-300">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-xs font-black tracking-widest uppercase animate-pulse font-mono">Đang tải...</p>
            </div>
        </div>
    );
}

// Helper to wrap lazy components with Suspense and ScrollToTop
function withSuspense(Component: React.LazyExoticComponent<any>) {
    return () => (
        <Suspense fallback={<PageLoader />}>
            <ScrollToTop />
            <Component />
        </Suspense>
    );
}

// Helper with AuthGuard for protected pages
function withAuth(Component: React.LazyExoticComponent<any>) {
    return () => (
        <Suspense fallback={<PageLoader />}>
            <ScrollToTop />
            <AuthGuard>
                <Component />
            </AuthGuard>
        </Suspense>
    );
}

export const router = createBrowserRouter([
    {
        path: "/",
        Component: withSuspense(Landing),
    },
    {
        path: "/login",
        Component: withSuspense(Login),
    },
    {
        path: "/register",
        Component: withSuspense(Register),
    },
    {
        path: "/forgot-password",
        Component: withSuspense(ForgotPassword),
    },
    {
        path: "/reset-password",
        Component: withSuspense(ResetPassword),
    },
    {
        path: "/guide",
        Component: withSuspense(GuidePublic),
    },
    {
        path: "/dashboard",
        Component: withAuth(Dashboard),
    },
    {
        path: "/library",
        Component: withAuth(Library),
    },
    {
        path: "/find-ai",
        Component: withAuth(FindWithAI),
    },
    {
        path: "/material/:id",
        Component: withAuth(MaterialDetail),
    },
    {
        path: "/presentation/:id",
        Component: withAuth(PresentationMode),
    },
    {
        path: "/intro-deck",
        Component: withSuspense(PresentationIntroPage),
    },
    {
        path: "/guide-app",
        Component: withAuth(Guide),
    },
    {
        path: "/profile",
        Component: withAuth(Profile),
    },
    {
        path: "/pricing",
        Component: withSuspense(PricingPublic),
    },
    {
        path: "/pricing-app",
        Component: withAuth(Pricing),
    },
    {
        path: "/payment/:planId",
        Component: withAuth(Payment),
    },
    {
        path: "/admin/dashboard",
        Component: withAuth(AdminDashboard),
    },
    {
        path: "/admin/materials",
        Component: withAuth(AdminMaterialsPage),
    },
    {
        path: "/admin/lessons",
        Component: withAuth(AdminLessonsPage),
    },
    {
        path: "/admin/users",
        Component: withAuth(AdminUsersPage),
    },
    {
        path: "/admin/schools",
        Component: withAuth(AdminSchoolsPage),
    },
    {
        path: "/admin/payments",
        Component: withAuth(AdminPaymentsPage),
    },
    {
        path: "/admin/ai-config",
        Component: withAuth(AdminAIConfigPage),
    },
    {
        path: "/school/dashboard",
        Component: withAuth(SchoolDashboard),
    },
    {
        path: "/join-school",
        Component: withAuth(JoinSchoolPage),
    },
    {
        path: "/vault",
        Component: withAuth(VaultPage),
    },
    {
        path: "*",
        Component: withSuspense(NotFound),
    },
]);
