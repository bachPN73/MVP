import { Layout } from '../layout/MainLayout';
import { BookOpen, FlaskConical, Sprout, Sparkles, ChevronRight, PlayCircle, Box, Compass, ShieldCheck, Clock, Crown, School, Search, Layers, Calculator, Cpu, Atom, Zap, Eye, Leaf, Dna, Globe, Activity, Rotate3d, Library, BookMarked } from 'lucide-react';
import { Link } from 'react-router';
import { materials as mockMaterials, getSubjectName, Material, formatRelativeTime } from '../data/materialsData';
import { useState, useEffect, useMemo } from 'react';
import { api, BASE_URL } from '../api';

export default function Dashboard() {
    const [allMaterials, setAllMaterials] = useState<Material[]>(mockMaterials);
    const [userName, setUserName] = useState('Học sinh');
    const [userPlan, setUserPlan] = useState('free');
    const [daysRemaining, setDaysRemaining] = useState(30);

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

                // Calculate days remaining dynamically from user creation timestamp
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

        // 1. Sync user session with the latest database record to dynamic adapt to admin plan grants
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

        // 2. Fetch school details if user role is school-admin and schoolId exists
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

    const recentMaterials = useMemo(() => allMaterials.slice(0, 4), [allMaterials]);

    const subjects = useMemo(() => [
        { 
            id: 'physics', 
            name: 'Vật lý', 
            icon: Atom, 
            color: 'from-blue-500 to-cyan-400', 
            bgGradient: 'from-blue-500/10 via-cyan-500/[0.03] to-transparent',
            borderColor: 'border-blue-500/20 dark:border-blue-500/25',
            shadow: 'shadow-blue-500/20', 
            hoverShadow: 'hover:shadow-blue-500/15', 
            hoverBorder: 'hover:border-blue-500/40', 
            glowClass: 'hover-glow-physics',
            progress: 78,
            subtopics: [
                { name: 'Cơ học', icon: Compass, desc: 'Động lực học & Chuyển động' },
                { name: 'Điện từ', icon: Zap, desc: 'Trường điện từ & Dòng điện' },
                { name: 'Quang học', icon: Eye, desc: 'Khúc xạ & Phản xạ ánh sáng' }
            ],
            desc: 'Khám phá động lực vũ trụ',
            count: allMaterials.filter(m => m.subject === 'physics').length 
        },
        { 
            id: 'chemistry', 
            name: 'Hóa học', 
            icon: FlaskConical, 
            color: 'from-emerald-500 to-green-400', 
            bgGradient: 'from-emerald-500/10 via-teal-500/[0.03] to-transparent',
            borderColor: 'border-emerald-500/20 dark:border-emerald-500/25',
            shadow: 'shadow-emerald-500/20', 
            hoverShadow: 'hover:shadow-emerald-500/15', 
            hoverBorder: 'hover:border-emerald-500/40', 
            glowClass: 'hover-glow-chemistry',
            progress: 52,
            subtopics: [
                { name: 'Hữu cơ', icon: Leaf, desc: 'Hợp chất Cacbon & Nhóm chức' },
                { name: 'Vô cơ', icon: Layers, desc: 'Phản ứng kim loại & Phi kim' },
                { name: 'Điện phân', icon: Activity, desc: 'Sự điện li & Chất điện phân' }
            ],
            desc: 'Khám phá liên kết chất',
            count: allMaterials.filter(m => m.subject === 'chemistry').length 
        },
        { 
            id: 'biology', 
            name: 'Sinh học', 
            icon: Sprout, 
            color: 'from-rose-500 to-orange-400', 
            bgGradient: 'from-rose-500/10 via-orange-500/[0.03] to-transparent',
            borderColor: 'border-rose-500/20 dark:border-rose-500/25',
            shadow: 'shadow-rose-500/20', 
            hoverShadow: 'hover:shadow-rose-500/15', 
            hoverBorder: 'hover:border-rose-500/40', 
            glowClass: 'hover-glow-biology',
            progress: 90,
            subtopics: [
                { name: 'Di truyền', icon: Dna, desc: 'Cơ chế di truyền & ADN xoắn' },
                { name: 'Tế bào', icon: Layers, desc: 'Cấu trúc tế bào & Phân bào' },
                { name: 'Sinh thái', icon: Globe, desc: 'Hệ sinh thái & Sinh quyển' }
            ],
            desc: 'Tìm hiểu sự sống diệu kỳ',
            count: allMaterials.filter(m => m.subject === 'biology').length 
        },
    ], [allMaterials]);

    const isPremiumPlan = ['premium', 'pro', 'school', 'combo', 'basic', 'demo'].includes(userPlan);
    const isSchoolAdmin = userRole === 'school-admin';
    const planBgClass = isPremiumPlan
        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30'
        : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30';

    const planConfig: Record<string, { label: string; icon: any; colorClass: string; barColor: string; bgClass: string; borderClass: string; textClass: string }> = {
        free: {
            label: "FREE",
            icon: Compass,
            colorClass: "text-slate-500 dark:text-slate-400 bg-slate-500/10",
            barColor: "from-slate-400 to-slate-500",
            bgClass: "bg-slate-500/5 dark:bg-slate-500/10",
            borderClass: "border-slate-500/20",
            textClass: "text-slate-800 dark:text-slate-200"
        },
        demo: {
            label: "DEMO",
            icon: Zap,
            colorClass: "text-rose-500 bg-rose-500/10",
            barColor: "from-rose-500 to-pink-500",
            bgClass: "bg-rose-500/5 dark:bg-rose-500/10",
            borderClass: "border-rose-500/25",
            textClass: "text-rose-800 dark:text-rose-400"
        },
        basic: {
            label: "BASIC",
            icon: Zap,
            colorClass: "text-blue-500 bg-blue-500/10",
            barColor: "from-blue-500 to-cyan-500",
            bgClass: "bg-blue-500/5 dark:bg-blue-500/10",
            borderClass: "border-blue-500/25",
            textClass: "text-blue-800 dark:text-blue-400"
        },
        pro: {
            label: "PRO",
            icon: Crown,
            colorClass: "text-amber-500 bg-amber-500/10",
            barColor: "from-amber-400 to-orange-500",
            bgClass: "bg-amber-500/5 dark:bg-amber-500/10",
            borderClass: "border-amber-500/25",
            textClass: "text-amber-800 dark:text-amber-400"
        },
        combo: {
            label: "COMBO",
            icon: Globe,
            colorClass: "text-orange-500 bg-orange-500/10",
            barColor: "from-orange-500 to-amber-400",
            bgClass: "bg-orange-500/5 dark:bg-orange-500/10",
            borderClass: "border-orange-500/25",
            textClass: "text-orange-800 dark:text-orange-400"
        },
        school: {
            label: "SCHOOL",
            icon: School,
            colorClass: "text-emerald-500 bg-emerald-500/10",
            barColor: "from-emerald-500 to-teal-500",
            bgClass: "bg-emerald-500/5 dark:bg-emerald-500/10",
            borderClass: "border-emerald-500/25",
            textClass: "text-emerald-800 dark:text-emerald-400"
        }
    };

    const currentPlanConfig = planConfig[userPlan] || planConfig.free;
    const PlanIcon = currentPlanConfig.icon;

    return (
        <Layout>
            <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(180deg,rgba(37,99,235,0.05),transparent_34%),linear-gradient(90deg,rgba(15,118,110,0.04),transparent_45%)] dark:bg-[linear-gradient(180deg,rgba(37,99,235,0.08),transparent_34%),linear-gradient(90deg,rgba(20,184,166,0.06),transparent_45%)]">
            </div>

            <div className="relative z-10 p-4 md:p-5 w-full h-full max-w-[104rem] mx-auto xl:h-[calc(100vh-2rem)] xl:max-h-[calc(100vh-2rem)] xl:overflow-hidden flex flex-col justify-between gap-4 animate-in fade-in duration-300">
                {isSchoolAdmin ? (
                    /* ================= SCHOOL ADMIN LAYOUT ================= */
                    <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto pr-1">
                        {/* 1. Hero Welcome & Search Area */}
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-[#0e1726] border border-white/10 shadow-2xl flex-shrink-0">
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] rounded-full bg-indigo-600/20 blur-3xl"></div>
                                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[120%] rounded-full bg-blue-500/10 blur-3xl"></div>
                            </div>

                            <div className="relative p-6 md:p-8 z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1 space-y-4 w-full">
                                    <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight leading-tight mb-1 font-heading">
                                        Chào Quản trị viên <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">{userName}</span>,
                                    </h1>
                                    <p className="text-slate-200 text-sm md:text-base font-semibold max-w-2xl">
                                        Chào mừng bạn đến với Cổng quản trị trường học. Quản lý tài nguyên, mã mời và phê duyệt thành viên cho trường của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* School Organization Dashboard */}
                        {userSchoolId && schoolInfo && (
                            <div className="rounded-3xl border border-teal-200/60 dark:border-teal-500/20 bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-teal-950/20 dark:to-indigo-950/20 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden flex-1 min-h-0">
                                {/* Decorative glowing backdrops */}
                                <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="absolute -left-20 -top-20 w-60 h-60 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
                                    <div>
                                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest text-xs font-mono">
                                            <School className="w-4.5 h-4.5 animate-pulse" />
                                            Cổng thông tin Trường học
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mt-1 font-heading">
                                            {schoolInfo.name || "Đang cập nhật"}
                                        </h2>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20">
                                            Mã mời: {schoolInfo.schoolCode || "Đang cập nhật"}
                                        </span>
                                        <Link
                                            to="/school/dashboard"
                                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center gap-1.5"
                                        >
                                            <School className="w-3.5 h-3.5 animate-pulse-slow" />
                                            <span>Cổng Quản Trị</span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left: Organization Overview */}
                                    <div className="lg:col-span-1 bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Thông tin niên khóa</h3>
                                            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
                                                Nhà trường đã tài trợ toàn bộ quyền lợi bản quyền Premium cho tài khoản của bạn.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Giáo viên</span>
                                                <p className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5">{schoolInfo.teacherSeatsUsed || 0} / {schoolInfo.teacherQuota || 5}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Học sinh</span>
                                                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{schoolInfo.studentSeatsUsed || 0} / {schoolInfo.studentQuota || 10}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right/Middle: Classmates & Teachers list for admin */}
                                    <div className="lg:col-span-2 bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider mb-3 flex items-center justify-between">
                                                <span>Thành viên cùng trường ({classmates.length + 1})</span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-400 normal-case font-bold font-sans">Đang trực tuyến</span>
                                            </h3>
                                            
                                            <div className="flex flex-wrap gap-3 overflow-y-auto max-h-32 custom-scrollbar pr-2">
                                                <div className="flex items-center gap-2 bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-100 dark:from-teal-500/20 dark:to-indigo-500/20 dark:border-teal-500/30 px-3 py-1.5 rounded-xl shrink-0">
                                                    <div className="w-6 h-6 rounded-lg bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                                        {userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-[11px] font-bold text-slate-800 dark:text-white">
                                                        {userName} <span className="text-[9px] text-teal-600 dark:text-teal-400 font-extrabold uppercase ml-1">(Bạn)</span>
                                                    </div>
                                                </div>

                                                {classmates.map((member) => (
                                                    <div key={member.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 hover:border-slate-200 dark:bg-white/5 dark:border-white/5 dark:hover:border-white/10 px-3 py-1.5 rounded-xl shrink-0 transition-all shadow-sm dark:shadow-none">
                                                        <div className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                                            {(member.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                                            {member.name}
                                                            <span className={`text-[9px] font-extrabold uppercase ml-1.5 ${member.role === 'teacher' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                {member.role === 'teacher' ? 'GV' : member.className || 'HS'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-teal-650 dark:text-teal-400/80 font-black tracking-widest uppercase flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-white/5">
                                            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                            Đã kích hoạt toàn bộ bản quyền học liệu tương tác 3D
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                 ) : (
                    /* ================= REGULAR USER LAYOUT — REDESIGNED ================= */
                    <>
                        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 shrink-0 w-full">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-teal-500 to-amber-400"></div>
                            <div className="relative z-10 grid grid-cols-1 gap-3 p-4 md:grid-cols-[1fr_auto] md:p-5">
                                <div className="flex items-start gap-3">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white shadow-md
                                        ${userRole === 'admin' 
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                                            : userRole === 'teacher'
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                            : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                                        }`}
                                    >
                                        {userRole === 'admin' ? (
                                            <Crown className="w-5 h-5" />
                                        ) : userRole === 'teacher' ? (
                                            <School className="w-5 h-5" />
                                        ) : (
                                            <Compass className="w-5 h-5" strokeWidth={2} />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white font-heading">
                                                Chào {userName}
                                            </h1>
                                            <span className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm
                                                ${userRole === 'admin' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200' 
                                                : userRole === 'teacher' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200'
                                                : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-200'}`}>
                                                {userRole === 'admin' ? 'Quản trị viên' : userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                            </span>
                                            {userClassName && (
                                                <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-200 shadow-sm">
                                                    Lớp {userClassName}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1.5 max-w-2xl text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                                            Khám phá mô hình 3D, rồi dùng AI để tìm học liệu theo cần.
                                        </p>
                                        {userSchoolId && schoolInfo && (
                                            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[9px] font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                                                <div className="w-4 h-4 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0">
                                                    <School className="h-2.5 w-2.5" />
                                                </div>
                                                <span className="truncate">{schoolInfo.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5 md:min-w-[24rem]">
                                    <div className="relative overflow-hidden rounded-lg border border-blue-200/50 dark:border-blue-500/20 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-900/20 p-2.5 shadow-sm">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-300 mb-1">
                                                <div className="p-1 rounded bg-blue-100/60 dark:bg-blue-500/20">
                                                    <Box className="w-3 h-3" />
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-wide">Học liệu</span>
                                            </div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">{allMaterials.length}</p>
                                        </div>
                                    </div>
                                    <div className="relative overflow-hidden rounded-lg border border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-2.5 shadow-sm">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300 mb-1">
                                                <div className="p-1 rounded bg-emerald-100/60 dark:bg-emerald-500/20">
                                                    <Clock className="w-3 h-3" />
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-wide">Thời hạn</span>
                                            </div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">{isPremiumPlan ? daysRemaining : '∞'}</p>
                                        </div>
                                    </div>
                                    <div className={`relative overflow-hidden rounded-lg border p-2.5 shadow-sm
                                        ${userPlan === 'pro' ? 'border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-900/20' :
                                          userPlan === 'demo' ? 'border-rose-200/50 dark:border-rose-500/20 bg-gradient-to-br from-rose-50 to-pink-50/50 dark:from-rose-950/30 dark:to-pink-900/20' :
                                          'border-slate-200/50 dark:border-slate-500/20 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-950/30 dark:to-slate-900/20'}`}>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className={`p-1 rounded ${currentPlanConfig.colorClass}`}>
                                                    <PlanIcon className="w-3 h-3" strokeWidth={2.5} />
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">Gói</span>
                                            </div>
                                            <p className={`text-lg font-black uppercase ${currentPlanConfig.textClass}`}>{currentPlanConfig.label}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Main Grid Content Area — 9/3 ratio */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0 overflow-y-auto xl:overflow-hidden custom-scrollbar pr-1">
                            {/* LEFT COLUMN: 9/12 */}
                            <div className="xl:col-span-9 flex flex-col gap-4 min-h-0">
                                
                                {/* === Subject Cards — Enhanced Educational Design === */}
                                <div className="shrink-0 flex flex-col gap-3.5">
                                    <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5 font-heading">
                                        <div className="p-1 rounded bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
                                            <Box className="w-3 h-3" />
                                        </div>
                                        Môn học & Chương trình
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {subjects.map((subject) => {
                                            const Icon = subject.icon;
                                            const circumference = 2 * Math.PI * 20;
                                            const strokeDashoffset = circumference - (subject.progress / 100) * circumference;
                                            
                                            // Enhanced color mapping for better educational aesthetics
                                            const subjectColors = {
                                                physics: {
                                                    bg: 'from-blue-50 via-cyan-50 to-blue-50/50 dark:from-blue-950/35 dark:via-cyan-950/30 dark:to-blue-950/25',
                                                    border: 'border-blue-200/60 dark:border-blue-500/25',
                                                    icon: 'from-blue-600 to-cyan-500',
                                                    progress: '#0ea5e9',
                                                    hover: 'hover:shadow-blue-500/15 hover:border-blue-300/80 dark:hover:border-blue-400/50'
                                                },
                                                chemistry: {
                                                    bg: 'from-emerald-50 via-green-50 to-emerald-50/50 dark:from-emerald-950/35 dark:via-green-950/30 dark:to-emerald-950/25',
                                                    border: 'border-emerald-200/60 dark:border-emerald-500/25',
                                                    icon: 'from-emerald-600 to-green-500',
                                                    progress: '#10b981',
                                                    hover: 'hover:shadow-emerald-500/15 hover:border-emerald-300/80 dark:hover:border-emerald-400/50'
                                                },
                                                biology: {
                                                    bg: 'from-rose-50 via-pink-50 to-rose-50/50 dark:from-rose-950/35 dark:via-pink-950/30 dark:to-rose-950/25',
                                                    border: 'border-rose-200/60 dark:border-rose-500/25',
                                                    icon: 'from-rose-600 to-pink-500',
                                                    progress: '#f43f5e',
                                                    hover: 'hover:shadow-rose-500/15 hover:border-rose-300/80 dark:hover:border-rose-400/50'
                                                }
                                            };
                                            
                                            const colors = subjectColors[subject.id as keyof typeof subjectColors] || subjectColors.physics;
                                            
                                            return (
                                                <Link
                                                    key={subject.id}
                                                    to={`/library?subject=${subject.id}`}
                                                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${colors.hover}`}
                                                >
                                                    {/* Animated background on hover */}
                                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-white/10 dark:from-white/5 to-transparent pointer-events-none"></div>
                                                    
                                                    <div className="relative z-10 p-4 flex flex-col h-full">
                                                        {/* Top: Icon and Progress */}
                                                        <div className="flex items-start justify-between mb-2.5 gap-2">
                                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.icon} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                                                            </div>
                                                            
                                                            {/* Circular Progress */}
                                                            <div className="relative w-12 h-12 shrink-0">
                                                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
                                                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="2" className="stroke-slate-200/50 dark:stroke-white/10" />
                                                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="2.5" strokeLinecap="round"
                                                                        style={{ 
                                                                            strokeDasharray: circumference, 
                                                                            strokeDashoffset: strokeDashoffset,
                                                                            color: colors.progress,
                                                                            transition: 'stroke-dashoffset 0.5s ease'
                                                                        }} 
                                                                    />
                                                                </svg>
                                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-slate-200">{subject.progress}%</span>
                                                            </div>
                                                        </div>

                                                        {/* Subject Info */}
                                                        <div className="flex-1">
                                                            <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight font-heading mb-0.5">{subject.name}</h3>
                                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-snug mb-2">{subject.desc}</p>
                                                            
                                                            {/* Resource Badges */}
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm border ${
                                                                    subject.id === 'physics' ? 'bg-blue-100 text-blue-700 border-blue-200/50 dark:bg-blue-500/20 dark:text-blue-100 dark:border-blue-500/30' :
                                                                    subject.id === 'chemistry' ? 'bg-emerald-100 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/20 dark:text-emerald-100 dark:border-emerald-500/30' :
                                                                    'bg-rose-100 text-rose-700 border-rose-200/50 dark:bg-rose-500/20 dark:text-rose-100 dark:border-rose-500/30'
                                                                }`}>
                                                                    {subject.count}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm border ${
                                                                    subject.id === 'physics' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500/20' :
                                                                    subject.id === 'chemistry' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20' :
                                                                    'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/20'
                                                                }`}>
                                                                    {subject.subtopics.length} chủ đề
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* === AI Search & Library Cards — Side-by-Side in the Middle === */}
                                <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* AI Search Card */}
                                    <Link
                                        to="/find-ai"
                                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-blue-950/30 border border-indigo-200/60 dark:border-indigo-500/25 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[140px] p-4"
                                    >
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none"></div>

                                        <div className="flex items-start gap-2.5 relative z-10 shrink-0 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shrink-0 text-white group-hover:scale-110 transition-transform duration-300">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-tight font-heading">Tìm kiếm AI</h2>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight font-semibold">
                                                    Hỏi bằng ngôn ngữ tự nhiên
                                                </p>
                                            </div>
                                        </div>

                                        {/* Search Bar Mockup */}
                                        <div className="relative z-10 flex-grow my-1.5 flex flex-col justify-center gap-1.5 select-none min-h-0">
                                            <div className="bg-white/70 dark:bg-white/[0.06] border border-slate-200/60 dark:border-indigo-500/25 rounded-lg py-2 px-3 flex items-center justify-between shadow-sm backdrop-blur-sm group-hover:bg-white dark:group-hover:bg-white/[0.08] transition-colors">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Search className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate flex items-center">
                                                        <span>Cấu trúc tế bào</span>
                                                        <span className="ml-0.5 w-0.5 h-3 bg-indigo-600 dark:bg-indigo-400 animate-cursor-blink shrink-0"></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 items-center">
                                                <span className="text-[8px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-widest flex items-center gap-1">
                                                    💡 Gợi ý:
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-500/20 dark:text-indigo-200 dark:border-indigo-500/40 shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors cursor-pointer">Tế bào</span>
                                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40 shadow-sm hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors cursor-pointer">Lục lạp</span>
                                            </div>
                                        </div>

                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-500/20 px-3 py-1.5 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/30 transition-colors w-max shrink-0 relative z-10 shadow-sm border border-indigo-200/60 dark:border-indigo-500/30">
                                            Tìm kiếm <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </Link>

                                    {/* Library Card */}
                                    <Link
                                        to="/library"
                                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-emerald-950/30 border border-teal-200/60 dark:border-teal-500/25 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[140px] p-4"
                                    >
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-teal-500/5 to-transparent pointer-events-none"></div>

                                        <div className="flex items-start gap-2.5 relative z-10 shrink-0 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shadow-lg shrink-0 text-white group-hover:scale-110 transition-transform duration-300">
                                                <Library className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white font-heading leading-tight">Thư Viện</h2>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight font-semibold">
                                                    {allMaterials.length} mô hình 3D
                                                </p>
                                            </div>
                                        </div>

                                        {/* Beautiful category icons */}
                                        <div className="flex items-center gap-2 my-2 relative z-10 shrink-0 select-none justify-center">
                                            {/* Phòng học */}
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Library className="w-4 h-4" />
                                                </div>
                                                <span className="text-[7px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phòng</span>
                                            </div>

                                            {/* Sách 3D */}
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <BookOpen className="w-4 h-4" />
                                                </div>
                                                <span className="text-[7px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sách</span>
                                            </div>

                                            {/* Bộ sưu tập */}
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <BookMarked className="w-4 h-4" />
                                                </div>
                                                <span className="text-[7px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Bộ sưu</span>
                                            </div>
                                        </div>

                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-500/20 px-3 py-1.5 rounded-lg group-hover:bg-teal-200 dark:group-hover:bg-teal-500/30 transition-colors w-max shrink-0 relative z-10 shadow-sm border border-teal-200/60 dark:border-teal-500/40">
                                            Thư viện <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </Link>
                                </div>

                                {/* === Continue Learning — Section === */}
                                <div className="flex-1 flex flex-col min-h-0 gap-2">
                                    <div className="flex items-center justify-between shrink-0">
                                        <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5 font-heading">
                                            <div className="p-1 rounded bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                                                <Clock className="w-3 h-3" />
                                            </div>
                                            Tiếp tục học tập
                                        </h2>
                                        <Link to="/library" className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-wider transition-colors">
                                            Xem tất cả →
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-grow min-h-0 xl:overflow-y-auto overflow-visible pr-1">
                                        {recentMaterials.map((material) => {
                                            const materialHoverClass = 
                                                material.subject === 'physics' ? 'hover:shadow-blue-500/10 hover:border-blue-500/25 dark:hover:border-blue-500/30' :
                                                material.subject === 'chemistry' ? 'hover:shadow-emerald-500/10 hover:border-emerald-500/25 dark:hover:border-emerald-500/30' :
                                                'hover:shadow-rose-500/10 hover:border-rose-500/25 dark:hover:border-rose-500/30';

                                            const subjectBadgeClass = 
                                                material.subject === 'physics' ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white' :
                                                material.subject === 'chemistry' ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white' :
                                                'bg-gradient-to-r from-rose-500 to-orange-400 text-white';

                                            const SubjectIcon = material.subject === 'physics' ? Atom : material.subject === 'chemistry' ? FlaskConical : Sprout;

                                            return (
                                                <Link
                                                    key={material.id}
                                                    to={`/material/${material.id}`}
                                                    className={`group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/[0.08] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 h-fit min-h-0 ${materialHoverClass}`}
                                                >
                                                    {/* Compact aspect ratio */}
                                                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 library-card-shimmer">
                                                        {material.thumbnail && material.thumbnail !== '3d-placeholder' ? (
                                                            <img
                                                                loading="lazy"
                                                                decoding="async"
                                                                src={material.thumbnail}
                                                                alt={material.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                                                                <Box className="w-6 h-6 text-indigo-200 dark:text-indigo-800" />
                                                            </div>
                                                        )}

                                                        {/* Badges */}
                                                        <div className="absolute top-1 left-1 flex gap-0.5">
                                                            <span className={`px-1 py-0.5 rounded text-[6px] font-black shadow-sm uppercase tracking-wider leading-none ${subjectBadgeClass}`}>
                                                                {getSubjectName(material.subject)}
                                                            </span>
                                                            <span className="px-1 py-0.5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded text-[6px] font-black text-slate-700 dark:text-slate-300 shadow-sm uppercase tracking-wider leading-none">
                                                                {material.type === '3d-model' ? '3D' : 'INFO'}
                                                            </span>
                                                        </div>

                                                        {/* Play overlay */}
                                                        <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]">
                                                            <PlayCircle className="w-6 h-6 text-white drop-shadow-md" strokeWidth={1.5} />
                                                        </div>
                                                    </div>

                                                    {/* Compact info section */}
                                                    <div className="p-1.5 flex flex-col justify-between flex-1">
                                                        <div>
                                                            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-[9px] line-clamp-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors leading-tight font-heading">
                                                                {material.title}
                                                            </h3>
                                                        </div>

                                                        <div className="pt-1 mt-1 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[7px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                                                            <span className="flex items-center gap-0.5">
                                                                <SubjectIcon className="w-2 h-2" /> K{material.grade}
                                                            </span>
                                                            <span className="line-clamp-1">{formatRelativeTime(material.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="xl:col-span-3 flex flex-col gap-3 h-full min-h-0">
                                {/* EduTech Brand Card */}
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200/60 dark:border-indigo-500/25 p-4 shadow-md">
                                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none"></div>
                                    
                                    <div className="relative z-10 flex items-center gap-3 mb-3">
                                        <div className="h-12 w-12 overflow-hidden rounded-lg border-2 border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-800 shadow-md">
                                            <img 
                                                src="/edutech_logo_new.jpg" 
                                                alt="Edu Tech Brand Logo" 
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Edu Tech 3D</p>
                                            <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">Không gian học</h2>
                                        </div>
                                    </div>
                                    <div className="relative z-10 border-t border-indigo-200 dark:border-indigo-500/20 pt-3">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Gói hiện tại</span>
                                            <span className={`rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-wider ${currentPlanConfig.colorClass} shadow-sm border ${currentPlanConfig.borderClass}`}>
                                                {currentPlanConfig.label}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shadow-sm">
                                            <div className={`h-full rounded-full bg-gradient-to-r ${currentPlanConfig.barColor} shadow-lg transition-all duration-500`} style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Today's Learning Tips Card */}
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-500/25 p-4 shadow-md flex-1 min-h-[240px]">
                                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none"></div>
                                    
                                    <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">💡 Gợi ý</p>
                                            <h2 className="mt-1 text-base font-black tracking-tight text-slate-900 dark:text-white">Phiên 25 phút</h2>
                                        </div>
                                        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                                    </div>

                                    <div className="relative z-10 divide-y divide-emerald-200 dark:divide-emerald-500/20">
                                        {/* Tip 1 */}
                                        <div className="py-2.5">
                                            <div className="flex items-start gap-2">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 shrink-0 shadow-sm">
                                                    <PlayCircle className="h-4 w-4" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white leading-snug">Mở mô hình gần đây</p>
                                                    <p className="mt-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">Bắt đầu bằng quan sát.</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Tip 2 */}
                                        <div className="py-2.5">
                                            <div className="flex items-start gap-2">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 shrink-0 shadow-sm">
                                                    <Sparkles className="h-4 w-4" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white leading-snug">Đặt câu hỏi cho AI</p>
                                                    <p className="mt-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">Tìm học liệu cùng chủ đề.</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Tip 3 */}
                                        <div className="py-2.5">
                                            <div className="flex items-start gap-2">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0 shadow-sm">
                                                    <BookMarked className="h-4 w-4" />
                                                </span>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">Lưu nội dung ôn</p>
                                                    <p className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">Giữ lại mô hình quan trọng.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to={recentMaterials[0] ? `/material/${recentMaterials[0].id}` : '/library'}
                                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100"
                                    >
                                        Bắt đầu ôn
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </Layout>
    );
}
