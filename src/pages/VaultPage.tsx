import { Layout } from '../layout/MainLayout';
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Archive, Clock, Trash2, BookOpen, Atom, FlaskConical, Sprout, Crown, AlertTriangle, BookmarkX, Box, PlayCircle } from 'lucide-react';
import { BASE_URL } from '../api';

// ── Vault Entry type (must match MaterialDetail.tsx) ─────────────────────────
interface VaultEntry {
    id: string;
    title: string;
    subject: string;
    type: string;
    thumbnail: string;
    addedAt: number;
    expiresAt: number;
}

const VAULT_KEY = 'edu_tech_pro_vault';

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
    const [entries, setEntries] = useState<VaultEntry[]>([]);
    const [now, setNow] = useState(Date.now());

    // Read user plan
    useEffect(() => {
        try {
            const stored = localStorage.getItem('edu_tech_user');
            if (stored) {
                const user = JSON.parse(stored);
                if (user.plan) setUserPlan(user.plan.toLowerCase());
            }
        } catch (_) {}
    }, []);

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
        loadVault();
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

    const isPro = ['pro', 'combo', 'school', 'demo'].includes(userPlan);

    // Sort by soonest expiry first
    const sorted = useMemo(() =>
        [...entries].sort((a, b) => a.expiresAt - b.expiresAt),
        [entries]
    );

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
                            Lưu học liệu vào kho riêng — tự động xóa sau 24 giờ.
                        </p>
                        <button
                            onClick={() => navigate('/pricing-app')}
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
                    {/* Decorative orbs */}
                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-purple-400/10 blur-2xl pointer-events-none" />

                    <div className="relative z-10 p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                                <Archive className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
                                    Kho tạm thời
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-300/40 dark:border-violet-500/30 uppercase tracking-wider">
                                        Pro
                                    </span>
                                </h1>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                    {entries.length} học liệu đang lưu · Tự động xóa sau 24h
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Info chip */}
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                Học liệu tự xóa sau 24h kể từ khi thêm
                            </div>
                            {/* Clear all */}
                            {entries.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/50 dark:border-red-500/15 transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Xóa tất cả
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Warning banner ─────────────────────────────────────────── */}
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                        Kho tạm thời chỉ lưu trên thiết bị này. Học liệu sẽ <strong>tự động bị xóa sau đúng 24 giờ</strong> kể từ khi bạn thêm vào. Hãy ghi chú lại các học liệu quan trọng.
                    </p>
                </div>

                {/* ── Empty state ────────────────────────────────────────────── */}
                {entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center">
                            <BookmarkX className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <div className="text-center max-w-xs">
                            <p className="text-slate-600 dark:text-slate-400 font-bold text-base mb-1">Kho đang trống</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium leading-relaxed">
                                Mở bất kỳ học liệu nào và nhấn <strong>"Lưu vào kho tạm thời"</strong> để thêm vào đây.
                            </p>
                        </div>
                        <Link
                            to="/library"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            <BookOpen className="w-4 h-4" />
                            Khám phá thư viện
                        </Link>
                    </div>
                ) : (
                    /* ── Material Grid ─────────────────────────────────────── */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                        {sorted.map(entry => {
                            const style = getSubjectStyle(entry.subject);
                            const remaining = entry.expiresAt - now;
                            const progressPct = Math.max(0, Math.min(100, (remaining / (24 * 3600 * 1000)) * 100));
                            const isExpiringSoon = remaining < 2 * 3600 * 1000; // < 2h
                            const thumbSrc = getThumbnailSrc(entry.thumbnail);

                            return (
                                <div
                                    key={entry.id}
                                    className={`group relative bg-white dark:bg-slate-900 border rounded-2xl flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 ${style.border} ${style.glow}`}
                                >
                                    {/* Remove button */}
                                    <button
                                        onClick={() => handleRemove(entry.id)}
                                        className="absolute top-2.5 right-2.5 z-20 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer"
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
                                                    <Box className="w-10 h-10 text-violet-200 dark:text-violet-800" />
                                                </div>
                                            )}
                                            {/* Gradient overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                                            {/* Badges */}
                                            <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black shadow-sm uppercase tracking-wider leading-none ${style.badge}`}>
                                                    {getSubjectName(entry.subject)}
                                                </span>
                                                <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-lg text-[9px] font-black text-slate-700 dark:text-slate-300 shadow-sm uppercase tracking-wider leading-none">
                                                    {entry.type === '3d-model' ? '3D' : 'INFO'}
                                                </span>
                                            </div>

                                            {/* Expiring soon badge */}
                                            {isExpiringSoon && (
                                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
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
                                        <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
                                            <h3 className="font-black mb-2 text-sm line-clamp-2 leading-snug text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors font-heading">
                                                {entry.title}
                                            </h3>

                                            {/* Countdown bar */}
                                            <div className="mt-auto pt-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isExpiringSoon ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
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
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}
