import { AdminLayout } from '../../layout/AdminLayout';
import { Users, Box, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        usersCount: 0,
        materialsCount: 0,
        adminsCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Mock data for Growth Chart (Last 6 Months)
    const growthData = [
        { name: 'Tháng 10', users: 120, materials: 45 },
        { name: 'Tháng 11', users: 180, materials: 80 },
        { name: 'Tháng 12', users: 250, materials: 110 },
        { name: 'Tháng 1', users: 310, materials: 156 },
        { name: 'Tháng 2', users: 480, materials: 210 },
        { name: 'Tháng 3', users: 650, materials: 280 },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, models] = await Promise.all([
                    api.getUsers(),
                    api.getModels()
                ]);

                setStats({
                    usersCount: users.length,
                    materialsCount: models.length,
                    adminsCount: users.filter((u: any) => u.role === 'admin').length,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { 
            title: 'Tổng số Người Dùng', 
            value: stats.usersCount, 
            icon: Users, 
            color: 'text-indigo-600 dark:text-indigo-400', 
            bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100/20 dark:border-indigo-900/20' 
        },
        { 
            title: 'Tài Khoản Admin', 
            value: stats.adminsCount, 
            icon: Activity, 
            color: 'text-rose-600 dark:text-rose-400', 
            bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100/20 dark:border-rose-900/20' 
        },
        { 
            title: 'Tổng số Học Liệu', 
            value: stats.materialsCount, 
            icon: Box, 
            color: 'text-emerald-600 dark:text-emerald-400', 
            bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100/20 dark:border-emerald-900/20' 
        },
        { 
            title: 'Tăng Trưởng (30 ngày)', 
            value: '+14%', 
            icon: TrendingUp, 
            color: 'text-amber-600 dark:text-amber-400', 
            bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100/20 dark:border-amber-900/20' 
        },
    ];

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center flex-col items-center h-[60vh] gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 font-sans font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu tổng quan...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-8 animate-fadeIn">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">Tổng Quan Hệ Thống</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-sans font-semibold mt-1">Cập nhật nhanh các chỉ số hoạt động và sức khỏe của Edu Tech.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 animate-fadeIn">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white dark:bg-slate-900/50 rounded-[1.5rem] p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/60 dark:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between relative group overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-2.5 rounded-xl border ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 transition-colors" />
                            </div>
                            <div className="relative z-10 mt-2">
                                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 font-heading tracking-tight">{stat.value}</h3>
                                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 font-sans font-bold uppercase tracking-wider line-clamp-1">{stat.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

        </AdminLayout>
    );
}
