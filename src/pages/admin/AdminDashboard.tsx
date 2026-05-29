import { AdminLayout } from '../../layout/AdminLayout';
import { Users, Box, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
                        <div key={index} className="bg-white dark:bg-slate-900/60 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between relative group overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-full blur-xl group-hover:scale-110 transition-transform" />
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-2.5 rounded-xl border ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 transition-colors" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-0.5 md:mb-1 font-heading">{stat.value}</h3>
                                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-sans font-extrabold uppercase tracking-wider line-clamp-1">{stat.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-slate-900/60 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-6 h-96 transition-all hover:shadow-md animate-fadeIn backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Biểu Đồ Tăng Trưởng</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-semibold">Thống kê người dùng mới & học liệu (6 tháng gần nhất)</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-sans font-bold">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                            <span className="text-slate-600 dark:text-slate-300">Người dùng mới</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-600 dark:text-slate-300">Học liệu tải lên</span>
                        </div>
                    </div>
                </div>

                <div className="h-[calc(100%-4.5rem)] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={growthData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMaterials" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', fontSize: 11 }}
                                className="text-slate-400 dark:text-slate-500 font-sans font-bold"
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'currentColor', fontSize: 11 }}
                                className="text-slate-400 dark:text-slate-500 font-sans font-bold"
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px', 
                                    borderWidth: '1px',
                                    color: '#ffffff',
                                    fontFamily: 'var(--font-sans)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                                }}
                                labelStyle={{ fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}
                                itemStyle={{ fontWeight: 650, fontSize: '12px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                name="Người dùng mới"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="materials"
                                name="Học liệu tải lên"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorMaterials)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminLayout>
    );
}
