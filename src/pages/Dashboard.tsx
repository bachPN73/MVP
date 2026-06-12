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
                    const durationDays = planStr === 'free' ? 7 : 30;
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

    const isPremiumPlan = ['premium', 'pro', 'school', 'basic'].includes(userPlan);
    const isSchoolAdmin = userRole === 'school-admin';
    const planBgClass = isPremiumPlan
        ? 'bg-gradient-to-br from-amber-400 to-orange-550 shadow-orange-500/30'
        : 'bg-gradient-to-br from-indigo-500 to-purple-650 shadow-indigo-500/30';

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
            {/* Mesh Gradient Blurred Floating Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[38rem] h-[38rem] rounded-full bg-indigo-550/8 dark:bg-indigo-650/12 blur-[100px] animate-float"></div>
                <div className="absolute top-[35%] left-[45%] w-[32rem] h-[32rem] rounded-full bg-rose-550/5 dark:bg-rose-550/8 blur-[100px] animate-float-delayed"></div>
                <div className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] rounded-full bg-cyan-550/6 dark:bg-cyan-500/10 blur-[100px] animate-float"></div>
            </div>

            <div className="relative z-10 p-4 md:p-5 w-full h-full max-w-[104rem] mx-auto xl:h-[calc(100vh-2rem)] xl:max-h-[calc(100vh-2rem)] xl:overflow-hidden flex flex-col justify-between gap-4 animate-in fade-in duration-305">
                {isSchoolAdmin ? (
                    /* ================= SCHOOL ADMIN LAYOUT ================= */
                    <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto pr-1">
                        {/* 1. Hero Welcome & Search Area */}
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-[#2d3280] dark:from-slate-900 dark:via-slate-950 dark:to-[#0e1726] border border-indigo-500/25 dark:border-white/10 shadow-xl flex-shrink-0">
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 blur-3xl"></div>
                                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[120%] rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl"></div>
                            </div>

                            <div className="relative p-6 md:p-8 z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1 space-y-4 w-full">
                                    <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight leading-tight mb-1 font-heading">
                                        Chào Quản trị viên <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">{userName}</span>,
                                    </h1>
                                    <p className="text-indigo-100 dark:text-slate-200 text-sm md:text-base font-semibold max-w-2xl">
                                        Chào mừng bạn đến với Cổng quản trị trường học. Quản lý tài nguyên, mã mời và phê duyệt thành viên cho trường của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* School Organization Dashboard */}
                        {userSchoolId && schoolInfo && (
                            <div className="rounded-3xl border border-stone-200/70 dark:border-teal-500/20 bg-gradient-to-r from-stone-50/80 to-indigo-50/60 dark:from-teal-950/20 dark:to-indigo-950/20 p-6 md:p-8 backdrop-blur-xl shadow-lg space-y-6 relative overflow-hidden flex-1 min-h-0">
                                {/* Decorative glowing backdrops */}
                                <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-400/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="absolute -left-20 -top-20 w-60 h-60 bg-indigo-300/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

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
                        {/* 1. Compact Welcome Banner */}
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-50/70 via-stone-50/90 to-amber-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-[#0e1726] border border-stone-200/60 dark:border-white/[0.06] shadow-md shrink-0 w-full">
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-[40%] -left-[8%] w-[50%] h-[140%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl"></div>
                                <div className="absolute top-[10%] -right-[15%] w-[40%] h-[100%] rounded-full bg-cyan-500/8 dark:bg-cyan-500/10 blur-3xl"></div>
                                <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]"></div>
                            </div>

                            <div className="relative z-10 px-5 py-4 md:px-7 md:py-5 flex items-center gap-4">
                                {/* Simplified Avatar */}
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 shrink-0
                                    ${userRole === 'admin' 
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 ring-amber-400/30' 
                                        : userRole === 'teacher'
                                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 ring-emerald-400/30'
                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 ring-indigo-400/30'
                                    }`}
                                >
                                    {userRole === 'admin' ? (
                                        <Crown className="w-6 h-6 text-white" />
                                    ) : userRole === 'teacher' ? (
                                        <School className="w-6 h-6 text-white" />
                                    ) : (
                                        <Compass className="w-6 h-6 text-white" strokeWidth={2} />
                                    )}
                                </div>

                                {/* Greeting + Inline Badges */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none font-heading">
                                            Chào <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-yellow-200 dark:to-cyan-200">{userName}</span>
                                        </h1>
                                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider leading-none border bg-indigo-50/80 text-indigo-700 border-indigo-100/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                                            {userRole === 'admin' ? 'Quản trị viên' : userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                        </span>
                                        {userClassName && (
                                            <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider leading-none bg-purple-50/80 text-purple-700 border border-purple-100/60 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20">
                                                Lớp {userClassName}
                                            </span>
                                        )}
                                        {userSchoolId && schoolInfo && (
                                            <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider leading-none bg-emerald-50/80 text-emerald-700 border border-emerald-100/60 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20 max-w-[180px] truncate">
                                                🏫 {schoolInfo.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-semibold mt-1 leading-snug truncate">
                                        Khám phá thế giới khoa học tương tác 3D cùng Edu Tech!
                                    </p>
                                </div>

                                {/* Custom Stats indicators with Energy progress bars */}
                                <div className="hidden md:flex items-center gap-4 shrink-0 select-none">
                                    {/* 24 học liệu Card */}
                                    <div className="flex flex-col gap-1.5 px-4 py-2.5 bg-white/85 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-sm min-w-[125px] hover:scale-105 active:scale-95 transition-all relative overflow-hidden group">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                                                <Box className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">24 học liệu</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse-glow" style={{ width: '80%' }}></div>
                                        </div>
                                    </div>

                                    {/* Số ngày còn lại Card */}
                                    <div className="flex flex-col gap-1.5 px-4 py-2.5 bg-white/85 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-sm min-w-[125px] hover:scale-105 active:scale-95 transition-all relative overflow-hidden group">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                                                <Clock className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                                {isPremiumPlan ? `Còn ${daysRemaining} ngày` : 'Hạn: Vĩnh viễn'}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse-glow" style={{ width: isPremiumPlan ? `${(daysRemaining / 30) * 100}%` : '100%' }}></div>
                                        </div>
                                    </div>

                                    {/* Dynamic Plan Card */}
                                    <div className={`flex flex-col gap-1.5 px-4 py-2.5 ${currentPlanConfig.bgClass} border ${currentPlanConfig.borderClass} rounded-2xl shadow-sm min-w-[95px] hover:scale-105 active:scale-95 transition-all relative overflow-hidden group`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded-lg ${currentPlanConfig.colorClass} shrink-0`}>
                                                <PlanIcon className="w-3.5 h-3.5 text-current" strokeWidth={2.5} />
                                            </div>
                                            <span className={`text-xs font-black uppercase tracking-wider ${currentPlanConfig.textClass}`}>{currentPlanConfig.label}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden animate-pulse-glow">
                                            <div className={`h-full bg-gradient-to-r ${currentPlanConfig.barColor} rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]`} style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Main Grid Content Area — 9/3 ratio */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
                            {/* LEFT COLUMN: 9/12 */}
                            <div className="xl:col-span-9 flex flex-col gap-4 min-h-0">
                                
                                {/* === Subject Cards — Compact Horizontal === */}
                                <div className="shrink-0 flex flex-col gap-2.5">
                                    <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 font-heading">
                                        <Box className="w-3.5 h-3.5 text-indigo-500" /> Môn học & Chương trình
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {subjects.map((subject) => {
                                            const Icon = subject.icon;
                                            const circumference = 2 * Math.PI * 18;
                                            const strokeDashoffset = circumference - (subject.progress / 100) * circumference;
                                            return (
                                                <Link
                                                    key={subject.id}
                                                    to={`/library?subject=${subject.id}`}
                                                    className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border ${subject.borderColor} shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${subject.glowClass} ${subject.hoverBorder}`}
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${subject.bgGradient} opacity-100 pointer-events-none`}></div>
                                                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none"></div>
                                                    
                                                    <div className="relative z-10 p-4 flex items-center gap-3.5">
                                                        {/* Subject Icon */}
                                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-white shadow-md ${subject.shadow} group-hover:scale-105 transition-transform shrink-0`}>
                                                            <Icon className="w-5.5 h-5.5" />
                                                        </div>

                                                        {/* Subject Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-none font-heading">{subject.name}</h3>
                                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-none font-semibold truncate">{subject.desc}</p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-100/80 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200/40 dark:border-white/5 leading-none">
                                                                    {subject.count} học liệu
                                                                 </span>
                                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-100/80 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200/40 dark:border-white/5 leading-none">
                                                                    {subject.subtopics.length} chủ đề
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Circular Progress Ring */}
                                                        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                                                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                                                                <circle cx="22" cy="22" r="18" fill="none" strokeWidth="3" className="stroke-slate-100 dark:stroke-white/10" />
                                                                <circle cx="22" cy="22" r="18" fill="none" strokeWidth="3" strokeLinecap="round" className={`stroke-current`}
                                                                    style={{ 
                                                                        strokeDasharray: circumference, 
                                                                        strokeDashoffset: strokeDashoffset,
                                                                        color: subject.id === 'physics' ? '#3b82f6' : subject.id === 'chemistry' ? '#10b981' : '#f43f5e'
                                                                    }} 
                                                                />
                                                            </svg>
                                                            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-700 dark:text-slate-200">{subject.progress}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Floating watermark */}
                                                    <Icon className="absolute -right-4 -bottom-4 w-20 h-20 text-slate-900/[0.012] dark:text-white/[0.01] pointer-events-none" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* === AI Search & Library Cards — Side-by-Side in the Middle === */}
                                <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* AI Search Card */}
                                    <Link
                                        to="/find-ai"
                                        className="group relative overflow-hidden rounded-3xl p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between min-h-[190px]"
                                    >
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-full blur-2xl pointer-events-none"></div>
                                        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

                                        <div className="flex items-center gap-3.5 relative z-10 shrink-0">
                                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0 text-white group-hover:scale-105 transition-transform">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="text-base md:text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight font-heading">Tìm kiếm AI</h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug font-semibold">
                                                    Mô tả bằng ngôn ngữ tự nhiên
                                                </p>
                                            </div>
                                        </div>

                                        {/* Search Bar Mockup */}
                                        <div className="relative z-10 flex-grow my-3 flex flex-col justify-center gap-2 select-none min-h-0">
                                            <div className="bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] rounded-xl py-2.5 px-4 flex items-center justify-between shadow-xs">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Search className="w-4 h-4 text-indigo-500 shrink-0" />
                                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate flex items-center">
                                                        <span>Cấu trúc tế bào thực vật</span>
                                                        <span className="ml-0.5 w-0.5 h-4 bg-indigo-500 animate-cursor-blink shrink-0"></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 items-center">
                                                <span className="text-[10px] font-black uppercase text-indigo-500/70 dark:text-indigo-400/70 tracking-widest flex items-center gap-1">
                                                    Gợi ý:
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200/40 dark:from-blue-950/20 dark:to-cyan-950/20 dark:text-cyan-300 dark:border-cyan-500/15 shadow-xs">🧬 Tế bào</span>
                                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200/40 dark:from-emerald-950/20 dark:to-teal-950/20 dark:text-emerald-300 dark:border-emerald-500/15 shadow-xs">🍀 Lục lạp</span>
                                            </div>
                                        </div>

                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-2 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors w-max shrink-0 relative z-10 shadow-xs border border-indigo-100/55 dark:border-indigo-900/20">
                                            Tìm kiếm ngay <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </Link>

                                    {/* Library Card */}
                                    <Link
                                        to="/library"
                                        className="group relative overflow-hidden rounded-3xl p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between min-h-[190px]"
                                    >
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50/50 dark:bg-blue-950/20 rounded-full blur-2xl pointer-events-none"></div>

                                        <div className="flex items-center gap-3.5 relative z-10 shrink-0">
                                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shrink-0 text-white group-hover:scale-105 transition-transform">
                                                <Library className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-base md:text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 font-heading leading-tight">Thư Viện</h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug font-semibold">
                                                    {allMaterials.length} mô hình 3D tương tác
                                                </p>
                                            </div>
                                        </div>

                                        {/* Beautiful glowing icons representing library, books, documents */}
                                        <div className="flex items-center gap-6 md:gap-8 my-3 relative z-10 shrink-0 select-none justify-center">
                                            {/* Thư viện chính */}
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-13 h-13 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.2)] group-hover:scale-110 active:scale-95 transition-all">
                                                    <Library className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phòng học</span>
                                            </div>

                                            {/* Sách giáo khoa / Vở */}
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-13 h-13 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 dark:border-purple-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.2)] group-hover:scale-110 active:scale-95 transition-all">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sách 3D</span>
                                            </div>

                                            {/* Đã lưu / Đánh dấu */}
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)] group-hover:scale-110 active:scale-95 transition-all">
                                                    <BookMarked className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bộ sưu tập</span>
                                            </div>
                                        </div>

                                        <span className="inline-flex items-center text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-4 py-2 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors w-max shrink-0 relative z-10 shadow-xs border border-blue-100/55 dark:border-blue-900/25">
                                            Mở thư viện <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </Link>
                                </div>

                                {/* === Continue Learning — Shorter & Squarer (Pushed Down) === */}
                                <div className="flex-1 flex flex-col min-h-0 gap-2.5">
                                    <div className="flex items-center justify-between shrink-0">
                                        <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 font-heading">
                                            <Clock className="w-3.5 h-3.5 text-emerald-500" /> Tiếp tục học tập
                                        </h2>
                                        <Link to="/library" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                            Xem tất cả &rarr;
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-grow min-h-0 xl:overflow-y-auto overflow-visible pr-1">
                                        {recentMaterials.map((material) => {
                                            const materialHoverClass = 
                                                material.subject === 'physics' ? 'hover:shadow-blue-500/8 hover:border-blue-500/25 dark:hover:border-blue-500/30' :
                                                material.subject === 'chemistry' ? 'hover:shadow-emerald-500/8 hover:border-emerald-500/25 dark:hover:border-emerald-500/30' :
                                                'hover:shadow-rose-500/8 hover:border-rose-500/25 dark:hover:border-rose-500/30';

                                            const subjectBadgeClass = 
                                                material.subject === 'physics' ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white' :
                                                material.subject === 'chemistry' ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white' :
                                                'bg-gradient-to-r from-rose-500 to-orange-400 text-white';

                                            const SubjectIcon = material.subject === 'physics' ? Atom : material.subject === 'chemistry' ? FlaskConical : Sprout;

                                            return (
                                                <Link
                                                    key={material.id}
                                                    to={`/material/${material.id}`}
                                                    className={`group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-fit min-h-0 ${materialHoverClass}`}
                                                >
                                                    {/* Square aspect ratio w-full (aspect-[4/3] to be compact and square-ish) */}
                                                    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 library-card-shimmer">
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
                                                                <Box className="w-10 h-10 text-indigo-200 dark:text-indigo-800" />
                                                            </div>
                                                        )}

                                                        {/* Badges */}
                                                        <div className="absolute top-2 left-2 flex gap-1">
                                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black shadow-sm uppercase tracking-wider leading-none ${subjectBadgeClass}`}>
                                                                {getSubjectName(material.subject)}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-md text-[8px] font-black text-slate-700 dark:text-slate-300 shadow-sm uppercase tracking-wider leading-none">
                                                                {material.type === '3d-model' ? '3D' : 'INFO'}
                                                            </span>
                                                        </div>

                                                        {/* Play overlay */}
                                                        <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]">
                                                            <PlayCircle className="w-10 h-10 text-white drop-shadow-md" strokeWidth={1.5} />
                                                        </div>
                                                    </div>

                                                    {/* Shorter info section, no description to make it short and clean */}
                                                    <div className="p-3 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs md:text-sm line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors leading-tight font-heading">
                                                                {material.title}
                                                            </h3>
                                                        </div>

                                                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                                                            <span className="flex items-center gap-1">
                                                                <SubjectIcon className="w-2.5 h-2.5" /> KHỐI {material.grade}
                                                            </span>
                                                            <span>{formatRelativeTime(material.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: 3/12 — Premium Brand Logo Card */}
                            <div className="xl:col-span-3 flex flex-col gap-4 h-full min-h-0">
                                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50/90 via-orange-50/80 to-rose-50/90 dark:from-[#3b0712] dark:via-[#7f1d1d] dark:to-[#451a03] border border-amber-200/70 dark:border-amber-500/25 shadow-xl flex flex-col items-center justify-between p-6 flex-grow min-h-[460px] text-center select-none hover:border-amber-400/50 dark:hover:border-amber-500/40 hover:shadow-amber-500/10 dark:hover:shadow-amber-500/20 transition-all duration-300">
                                    {/* Glowing Orbs in background */}
                                    <div className="absolute -top-12 -left-12 w-28 h-28 bg-orange-300/15 dark:bg-red-500/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
                                    <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-300/15 dark:bg-amber-500/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
                                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

                                    {/* Top Branding Label */}
                                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700 dark:text-yellow-300 drop-shadow-xs dark:drop-shadow-md">Edu Tech 3D</span>
                                        <h2 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-700 dark:from-yellow-100 dark:via-yellow-200 dark:to-amber-300 tracking-tight uppercase leading-normal font-heading mt-1 py-1.5 px-1 overflow-visible flex items-center gap-1 filter drop-shadow-none dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-yellow-300 animate-pulse shrink-0" />
                                            Không gian tương tác
                                        </h2>
                                    </div>

                                    {/* Main 3D Brand Logo Graphic */}
                                    <div className="my-4 relative w-full aspect-square max-w-[240px] p-1 flex items-center justify-center rounded-3xl overflow-hidden border-2 border-amber-300/40 dark:border-amber-400/40 shadow-md dark:shadow-2xl bg-white group-hover:scale-105 transition-transform duration-700 shadow-amber-500/5 dark:shadow-amber-500/20">
                                        <img 
                                            src="/edutech_logo_new.jpg" 
                                            alt="Edu Tech Brand Logo" 
                                            className="w-full h-full object-contain rounded-2xl"
                                        />
                                    </div>

                                    {/* Bottom Details / Meta */}
                                    <div className="w-full space-y-3.5 shrink-0">
                                        {/* Wish Banner */}
                                        <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent dark:from-amber-500/20 dark:via-red-650/20 dark:to-black/25 border border-amber-300 dark:border-amber-400/40 rounded-2xl p-4 shadow-sm dark:shadow-inner relative overflow-hidden group/wish">
                                            {/* Decorative tiny lights */}
                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-600 dark:bg-yellow-400 rounded-full animate-ping"></div>
                                            
                                            <h3 className="text-xs font-black text-rose-900 dark:text-yellow-300 uppercase tracking-widest flex items-center justify-center gap-1 mb-1.5 filter drop-shadow-xs dark:drop-shadow-sm">
                                                🎓 Chúc Thi Tốt! 🎓
                                            </h3>
                                            <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-relaxed">
                                                Bình tĩnh, tự tin, làm bài thật tốt để bứt phá và về đích thành công rực rỡ! 🎯🏆
                                            </p>
                                        </div>

                                        <p className="text-[11px] text-amber-950 dark:text-amber-100/90 leading-relaxed font-bold">
                                            Học liệu 3D & AI đồng hành cùng sĩ tử trong mọi kỳ thi thử thách.
                                        </p>
                                        
                                        <div className="pt-2.5 border-t border-slate-200 dark:border-white/15 flex flex-col gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-200 uppercase tracking-widest leading-none">
                                            <div className="opacity-90">Phiên bản Premium v2.5.0</div>
                                            <div className="text-rose-900 dark:text-yellow-300 mt-1 flex items-center justify-center gap-1.5 font-black">
                                                <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-yellow-400 animate-ping"></span>
                                                Đồng hành cùng sĩ tử về đích
                                            </div>
                                        </div>
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
