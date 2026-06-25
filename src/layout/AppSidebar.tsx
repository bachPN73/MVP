import { Link } from 'react-router';
import { Home, Library, Sparkles, BookOpen, LogOut, CreditCard, X, ChevronLeft, Sun, Moon, ShieldAlert, School, Zap, Archive, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { api } from '../api';
import ThemeToggle from '../components/ThemeToggle';

interface AppSidebarProps {
    currentPath?: string;
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
}

export function AppSidebar({ currentPath = '/', isOpen = false, setIsOpen, isCollapsed, setIsCollapsed }: AppSidebarProps) {
    const [userName, setUserName] = useState('Người dùng');
    const [userRole, setUserRole] = useState('student');
    const [userPlan, setUserPlan] = useState('free');
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        let currentUser: any = null;
        const stored = localStorage.getItem('edu_tech_user');
        if (stored) {
            try {
                currentUser = JSON.parse(stored);
                if (currentUser.name) setUserName(currentUser.name);
                if (currentUser.role) setUserRole(currentUser.role);
                if (currentUser.plan) setUserPlan(currentUser.plan.toLowerCase());
            } catch { /* ignore */ }
        }

        if (currentUser && currentUser.email) {
            api.getUsers()
                .then((usersList: any[]) => {
                    const latest = usersList.find(u => u.email === currentUser.email);
                    if (latest) {
                        const latestPlan = (latest.plan || 'free').toLowerCase();
                        const currentPlan = (currentUser.plan || 'free').toLowerCase();
                        
                        const hasChanges = 
                            latest.name !== currentUser.name ||
                            latestPlan !== currentPlan ||
                            latest.role !== currentUser.role ||
                            latest.schoolId !== currentUser.schoolId ||
                            latest.className !== currentUser.className;

                        if (hasChanges) {
                            const updatedUser = {
                                ...currentUser,
                                id: latest.id || latest._id || currentUser.id,
                                name: latest.name || 'Người dùng',
                                role: latest.role || 'student',
                                plan: latest.plan || 'free',
                                schoolId: latest.schoolId || null,
                                className: latest.className || ''
                            };
                            localStorage.setItem('edu_tech_user', JSON.stringify(updatedUser));
                            
                            setUserName(updatedUser.name);
                            setUserPlan(updatedUser.plan.toLowerCase());
                            setUserRole(updatedUser.role);
                        }
                    }
                })
                .catch(err => console.error("Error syncing profile state on sidebar:", err));
        }
    }, [currentPath]);

    const getRoleLabel = (role: string, plan: string) => {
        if (role === 'admin') return 'Quản trị viên';
        if (role === 'school-admin') return 'Quản trị Trường';
        if (role === 'teacher') return 'Giáo viên';
        return 'Học sinh';
    };

    const getRoleBadgeClass = (role: string, plan: string) => {
        if (role === 'admin') return 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
        if (role === 'school-admin') return 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
        if (role === 'teacher') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
    };

    const menuItems = [
        { path: '/dashboard', label: 'Tổng quan', icon: Home },
        { path: '/library', label: 'Thư viện', icon: Library },
        { path: '/find-ai', label: 'AI tìm kiếm', icon: Sparkles },
        { path: '/pricing-app', label: 'Gói dịch vụ', icon: CreditCard },
        ...(['pro', 'premium', 'school', 'demo'].includes(userPlan) ? [{ path: '/vault', label: 'Kho tạm thời', icon: Archive }] : []),
        ...(userRole === 'school-admin' ? [{ path: '/school/dashboard', label: 'Trường học', icon: School }] : []),
        // Show join-school link for everyone except school-admin (who has dashboard) and active school members
        ...(userRole !== 'school-admin' && !['school'].includes(userPlan)
            ? [{ path: '/join-school', label: 'Trường học', icon: GraduationCap }]
            : []),
        { path: '/guide-app', label: 'Hướng dẫn', icon: BookOpen },
    ];

    const handleLogout = () => {
        localStorage.removeItem('edu_tech_user');
        window.location.href = '/';
    };

    return (
        <aside 
            className={`fixed left-0 top-0 md:left-3 md:top-3 md:h-[calc(100vh-1.5rem)] h-full backdrop-blur-2xl flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out md:translate-x-0 md:rounded-2xl md:border
            bg-[#0B1B32] border-white/10 text-white
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            ${isCollapsed ? 'md:w-20 w-[16.875rem]' : 'w-[16.875rem]'}`}
        >
            {/* Inner container to hold and clip content to rounded borders safely */}
            <div className="w-full h-full flex flex-col overflow-hidden rounded-[inherit]">
                {/* ===== Logo Section — Premium Branding ===== */}
                <div className={`border-b border-sidebar-border flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'md:p-5 md:justify-center px-6 py-5 justify-between' : 'px-6 py-5 justify-between'}`}>
                    <div className="flex items-center select-none">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-[0_0_24px_rgba(79,70,229,0.2)] hover:shadow-[0_0_32px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-[90%] h-[90%] object-contain" />
                        </div>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col
                            ${isCollapsed ? 'md:max-w-0 md:opacity-0 md:invisible md:ml-0 max-w-[11.25rem] opacity-100 visible ml-3.5' : 'max-w-[11.25rem] opacity-100 visible ml-3.5'}`}>
                            <h1 className={`text-2xl font-black uppercase tracking-tight leading-none whitespace-nowrap text-white`}>
                                EDU TECH
                            </h1>
                            <span className={`text-xs uppercase tracking-[0.2em] font-extrabold mt-1.5 font-mono flex items-center gap-1 whitespace-nowrap ${
                                theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'
                            }`}>
                                <Zap className="w-3 h-3 animate-pulse" /> 3D Interactive
                            </span>
                        </div>
                    </div>
                    
                    {/* Mobile Close Button */}
                    <button
                        className={`md:hidden p-1.5 rounded-xl transition-colors ${theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-sidebar-foreground/70 hover:text-white hover:bg-white/5'}`}
                        onClick={() => setIsOpen?.(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ===== Navigation — Clean & Professional ===== */}
                <nav className="flex-1 flex flex-col px-3.5 py-3 overflow-y-auto overflow-x-hidden">
                    <div className="flex-1 flex flex-col justify-start gap-1 xl:gap-2 pb-2 min-h-max">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;

                        const inactiveClass = 'text-white font-bold hover:text-blue-200 hover:bg-white/10 hover:shadow-md';
                        const activeClass = 'bg-indigo-500/20 text-white border border-indigo-500/30 shadow-inner shadow-indigo-500/10 font-bold';

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-nav-glow premium-sidebar-item group flex items-center rounded-2xl relative transition-all duration-300 ease-in-out ${isActive ? `active ${activeClass}` : inactiveClass} ${isCollapsed ? 'md:justify-center md:px-0 md:gap-0 py-2.5 px-3 gap-3' : 'px-3 py-2.5 gap-3'}`}
                            >
                                <div className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
                                    isActive 
                                        ? 'bg-indigo-500/20 text-white'
                                        : 'group-hover:bg-white/10 group-hover:text-white'
                                }`}>
                                    <Icon className="w-[1.125rem] h-[1.125rem]" />
                                </div>
                                
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out flex-1 text-left
                                    ${isCollapsed ? 'md:max-w-0 md:opacity-0 md:invisible max-w-[9.375rem] opacity-100 visible' : 'max-w-[9.375rem] opacity-100 visible'}`}>
                                    <span className={`text-base font-extrabold tracking-wide whitespace-nowrap transition-all duration-200 ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
                                        {item.label}
                                    </span>
                                </div>

                                {/* Premium Glass Tooltip on Hover when collapsed */}
                                <span className={`absolute left-full ml-4 px-3.5 py-2 bg-[#0b1329]/95 text-white text-[0.6875rem] font-bold rounded-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[0.375rem] before:border-transparent before:border-r-[#0b1329]/95
                                    ${isCollapsed ? 'group-hover:opacity-100 group-hover:translate-x-1' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    </div>

                    {/* ===== Theme Switcher — Framed & Prominent ===== */}
                    <div className="shrink-0 pt-3 mt-1 border-t border-sidebar-border/50">
                        <div className={`rounded-2xl transition-all duration-300 flex border overflow-hidden ${isCollapsed ? 'flex-col items-center justify-center py-6' : 'flex-row items-center justify-between p-3 px-5'} bg-indigo-500/10 border-indigo-500/20`}>
                            {!isCollapsed && (
                                <span className={`text-sm font-bold tracking-wide text-white`}>
                                    Giao diện
                                </span>
                            )}
                            <div className={`${isCollapsed ? '-rotate-90' : ''} transition-transform duration-500 origin-center flex items-center justify-center ${isCollapsed ? 'w-10 h-16' : ''}`}>
                                <ThemeToggle variant="toggle" className="scale-110" />
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ===== Bảng Admin Shortcut ===== */}
                {userRole === 'admin' && (
                    <div className="px-3.5 pb-3">
                        <Link 
                            to="/admin/dashboard"
                            className="group/switch w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl font-bold text-xs hover:shadow-sm transition-all cursor-pointer font-sans"
                        >
                            <ShieldAlert className="w-4 h-4 group-hover/switch:scale-110 group-hover/switch:-rotate-6 transition-transform duration-300 text-emerald-600 dark:text-emerald-400" />
                            <span className={`${isCollapsed ? 'md:hidden' : ''}`}>Bảng Admin</span>
                        </Link>
                    </div>
                )}

                {/* ===== User Account Section — Premium Card ===== */}
                <div className="px-3.5 pb-4">
                    <div className={`p-3 rounded-2xl transition-all duration-300 bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.15)]`}>
                        <div className={`flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'md:flex-col md:gap-3 justify-between gap-3' : 'justify-between gap-3'}`}>
                            <Link 
                                to="/profile" 
                                className={`flex items-center flex-1 min-w-0 relative group transition-all duration-300 ease-in-out ${isCollapsed ? 'md:flex-col md:gap-0 gap-3' : 'gap-3'}`}
                            >
                                {/* Avatar with online indicator */}
                                <div className="relative shrink-0 select-none">
                                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white font-black text-base shadow-lg ring-2 ring-indigo-500/15 dark:ring-indigo-400/10 hover:rotate-3 transition-transform`}>
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    {/* Online indicator dot */}
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2.5px] border-sidebar shadow-sm">
                                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40"></span>
                                    </span>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col flex-1
                                    ${isCollapsed ? 'md:max-w-0 md:opacity-0 md:invisible md:ml-0 md:h-0 max-w-[9.375rem] opacity-100 visible ml-0' : 'max-w-[9.375rem] opacity-100 visible ml-0'}`}>
                                    <p className={`font-black text-sm truncate leading-tight text-white`}>{userName}</p>
                                    {/* Role badge with color */}
                                    <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md text-[0.5625rem] font-black uppercase tracking-widest leading-none border w-max ${getRoleBadgeClass(userRole, userPlan)}`}>
                                        {getRoleLabel(userRole, userPlan)}
                                    </span>
                                </div>

                                {/* Premium Tooltip for profile when collapsed */}
                                <span className={`absolute left-full ml-6 px-3.5 py-2 bg-[#0b1329]/95 text-white text-[0.6875rem] font-bold rounded-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[0.375rem] before:border-transparent before:border-r-[#0b1329]/95
                                    ${isCollapsed ? 'group-hover:opacity-100 group-hover:translate-x-1' : ''}`}>
                                    Hồ sơ: {userName}
                                </span>
                            </Link>
                            
                            <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'md:w-full md:flex md:justify-center md:border-t md:border-sidebar-border/50 md:pt-2.5' : ''}`}>
                                <button
                                    onClick={handleLogout}
                                    className={`p-2.5 rounded-xl transition-all active:scale-90 shrink-0 relative group text-white/50 hover:text-white hover:bg-red-500/80`}
                                    title="Đăng xuất"
                                    aria-label="Đăng xuất tài khoản"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {/* Premium Tooltip for logout when collapsed */}
                                    <span className={`absolute left-full ml-6 top-1/2 -translate-y-1/2 px-3.5 py-2 bg-red-600/95 text-white text-[0.6875rem] font-bold rounded-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-red-500/20 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[0.375rem] before:border-transparent before:border-r-red-600/95
                                        ${isCollapsed ? 'group-hover:opacity-100 group-hover:translate-x-1' : ''}`}>
                                        Đăng xuất
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Premium Collapse Toggle ===== */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden md:flex absolute -right-3.5 top-20 items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-4 border-sidebar shadow-xl hover:scale-110 active:scale-95 transition-all z-[60]
                    ${isCollapsed ? 'rotate-180' : ''}`}
                title={isCollapsed ? "Mở rộng" : "Thu gọn"}
                aria-label={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
        </aside>
    );
}
