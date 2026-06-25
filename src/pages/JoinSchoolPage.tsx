import { Layout } from "../layout/MainLayout";
import { useState, useEffect, useRef } from "react";
import {
    School, QrCode, X, Sparkles, AlertTriangle, CheckCircle2,
    BookOpen, Users, Zap, ShieldCheck, GraduationCap,
    ArrowRight, Star, ChevronRight, ScanLine, KeyRound, Info
} from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router";
import { api } from "../api";

const BENEFITS = [
    {
        icon: Zap,
        title: "Gói Pro miễn phí",
        desc: "Tự động nâng cấp tài khoản lên gói Pro trong suốt thời gian bạn là thành viên trường.",
        color: "amber"
    },
    {
        icon: BookOpen,
        title: "Tài liệu bản quyền",
        desc: "Truy cập toàn bộ kho 3D model, bài giảng và tài liệu premium được trường cấp phép.",
        color: "indigo"
    },
    {
        icon: Users,
        title: "Lớp học & Trường",
        desc: "Được xếp vào lớp, kết nối với giáo viên và các bạn học trong cùng tổ chức.",
        color: "teal"
    },
    {
        icon: ShieldCheck,
        title: "Quản lý tập trung",
        desc: "Ban giám hiệu quản lý danh sách thành viên, duyệt đơn và theo dõi sử dụng dễ dàng.",
        color: "emerald"
    },
];

const STEPS = [
    {
        num: 1,
        title: "Nhận mã mời",
        desc: "Liên hệ giáo viên hoặc ban giám hiệu trường để nhận Mã mời (invite code) dạng chữ in hoa.",
        icon: KeyRound,
    },
    {
        num: 2,
        title: "Điền thông tin & Gửi đơn",
        desc: "Nhập mã mời, chọn vai trò (Giáo viên / Học sinh) và lớp học, sau đó gửi yêu cầu tham gia.",
        icon: GraduationCap,
    },
    {
        num: 3,
        title: "Chờ duyệt & Kích hoạt",
        desc: "Admin trường duyệt đơn của bạn. Sau khi được phê duyệt, tài khoản tự động nâng lên Pro.",
        icon: Sparkles,
    },
];

const colorMap: Record<string, string> = {
    amber:   "from-amber-400 to-orange-400 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    indigo:  "from-indigo-500 to-violet-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20",
    teal:    "from-teal-400 to-cyan-400 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20",
    emerald: "from-emerald-400 to-green-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
};

export default function JoinSchoolPage() {
    const navigate = useNavigate();
    const codeInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<any>(null);
    const [schoolCode, setSchoolCode] = useState("");
    const [requestedRole, setRequestedRole] = useState<"teacher" | "student">("student");
    const [requestedClass, setRequestedClass] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState("");
    const [joinError, setJoinError] = useState("");
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("edu_tech_user");
        if (!stored) { navigate("/login"); return; }
        const parsed = JSON.parse(stored);
        // Removed the redirect logic
        setUser(parsed);

        // Auto-fill from URL ?join= or ?code= param
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get("join") || params.get("code");
        if (codeParam) {
            setSchoolCode(codeParam.toUpperCase());
            setTimeout(() => codeInputRef.current?.focus(), 300);
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolCode.trim() || !user) return;
        setJoinLoading(true);
        setJoinError("");
        setJoinSuccess("");
        try {
            const res = await api.joinSchool(
                schoolCode.trim().toUpperCase(),
                requestedRole,
                requestedClass,
                user.id || user._id
            ) as any;
            setJoinSuccess(res.message || "Gửi yêu cầu thành công! Vui lòng chờ duyệt.");
            setSchoolCode("");
            setRequestedClass("");
            if (res.success && res.user) {
                const stored = localStorage.getItem("edu_tech_user");
                if (stored) {
                    const curr = JSON.parse(stored);
                    localStorage.setItem("edu_tech_user", JSON.stringify({
                        ...curr, role: res.user.role, plan: res.user.plan,
                        schoolId: res.user.schoolId, className: res.user.className
                    }));
                }
                setTimeout(() => window.location.reload(), 1200);
            }
        } catch (err: any) {
            setJoinError(err.message || "Gửi yêu cầu thất bại. Vui lòng kiểm tra lại mã mời.");
        } finally {
            setJoinLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Layout currentPath="/join-school">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-8">
                
                {user.schoolId ? (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm backdrop-blur-md">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                        <School className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> Đã tham gia trường học
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tổ chức giáo dục</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Vai trò của bạn: {user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'} {user.className ? `- Lớp ${user.className}` : ''}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (window.confirm("Bạn có chắc chắn muốn rời khỏi trường học hiện tại? Tài khoản của bạn sẽ mất các đặc quyền Pro được cấp từ trường.")) {
                                            const stored = localStorage.getItem("edu_tech_user");
                                            if (stored) {
                                                const curr = JSON.parse(stored);
                                                localStorage.setItem("edu_tech_user", JSON.stringify({
                                                    ...curr, role: "user", schoolId: null, className: null
                                                }));
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                    className="px-5 py-2.5 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20 whitespace-nowrap"
                                >
                                    Rời khỏi trường
                                </button>
                            </div>
                        </div>

                        {/* Smaller participation hero */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-6 sm:p-8 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-black leading-tight text-slate-900 dark:text-white">
                                        Tham gia trường khác
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-lg leading-relaxed">
                                        Bạn cần rời khỏi trường hiện tại trước khi có thể tham gia vào một tổ chức giáo dục mới.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Hero Header ── */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 p-8 sm:p-10 text-white shadow-2xl shadow-teal-500/20">
                    {/* Decorative blobs */}
                    <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-16 -left-8 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm shrink-0">
                            <School className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-black uppercase tracking-widest bg-white/15 border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    Dành cho Học sinh &amp; Giáo viên
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black leading-tight">
                                Tham gia Trường học
                            </h1>
                            <p className="text-teal-100 text-sm mt-2 max-w-lg leading-relaxed">
                                Liên kết tài khoản với tổ chức giáo dục của bạn để nhận gói <strong className="text-white">Pro miễn phí</strong> và
                                truy cập toàn bộ tài liệu premium được trường cấp phép.
                            </p>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="relative z-10 mt-8 grid grid-cols-3 gap-4">
                        {[
                            { label: "Gói Pro", value: "Miễn phí" },
                            { label: "Tài liệu", value: "Không giới hạn" },
                            { label: "Kích hoạt", value: "Tức thì" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
                                <div className="text-lg font-black text-white leading-none">{s.value}</div>
                                <div className="text-[10px] text-teal-100 font-semibold uppercase tracking-wider mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                    {/* ── Left Column ── */}
                    <div className="space-y-6">

                        {/* Benefits */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm backdrop-blur-md">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-5">
                                <Star className="w-4 h-4 text-amber-500" />
                                Quyền lợi khi tham gia
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {BENEFITS.map((b) => {
                                    const colors = colorMap[b.color].split(" ");
                                    const iconBg = `${colors[2]} ${colors[3]}`;
                                    const iconText = `${colors[1]} ${colors[2] ? '' : ''}`;
                                    const borderCls = `border ${colors[4]} ${colors[5] ?? ''}`;
                                    return (
                                        <div
                                            key={b.title}
                                            className={`flex gap-3 p-4 rounded-2xl border ${
                                                b.color === "amber"   ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" :
                                                b.color === "indigo"  ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20" :
                                                b.color === "teal"    ? "bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20" :
                                                                        "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                                            } transition-all hover:scale-[1.01] cursor-default`}
                                        >
                                            <div className={`shrink-0 p-2 rounded-xl ${
                                                b.color === "amber"   ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                                                b.color === "indigo"  ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                                                b.color === "teal"    ? "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400" :
                                                                        "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                            }`}>
                                                <b.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{b.title}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm backdrop-blur-md">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-5">
                                <Info className="w-4 h-4 text-indigo-500" />
                                Quy trình tham gia
                            </h2>
                            <div className="space-y-4">
                                {STEPS.map((step, idx) => (
                                    <div key={step.num} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white text-sm font-black flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
                                                {step.num}
                                            </div>
                                            {idx < STEPS.length - 1 && (
                                                <div className="w-px flex-1 bg-gradient-to-b from-teal-300 to-transparent dark:from-teal-700 mt-2" />
                                            )}
                                        </div>
                                        <div className="pb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <step.icon className="w-4 h-4 text-teal-500" />
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Info note */}
                            <div className="mt-4 p-3.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl flex gap-2.5 items-start">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                                    Sau khi bị xóa khỏi trường, tài khoản sẽ <strong>tự động hoàn trả</strong> về gói dịch vụ bạn có trước khi tham gia (Free, Basic hoặc Pro nếu còn hạn).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Form ── */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm backdrop-blur-md sticky top-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
                                    <School className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white">Điền thông tin</h2>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Nhập mã mời của trường bạn</p>
                                </div>
                            </div>

                            {/* Success banner */}
                            {joinSuccess && (
                                <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-2xl flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-300">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{joinSuccess}</span>
                                </div>
                            )}

                            {/* Error banner */}
                            {joinError && (
                                <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-2xl flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-300">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{joinError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Invite code */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Mã mời trường học <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            ref={codeInputRef}
                                            type="text"
                                            required
                                            placeholder="Ví dụ: NGUYENDU2026"
                                            value={schoolCode}
                                            onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                                            className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white focus:border-teal-500 text-sm uppercase font-mono tracking-widest transition-colors min-w-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowScanner(true)}
                                            className="shrink-0 p-3.5 bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20 rounded-2xl border border-teal-200 dark:border-teal-500/20 transition-all hover:scale-105 active:scale-95"
                                            title="Quét mã QR"
                                        >
                                            <ScanLine className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                        Hoặc bấm vào icon camera để quét mã QR từ trường
                                    </p>
                                </div>

                                {/* Role */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Vai trò ứng tuyển
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(["student", "teacher"] as const).map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setRequestedRole(r)}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-sm font-bold transition-all ${
                                                    requestedRole === r
                                                        ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20"
                                                        : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-500/30"
                                                }`}
                                            >
                                                {r === "student" ? <GraduationCap className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                                {r === "student" ? "Học sinh" : "Giáo viên"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Class (students only) */}
                                {requestedRole === "student" && (
                                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Lớp học <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: 12A1, 10A5..."
                                            value={requestedClass}
                                            onChange={(e) => setRequestedClass(e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white focus:border-teal-500 text-sm transition-colors"
                                        />
                                    </div>
                                )}

                                {/* Current user info */}
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black text-sm shrink-0">
                                        {user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <span className="ml-auto shrink-0 text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
                                        {user?.plan || "Free"}
                                    </span>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={joinLoading || !schoolCode.trim()}
                                    className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {joinLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang gửi yêu cầu...
                                        </>
                                    ) : (
                                        <>
                                            Gửi yêu cầu tham gia
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="my-5 flex items-center gap-3">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">hoặc</span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                            </div>

                            {/* QR trigger big */}
                            <button
                                onClick={() => setShowScanner(true)}
                                className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950/40 hover:bg-teal-50 dark:hover:bg-teal-500/10 border border-slate-200 dark:border-white/10 hover:border-teal-300 dark:hover:border-teal-500/30 rounded-2xl transition-all group"
                            >
                                <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 group-hover:border-teal-300 dark:group-hover:border-teal-500/30 transition-colors">
                                    <QrCode className="w-5 h-5 text-teal-500" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Quét mã QR từ trường</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Mở camera và hướng vào mã QR của trường học</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )}

            {/* ── QR Scanner Modal ── */}
            {showScanner && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal header */}
                        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400">
                                    <ScanLine className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Quét mã QR</h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Hướng camera vào mã QR của trường</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowScanner(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-slate-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Scanner area */}
                        <div className="aspect-square w-full bg-slate-950 relative">
                            <Scanner
                                onScan={(result) => {
                                    if (result && result.length > 0) {
                                        try {
                                            const scannedUrl = new URL(result[0].rawValue);
                                            const joinParam = scannedUrl.searchParams.get("join") || scannedUrl.searchParams.get("code");
                                            if (joinParam) {
                                                setSchoolCode(joinParam.toUpperCase());
                                                setShowScanner(false);
                                                return;
                                            }
                                        } catch {
                                            if (result[0].rawValue) {
                                                setSchoolCode(result[0].rawValue.toUpperCase());
                                                setShowScanner(false);
                                            }
                                        }
                                    }
                                }}
                                onError={(error) => console.error(error)}
                            />
                            {/* Scan frame overlay */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-white/40 rounded-2xl relative">
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-lg" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Mã QR sẽ được nhận dạng tự động và điền vào ô nhập mã mời.
                            </p>
                        </div>
                    </div>
                </div>
            )}
</div>
        </Layout>
    );
}
