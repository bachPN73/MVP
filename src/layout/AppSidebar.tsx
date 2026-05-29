import { Link } from 'react-router';
import { Home, Library, Sparkles, BookOpen, LogOut, CreditCard, X, ChevronLeft, Sun, Moon, ShieldAlert, School } from 'lucide-react';
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
        if (role === 'admin') {
            return plan.toLowerCase() === 'school' ? 'Quản trị Trường' : 'Quản trị Web';
        }
        if (role === 'teacher') return 'Giáo viên';
        return 'Học sinh';
    };

    const menuItems = [
        { path: '/dashboard', label: 'Trang chủ', icon: Home },
        { path: '/library', label: 'Thư viện', icon: Library },
        { path: '/find-ai', label: 'Find with AI', icon: Sparkles },
        { path: '/pricing-app', label: 'Gói dịch vụ', icon: CreditCard },
        { path: '/guide-app', label: 'Hướng dẫn', icon: BookOpen },
        ...(userPlan === 'school' && userRole === 'admin' ? [{ path: '/school/dashboard', label: 'Trường học', icon: School }] : []),
        ...(userRole === 'admin' && userPlan !== 'school' ? [{ path: '/admin/dashboard', label: 'Bảng Admin', icon: ShieldAlert }] : []),
    ];

    const handleLogout = () => {
        localStorage.removeItem('edu_tech_user');
        window.location.href = '/';
    };

    return (
        <aside 
            className={`fixed left-0 top-0 h-full bg-sidebar/95 backdrop-blur-3xl text-sidebar-foreground flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out md:translate-x-0 border-r border-sidebar-border
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Logo Section - Stylized & Branded */}
            <div className={`p-6 border-b border-sidebar-border flex flex-col items-center ${isCollapsed ? 'gap-6' : 'flex-row justify-between h-24'}`}>
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-1 group cursor-pointer animate-in zoom-in duration-500">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all">
                            ET
                        </div>
                        <div className="flex flex-col items-center leading-none mt-1 group-hover:scale-110 transition-transform">
                            <span className={`text-[9px] font-black ${theme === 'light' ? 'text-slate-500' : 'text-white/50'}`}>EDU</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black shadow-lg">
                            E
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`text-xl font-black uppercase tracking-tight leading-none ${
                                theme === 'light' 
                                    ? 'text-slate-900' 
                                    : 'bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent'
                            }`}>
                                EDU TECH
                            </h1>
                            <span className={`text-[10px] uppercase tracking-[0.2em] font-black mt-1 ${
                                theme === 'light' ? 'text-indigo-600/70' : 'text-indigo-400/60'
                            }`}>
                                Khoa học
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Mobile Close Button */}
                <button
                    className={`md:hidden p-1 ${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-sidebar-foreground/70 hover:text-white'}`}
                    onClick={() => setIsOpen?.(false)}
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Premium Collapse Toggle */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden md:flex absolute -right-3.5 top-20 items-center justify-center w-7 h-7 rounded-full bg-indigo-500 text-white border-4 border-sidebar shadow-xl hover:scale-110 active:scale-95 transition-all z-[60]
                    ${isCollapsed ? 'rotate-180' : ''}`}
                title={isCollapsed ? "Mở rộng" : "Thu gọn"}
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Navigation - High Contrast & Smooth Hover */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;

                    const inactiveClass = theme === 'light' 
                        ? 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/55' 
                        : 'text-white/50 hover:text-white hover:bg-white/5';
                    const activeClass = theme === 'light'
                        ? 'bg-indigo-50 text-indigo-600 font-bold shadow-sm'
                        : 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.03)]';

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`premium-sidebar-item group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl relative ${isActive ? `active ${activeClass}` : inactiveClass} ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <div className={`p-1 duration-300 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-indigo-400'}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            {!isCollapsed ? (
                                <span className={`text-[13px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                                    {item.label}
                                </span>
                            ) : (
                                /* Premium Glass Tooltip on Hover when collapsed */
                                <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#0b1329]/95 text-white text-[11px] font-bold rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#0b1329]/95">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Theme Switcher Button */}
                <div className="pt-4 mt-4 border-t border-sidebar-border/60">
                    <button
                        onClick={toggleTheme}
                        className={`premium-sidebar-item group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl relative w-full transition-all ${isCollapsed ? 'justify-center' : ''} ${
                            theme === 'light' 
                                ? 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/55' 
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <div className="relative w-5 h-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5 text-indigo-500 drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]" />
                            ) : (
                                <Sun className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                            )}
                        </div>
                        {!isCollapsed ? (
                            <span className="text-[13px] font-semibold tracking-wide transition-all duration-300 group-hover:translate-x-1 text-left">
                                {theme === 'light' ? 'Giao diện Tối' : 'Giao diện Sáng'}
                            </span>
                        ) : (
                            <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#0b1329]/95 text-white text-[11px] font-bold rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#0b1329]/95">
                                {theme === 'light' ? 'Chế độ Tối' : 'Chế độ Sáng'}
                            </span>
                        )}
                    </button>
                </div>
            </nav>

            {/* User Account Section - Floating Card Style */}
            <div className="px-4 pb-8">
                <div className={`${theme === 'light' ? 'bg-slate-100/80 border border-slate-200/50' : 'glass-card'} p-2 rounded-2xl flex items-center gap-3 transition-all ${isCollapsed ? 'flex-col items-center justify-center py-4' : ''}`}>
                    <Link 
                        to="/profile" 
                        className={`flex items-center gap-3 flex-1 min-w-0 relative group ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shrink-0 hover:rotate-6 transition-transform">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed ? (
                            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-2">
                                <p className={`font-bold text-[13px] truncate ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{userName}</p>
                                <p className={`text-[10px] font-black uppercase tracking-widest leading-none mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-white/40'}`}>{getRoleLabel(userRole, userPlan)}</p>
                            </div>
                        ) : (
                            /* Premium Tooltip for profile when collapsed */
                            <span className="absolute left-full ml-6 px-3 py-1.5 bg-[#0b1329]/95 text-white text-[11px] font-bold rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#0b1329]/95">
                                Hồ sơ: {userName}
                            </span>
                        )}
                    </Link>
                    
                    {!isCollapsed ? (
                        <button
                            onClick={handleLogout}
                            className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                                theme === 'light' 
                                    ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' 
                                    : 'text-white/20 hover:text-white hover:bg-red-500/80'
                            }`}
                            title="Đăng xuất"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="relative group w-full flex justify-center">
                            <button
                                onClick={handleLogout}
                                className={`mt-2 p-2 rounded-lg transition-all ${
                                    theme === 'light' 
                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' 
                                        : 'text-white/20 hover:text-white hover:bg-red-500/80'
                                }`}
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                            {/* Premium Tooltip for logout when collapsed */}
                            <span className="absolute left-full ml-6 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-600/95 text-white text-[11px] font-bold rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-red-500/20 z-[70] backdrop-blur-md before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-red-600/95">
                                Đăng xuất
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
