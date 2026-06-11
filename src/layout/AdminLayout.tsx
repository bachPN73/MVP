import { ReactNode, useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { useLocation, useNavigate } from 'react-router';
import { Menu } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Tự động đóng sidebar khi chuyển trang trên mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        // Simple client-side protection for admin area
        const stored = localStorage.getItem('edu_tech_user');
        if (!stored) {
            navigate('/login');
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            if (parsed.role !== 'admin') {
                navigate('/dashboard'); // Kick regular users out of admin area
            }
        } catch {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b1329] text-slate-900 dark:text-slate-200 transition-colors duration-300 relative">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-md flex items-center justify-between px-4 z-40 border-b border-slate-200/60 dark:border-white/10 shadow-sm">
                <div className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-1 font-heading">
                    <span>Admin</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Panel</span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle variant="ghost" className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl" />
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-slate-600 dark:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <AdminSidebar
                currentPath={location.pathname}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Overlay nền đen khi mở sidebar trên mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-4 md:p-8 w-full overflow-x-hidden">
                <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
