import { ReactNode, useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { useLocation } from 'react-router';
import { Menu } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        const saved = localStorage.getItem('edu_tech_sidebar_collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Chỉ lưu trạng thái collapsed khi người dùng chủ động nhấn nút thu gọn/mở rộng
    const handleSetCollapsed = (val: boolean) => {
        setIsCollapsed(val);
        localStorage.setItem('edu_tech_sidebar_collapsed', JSON.stringify(val));
    };

    // Tự động đóng sidebar khi chuyển trang trên mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-background relative text-foreground transition-colors duration-300">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar flex items-center justify-between px-4 z-40 border-b border-sidebar-border shadow-md">
                <div className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Edu Tech</div>
                <div className="flex items-center gap-2">
                    <ThemeToggle variant="ghost" className="text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl" />
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                        aria-label="Mở menu điều hướng"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Sidebar (hoạt động như Drawer trên mobile) */}
            <AppSidebar
                currentPath={location.pathname}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={handleSetCollapsed}
            />

            {/* Overlay nền đen mờ khi mở Drawer trên mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area - wrapped in a premium aligned card container on desktop */}
            <main className={`flex-1 min-h-screen md:h-screen md:min-h-0 flex flex-col p-0 pt-14 md:p-3 md:pl-6 md:pt-3 w-full overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-20' : 'md:ml-[270px]'}`}>
                <div className="flex-1 w-full h-full bg-card md:rounded-2xl md:border border-sidebar-border shadow-xl overflow-y-auto flex flex-col relative custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
