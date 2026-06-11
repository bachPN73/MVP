import { Link } from 'react-router';
import { LayoutDashboard, Users, Box, LogOut, X, Sun, Moon, BookOpen, School, CreditCard, Settings2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';

interface AdminSidebarProps {
    currentPath?: string;
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

export function AdminSidebar({ currentPath = '/admin/dashboard', isOpen = false, setIsOpen }: AdminSidebarProps) {
    const [userName, setUserName] = useState('Admin');
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const stored = localStorage.getItem('edu_tech_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUserName(parsed.name || 'Admin');
            } catch { /* ignore */ }
        }
    }, []);

    const menuItems = [
        { path: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { path: '/admin/materials', label: 'Quản lý học liệu', icon: Box },
        { path: '/admin/lessons', label: 'Quản lý bài học', icon: BookOpen },
        { path: '/admin/users', label: 'Quản lý người dùng', icon: Users },
        { path: '/admin/schools', label: 'Quản lý trường học', icon: School },
        { path: '/admin/payments', label: 'Quản lý thanh toán', icon: CreditCard },
        { path: '/admin/ai-config', label: 'AI & Phân quyền', icon: Settings2 },
    ];

    const handleLogout = () => {
        localStorage.removeItem('edu_tech_user');
        window.location.href = '/';
    };

    return (
        <aside className={`fixed left-0 top-0 h-full w-64 bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-3xl text-slate-600 dark:text-slate-300 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-2xl z-50 border-r border-slate-200/60 dark:border-white/10 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Logo */}
            <div className="p-6 border-b border-slate-200/60 dark:border-white/10 bg-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/30">
                        <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-heading">Admin<span className="text-indigo-600 dark:text-indigo-400">Panel</span></h1>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-sans">Edu Tech</p>
                    </div>
                </div>
                {/* Nút đóng cho Mobile */}
                <button
                    className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setIsOpen?.(false)}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4 font-sans">
                    Menu Chính
                </div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path || (currentPath !== '/admin/dashboard' && currentPath.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group font-sans ${isActive
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-500/20 shadow-sm'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400 font-semibold border border-transparent'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : 'group-hover:scale-110'}`} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Theme Switcher Button */}
                <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/10">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white group text-slate-600 dark:text-slate-400 cursor-pointer font-sans font-semibold border border-transparent"
                    >
                        <div className="relative w-5 h-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                            ) : (
                                <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            )}
                        </div>
                        <span className="text-sm text-left">
                            {theme === 'light' ? 'Chế độ Tối' : 'Chế độ Sáng'}
                        </span>
                    </button>
                </div>
            </nav>

            {/* Quick Switcher back to Student Interface */}
            <div className="px-4 mb-4">
                <Link
                    to="/dashboard"
                    className="group/switch w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl font-bold text-xs hover:shadow-sm transition-all cursor-pointer font-sans"
                >
                    <BookOpen className="w-4 h-4 group-hover/switch:scale-110 group-hover/switch:-rotate-6 transition-transform duration-300 text-emerald-600 dark:text-emerald-400" />
                    <span>Giao diện Học tập</span>
                </Link>
            </div>

            {/* User section */}
            <div className="p-4 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 mb-3 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/10">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-white truncate text-[13px] font-heading leading-tight">{userName}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold uppercase tracking-wider mt-0.5">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group font-sans border border-transparent"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
