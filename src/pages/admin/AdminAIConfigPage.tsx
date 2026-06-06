import { AdminLayout } from '../../layout/AdminLayout';
import { useState, useEffect, useCallback } from 'react';
import {
    Settings2, Sparkles, Shield, Save, Loader2, CheckCircle2, AlertCircle,
    RefreshCw, Search, ChevronDown, Infinity, Lock, Unlock, BookOpen, Box, ImagePlus
} from 'lucide-react';
import { api } from '../../api';
import { plans } from '../../data/plans';

// Plan display info
const PLAN_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
    free:   { label: 'Miễn phí',        color: 'text-slate-600 dark:text-slate-300',   bg: 'bg-slate-100 dark:bg-slate-800',      border: 'border-slate-300 dark:border-slate-600' },
    demo:   { label: 'Thử nghiệm',      color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-950/30',      border: 'border-rose-300 dark:border-rose-700' },
    basic:  { label: 'Cơ bản',          color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/30',      border: 'border-blue-300 dark:border-blue-700' },
    pro:    { label: 'Chuyên nghiệp',   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-300 dark:border-violet-700' },
    combo:  { label: 'Combo Pro + In',  color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-300 dark:border-orange-700' },
    school: { label: 'Trường học',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-700' },
};

// Plan hierarchy: higher index = more access
const PLAN_HIERARCHY = ['free', 'demo', 'basic', 'combo', 'pro', 'school'];

const PLAN_OPTIONS = [
    { value: '', label: 'Không giới hạn (mọi gói)' },
    { value: 'demo', label: 'Thử nghiệm trở lên' },
    { value: 'basic', label: 'Cơ bản trở lên' },
    { value: 'combo', label: 'Combo trở lên' },
    { value: 'pro', label: 'Chuyên nghiệp trở lên' },
    { value: 'school', label: 'Trường học' },
];

export default function AdminAIConfigPage() {
    const [activeTab, setActiveTab] = useState<'ai' | 'permissions'>('ai');

    // ---- AI Config State ----
    const [limits, setLimits] = useState<Record<string, number>>({
        free: 3, demo: 10, basic: 20, pro: 50, combo: 50, school: 100
    });
    const [limitsDraft, setLimitsDraft] = useState<Record<string, number>>({ ...limits });
    const [aiLoading, setAiLoading] = useState(true);
    const [aiSaving, setAiSaving] = useState(false);
    const [aiStatus, setAiStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

    // ---- Material Permissions State ----
    const [materials, setMaterials] = useState<any[]>([]);
    const [matLoading, setMatLoading] = useState(true);
    const [matSearch, setMatSearch] = useState('');
    const [matSubject, setMatSubject] = useState('');
    const [matType, setMatType] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);
    const [matStatus, setMatStatus] = useState<{ id: string; type: 'success' | 'error' } | null>(null);

    // Load AI config
    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getAIConfig();
                setLimits(data.limits);
                setLimitsDraft({ ...data.limits });
            } catch (e) {
                console.error('Failed to load AI config', e);
            } finally {
                setAiLoading(false);
            }
        };
        load();
    }, []);

    // Load materials
    const loadMaterials = useCallback(async () => {
        setMatLoading(true);
        try {
            const data = await api.getModels();
            setMaterials(data);
        } catch (e) {
            console.error('Failed to load materials', e);
        } finally {
            setMatLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'permissions') loadMaterials();
    }, [activeTab, loadMaterials]);

    const handleSaveAI = async () => {
        setAiSaving(true);
        setAiStatus({ type: null, msg: '' });
        try {
            await api.updateAIConfig(limitsDraft);
            setLimits({ ...limitsDraft });
            setAiStatus({ type: 'success', msg: 'Đã lưu cấu hình AI thành công!' });
        } catch (e: any) {
            setAiStatus({ type: 'error', msg: e.message || 'Lỗi khi lưu cấu hình' });
        } finally {
            setAiSaving(false);
            setTimeout(() => setAiStatus({ type: null, msg: '' }), 4000);
        }
    };

    const handlePlanChange = async (materialId: string, newPlan: string) => {
        setSavingId(materialId);
        setMatStatus(null);
        try {
            await api.updateMaterialPlan(materialId, newPlan === '' ? null : newPlan);
            setMaterials(prev => prev.map(m =>
                (m.id === materialId || m._id === materialId)
                    ? { ...m, requiredPlan: newPlan === '' ? null : newPlan }
                    : m
            ));
            setMatStatus({ id: materialId, type: 'success' });
        } catch (e: any) {
            setMatStatus({ id: materialId, type: 'error' });
        } finally {
            setSavingId(null);
            setTimeout(() => setMatStatus(null), 2500);
        }
    };

    const filteredMaterials = materials.filter(m => {
        const searchOk = !matSearch ||
            m.title?.toLowerCase().includes(matSearch.toLowerCase()) ||
            (Array.isArray(m.tags) && m.tags.some((t: string) => t.toLowerCase().includes(matSearch.toLowerCase())));
        const subjectOk = !matSubject || m.subject === matSubject;
        const typeOk = !matType || m.type === matType;
        return searchOk && subjectOk && typeOk;
    });

    const planCounts = Object.entries(PLAN_META).reduce((acc, [key]) => {
        acc[key] = materials.filter(m => m.requiredPlan === key).length;
        return acc;
    }, {} as Record<string, number>);
    const unrestrictedCount = materials.filter(m => !m.requiredPlan).length;

    return (
        <AdminLayout>
            <div className="mb-8 animate-fadeIn">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-3">
                    <Settings2 className="w-6 h-6 text-indigo-500" />
                    Cấu hình AI & Phân Quyền
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-sans font-semibold mt-1">
                    Quản lý số lượt AI tìm kiếm theo gói và phân quyền truy cập học liệu
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 w-fit mb-8">
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'ai'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-white/10'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    Giới hạn AI tìm kiếm
                </button>
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'permissions'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-white/10'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <Shield className="w-3.5 h-3.5" />
                    Phân quyền Học liệu
                </button>
            </div>

            {/* ===== TAB: AI LIMITS ===== */}
            {activeTab === 'ai' && (
                <div className="animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-t-2xl" />

                        <div className="flex items-start gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Số lượt AI tìm kiếm theo gói</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Đặt số lượt tìm kiếm AI tối đa mỗi ngày cho từng gói. Nhập <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">-1</code> để không giới hạn.
                                    Lượt sẽ được đặt lại lúc <strong>00:00 (giờ Việt Nam)</strong> mỗi ngày.
                                </p>
                            </div>
                        </div>

                        {aiLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(PLAN_META).map(([planKey, meta]) => {
                                    const val = limitsDraft[planKey] ?? 0;
                                    const isUnlimited = val === -1;
                                    const isDirty = limitsDraft[planKey] !== limits[planKey];
                                    return (
                                        <div
                                            key={planKey}
                                            className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all ${
                                                isDirty
                                                    ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                                                    : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${meta.bg} ${meta.color} ${meta.border} shrink-0`}>
                                                    {meta.label}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:block">
                                                    planId: <span className="text-slate-600 dark:text-slate-300">{planKey}</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="number"
                                                        min={-1}
                                                        value={val}
                                                        onChange={e => {
                                                            const num = parseInt(e.target.value);
                                                            if (!isNaN(num) && num >= -1) {
                                                                setLimitsDraft(prev => ({ ...prev, [planKey]: num }));
                                                            }
                                                        }}
                                                        className="w-28 px-3 py-2 pr-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                    />
                                                    <span className="absolute right-3 text-xs text-slate-400 dark:text-slate-500 font-semibold pointer-events-none">
                                                        lượt/ngày
                                                    </span>
                                                </div>
                                                <button
                                                    title={isUnlimited ? 'Đang không giới hạn — nhấn để giới hạn' : 'Nhấn để không giới hạn (-1)'}
                                                    onClick={() => setLimitsDraft(prev => ({ ...prev, [planKey]: isUnlimited ? 10 : -1 }))}
                                                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                                        isUnlimited
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-400 hover:text-indigo-500'
                                                    }`}
                                                >
                                                    <Infinity className="w-4 h-4" />
                                                </button>
                                                {isDirty && (
                                                    <span className="text-[10px] font-bold text-indigo-500 animate-pulse">● Chưa lưu</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Status */}
                                {aiStatus.type && (
                                    <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-bold animate-fadeIn ${
                                        aiStatus.type === 'success'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-700 dark:text-rose-400'
                                    }`}>
                                        {aiStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {aiStatus.msg}
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSaveAI}
                                        disabled={aiSaving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {aiSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {aiSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info card */}
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <strong>Lưu ý:</strong> Giới hạn áp dụng theo <strong>ngày</strong> và được đếm phía server — người dùng không thể bypass bằng cách xóa localStorage.
                            Admin và School Admin luôn có lượt không giới hạn.
                        </div>
                    </div>
                </div>
            )}

            {/* ===== TAB: MATERIAL PERMISSIONS ===== */}
            {activeTab === 'permissions' && (
                <div className="animate-fadeIn">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Không giới hạn</span>
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">{unrestrictedCount}</span>
                        </div>
                        {Object.entries(PLAN_META).filter(([k]) => k !== 'free').map(([planKey, meta]) => (
                            <div key={planKey} className={`border rounded-xl p-3 flex flex-col gap-1 ${meta.bg} ${meta.border}`}>
                                <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">{planCounts[planKey] || 0}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-t-2xl" />

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100 dark:border-white/5">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, tag..."
                                    value={matSearch}
                                    onChange={e => setMatSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <select
                                value={matSubject}
                                onChange={e => setMatSubject(e.target.value)}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="">Tất cả môn</option>
                                <option value="physics">Vật lý</option>
                                <option value="chemistry">Hóa học</option>
                                <option value="biology">Sinh học</option>
                            </select>
                            <select
                                value={matType}
                                onChange={e => setMatType(e.target.value)}
                                className="px-3 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="">Tất cả loại</option>
                                <option value="3d-model">Mô hình 3D</option>
                                <option value="infographic">Infographic</option>
                            </select>
                            <button
                                onClick={loadMaterials}
                                className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
                                title="Tải lại"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {matLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_200px_36px] gap-4 px-5 py-3 border-b border-slate-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <span>Tên học liệu</span>
                                    <span>Môn / Lớp</span>
                                    <span>Loại</span>
                                    <span>Yêu cầu gói tối thiểu</span>
                                    <span></span>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                    {filteredMaterials.length === 0 ? (
                                        <div className="py-16 text-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
                                            Không tìm thấy học liệu nào
                                        </div>
                                    ) : (
                                        filteredMaterials.map((m) => {
                                            const matId = m.id || m._id;
                                            const currentPlan = m.requiredPlan || '';
                                            const isSaving = savingId === matId;
                                            const statusEntry = matStatus?.id === matId ? matStatus : null;
                                            const subjectLabel = m.subject === 'physics' ? 'Vật lý' : m.subject === 'chemistry' ? 'Hóa học' : 'Sinh học';
                                            const planMeta = currentPlan ? PLAN_META[currentPlan] : null;

                                            return (
                                                <div key={matId} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_200px_36px] gap-3 md:gap-4 px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors items-center">
                                                    {/* Name */}
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {m.thumbnail ? (
                                                            <img src={m.thumbnail.startsWith('http') ? m.thumbnail : m.thumbnail} alt={m.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10 flex-shrink-0" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                                                                {m.type === '3d-model' ? <Box className="w-5 h-5 text-indigo-400" /> : <ImagePlus className="w-5 h-5 text-violet-400" />}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.title}</p>
                                                            {planMeta && (
                                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${planMeta.bg} ${planMeta.color} ${planMeta.border} border`}>
                                                                    <Lock className="w-2.5 h-2.5" />
                                                                    {planMeta.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Subject / Grade */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">{subjectLabel}</span>
                                                        <span className="text-xs text-slate-400 font-semibold">Lớp {m.grade}</span>
                                                    </div>

                                                    {/* Type */}
                                                    <div>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-bold border ${m.type === '3d-model' ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'}`}>
                                                            {m.type === '3d-model' ? 'Mô hình 3D' : 'Infographic'}
                                                        </span>
                                                    </div>

                                                    {/* Plan Selector */}
                                                    <div className="relative">
                                                        <select
                                                            value={currentPlan}
                                                            onChange={e => handlePlanChange(matId, e.target.value)}
                                                            disabled={isSaving}
                                                            className={`w-full appearance-none px-3 py-2 pr-8 rounded-xl border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-60 ${
                                                                statusEntry?.type === 'success'
                                                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700'
                                                                    : statusEntry?.type === 'error'
                                                                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/20 text-rose-700'
                                                                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                                                            }`}
                                                        >
                                                            {PLAN_OPTIONS.map(opt => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            {isSaving ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                                                            ) : statusEntry?.type === 'success' ? (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            ) : statusEntry?.type === 'error' ? (
                                                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                                            ) : (
                                                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Lock/Unlock icon */}
                                                    <div className="hidden md:flex justify-center">
                                                        {currentPlan ? (
                                                            <Lock className="w-4 h-4 text-amber-500" />
                                                        ) : (
                                                            <Unlock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-400 font-semibold">
                                    Hiển thị {filteredMaterials.length} / {materials.length} học liệu
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
