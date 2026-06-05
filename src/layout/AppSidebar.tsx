import { Link } from 'react-router';
import { Home, Library, Sparkles, BookOpen, LogOut, CreditCard, X, ChevronLeft, Sun, Moon, ShieldAlert, School, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { api } from '../api';

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
        if (role === 'admin') return 'Quản trị Web';
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
        { path: '/dashboard', label: 'Trang chủ', icon: Home },
        { path: '/library', label: 'Thư viện', icon: Library },
        { path: '/find-ai', label: 'Find with AI', icon: Sparkles },
        { path: '/pricing-app', label: 'Gói dịch vụ', icon: CreditCard },
        { path: '/guide-app', label: 'Hướng dẫn', icon: BookOpen },
        ...(userRole === 'school-admin' ? [{ path: '/school/dashboard', label: 'Trường học', icon: School }] : []),
        ...(userRole === 'admin' ? [{ path: '/admin/dashboard', label: 'Bảng Admin', icon: ShieldAlert }] : []),
    ];

    const handleLogout = () => {
        localStorage.removeItem('edu_tech_user');
        window.location.href = '/';
    };

    return (
        <aside 
            className={`fixed left-0 top-0 md:left-3 md:top-3 md:h-[calc(100vh-1.5rem)] h-full bg-sidebar/95 backdrop-blur-3xl text-sidebar-foreground flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out md:translate-x-0 md:rounded-2xl md:border border-sidebar-border
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            ${isCollapsed ? 'w-20' : 'w-[270px]'}`}
        >
            {/* Inner container to hold and clip content to rounded borders safely */}
            <div className="w-full h-full flex flex-col overflow-hidden rounded-[inherit]">
                {/* ===== Logo Section — Premium Branding ===== */}
                <div className={`border-b border-sidebar-border flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'p-5 justify-center' : 'px-6 py-5 justify-between'}`}>
                    <div className="flex items-center select-none">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-[0_0_24px_rgba(79,70,229,0.25)] hover:shadow-[0_0_32px_rgba(79,70,229,0.45)] hover:scale-105 active:scale-95 transition-all shrink-0">
                            ET
                        </div>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col
                            ${isCollapsed ? 'max-w-0 opacity-0 invisible ml-0' : 'max-w-[180px] opacity-100 visible ml-3.5'}`}>
                            <h1 className={`text-xl font-black uppercase tracking-tight leading-none whitespace-nowrap ${
                                theme === 'light' 
                                    ? 'text-slate-900' 
                                    : 'bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent'
                            }`}>
                                EDU TECH
                            </h1>
                            <span className={`text-[9px] uppercase tracking-[0.2em] font-extrabold mt-1.5 font-mono flex items-center gap-1 whitespace-nowrap ${
                                theme === 'light' ? 'text-indigo-500/70' : 'text-indigo-400/50'
                            }`}>
                                <Zap className="w-2.5 h-2.5 animate-pulse" /> 3D Interactive
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
                <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;

                        const inactiveClass = theme === 'light' 
                            ? 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60' 
                            : 'text-white/45 hover:text-white hover:bg-white/[0.04]';

                        const activeClass = theme === 'light'
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50/50 text-indigo-600 border border-indigo-100/60 shadow-sm'
                            : 'bg-gradient-to-r from-indigo-500/10 to-purple-500/5 text-white border border-indigo-500/15 shadow-[0_0_20px_rgba(99,102,241,0.06)]';

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-nav-glow premium-sidebar-item group flex items-center rounded-2xl relative transition-all duration-300 ease-in-out ${isActive ? `active ${activeClass}` : inactiveClass} ${isCollapsed ? 'justify-center px-0 gap-0 py-3.5' : 'px-4 py-3.5 gap-3.5'}`}
                            >
                                <div className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
                                    isActive 
                                        ? (theme === 'light' ? 'bg-indigo-100/80 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400')
                                        : (theme === 'light' ? 'group-hover:bg-indigo-100/50 group-hover:text-indigo-500' : 'group-hover:bg-white/[0.06] group-hover:text-indigo-400')
                                }`}>
                                    <Icon className="w-[18px] h-[18px]" />
                                </div>
                                
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out flex-1 text-left
                                    ${isCollapsed ? 'max-w-0 opacity-0 invisible' : 'max-w-[150px] opacity-100 visible'}`}>
                                    <span className={`text-sm font-extrabold tracking-wide whitespace-nowrap transition-all duration-200 ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
                                        {item.label}
                                    </span>
                                </div>

                                {/* Premium Glass Tooltip on Hover when collapsed */}
                                <span className={`absolute left-full ml-4 px-3.5 py-2 bg-[#0b1329]/95 text-white text-[11px] font-bold rounded-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#0b1329]/95
                                    ${isCollapsed ? 'group-hover:opacity-100 group-hover:translate-x-1' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* ===== Theme Switcher — Framed & Prominent ===== */}
                    <div className="pt-4 mt-4 border-t border-sidebar-border/50">
                        <div className={`rounded-2xl p-1 transition-colors duration-300 ${
                            theme === 'light' 
                                ? 'bg-slate-100/60' 
                                : 'bg-white/[0.025]'
                        }`}>
                            <button
                                onClick={toggleTheme}
                                className={`sidebar-nav-glow group flex items-center rounded-xl relative w-full transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center px-0 gap-0 py-3' : 'px-4 py-3 gap-3.5'} ${
                                    theme === 'light' 
                                        ? 'text-slate-600 hover:text-indigo-600 hover:bg-white/80' 
                                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className={`p-2 rounded-xl transition-all duration-300 shrink-0 ${
                                    theme === 'light' 
                                        ? 'bg-indigo-50/80 group-hover:bg-indigo-100' 
                                        : 'bg-amber-500/10 group-hover:bg-amber-500/15'
                                }`}>
                                    {theme === 'light' ? (
                                        <Moon className="w-[18px] h-[18px] text-indigo-500 group-hover:rotate-12 transition-transform duration-300" />
                                    ) : (
                                        <Sun className="w-[18px] h-[18px] text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                                    )}
                                </div>
                                
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out flex-1 text-left
                                    ${isCollapsed ? 'max-w-0 opacity-0 invisible' : 'max-w-[150px] opacity-100 visible'}`}>
                                    <span className="text-sm font-bold tracking-wide whitespace-nowrap">
                                        {theme === 'light' ? 'Giao diện Tối' : 'Giao diện Sáng'}
                                    </span>
                                </div>

                                {/* Premium Glass Tooltip on Hover when collapsed */}
                                <span className={`absolute left-full ml-4 px-3.5 py-2 bg-[#0b1329]/95 text-white text-[11px] font-bold rounded-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#0b1329]/95
                                    ${isCollapsed ? 'group-hover:opacity-100 group-hover:translate-x-1' : ''}`}>
                                    {theme === 'light' ? 'Chế độ Tối' : 'Chế độ Sáng'}
                                </span>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* ===== User Account Section — Premium Card ===== */}
                <div className="px-3.5 pb-6">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${
                        theme === 'light' 
                            ? 'bg-slate-50/90 border border-slate-200/50 shadow-sm' 
                            : 'glass-card shadow-[0_0_20px_rgba(0,0,0,0.15)]'
                    }`}>
                        <div className={`flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'flex-col gap-3' : 'justify-between gap-3'}`}>
                            <Link 
                                to="/profile" 
                                className={`flex items-center flex-1 min-w-0 relative group transition-all duration-300 ease-in-out ${isCollapsed ? 'flex-col gap-0' : 'gap-3'}`}
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
                                    ${isCollapsed ? 'max-w-0 opacity-0 invisible ml-0 h-0' : 'max-w-[150px] opacity-100 visible ml-0'}`}>
                                    <p className={`font-black text-sm truncate leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{userName}</p>
                                    {/* Role badge with color */}
                                    <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest leading-none border w-max ${getRoleBadgeClass(userRole, userPlan)}`}>
                                        {getRoleLabel(userRole, userPlan)}
                                    </span>
                                </div>

                                {/* Premium Tooltip for profile when collapsed */}
                                <span className={`absolute left-full ml-6 px-3.5 py-2 bg-[#0b1329]/95 text-white text-[11px] font-bold rounded-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#0b1329]/95
                                    ${isCollapsed ? 'group-hover:opacity-100 group-hover:translate-x-1' : ''}`}>
                                    Hồ sơ: {userName}
                                </span>
                            </Link>
                            
                            <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-full flex justify-center border-t border-sidebar-border/50 pt-2.5' : ''}`}>
                                <button
                                    onClick={handleLogout}
                                    className={`p-2.5 rounded-xl transition-all active:scale-90 shrink-0 relative group ${
                                        theme === 'light' 
                                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' 
                                            : 'text-white/20 hover:text-white hover:bg-red-500/80'
                                    }`}
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {/* Premium Tooltip for logout when collapsed */}
                                    <span className={`absolute left-full ml-6 top-1/2 -translate-y-1/2 px-3.5 py-2 bg-red-600/95 text-white text-[11px] font-bold rounded-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-red-500/20 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-red-600/95
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
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
        </aside>
    );
}
