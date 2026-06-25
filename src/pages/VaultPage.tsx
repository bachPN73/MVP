import { Layout } from '../layout/MainLayout';
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
    Archive, Clock, Trash2, BookOpen, Atom, FlaskConical, Sprout, Crown, 
    AlertTriangle, BookmarkX, Box, PlayCircle, Plus, Edit3, Save, X, Folder, 
    ChevronDown, ChevronRight, FolderPlus 
} from 'lucide-react';
import { BASE_URL } from '../api';

// ── Types ────────────────────────────────────────────────────────────────────
interface VaultPeriod {
    id: string;
    name: string;
    createdAt: number;
}

interface VaultEntry {
    id: string;
    title: string;
    subject: string;
    type: string;
    thumbnail: string;
    addedAt: number;
    expiresAt: number;
    periodId?: string; // links to VaultPeriod
}

const VAULT_KEY = 'edu_tech_pro_vault';
const PERIODS_KEY = 'edu_tech_vault_periods';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCountdown(ms: number): string {
    if (ms <= 0) return 'Đã hết hạn';
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m còn lại`;
    if (m > 0) return `${m}m ${s}s còn lại`;
    return `${s}s còn lại`;
}

function getSubjectStyle(subject: string) {
    switch (subject) {
        case 'physics':
            return {
                badge: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
                icon: Atom,
                border: 'border-blue-200/50 dark:border-blue-500/20',
                glow: 'hover:shadow-blue-500/10',
            };
        case 'chemistry':
            return {
                badge: 'bg-gradient-to-r from-emerald-500 to-green-400 text-white',
                icon: FlaskConical,
                border: 'border-emerald-200/50 dark:border-emerald-500/20',
                glow: 'hover:shadow-emerald-500/10',
            };
        default:
            return {
                badge: 'bg-gradient-to-r from-rose-500 to-orange-400 text-white',
                icon: Sprout,
                border: 'border-rose-200/50 dark:border-rose-500/20',
                glow: 'hover:shadow-rose-500/10',
            };
    }
}

function getSubjectName(subject: string) {
    switch (subject) {
        case 'physics': return 'Vật lý';
        case 'chemistry': return 'Hóa học';
        case 'biology': return 'Sinh học';
        default: return subject;
    }
}

function getThumbnailSrc(thumbnail: string): string {
    if (!thumbnail || thumbnail === '3d-placeholder') return '';
    if (thumbnail.startsWith('http')) return thumbnail;
    return `${BASE_URL}${thumbnail}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VaultPage() {
    const navigate = useNavigate();
    const [userPlan, setUserPlan] = useState('free');
    const [userRole, setUserRole] = useState('student');
    const [entries, setEntries] = useState<VaultEntry[]>([]);
    const [periods, setPeriods] = useState<VaultPeriod[]>([]);
    const [now, setNow] = useState(Date.now());

    // UI state for creating/editing periods
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPeriodName, setNewPeriodName] = useState('');
    const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
    const [editingPeriodName, setEditingPeriodName] = useState('');

    // Accordion expand/collapse state
    const [collapsedPeriods, setCollapsedPeriods] = useState<Record<string, boolean>>({});

    // Read user plan
    useEffect(() => {
        try {
            const stored = localStorage.getItem('edu_tech_user');
            if (stored) {
                const user = JSON.parse(stored);
                if (user.plan) setUserPlan(user.plan.toLowerCase());
                if (user.role) setUserRole(user.role);
            }
        } catch (_) {}
    }, []);

    // Load periods
    const loadPeriods = () => {
        try {
            const raw = localStorage.getItem(PERIODS_KEY);
            if (raw) {
                setPeriods(JSON.parse(raw));
            } else {
                // Seed a default period
                const defaultPeriods = [
                    { id: 'period-default-1', name: 'Tiết 1: Học liệu mở đầu', createdAt: Date.now() }
                ];
                localStorage.setItem(PERIODS_KEY, JSON.stringify(defaultPeriods));
                setPeriods(defaultPeriods);
            }
        } catch (_) {
            setPeriods([]);
        }
    };

    // Load vault and clean expired entries
    const loadVault = () => {
        try {
            const raw = localStorage.getItem(VAULT_KEY);
            if (!raw) { setEntries([]); return; }
            const all: VaultEntry[] = JSON.parse(raw);
            const live = all.filter(e => Date.now() < e.expiresAt);
            // Persist cleaned version
            localStorage.setItem(VAULT_KEY, JSON.stringify(live));
            setEntries(live);
        } catch (_) {
            setEntries([]);
        }
    };

    useEffect(() => {
        loadPeriods();
        loadVault();

        // Check query param for period to scroll to
        const params = new URLSearchParams(window.location.search);
        const targetPeriod = params.get('period');
        if (targetPeriod) {
            setTimeout(() => {
                const element = document.getElementById(`period-${targetPeriod}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Optionally uncollapse it
                    setCollapsedPeriods(prev => ({ ...prev, [targetPeriod]: false }));
                }
            }, 300); // Wait for render
        }
    }, []);

    // Tick every second for countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now());
            // Auto-remove expired while page is open
            setEntries(prev => {
                const live = prev.filter(e => Date.now() < e.expiresAt);
                if (live.length !== prev.length) {
                    localStorage.setItem(VAULT_KEY, JSON.stringify(live));
                }
                return live;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRemove = (id: string) => {
        setEntries(prev => {
            const updated = prev.filter(e => e.id !== id);
            localStorage.setItem(VAULT_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const handleClearAll = () => {
        if (!confirm('Xóa toàn bộ học liệu trong kho tạm thời?')) return;
        localStorage.setItem(VAULT_KEY, JSON.stringify([]));
        setEntries([]);
    };

    const isPro = ['pro', 'school', 'admin'].includes(userPlan) || userRole === 'admin';

    // --- Period Management Actions ---
    const handleCreatePeriod = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPeriodName.trim()) return;

        const newPeriod: VaultPeriod = {
            id: 'period-' + Date.now(),
            name: newPeriodName.trim(),
            createdAt: Date.now()
        };

        const updated = [...periods, newPeriod];
        setPeriods(updated);
        localStorage.setItem(PERIODS_KEY, JSON.stringify(updated));
        setNewPeriodName('');
        setShowCreateForm(false);
    };

    const handleStartRename = (id: string, name: string) => {
        setEditingPeriodId(id);
        setEditingPeriodName(name);
    };

    const handleSaveRename = (id: string) => {
        if (!editingPeriodName.trim()) return;
        const updated = periods.map(p => p.id === id ? { ...p, name: editingPeriodName.trim() } : p);
        setPeriods(updated);
        localStorage.setItem(PERIODS_KEY, JSON.stringify(updated));
        setEditingPeriodId(null);
    };

    const handleDeletePeriod = (id: string) => {
        if (!confirm('Xóa tiết học này? Các học liệu bên trong sẽ được chuyển sang mục "Chưa phân loại".')) return;
        const updatedPeriods = periods.filter(p => p.id !== id);
        setPeriods(updatedPeriods);
        localStorage.setItem(PERIODS_KEY, JSON.stringify(updatedPeriods));

        // Update entries to remove periodId association
        const updatedEntries = entries.map(e => e.periodId === id ? { ...e, periodId: undefined } : e);
        setEntries(updatedEntries);
        localStorage.setItem(VAULT_KEY, JSON.stringify(updatedEntries));
    };

    const handleMoveEntry = (entryId: string, targetPeriodId: string | undefined) => {
        const updated = entries.map(e => e.id === entryId ? { ...e, periodId: targetPeriodId } : e);
        setEntries(updated);
        localStorage.setItem(VAULT_KEY, JSON.stringify(updated));
    };

    // Toggle collapse/expand of a period section
    const toggleCollapse = (id: string) => {
        setCollapsedPeriods(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Sort entries by soonest expiry first
    const sorted = useMemo(() =>
        [...entries].sort((a, b) => a.expiresAt - b.expiresAt),
        [entries]
    );

    // Group sorted entries by period
    const grouped = useMemo(() => {
        const groups: Record<string, VaultEntry[]> = {};
        // Initialize groups for current periods
        periods.forEach(p => {
            groups[p.id] = [];
        });
        groups['uncategorized'] = [];

        sorted.forEach(entry => {
            const pid = entry.periodId;
            if (pid && groups[pid]) {
                groups[pid].push(entry);
            } else {
                groups['uncategorized'].push(entry);
            }
        });
        return groups;
    }, [sorted, periods]);

    // ── Not Pro – Upsell screen ───────────────────────────────────────────────
    if (!isPro) {
        return (
            <Layout>
                <div className="min-h-[70vh] flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-6">
                            <Archive className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-heading">
                            Kho tạm thời 24h
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            Tính năng dành riêng cho tài khoản <strong className="text-violet-500">Pro</strong> trở lên.
                            Lưu học liệu vào kho riêng theo từng Tiết học — tự động xóa học liệu sau 24 giờ.
                        </p>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-violet-500/20 hover:shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Crown className="w-4 h-4" />
                            Nâng cấp lên Pro ngay
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ── Pro – Vault content ───────────────────────────────────────────────────
    return (
        <Layout>
            <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-50/90 via-white/95 to-purple-50/80 dark:from-violet-950/30 dark:via-slate-950 dark:to-purple-950/20 border border-violet-200/60 dark:border-violet-500/20 shadow-md mb-6">
                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-purple-400/10 blur-2xl pointer-events-none" />

                    <div className="relative z-10 p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                                <Archive className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
                                    Kho tạm thời theo Tiết
                                    <span className="text-[0.625rem] font-black px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-300/40 dark:border-violet-500/30 uppercase tracking-wider">
                                        Pro
                                    </span>
                                </h1>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                    {entries.length} học liệu đang lưu · {periods.length} Tiết học
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            {/* Create Period Button */}
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase bg-violet-600 hover:bg-violet-750 text-white shadow-md transition-all cursor-pointer"
                            >
                                <FolderPlus className="w-4 h-4" />
                                Tạo Tiết mới
                            </button>

                            {/* Clear all */}
                            {entries.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/50 dark:border-red-500/15 transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Xóa hết học liệu
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Create Period Inline Form --- */}
                {showCreateForm && (
                    <form onSubmit={handleCreatePeriod} className="mb-6 p-4 bg-white dark:bg-slate-900 border border-violet-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center gap-3 animate-in slide-in-from-top-2 duration-250">
                        <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 rounded-xl">
                            <Folder className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Nhập tên tiết học, ví dụ: Tiết 12: Quang học"
                            value={newPeriodName}
                            onChange={e => setNewPeriodName(e.target.value)}
                            className="flex-1 bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-0 text-sm font-semibold py-1 focus:outline-none text-slate-850 dark:text-white"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                        >
                            Thêm
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowCreateForm(false); setNewPeriodName(''); }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 rounded-xl"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {/* ── Warning banner ─────────────────────────────────────────── */}
                <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                        Tiết học sẽ được lưu vĩnh viễn trên thiết bị này. Chỉ có các <strong>học liệu bên trong sẽ tự động xóa sau 24 giờ</strong> kể từ lúc thêm.
                    </p>
                </div>

                {/* ── Empty overall state ────────────────────────────────────────── */}
                {periods.length === 0 && entries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-3xl">
                        <BookmarkX className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        <div className="text-center max-w-xs">
                            <p className="text-slate-650 dark:text-slate-300 font-bold text-base">Chưa có tiết học nào</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
                                Tạo tiết học mới ở trên hoặc đi khám phá học liệu tại thư viện.
                            </p>
                        </div>
                        <Link to="/library" className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white font-bold text-sm shadow-md transition-all">
                            Khám phá thư viện
                        </Link>
                    </div>
                )}

                {/* ── Display Groups (Periods + Uncategorized) ────────────────────── */}
                <div className="space-y-8">
                    {/* Render each Period */}
                    {periods.map(period => {
                        const periodItems = grouped[period.id] || [];
                        const isCollapsed = collapsedPeriods[period.id];

                        return (
                            <div id={`period-${period.id}`} key={period.id} className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/[0.05] rounded-3xl p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => toggleCollapse(period.id)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg"
                                        >
                                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <Folder className="w-5 h-5 text-violet-500 shrink-0" />
                                            {editingPeriodId === period.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingPeriodName}
                                                        onChange={e => setEditingPeriodName(e.target.value)}
                                                        className="bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg text-sm font-bold border border-violet-300 focus:outline-none focus:border-violet-500"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleSaveRename(period.id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                                                        <Save className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setEditingPeriodId(null)} className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-300">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-150 font-heading">
                                                    {period.name}
                                                </h3>
                                            )}
                                        </div>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold border border-slate-250/30 dark:border-white/5">
                                            {periodItems.length} học liệu
                                        </span>
                                    </div>

                                    {/* Actions on Period */}
                                    {editingPeriodId !== period.id && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStartRename(period.id, period.name)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors cursor-pointer"
                                                title="Đổi tên tiết học"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePeriod(period.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                                title="Xóa tiết học"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {!isCollapsed && (
                                    periodItems.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-slate-400 font-semibold border-2 border-dashed border-slate-150 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-transparent">
                                            Tiết học này chưa có học liệu. Bấm vào học liệu ở thư viện để lưu vào tiết này.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                                            {periodItems.map(entry => (
                                                <VaultEntryCard 
                                                    key={entry.id} 
                                                    entry={entry} 
                                                    now={now} 
                                                    periods={periods} 
                                                    onRemove={handleRemove} 
                                                    onMove={handleMoveEntry} 
                                                />
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        );
                    })}

                    {/* Render Uncategorized/Chưa phân loại section if there are items */}
                    {grouped['uncategorized'] && grouped['uncategorized'].length > 0 && (
                        <div className="bg-slate-50/80 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/50 dark:border-white/5">
                                <Archive className="w-5 h-5 text-slate-400 shrink-0" />
                                <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-300 font-heading">
                                    Học liệu chưa phân loại (Mặc định)
                                </h3>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold">
                                    {grouped['uncategorized'].length} học liệu
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                                {grouped['uncategorized'].map(entry => (
                                    <VaultEntryCard 
                                        key={entry.id} 
                                        entry={entry} 
                                        now={now} 
                                        periods={periods} 
                                        onRemove={handleRemove} 
                                        onMove={handleMoveEntry} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

// ── Vault Entry Card Child Component ─────────────────────────────────────────
interface CardProps {
    entry: VaultEntry;
    now: number;
    periods: VaultPeriod[];
    onRemove: (id: string) => void;
    onMove: (id: string, targetId: string | undefined) => void;
}

function VaultEntryCard({ entry, now, periods, onRemove, onMove }: CardProps) {
    const style = getSubjectStyle(entry.subject);
    const remaining = entry.expiresAt - now;
    const progressPct = Math.max(0, Math.min(100, (remaining / (24 * 3600 * 1000)) * 100));
    const isExpiringSoon = remaining < 2 * 3600 * 1000;
    const thumbSrc = getThumbnailSrc(entry.thumbnail);

    return (
        <div className="group relative bg-white dark:bg-slate-900 border rounded-2xl flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 shadow-sm border-slate-200/80 dark:border-white/10">
            {/* Remove button */}
            <button
                onClick={(e) => { e.preventDefault(); onRemove(entry.id); }}
                className="absolute top-2.5 right-2.5 z-20 p-1.5 bg-red-650 hover:bg-red-750 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer"
                title="Xóa khỏi kho"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>

            <Link to={`/material/${entry.id}`} className="block flex-1 flex flex-col">
                {/* Thumbnail */}
                <div className="shrink-0 relative overflow-hidden aspect-video bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
                    {thumbSrc ? (
                        <img
                            loading="lazy"
                            src={thumbSrc}
                            alt={entry.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 group-hover:scale-105 transition-transform duration-500">
                            <Box className="w-10 h-10 text-violet-250 dark:text-violet-800" />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[0.5625rem] font-black shadow-sm uppercase tracking-wider leading-none ${style.badge}`}>
                            {getSubjectName(entry.subject)}
                        </span>
                        <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-lg text-[0.5625rem] font-black text-slate-700 dark:text-slate-300 shadow-sm uppercase tracking-wider leading-none">
                            {entry.type === '3d-model' ? '3D' : 'INFO'}
                        </span>
                    </div>

                    {/* Expiring soon badge */}
                    {isExpiringSoon && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-red-650 backdrop-blur-sm text-white text-[0.5625rem] font-black uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Sắp hết hạn
                        </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                        <PlayCircle className="w-11 h-11 text-white drop-shadow-md" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Card body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <h3 className="font-black mb-2 text-sm line-clamp-2 leading-snug text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors font-heading">
                        {entry.title}
                    </h3>

                    <div className="space-y-3 mt-auto">
                        {/* Countdown bar */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[0.625rem] font-bold flex items-center gap-1 ${isExpiringSoon ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                    <Clock className="w-2.5 h-2.5" />
                                    {formatCountdown(remaining)}
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        isExpiringSoon
                                            ? 'bg-gradient-to-r from-red-500 to-orange-400'
                                            : 'bg-gradient-to-r from-violet-500 to-purple-400'
                                    }`}
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>

                        {/* Move to another period selector */}
                        <div 
                            className="pt-2 border-t border-slate-100 dark:border-white/5"
                            onClick={e => e.stopPropagation()} // prevent Link trigger
                        >
                            <label className="block text-[0.5625rem] font-black uppercase text-slate-400 tracking-wider mb-1">Di chuyển tiết:</label>
                            <select
                                value={entry.periodId || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    onMove(entry.id, val === '' ? undefined : val);
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg px-2 py-1 text-[0.625rem] font-bold focus:outline-none focus:border-violet-500 cursor-pointer text-slate-700 dark:text-slate-300"
                            >
                                <option value="">Chưa phân loại</option>
                                {periods.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
