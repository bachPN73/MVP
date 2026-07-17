import { createBrowserRouter, Outlet } from "react-router";
import ScrollToTop from "./components/ScrollToTop";
import AuthGuard from "./components/AuthGuard";
import ErrorPage from "./pages/ErrorPage";
import PageTitle from "./components/PageTitle";

export const router = createBrowserRouter([
    {
        element: (
            <>
                <ScrollToTop />
                <PageTitle />
                <Outlet />
            </>
        ),
        errorElement: <ErrorPage />,
        children: [
            // ================= PUBLIC ROUTES =================
            {
                path: "/",
                lazy: async () => {
                    const { default: Component } = await import("./pages/LandingPage");
                    return { Component };
                },
            },
            {
                path: "/login",
                lazy: async () => {
                    const { default: Component } = await import("./pages/LoginPage");
                    return { Component };
                },
            },
            {
                path: "/register",
                lazy: async () => {
                    const { default: Component } = await import("./pages/RegisterPage");
                    return { Component };
                },
            },
            {
                path: "/forgot-password",
                lazy: async () => {
                    const { default: Component } = await import("./pages/ForgotPasswordPage");
                    return { Component };
                },
            },
            {
                path: "/reset-password",
                lazy: async () => {
                    const { default: Component } = await import("./pages/ResetPasswordPage");
                    return { Component };
                },
            },
            {
                path: "/guide",
                lazy: async () => {
                    const { default: Component } = await import("./pages/GuidePublicPage");
                    return { Component };
                },
            },
            {
                path: "/intro-deck",
                lazy: async () => {
                    const { default: Component } = await import("./pages/PresentationIntroPage");
                    return { Component };
                },
            },
            {
                path: "/pricing",
                lazy: async () => {
                    const { default: Component } = await import("./pages/PricingPublicPage");
                    return { Component };
                },
            },

            // ================= PROTECTED ROUTES (AUTH) =================
            {
                element: (
                    <AuthGuard>
                        <Outlet />
                    </AuthGuard>
                ),
                children: [
                    {
                        path: "/dashboard",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/Dashboard");
                            return { Component };
                        },
                    },
                    {
                        path: "/library",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/LibraryPage");
                            return { Component };
                        },
                    },
                    {
                        path: "/find-ai",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/FindWithAI");
                            return { Component };
                        },
                    },
                    {
                        path: "/material/:id",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/MaterialDetail");
                            return { Component };
                        },
                    },
                    {
                        path: "/presentation/:id",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/PresentationModePage");
                            return { Component };
                        },
                    },
                    {
                        path: "/guide-app",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/GuidePage");
                            return { Component };
                        },
                    },
                    {
                        path: "/profile",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/ProfilePage");
                            return { Component };
                        },
                    },
                    {
                        path: "/pricing-app",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/PricingPage");
                            return { Component };
                        },
                    },
                    {
                        path: "/payment/:planId",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/PaymentPage");
                            return { Component };
                        },
                    },
                    
                    // Admin Pages
                    {
                        path: "/admin/dashboard",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/admin/AdminDashboard");
                            return { Component };
                        },
                    },
                    {
                        path: "/admin/materials",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/admin/AdminMaterialsPage");
                            return { Component };
                        },
                    },
                    {
                        path: "/admin/lessons",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/admin/AdminLessonsPage");
                            return { Component };
                        },
                    },
                    {
                        path: "/admin/users",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/admin/AdminUsersPage");
                            return { Component };
                        },
                    },
                    {
                        path: "/admin/schools",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/admin/AdminSchoolsPage");
                            return { Component };
                        },
                    },
                    {
                        path: "/admin/payments",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/admin/AdminPaymentsPage");
                            return { Component };
                        },
                    },
                    {
                        path: "/admin/ai-config",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/admin/AdminAIConfigPage");
                            return { Component };
                        },
                    },
                    
                    // School Pages
                    {
                        path: "/school/dashboard",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/school/SchoolDashboard");
                            return { Component };
                        },
                    },
                    {
                        path: "/join-school",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/JoinSchoolPage");
                            return { Component };
                        },
                    },
                    
                    // Pro Vault
                    {
                        path: "/vault",
                        lazy: async () => {
                            const { default: Component } = await import("./pages/VaultPage");
                            return { Component };
                        },
                    },
                ],
            },
            
            // ================= 404 NOT FOUND =================
            {
                path: "*",
                lazy: async () => {
                    const { default: Component } = await import("./pages/NotFound");
                    return { Component };
                },
            },
        ],
    },
]);
