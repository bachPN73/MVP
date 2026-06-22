import { Layout } from '../layout/MainLayout';
import {
    BookOpen, FlaskConical, Sprout, Sparkles, ChevronRight,
    PlayCircle, Box, Compass, ShieldCheck, Clock, Crown,
    School, Search, Layers, Calculator, Cpu, Atom, Zap,
    Eye, Leaf, Dna, Globe, Activity, Rotate3d, Library,
    BookMarked, Users, ArrowUpRight, BarChart3, Key, Flame,
    ChevronLeft, Star, Trophy, GraduationCap, Map, Bot
} from 'lucide-react';
import { Link } from 'react-router';
import { materials as mockMaterials, getSubjectName, Material, formatRelativeTime } from '../data/materialsData';
import { useState, useEffect, useMemo } from 'react';
import { api, BASE_URL } from '../api';
import LatexText from '../components/LatexText';

export default function Dashboard() {
    const [allMaterials, setAllMaterials] = useState<Material[]>(mockMaterials);
    const [userName, setUserName] = useState('Học sinh');
    const [userPlan, setUserPlan] = useState('free');
    const [daysRemaining, setDaysRemaining] = useState(30);
    const [recentIdx, setRecentIdx] = useState(0);

    // School Panel States
    const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
    const [schoolInfo, setSchoolInfo] = useState<any>(null);
    const [classmates, setClassmates] = useState<any[]>([]);
    const [userRole, setUserRole] = useState('student');
    const [userClassName, setUserClassName] = useState('');

    useEffect(() => {
        let currentUser: any = null;
        try {
            const stored = localStorage.getItem('edu_tech_user');
            if (stored) {
                currentUser = JSON.parse(stored);
                if (currentUser.name) setUserName(currentUser.name);
                if (currentUser.plan) setUserPlan(currentUser.plan.toLowerCase());
                if (currentUser.role) setUserRole(currentUser.role);
                if (currentUser.className) setUserClassName(currentUser.className);
                if (currentUser.schoolId) setUserSchoolId(currentUser.schoolId);

                if (currentUser.createdAt) {
                    const createdDate = new Date(currentUser.createdAt);
                    const planStr = (currentUser.plan || 'free').toLowerCase();
                    const durationDays = planStr === 'demo' ? 1 : planStr === 'free' ? 7 : 30;
                    const expiryDate = new Date(createdDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
                    const diffTime = expiryDate.getTime() - Date.now();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setDaysRemaining(diffDays > 0 ? diffDays : durationDays);
                }
            }
        } catch (e) { }

        const loadSchoolData = (schoolId: string, userId: string, role: string) => {
            api.getSchoolSummary(schoolId)
                .then(s => setSchoolInfo(s))
                .catch(err => console.error("Error fetching school summary on dashboard:", err));

            if (role === 'admin') {
                api.getUsers()
                    .then(usersList => {
                        const list = usersList.filter((u: any) => u.schoolId === schoolId && u.id !== userId);
                        setClassmates(list);
                    })
                    .catch(err => console.error("Error fetching school members on dashboard:", err));
            } else {
                setClassmates([]);
            }
        };

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
                            setUserClassName(updatedUser.className);
                            setUserSchoolId(updatedUser.schoolId);
                            if (updatedUser.role === 'school-admin' && updatedUser.schoolId) {
                                loadSchoolData(updatedUser.schoolId, updatedUser.id, updatedUser.role);
                            }
                        }
                    }
                })
                .catch(err => console.error("Error syncing profile state on dashboard:", err));
        }

        if (currentUser && currentUser.role === 'school-admin' && currentUser.schoolId) {
            setUserSchoolId(currentUser.schoolId);
            loadSchoolData(currentUser.schoolId, currentUser.id, currentUser.role);
        }

        const fetchModels = async () => {
            try {
                const dbModels = await api.getModels();
                const formatted: Material[] = dbModels.map((m: any) => ({
                    id: `db-${m.id}`,
                    title: m.title,
                    subject: m.subject,
                    type: m.type || '3d-model',
                    description: m.description,
                    thumbnail: m.thumbnail
                        ? (m.thumbnail.startsWith('http') ? m.thumbnail : `${BASE_URL}${m.thumbnail}`)
                        : '3d-placeholder',
                    tags: m.tags || [],
                    grade: m.grade || 10,
                    createdAt: m.createdAt || m.created_at
                }));
                setAllMaterials([...mockMaterials, ...formatted]);
            } catch (error) {
                console.error("Error fetching models for dashboard:", error);
            }
        };
        fetchModels();
    }, []);

    const recentMaterials = useMemo(() => allMaterials.slice(0, 8), [allMaterials]);

    const greetingTime = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    }, []);

    const subjects = useMemo(() => [
        {
            id: 'biology',
            name: 'Sinh học',
            icon: Sprout,
            progress: 90,
            desc: 'Khám phá sự sống diệu kỳ',
            count: allMaterials.filter(m => m.subject === 'biology').length,
            gradient: 'from-emerald-500 to-teal-600',
            lightBg: 'bg-emerald-50',
            darkBg: 'dark:bg-emerald-950/20',
            border: 'border-emerald-200/70 dark:border-emerald-500/20',
            hoverBorder: 'hover:border-emerald-400/60 dark:hover:border-emerald-400/40',
            progressColor: '#10b981',
            badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
            glow: 'hover:shadow-emerald-200/50 dark:hover:shadow-emerald-500/10',
        },
        {
            id: 'physics',
            name: 'Vật lý',
            icon: Atom,
            progress: 75,
            desc: 'Khám phá động lực vũ trụ',
            count: allMaterials.filter(m => m.subject === 'physics').length,
            gradient: 'from-blue-500 to-indigo-600',
            lightBg: 'bg-blue-50',
            darkBg: 'dark:bg-blue-950/20',
            border: 'border-blue-200/70 dark:border-blue-500/20',
            hoverBorder: 'hover:border-blue-400/60 dark:hover:border-blue-400/40',
            progressColor: '#3b82f6',
            badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
            glow: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-500/10',
        },
        {
            id: 'chemistry',
            name: 'Hóa học',
            icon: FlaskConical,
            progress: 70,
            desc: 'Khám phá liên kết chất',
            count: allMaterials.filter(m => m.subject === 'chemistry').length,
            gradient: 'from-violet-500 to-purple-600',
            lightBg: 'bg-violet-50',
            darkBg: 'dark:bg-violet-950/20',
            border: 'border-violet-200/70 dark:border-violet-500/20',
            hoverBorder: 'hover:border-violet-400/60 dark:hover:border-violet-400/40',
            progressColor: '#8b5cf6',
            badgeBg: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
            glow: 'hover:shadow-violet-200/50 dark:hover:shadow-violet-500/10',
        },
    ], [allMaterials]);

    const isPremiumPlan = ['premium', 'pro', 'school', 'combo', 'basic', 'demo'].includes(userPlan);
    const isSchoolAdmin = userRole === 'school-admin';

    const planConfig: Record<string, { label: string; icon: any; colorClass: string; barColor: string; bgClass: string; borderClass: string; textClass: string }> = {
        free: { label: "FREE", icon: Compass, colorClass: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10", barColor: "from-slate-400 to-slate-500", bgClass: "bg-slate-50 dark:bg-slate-800/30", borderClass: "border-slate-200 dark:border-white/8", textClass: "text-slate-600 dark:text-slate-300" },
        demo: { label: "DEMO", icon: Zap, colorClass: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25", barColor: "from-rose-500 to-pink-500", bgClass: "bg-rose-50/60 dark:bg-rose-950/20", borderClass: "border-rose-200/60 dark:border-rose-500/20", textClass: "text-rose-700 dark:text-rose-400" },
        basic: { label: "BASIC", icon: Zap, colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/25", barColor: "from-blue-500 to-cyan-500", bgClass: "bg-blue-50/60 dark:bg-blue-950/20", borderClass: "border-blue-200/60 dark:border-blue-500/20", textClass: "text-blue-700 dark:text-blue-400" },
        pro: { label: "PRO", icon: Crown, colorClass: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25", barColor: "from-amber-400 to-orange-500", bgClass: "bg-amber-50/60 dark:bg-amber-950/20", borderClass: "border-amber-200/60 dark:border-amber-500/20", textClass: "text-amber-700 dark:text-amber-400" },
        combo: { label: "COMBO", icon: Globe, colorClass: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/25", barColor: "from-orange-500 to-amber-400", bgClass: "bg-orange-50/60 dark:bg-orange-950/20", borderClass: "border-orange-200/60 dark:border-orange-500/20", textClass: "text-orange-700 dark:text-orange-400" },
        school: { label: "SCHOOL", icon: School, colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25", barColor: "from-emerald-500 to-teal-500", bgClass: "bg-emerald-50/60 dark:bg-emerald-950/20", borderClass: "border-emerald-200/60 dark:border-emerald-500/20", textClass: "text-emerald-700 dark:text-emerald-400" },
    };

    const resolvedUserPlan = userPlan === 'premium' ? 'pro' : userPlan;
    const currentPlanConfig = planConfig[resolvedUserPlan] || planConfig.free;
    const PlanIcon = currentPlanConfig.icon;

    const quickActions = [
        { id: 'guide', label: 'Hướng dẫn', icon: Map, to: '/guide', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/60 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300' },
        { id: 'library', label: 'Thư viện', icon: Library, to: '/library', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200/60 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-300' },
        { id: 'ai', label: 'Tìm kiếm AI', icon: Bot, to: '/find-ai', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200/60 dark:border-violet-500/20', text: 'text-violet-700 dark:text-violet-300' },
        { id: 'profile', label: 'Hồ sơ', icon: GraduationCap, to: '/profile', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200/60 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-300' },
    ];

    // Visible slice of recent materials (carousel)
    const visibleCount = 4;
    const maxIdx = Math.max(0, recentMaterials.length - visibleCount);

    return (
        <Layout>
            {/* Ambient decorative blobs */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-400/6 dark:bg-emerald-500/8 blur-3xl" />
                <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-blue-400/5 dark:bg-blue-500/7 blur-3xl" />
                <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-400/4 dark:bg-violet-500/6 blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-5 w-full h-full max-w-[110rem] mx-auto flex flex-col gap-4 animate-in fade-in duration-300 xl:h-[calc(100vh-2rem)] xl:max-h-[calc(100vh-2rem)] xl:overflow-hidden">

                {isSchoolAdmin ? (
                    /* ================= SCHOOL ADMIN LAYOUT ================= */
                    <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-slate-900 shadow-sm flex-shrink-0">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500" />
                            <div className="p-5 md:p-7 flex flex-col md:flex-row items-center justify-between gap-5">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/25">
                                        <ShieldCheck className="w-3 h-3" />
                                        School Control Unit
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                        Chào Quản trị viên <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">{userName}</span>
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                                        Hệ thống quản lý tài khoản trường học và bản quyền Premium.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {userSchoolId && schoolInfo && (
                            <div className="rounded-2xl border border-teal-200/40 dark:border-teal-500/20 bg-white dark:bg-slate-900 p-5 md:p-7 shadow-sm space-y-5 relative overflow-hidden flex-1 min-h-0 flex flex-col">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/8 shrink-0">
                                    <div>
                                        <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <School className="w-3.5 h-3.5" /> Cổng thông tin Trường học
                                        </p>
                                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{schoolInfo.name || 'Đang cập nhật'}</h2>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/25">
                                            Mã: {schoolInfo.schoolCode || '--'}
                                        </span>
                                        <Link id="btn-school-dashboard" to="/school/dashboard"
                                            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-1.5">
                                            <School className="w-3.5 h-3.5" /> Quản lý trường <ArrowUpRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
                                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 rounded-xl p-4 space-y-4">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                                            <BarChart3 className="w-3.5 h-3.5 text-teal-500" /> Thông tin niên khóa
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                    <span>Giáo viên</span>
                                                    <span>{schoolInfo.teacherSeatsUsed || 0} / {schoolInfo.teacherQuota || 5}</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                                    <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-700"
                                                        style={{ width: `${Math.min(100, ((schoolInfo.teacherSeatsUsed || 0) / (schoolInfo.teacherQuota || 5)) * 100)}%` }} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                    <span>Học sinh</span>
                                                    <span>{schoolInfo.studentSeatsUsed || 0} / {schoolInfo.studentQuota || 10}</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all duration-700"
                                                        style={{ width: `${Math.min(100, ((schoolInfo.studentSeatsUsed || 0) / (schoolInfo.studentQuota || 10)) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 rounded-xl p-4 flex flex-col gap-3">
                                        <h3 className="font-bold text-slate-700 dark:text-white text-xs uppercase tracking-wider flex items-center justify-between">
                                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-500" /> Thành viên ({classmates.length + 1})</span>
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium normal-case">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Active
                                            </span>
                                        </h3>
                                        <div className="flex-1 flex flex-wrap gap-2 overflow-y-auto custom-scrollbar pr-1 min-h-0">
                                            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200/50 dark:bg-teal-500/10 dark:border-teal-500/20 px-3 py-1.5 rounded-lg">
                                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                                                    {userName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-white">{userName}</span>
                                                <span className="text-[9px] text-teal-600 dark:text-teal-400 font-bold">(Bạn)</span>
                                            </div>
                                            {classmates.map((member) => (
                                                <div key={member.id} className="flex items-center gap-2 bg-white border border-slate-200/60 dark:bg-slate-900/60 dark:border-white/5 px-3 py-1.5 rounded-lg">
                                                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                                        {(member.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{member.name}</span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${member.role === 'teacher' ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
                                                        {member.role === 'teacher' ? 'GV' : member.className || 'HS'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-white/5">
                                            <Sparkles className="w-3.5 h-3.5" /> Đã kích hoạt quyền lợi học tập không giới hạn
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ================= REGULAR USER LAYOUT ================= */
                    <>
                        {/* ── TOP HERO BANNER ── */}
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-white/8 bg-white dark:bg-slate-900 shadow-md shrink-0">
                            {/* Top gradient accent bar */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
                            {/* Decorative BG blobs inside card */}
                            <div className="absolute top-0 right-0 w-64 h-full pointer-events-none overflow-hidden">
                                <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-emerald-400/8 dark:bg-emerald-500/10 blur-2xl" />
                                <div className="absolute top-4 right-16 w-32 h-32 rounded-full bg-indigo-400/6 dark:bg-indigo-500/8 blur-xl" />
                            </div>

                            <div className="relative p-4 md:p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                                {/* Left: User greeting */}
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg
                                        ${userRole === 'admin'
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200/50 dark:shadow-amber-500/20'
                                            : userRole === 'teacher'
                                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200/50 dark:shadow-emerald-500/20'
                                            : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-200/50 dark:shadow-indigo-500/20'
                                        }`}>
                                        {userRole === 'admin' ? <Crown className="w-6 h-6" /> : userRole === 'teacher' ? <School className="w-6 h-6" /> : <Compass className="w-6 h-6" strokeWidth={2} />}
                                        {/* Online dot */}
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{greetingTime}</span>
                                            {userSchoolId && schoolInfo && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-500/20">
                                                    <School className="h-2.5 w-2.5" /> {schoolInfo.name}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                                            Chào <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">{userName}</span> 👋
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            <span className={`rounded-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border
                                                ${userRole === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
                                                : userRole === 'teacher' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                                                : 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20'}`}>
                                                {userRole === 'admin' ? 'Quản trị viên' : userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                            </span>
                                            {userClassName && (
                                                <span className="rounded-lg border border-slate-200/60 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                    Lớp {userClassName}
                                                </span>
                                            )}
                                            <span className={`rounded-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${currentPlanConfig.colorClass}`}>
                                                {currentPlanConfig.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Khám phá mô hình {allMaterials.length} học liệu, rồi dùng AI để em học liệu thao cần.</p>
                                    </div>
                                </div>

                                {/* Right: Stats HUD */}
                                <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto md:min-w-[20rem]">
                                    <div className="rounded-xl border border-blue-100 dark:border-blue-500/15 bg-blue-50/80 dark:bg-blue-950/20 p-3 text-center hover:border-blue-300/60 dark:hover:border-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                                        <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                                            <Box className="w-3 h-3" />
                                            <span className="text-[9px] font-bold uppercase tracking-wide">Sy Mạn</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{allMaterials.length}</p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 dark:border-emerald-500/15 bg-emerald-50/80 dark:bg-emerald-950/20 p-3 text-center hover:border-emerald-300/60 dark:hover:border-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                                        <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[9px] font-bold uppercase tracking-wide">Thời hạn</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                            {isPremiumPlan ? daysRemaining : '∞'}
                                        </p>
                                        {isPremiumPlan && <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">ngày</p>}
                                    </div>
                                    <div className={`rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm ${currentPlanConfig.borderClass} ${currentPlanConfig.bgClass}`}>
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <PlanIcon className={`w-3 h-3 ${currentPlanConfig.textClass}`} />
                                            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Gói</span>
                                        </div>
                                        <p className={`text-sm font-black uppercase tracking-wide leading-none ${currentPlanConfig.textClass}`}>
                                            {currentPlanConfig.label}
                                        </p>
                                        <p className="flex items-center justify-center gap-0.5 mt-1">
                                            {[1,2,3].map(i => <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── MAIN GRID ── */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0 overflow-y-auto xl:overflow-hidden custom-scrollbar pr-1">

                            {/* ── LEFT COLUMN: 8/12 ── */}
                            <div className="xl:col-span-8 flex flex-col gap-4 min-h-0">

                                {/* SECTION: Môn học & Chương trình */}
                                <div className="shrink-0">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
                                        <h2 className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Môn học & Chương trình</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {subjects.map((subject) => {
                                            const Icon = subject.icon;
                                            const circumference = 2 * Math.PI * 22;
                                            const strokeDashoffset = circumference - (subject.progress / 100) * circumference;
                                            return (
                                                <Link
                                                    id={`card-subject-${subject.id}`}
                                                    key={subject.id}
                                                    to={`/library?subject=${subject.id}`}
                                                    className={`group relative overflow-hidden rounded-2xl ${subject.lightBg} ${subject.darkBg} border ${subject.border} ${subject.hoverBorder} shadow-sm hover:shadow-lg ${subject.glow} transition-all duration-300 hover:-translate-y-1`}
                                                >
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                                                <Icon className="w-5 h-5" strokeWidth={2} />
                                                            </div>
                                                            {/* Progress ring */}
                                                            <div className="relative w-12 h-12">
                                                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 60 60">
                                                                    <circle cx="30" cy="30" r="22" fill="none" strokeWidth="3.5" className="stroke-slate-200/80 dark:stroke-white/10" />
                                                                    <circle cx="30" cy="30" r="22" fill="none" strokeWidth="4" strokeLinecap="round"
                                                                        stroke={subject.progressColor}
                                                                        style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s ease' }} />
                                                                </svg>
                                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-slate-200">{subject.progress}%</span>
                                                            </div>
                                                        </div>
                                                        <h3 className="text-sm font-black text-slate-800 dark:text-white mb-0.5">{subject.name}</h3>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{subject.desc}</p>
                                                        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5">
                                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${subject.badgeBg}`}>{subject.count} học liệu</span>
                                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100/80 text-slate-500 dark:bg-white/5 dark:text-slate-400">3 chủ đề</span>
                                                        </div>
                                                    </div>
                                                    {/* Hover shimmer effect */}
                                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* SECTION: Khám phá (Search + Quick Actions) */}
                                <div className="shrink-0 rounded-2xl border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-900 shadow-sm p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                                        <h2 className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Khám phá</h2>
                                    </div>
                                    {/* Search bar */}
                                    <Link to="/find-ai" className="flex items-center gap-3 w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/8 rounded-xl px-4 py-3 mb-4 hover:border-indigo-300/60 dark:hover:border-indigo-500/40 transition-all hover:shadow-sm group">
                                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors shrink-0" />
                                        <span className="text-sm text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">Mô hình tế bào...</span>
                                        <span className="ml-auto text-[9px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/20 shrink-0">AI</span>
                                    </Link>
                                    {/* Quick action grid */}
                                    <div className="grid grid-cols-4 gap-2.5">
                                        {quickActions.map((action) => {
                                            const Icon = action.icon;
                                            return (
                                                <Link
                                                    key={action.id}
                                                    id={`quick-action-${action.id}`}
                                                    to={action.to}
                                                    className={`group flex flex-col items-center gap-2 p-3 rounded-xl border ${action.bg} ${action.border} hover:shadow-md transition-all duration-250 hover:-translate-y-0.5`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className={`text-[10px] font-bold ${action.text} text-center leading-tight`}>{action.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* SECTION: Tiếp tục học tập (Carousel) */}
                                <div className="flex-1 flex flex-col min-h-0 gap-2.5">
                                    <div className="flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                                            <h2 className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Tiếp tục học tập</h2>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setRecentIdx(Math.max(0, recentIdx - 1))}
                                                disabled={recentIdx === 0}
                                                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/8 border border-slate-200/60 dark:border-white/8 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/15 disabled:opacity-30 transition-all cursor-pointer"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setRecentIdx(Math.min(maxIdx, recentIdx + 1))}
                                                disabled={recentIdx >= maxIdx}
                                                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/8 border border-slate-200/60 dark:border-white/8 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/15 disabled:opacity-30 transition-all cursor-pointer"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                            <Link id="link-view-all-materials" to="/library" className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                                Xem tất cả →
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-hidden">
                                        {recentMaterials.slice(recentIdx, recentIdx + visibleCount).map((material) => {
                                            const subjectColors: Record<string, { badge: string; overlay: string }> = {
                                                biology: { badge: 'bg-emerald-500', overlay: 'from-emerald-900/40' },
                                                physics: { badge: 'bg-blue-500', overlay: 'from-blue-900/40' },
                                                chemistry: { badge: 'bg-violet-500', overlay: 'from-violet-900/40' },
                                            };
                                            const sc = subjectColors[material.subject] || subjectColors.biology;
                                            const SubjectIcon = material.subject === 'physics' ? Atom : material.subject === 'chemistry' ? FlaskConical : Sprout;

                                            return (
                                                <Link
                                                    id={`link-recent-material-${material.id}`}
                                                    key={material.id}
                                                    to={`/material/${material.id}`}
                                                    className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1.5"
                                                >
                                                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden">
                                                        {material.thumbnail && material.thumbnail !== '3d-placeholder' ? (
                                                            <img loading="lazy" decoding="async" src={material.thumbnail} alt={material.title}
                                                                className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-500" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                                                                <Box className="w-8 h-8 text-indigo-200 dark:text-indigo-800" />
                                                            </div>
                                                        )}
                                                        {/* Gradient overlay on hover */}
                                                        <div className={`absolute inset-0 bg-gradient-to-t ${sc.overlay} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                                        {/* Badges */}
                                                        <div className="absolute top-2 left-2 flex gap-1">
                                                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold shadow-sm uppercase text-white ${sc.badge}`}>{getSubjectName(material.subject)}</span>
                                                            <span className="px-1.5 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-md text-[8px] font-bold text-slate-700 dark:text-slate-200 shadow-sm uppercase">
                                                                {material.type === '3d-model' ? '3D' : 'INFO'}
                                                            </span>
                                                        </div>
                                                        {/* Play button */}
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                            <div className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">
                                                                <PlayCircle className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-2.5 flex flex-col gap-1">
                                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[11px] line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                                            <LatexText text={material.title} />
                                                        </h3>
                                                        <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                                                            <span className="flex items-center gap-0.5 uppercase tracking-wide">
                                                                <SubjectIcon className="w-2.5 h-2.5 text-indigo-400" /> Khối {material.grade}
                                                            </span>
                                                            <span className="flex items-center gap-0.5">
                                                                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> {formatRelativeTime(material.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ── RIGHT COLUMN: 4/12 ── */}
                            <div className="xl:col-span-4 flex flex-col gap-4 min-h-0">

                                {/* Plan & Brand card */}
                                <div className="rounded-2xl border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-900 shadow-sm p-4 shrink-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-11 w-11 overflow-hidden rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-slate-800 shadow-sm p-1.5 shrink-0">
                                            <img src="/edutech_logo_new.jpg" alt="EduTech Logo" className="h-full w-full object-contain rounded-md" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Edu Tech Ecosystem</p>
                                            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Trung tâm học tập</h2>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-white/6 pt-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gói hiện tại</span>
                                            <span className={`rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border ${currentPlanConfig.colorClass}`}>
                                                {currentPlanConfig.label}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
                                            <div className={`h-full rounded-full bg-gradient-to-r ${currentPlanConfig.barColor} transition-all duration-700`} style={{ width: '100%' }} />
                                        </div>
                                        {!isPremiumPlan && (
                                            <Link to="/pricing" className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-3 py-2.5 text-[11px] font-bold text-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                                                <Zap className="w-3.5 h-3.5" /> Nâng cấp ngay <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Study Blueprint */}
                                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/8 shadow-sm flex-1 min-h-0 flex flex-col p-4">
                                    {/* Decorative top gradient */}
                                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
                                    <div className="shrink-0 mb-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Study Blueprint</span>
                                        </div>
                                        <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Chiến thuật học tập hiệu quả</h2>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                            Áp dụng phương pháp Pomodoro 25 phút tập trung để tối ưu khả năng ghi nhớ.
                                        </p>
                                    </div>

                                    <div className="flex-grow divide-y divide-slate-100 dark:divide-white/5 overflow-y-auto custom-scrollbar min-h-0">
                                        {([
                                            { n: 1, title: 'Mở mô hình 3D', desc: 'Xoay, thu phóng và phân rã các lớp tế bào cấu trúc.', gradient: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600 dark:text-blue-400' },
                                            { n: 2, title: 'Hỏi AI chi tiết', desc: 'Yêu cầu giải thích chi tiết chức năng của các bào quan.', gradient: 'from-violet-500 to-purple-600', textColor: 'text-violet-600 dark:text-violet-400' },
                                            { n: 3, title: 'Lưu nội dung bài', desc: 'Đánh dấu bookmark mô hình quan trọng để ôn trước kỳ thi.', gradient: 'from-amber-400 to-orange-500', textColor: 'text-amber-600 dark:text-amber-400' },
                                        ] as const).map(({ n, title, desc, gradient, textColor }) => (
                                            <div key={n} className="py-2.5 flex items-start gap-3 group/step">
                                                <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-[10px] font-black shrink-0 text-white bg-gradient-to-br ${gradient} shadow-sm group-hover/step:scale-110 transition-transform`}>{n}</span>
                                                <div>
                                                    <p className={`text-[11px] font-bold ${textColor} leading-snug`}>{title}</p>
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Link id="btn-start-pomodoro" to={recentMaterials[0] ? `/material/${recentMaterials[0].id}` : '/library'}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200 shrink-0">
                                        <span>Bắt đầu phiên học tập</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                {/* Recent material thumbnails mini-grid */}
                                <div className="rounded-2xl border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-900 shadow-sm p-4 shrink-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-rose-400 to-pink-500" />
                                            <h2 className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Mới nhất</h2>
                                        </div>
                                        <Link to="/library" className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hover:underline">Xem thêm</Link>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {recentMaterials.slice(4, 7).map((m) => (
                                            <Link key={m.id} to={`/material/${m.id}`} className="group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-white/5 hover:border-indigo-300/60 dark:hover:border-indigo-500/30 transition-all hover:shadow-md hover:-translate-y-0.5">
                                                {m.thumbnail && m.thumbnail !== '3d-placeholder' ? (
                                                    <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                                                        <Box className="w-5 h-5 text-indigo-300 dark:text-indigo-700" />
                                                    </div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
