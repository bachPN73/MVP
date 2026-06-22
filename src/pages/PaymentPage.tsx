import { Layout } from "../layout/MainLayout";
import { useParams, useNavigate, useLocation } from "react-router";
import {
    ShieldCheck, ArrowLeft, Loader2, Sparkles, CheckCircle2,
    QrCode, Copy, Check, AlertCircle, XCircle, X, Phone, Mail, MessageCircle,
    Clock, Zap, RefreshCw, ChevronRight, ExternalLink,
    Wifi, WifiOff, Lock
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Button from "../components/Button";
import { api } from "../api";

// ─── Web Audio ding on success ────────────────────────────────────────────────
function playSuccessSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.9);
    } catch (_) { }
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function ConfettiParticle({ delay, color, x }: { delay: number; color: string; x: number }) {
    return <div className="absolute top-0 rounded-full pointer-events-none" style={{ left: `${x}%`, width: 8, height: 8, backgroundColor: color, animation: `confettiFall 1.5s ease-in ${delay}ms forwards` }} />;
}
const CONFETTI_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

// ─── Countdown Circle ─────────────────────────────────────────────────────────
function CountdownCircle({ seconds, total }: { seconds: number; total: number }) {
    const r = 20, circ = 2 * Math.PI * r;
    const color = seconds <= 30 ? '#ef4444' : '#6366f1';
    const display = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    return (
        <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" />
                <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={circ * (1 - seconds / total)}
                    style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <span className="relative text-[10px] font-black tabular-nums" style={{ color }}>{display}</span>
        </div>
    );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ value, field, copiedField, onCopy, prominent }: {
    value: string; field: string; copiedField: string | null;
    onCopy: (v: string, f: string) => void; prominent?: boolean;
}) {
    const copied = copiedField === field;
    return (
        <button onClick={() => onCopy(value, field)} className={`shrink-0 p-2 rounded-lg cursor-pointer transition-all ${copied ? 'bg-emerald-500 text-white' : prominent ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'}`}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

export default function PaymentPage() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<any>(null);
    const [payment, setPayment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pollCount, setPollCount] = useState(0);
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const [showConfetti, setShowConfetti] = useState(false);

    const COUNTDOWN_TOTAL = 120; // 2 phút
    const AUTO_CANCEL_SECS = 30 * 60; // 30 phút
    const [checkCountdown, setCheckCountdown] = useState(COUNTDOWN_TOTAL);
    const [autoCancelCountdown, setAutoCancelCountdown] = useState(AUTO_CANCEL_SECS);
    const autoCancelRef = useRef<NodeJS.Timeout | null>(null);

    const bgPollingRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const redirectCountdownRef = useRef<NodeJS.Timeout | null>(null);
    const hasTriggeredSuccess = useRef(false);

    const plans: Record<string, any> = {
        free:   { name: "Miễn phí (Free)",     price: 0,       desc: "Giáo viên/ học sinh mới trải nghiệm", color: "from-slate-500 to-gray-600",    badge: "FREE",   accent: "#64748b" },
        basic:  { name: "Cơ bản (Basic)",      price: 59000,   desc: "Giáo viên cá nhân/học sinh",          color: "from-indigo-500 to-purple-600", badge: "BASIC",  accent: "#6366f1" },
        pro:    { name: "Chuyên nghiệp (Pro)", price: 99000,   desc: "Giáo viên sử dụng thường xuyên",      color: "from-violet-500 to-purple-600", badge: "PRO",    accent: "#8b5cf6" },
        combo:  { name: "Combo Pro + In 3D",   price: 189000,  desc: "Bao gồm in 1 mô hình 3D (<= 150 g)",  color: "from-orange-500 to-amber-500",  badge: "COMBO",  accent: "#f97316" },
        school: { name: "Trường học (School)", price: 1500000, desc: "Trường THPT & Tổ bộ môn",             color: "from-teal-500 to-cyan-600",     badge: "SCHOOL", accent: "#14b8a6" },
    };
    const resolvedPlanId = planId === 'premium' ? 'pro' : planId;
    const plan = plans[resolvedPlanId || "free"] || plans.free;

    useEffect(() => {
        const on = () => setIsOnline(true), off = () => setIsOnline(false);
        window.addEventListener('online', on); window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    const handlePaymentSuccess = useCallback((approvedPlanId: string) => {
        if (hasTriggeredSuccess.current) return;
        hasTriggeredSuccess.current = true;
        if (bgPollingRef.current) clearInterval(bgPollingRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        const stored = localStorage.getItem('edu_tech_user');
        if (stored) { const p = JSON.parse(stored); p.plan = approvedPlanId; localStorage.setItem('edu_tech_user', JSON.stringify(p)); }
        playSuccessSound();
        setShowConfetti(true);
        let count = 5;
        setRedirectCountdown(count);
        redirectCountdownRef.current = setInterval(() => {
            count -= 1; setRedirectCountdown(count);
            if (count <= 0) { if (redirectCountdownRef.current) clearInterval(redirectCountdownRef.current); navigate("/dashboard"); }
        }, 1000);
    }, [navigate]);

    const checkPaymentStatus = useCallback(async () => {
        if (!payment?.paymentCode) return;
        try {
            const result = await api.checkPaymentByCode(payment.paymentCode);
            setPollCount(c => c + 1);
            if (result.status !== payment.status) setPayment((prev: any) => ({ ...prev, status: result.status, planId: result.planId }));
            if (result.status === 'approved') handlePaymentSuccess(result.planId);
        } catch (_) {
            if (!user?.id) return;
            try {
                const payments = await api.getUserPayments(user.id);
                const current = payments.find((p: any) => p.id === payment.id);
                if (current && current.status !== payment.status) { setPayment(current); if (current.status === 'approved') handlePaymentSuccess(current.planId); }
            } catch (_) { }
        }
    }, [payment, user, handlePaymentSuccess]);

    useEffect(() => {
        const stored = localStorage.getItem('edu_tech_user');
        if (!stored) { navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`); return; }
        try {
            const parsedUser = JSON.parse(stored);
            setUser(parsedUser);
            if (plan.price > 0) {
                api.createPayment(parsedUser.id, resolvedPlanId || "free", plan.price)
                    .then(setPayment)
                    .catch((err: any) => setStatusError(err.message || "Không thể kết nối máy chủ."))
                    .finally(() => setIsLoading(false));
            } else setIsLoading(false);
        } catch { navigate('/login'); }
    }, [planId, navigate, location.pathname, plan.price]);

    // Background passive poll every 15s
    useEffect(() => {
        if (!payment?.paymentCode || payment.status !== 'pending') return;
        bgPollingRef.current = setInterval(checkPaymentStatus, 15000);
        return () => { if (bgPollingRef.current) clearInterval(bgPollingRef.current); };
    }, [payment?.paymentCode, payment?.status, checkPaymentStatus]);

    // 3-min countdown — only checks at 0, then resets
    useEffect(() => {
        if (!isConfirming || payment?.status !== 'pending') return;
        setCheckCountdown(COUNTDOWN_TOTAL);
        countdownTimerRef.current = setInterval(() => {
            setCheckCountdown(prev => { if (prev <= 1) { checkPaymentStatus(); return COUNTDOWN_TOTAL; } return prev - 1; });
        }, 1000);
        return () => { if (countdownTimerRef.current) clearInterval(countdownTimerRef.current); };
    }, [isConfirming, payment?.status]);

    // Auto-cancel countdown after 30 minutes if still pending
    useEffect(() => {
        if (!payment?.paymentCode || payment?.status !== 'pending') return;
        setAutoCancelCountdown(AUTO_CANCEL_SECS);
        autoCancelRef.current = setInterval(() => {
            setAutoCancelCountdown(prev => {
                if (prev <= 1) {
                    // Time's up — mark as cancelled locally and navigate away
                    if (autoCancelRef.current) clearInterval(autoCancelRef.current);
                    if (bgPollingRef.current) clearInterval(bgPollingRef.current);
                    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                    navigate('/pricing-app');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (autoCancelRef.current) clearInterval(autoCancelRef.current); };
    }, [payment?.paymentCode, payment?.status]);

    useEffect(() => () => {
        [bgPollingRef, countdownTimerRef, redirectCountdownRef, autoCancelRef].forEach(r => { if (r.current) clearInterval(r.current); });
    }, []);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleManualCheck = () => { checkPaymentStatus(); setCheckCountdown(COUNTDOWN_TOTAL); };

    // ─── LOADING ──────────────────────────────────────────────────────────────
    if (isLoading) return (
        <Layout>
            <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Đang chuẩn bị thanh toán...</p>
            </div>
        </Layout>
    );

    // ─── ERROR ────────────────────────────────────────────────────────────────
    if (statusError) return (
        <Layout>
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <div className="max-w-sm w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto">
                        <XCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <h1 className="text-xl font-[950] text-slate-900 dark:text-white">Lỗi kết nối</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{statusError}</p>
                    <Button variant="gradient" className="w-full" onClick={() => window.location.reload()}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
                    </Button>
                </div>
            </div>
        </Layout>
    );

    // ─── SUCCESS ──────────────────────────────────────────────────────────────
    if (payment?.status === 'approved') return (
        <Layout>
            <style>{`
                @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
                @keyframes successPulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.5);opacity:.1} }
                @keyframes checkIn { 0%{transform:scale(0) rotate(-20deg);opacity:0} 70%{transform:scale(1.1) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
            `}</style>
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
                {showConfetti && Array.from({ length: 30 }).map((_, i) => (
                    <ConfettiParticle key={i} delay={i * 60} color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} x={Math.random() * 100} />
                ))}
                <div className="max-w-sm w-full text-center">
                    <div className="bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/30 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-t-[2rem]" />
                        <button
                            onClick={() => {
                                if (redirectCountdownRef.current) clearInterval(redirectCountdownRef.current);
                                navigate("/dashboard");
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer z-10"
                            aria-label="Đóng"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="relative w-20 h-20 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full bg-emerald-400/20" style={{ animation: 'successPulse 2s ease-in-out infinite' }} />
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg" style={{ animation: 'checkIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both' }}>
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                            <Zap className="w-3 h-3" /> Kích hoạt thành công
                        </div>
                        <h1 className="text-2xl font-[950] font-heading text-slate-900 dark:text-white mb-2">
                            Chào mừng gói <span className="text-emerald-500">{plan.name}</span>!
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Tài khoản đã nâng cấp. Khám phá học liệu 3D ngay!</p>
                        <div className="flex items-center justify-center gap-2 mb-5 text-sm text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 py-2 px-4 rounded-xl">
                            <Clock className="w-4 h-4 animate-pulse" /> Tự động chuyển sau <span className="font-[950] tabular-nums">{redirectCountdown}s</span>
                        </div>
                        <Button variant="gradient" className="w-full" onClick={() => navigate("/dashboard")}>
                            Đến Trang Học Tập <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );

    // ─── REJECTED ─────────────────────────────────────────────────────────────
    if (payment?.status === 'rejected') return (
        <Layout>
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <div className="max-w-sm w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto">
                        <XCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <h1 className="text-xl font-[950] text-slate-900 dark:text-white">Giao dịch thất bại</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Kiểm tra lại nội dung chuyển khoản và số tiền.</p>
                    <Button variant="gradient" className="w-full" onClick={() => window.location.reload()}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Thực hiện lại
                    </Button>
                </div>
            </div>
        </Layout>
    );

    // ─── MAIN ─────────────────────────────────────────────────────────────────
    // compact.png = QR code only, không có logo ngân hàng/tên phía dưới
    const qrUrl = payment
        ? `https://img.vietqr.io/image/${payment.bankName}-${payment.accountNumber}-compact.png?amount=${payment.amount}&addInfo=${encodeURIComponent(payment.paymentCode)}`
        : '';

    return (
        <Layout>
            <style>{`
                @keyframes scanLine { 0%{top:4px} 100%{top:calc(100% - 4px)} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.3)} 50%{box-shadow:0 0 0 12px rgba(99,102,241,0)} }
            `}</style>

            <div className="min-h-[calc(100vh-2rem)] p-3 md:p-5 w-full">
                <div className="max-w-[1100px] mx-auto flex flex-col gap-4">

                    {/* ── NAV ── */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-sm hover:border-indigo-200">
                            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Quay lại</span>
                        </button>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shrink-0`}>
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <h1 className="text-base md:text-lg font-[950] text-slate-900 dark:text-white font-heading truncate">
                                Thanh toán — <span className={`text-transparent bg-clip-text bg-gradient-to-r ${plan.color}`}>{plan.name}</span>
                            </h1>
                            <span className={`hidden sm:inline text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r ${plan.color} text-white shrink-0`}>{plan.badge}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border shrink-0 ${isOnline ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-950/30 dark:text-emerald-400' : 'border-rose-200 bg-rose-50/80 text-rose-700'}`}>
                            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            <span className="hidden sm:inline">{isOnline ? 'Trực tuyến' : 'Mất kết nối'}</span>
                        </div>
                    </div>

                    {/* ── 2-COLUMN GRID ── */}
                    {payment && (
                        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">

                            {/* ══ LEFT: QR ══ */}
                            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.06] rounded-[2rem] shadow-xl backdrop-blur-xl overflow-hidden flex flex-col">
                                <div className={`h-1.5 bg-gradient-to-r ${plan.color}`} />
                                <div className="flex flex-col items-center p-5 gap-4 flex-1">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 self-stretch">
                                        <div className="flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] font-black tracking-widest uppercase py-1.5 px-3 rounded-full shadow-md shadow-indigo-500/30">
                                            <QrCode className="w-3 h-3" /> VIETQR
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quét để thanh toán</span>
                                        <div className="ml-auto flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            SePay
                                        </div>
                                    </div>

                                    {/* QR Image */}
                                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl w-full"
                                        style={{ aspectRatio: '1', padding: 6, border: `2px solid ${plan.accent}25`, animation: isConfirming ? 'pulseGlow 1.5s ease-in-out infinite' : 'none' }}>
                                        <div className="absolute top-0 left-0 w-7 h-7 pointer-events-none" style={{ borderTop: `3px solid ${plan.accent}`, borderLeft: `3px solid ${plan.accent}`, borderRadius: '8px 0 0 0', zIndex: 10 }} />
                                        <div className="absolute top-0 right-0 w-7 h-7 pointer-events-none" style={{ borderTop: `3px solid ${plan.accent}`, borderRight: `3px solid ${plan.accent}`, borderRadius: '0 8px 0 0', zIndex: 10 }} />
                                        <div className="absolute bottom-0 left-0 w-7 h-7 pointer-events-none" style={{ borderBottom: `3px solid ${plan.accent}`, borderLeft: `3px solid ${plan.accent}`, borderRadius: '0 0 0 8px', zIndex: 10 }} />
                                        <div className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none" style={{ borderBottom: `3px solid ${plan.accent}`, borderRight: `3px solid ${plan.accent}`, borderRadius: '0 0 8px 0', zIndex: 10 }} />
                                        {!isConfirming && (
                                            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent z-10 pointer-events-none" style={{ animation: 'scanLine 2.5s linear infinite' }} />
                                        )}
                                        <img src={qrUrl} alt="VietQR" className="w-full h-full object-fill block select-none" style={{ borderRadius: 6 }} />
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                                        Quét bằng <strong className="text-slate-700 dark:text-slate-200">app ngân hàng</strong> bất kỳ · Nhập số tiền <strong className="text-indigo-600 dark:text-indigo-400">{plan.price.toLocaleString()}đ</strong>
                                    </p>
                                </div>
                            </div>

                            {/* ══ RIGHT: Info + Action + Summary ══ */}
                            <div className="flex flex-col gap-3">

                                {/* Transfer Info */}
                                <div className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.06] rounded-[1.5rem] shadow-lg backdrop-blur-xl p-4 space-y-2.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Thông tin chuyển khoản</p>

                                    {/* Bank + Account — side by side */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Ngân hàng</p>
                                                <p className="text-sm font-black text-slate-800 dark:text-white">TPBank</p>
                                            </div>
                                            <CopyBtn value="TPBank" field="bank" copiedField={copiedField} onCopy={handleCopy} />
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Chủ tài khoản</p>
                                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase truncate">{payment.accountName}</p>
                                            </div>
                                            <CopyBtn value={payment.accountName} field="accountName" copiedField={copiedField} onCopy={handleCopy} />
                                        </div>
                                    </div>

                                    {/* Account number */}
                                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border-2 border-indigo-200/60 dark:border-indigo-500/30">
                                        <div>
                                            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-wider mb-0.5">Số tài khoản</p>
                                            <p className="text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white">{payment.accountNumber}</p>
                                        </div>
                                        <CopyBtn value={payment.accountNumber} field="accountNumber" copiedField={copiedField} onCopy={handleCopy} prominent />
                                    </div>

                                    {/* Payment code */}
                                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/20 border-2 border-indigo-200/60 dark:border-indigo-500/30">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Nội dung (BẮT BUỘC)
                                            </p>
                                            <p className="text-base font-black font-mono text-indigo-700 dark:text-indigo-300 tracking-wider break-all select-all">{payment.paymentCode}</p>
                                        </div>
                                        <CopyBtn value={payment.paymentCode} field="code" copiedField={copiedField} onCopy={handleCopy} prominent />
                                    </div>
                                </div>

                                {/* Order Summary + Action — side by side on md+ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                    {/* Order Summary */}
                                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.06] rounded-[1.5rem] shadow-lg backdrop-blur-xl p-4 flex flex-col gap-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đơn hàng</p>
                                        {/* Plan badge */}
                                        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${plan.color} text-white relative overflow-hidden`} style={{ boxShadow: `0 6px 20px ${plan.accent}35` }}>
                                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full" />
                                            <div className="relative flex items-center gap-2.5">
                                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                                    <Sparkles className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-[950] text-sm leading-tight">{plan.name}</p>
                                                    <p className="text-[10px] text-white/70 mt-0.5">{plan.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Total */}
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Tổng cộng</span>
                                            <span className="text-2xl font-[950] font-heading text-indigo-600 dark:text-indigo-400">{plan.price.toLocaleString()}<span className="text-base">đ</span></span>
                                        </div>
                                        {/* Trust badges — 2 compact */}
                                        <div className="flex gap-2 pt-1 border-t border-dashed border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <ShieldCheck className="w-3.5 h-3.5" /> Bảo mật SSL
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                                <Zap className="w-3.5 h-3.5" /> Kích hoạt 1–3 phút
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.06] rounded-[1.5rem] shadow-lg backdrop-blur-xl p-4 flex flex-col gap-3">
                                        {!isConfirming ? (
                                            <>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Xác nhận</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    Sau khi chuyển khoản, bấm xác nhận để hệ thống kiểm tra tự động.
                                                </p>
                                                <button
                                                    onClick={() => setIsConfirming(true)}
                                                    className={`mt-auto w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider bg-gradient-to-r ${plan.color} text-white shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer`}
                                                    style={{ boxShadow: `0 6px 24px ${plan.accent}40` }}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Tôi đã chuyển khoản
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col gap-3 flex-1" style={{ animation: 'fadeUp 0.3s ease-out' }}>
                                                {/* Countdown row */}
                                                <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-3">
                                                    <CountdownCircle seconds={checkCountdown} total={COUNTDOWN_TOTAL} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">Đang xác nhận...</p>
                                                        <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                                                            Tự check lại sau {Math.floor(checkCountdown / 60)}p{checkCountdown % 60 > 0 ? ` ${checkCountdown % 60}s` : ''}
                                                        </p>
                                                    </div>
                                                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                                                </div>
                                                {/* Progress */}
                                                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(((COUNTDOWN_TOTAL - checkCountdown) / COUNTDOWN_TOTAL) * 100, 95)}%` }} />
                                                </div>
                                                {/* ── 10-min warning ── */}
                                                <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/40 rounded-xl">
                                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                                                        Nếu sau <span className="underline decoration-dotted">10 phút</span> chưa thanh toán thành công, vui lòng{' '}
                                                        <a href="https://zalo.me/0336189329" target="_blank" rel="noreferrer" className="text-amber-700 dark:text-amber-300 underline font-black hover:text-amber-900">liên hệ chúng tôi</a> để được hỗ trợ.
                                                    </p>
                                                </div>
                                                {/* Auto-cancel notice */}
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                                                    Đơn tự huỷ sau <span className="font-black text-slate-500">{Math.floor(autoCancelCountdown / 60)}:{(autoCancelCountdown % 60).toString().padStart(2, '0')}</span> nếu chưa thanh toán
                                                </p>
                                                {/* Check button — unlocked only at 0 */}
                                                <button
                                                    onClick={handleManualCheck}
                                                    disabled={checkCountdown > 0}
                                                    className={`mt-auto w-full py-3 rounded-xl border-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                                                        ${checkCountdown > 0
                                                            ? 'border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/30 cursor-not-allowed'
                                                            : 'border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 cursor-pointer shadow-sm'
                                                        }`}
                                                >
                                                    {checkCountdown > 0
                                                        ? <><Lock className="w-3.5 h-3.5" /> Mở khoá sau {Math.floor(checkCountdown / 60)}:{(checkCountdown % 60).toString().padStart(2, '0')}</>
                                                        : <><RefreshCw className="w-4 h-4" /> Kiểm tra ngay ({pollCount} lần)</>
                                                    }
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Support row — compact */}
                                <div className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.06] rounded-[1.25rem] shadow-sm backdrop-blur-xl px-4 py-3 flex items-center gap-4 flex-wrap">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Hỗ trợ:</p>
                                    {[
                                        { href: "https://zalo.me/0336189329", icon: <MessageCircle className="w-3.5 h-3.5" />, label: "Zalo: 0336189329", cls: "text-blue-600 hover:bg-blue-50" },
                                        { href: "tel:0982143958", icon: <Phone className="w-3.5 h-3.5" />, label: "098 214 39 58", cls: "text-emerald-600 hover:bg-emerald-50" },
                                        { href: "mailto:netangedutech@gmail.com", icon: <Mail className="w-3.5 h-3.5" />, label: "netangedutech@gmail.com", cls: "text-indigo-600 hover:bg-indigo-50" },
                                    ].map(c => (
                                        <a key={c.href} href={c.href} target="_blank" rel="noreferrer"
                                            className={`flex items-center gap-1.5 text-xs font-bold ${c.cls} dark:text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors`}>
                                            {c.icon} {c.label} <ExternalLink className="w-3 h-3 opacity-30" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
