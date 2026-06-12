import { AdminLayout } from '../../layout/AdminLayout';
import { CreditCard, Search, Filter, CheckCircle, XCircle, Clock, RefreshCw, Zap, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../../api';


export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [newPendingCount, setNewPendingCount] = useState(0);
    const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
    const prevPendingCountRef = useRef(0);

    useEffect(() => {
        loadPayments();
        // Auto-refresh every 10 seconds to catch new webhook-approved payments
        autoRefreshRef.current = setInterval(() => loadPayments(true), 10000);
        return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current); };
    }, []);

    const loadPayments = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        try {
            const data = await api.getPayments();
            const pendingCount = data.filter((p: any) => p.status === 'pending').length;
            // Notify if new pending payments appeared
            if (silent && pendingCount > prevPendingCountRef.current) {
                setNewPendingCount(pendingCount - prevPendingCountRef.current);
                setTimeout(() => setNewPendingCount(0), 5000);
            }
            prevPendingCountRef.current = pendingCount;
            setPayments(data);
            setLastRefreshed(new Date());
        } catch (error) {
            console.error("Failed to load payments", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleApprove = async (id: string, userName: string, planName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn PHÊ DUYỆT giao dịch này và KÍCH HOẠT gói [${planName}] cho người dùng [${userName}]?`)) {
            return;
        }

        try {
            const res = await api.approvePayment(id);
            alert(res.message || "Đã phê duyệt giao dịch thành công!");
            loadPayments();
        } catch (err: any) {
            alert(`Lỗi phê duyệt: ${err.message}`);
        }
    };

    const handleReject = async (id: string, userName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI giao dịch của [${userName}]?`)) {
            return;
        }

        try {
            const res = await api.rejectPayment(id);
            alert(res.message || "Đã từ chối giao dịch!");
            loadPayments();
        } catch (err: any) {
            alert(`Lỗi từ chối: ${err.message}`);
        }
    };

    const filteredPayments = payments.filter(p => {
        // Search filter
        const matchSearch = 
            (p.paymentCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;

        return matchSearch && matchStatus;
    });

    const getPlanBadge = (planId: string) => {
        switch (planId) {
            case 'premium':
            case 'pro':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/10 uppercase">PRO</span>;

            case 'school':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/10 uppercase">SCHOOL</span>;
            case 'basic':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/10 uppercase">BASIC</span>;
            default:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border border-slate-200/10 uppercase">{planId}</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/10 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> Đã duyệt
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/10">
                        <XCircle className="w-3.5 h-3.5" /> Từ chối
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/10 animate-pulse-slow">
                        <Clock className="w-3.5 h-3.5 animate-spin-slow" /> Chờ duyệt
                    </span>
                );
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 animate-fadeIn text-slate-800 dark:text-slate-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-3">
                        <CreditCard className="w-7 h-7 text-indigo-500" /> Quản Lý Giao Dịch
                    </h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-sans font-semibold">
                            Duyệt chuyển khoản, đối soát mã VietQR kích hoạt Premium ({payments.length} yêu cầu)
                        </p>
                        {/* Auto-refresh indicator */}
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Auto-sync 10s
                        </div>
                        {lastRefreshed && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                                Cập nhật lúc {lastRefreshed.toLocaleTimeString('vi-VN')}
                            </span>
                        )}
                    </div>
                </div>

                {/* New pending notification */}
                {newPendingCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/40 text-amber-700 dark:text-amber-400 rounded-2xl text-xs font-black animate-bounce">
                        <Bell className="w-4 h-4" />
                        +{newPendingCount} giao dịch mới chờ duyệt!
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Tìm mã chuyển khoản, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none w-full font-sans transition-all"
                        />
                    </div>
                    
                    <div className="relative w-full sm:w-auto flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-sans"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ phê duyệt</option>
                            <option value="approved">Đã duyệt (Thành công)</option>
                            <option value="rejected">Từ chối (Hủy)</option>
                        </select>
                    </div>

                    {/* Manual refresh button */}
                    <button
                        onClick={() => loadPayments()}
                        disabled={isLoading || isRefreshing}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer disabled:opacity-50"
                        title="Làm mới danh sách"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="bg-transparent md:bg-white md:dark:bg-slate-900/60 md:border md:border-slate-200 md:dark:border-white/10 md:rounded-2xl overflow-hidden md:shadow-sm backdrop-blur-xl animate-fadeIn">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-white/10">
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thời gian</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Khách hàng</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mã đối soát</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gói mua</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Số tiền</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-4.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-200 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Đang tải giao dịch...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Không tìm thấy giao dịch nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4 text-xs font-mono text-slate-400 dark:text-slate-500">
                                            {new Date(p.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-extrabold text-slate-900 dark:text-white font-heading text-sm">{p.userName}</div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{p.userEmail}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black font-mono text-indigo-600 dark:text-indigo-400 tracking-wider text-[13px] bg-indigo-50 dark:bg-indigo-950/30 py-1 px-2.5 rounded-lg border border-indigo-200/10">
                                                {p.paymentCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{getPlanBadge(p.planId)}</td>
                                        <td className="px-6 py-4 font-black font-heading text-slate-950 dark:text-white">
                                            {p.amount.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(p.status)}
                                            {/* Webhook auto-approved badge */}
                                            {p.status === 'approved' && (
                                                <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border border-violet-200/30 dark:border-violet-500/20 px-1.5 py-0.5 rounded-full">
                                                    <Zap className="w-2.5 h-2.5" /> Tự động
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {p.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(p.id, p.userName, p.planId)}
                                                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-black shadow-md cursor-pointer transition-colors"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(p.id, p.userName)}
                                                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-black shadow-md cursor-pointer transition-colors"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">Đã xử lý</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view list cards */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="py-12 text-center text-slate-400 flex justify-center items-center gap-3 font-sans font-bold text-xs uppercase tracking-widest">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang tải...</span>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 font-sans">
                            Không tìm thấy giao dịch nào.
                        </div>
                    ) : (
                        <div className="space-y-3 font-sans">
                            {filteredPayments.map((p) => (
                                <div key={p.id} className="bg-white dark:bg-slate-900/60 p-4.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="text-[10px] font-mono text-slate-400">
                                            {new Date(p.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                        <div>
                                            {getStatusBadge(p.status)}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">{p.userName}</h3>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-none mt-0.5">{p.userEmail}</p>
                                    </div>

                                    <div className="flex justify-between items-center py-2 bg-slate-50/50 dark:bg-slate-950/20 px-2 rounded-xl">
                                        <span className="font-black font-mono text-indigo-600 dark:text-indigo-400 text-xs tracking-wider">
                                            {p.paymentCode}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            {getPlanBadge(p.planId)}
                                            <span className="font-black font-heading text-slate-900 dark:text-white text-xs">{p.amount.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>

                                    {p.status === 'pending' && (
                                        <div className="flex gap-2 pt-1.5 w-full">
                                            <button
                                                onClick={() => handleApprove(p.id, p.userName, p.planId)}
                                                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors text-center"
                                            >
                                                Duyệt thanh toán
                                            </button>
                                            <button
                                                onClick={() => handleReject(p.id, p.userName)}
                                                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors text-center"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
