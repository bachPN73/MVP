import { Layout } from '../layout/MainLayout';
import { 
    BookOpen, FlaskConical, Sprout, Sparkles, ChevronRight, 
    PlayCircle, Box, Compass, ShieldCheck, Clock, Crown, 
    School, Search, Layers, Calculator, Cpu, Atom, Zap, 
    Eye, Leaf, Dna, Globe, Activity, Rotate3d, Library, 
    BookMarked, Users, ArrowUpRight, BarChart3, Key, Flame
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

    // Greeting message based on the hour of the day
    const greetingTime = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    }, []);

    const subjects = useMemo(() => [
        { 
            id: 'physics', 
            name: 'Vật lý', 
            icon: Atom, 
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

    const planConfig: Record<string, { label: string; icon: any; colorClass: string; barColor: string; bgClass: string; borderClass: string; textClass: string; accentColor: string }> = {
        free: {
            label: "FREE",
            icon: Compass,
            colorClass: "text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/20",
            barColor: "from-slate-400 to-slate-500",
            bgClass: "bg-slate-500/5 dark:bg-slate-500/10",
            borderClass: "border-slate-500/20",
            textClass: "text-slate-700 dark:text-slate-300",
            accentColor: "slate"
        },
        demo: {
            label: "DEMO",
            icon: Zap,
            colorClass: "text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/25",
            barColor: "from-rose-500 to-pink-500",
            bgClass: "bg-rose-500/5 dark:bg-rose-500/10",
            borderClass: "border-rose-500/25",
            textClass: "text-rose-700 dark:text-rose-400",
            accentColor: "rose"
        },
        basic: {
            label: "BASIC",
            icon: Zap,
            colorClass: "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/25",
            barColor: "from-blue-500 to-cyan-500",
            bgClass: "bg-blue-500/5 dark:bg-blue-500/10",
            borderClass: "border-blue-500/25",
            textClass: "text-blue-700 dark:text-blue-400",
            accentColor: "blue"
        },
        pro: {
            label: "PRO",
            icon: Crown,
            colorClass: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
            barColor: "from-amber-400 to-orange-500",
            bgClass: "bg-amber-500/5 dark:bg-amber-500/10",
            borderClass: "border-amber-500/25",
            textClass: "text-amber-700 dark:text-amber-400",
            accentColor: "amber"
        },
        combo: {
            label: "COMBO",
            icon: Globe,
            colorClass: "text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/25",
            barColor: "from-orange-500 to-amber-400",
            bgClass: "bg-orange-500/5 dark:bg-orange-500/10",
            borderClass: "border-orange-500/25",
            textClass: "text-orange-700 dark:text-orange-400",
            accentColor: "orange"
        },
        school: {
            label: "SCHOOL",
            icon: School,
            colorClass: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
            barColor: "from-emerald-500 to-teal-500",
            bgClass: "bg-emerald-500/5 dark:bg-emerald-500/10",
            borderClass: "border-emerald-500/25",
            textClass: "text-emerald-700 dark:text-emerald-400",
            accentColor: "emerald"
        }
    };

    const resolvedUserPlan = userPlan === 'premium' ? 'pro' : userPlan;
    const currentPlanConfig = planConfig[resolvedUserPlan] || planConfig.free;
    const PlanIcon = currentPlanConfig.icon;

    return (
        <Layout>
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-400/8 dark:bg-indigo-500/10 blur-3xl" />
                <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] rounded-full bg-teal-400/6 dark:bg-teal-500/8 blur-3xl" />
                <div className="absolute -bottom-20 left-1/3 w-[360px] h-[360px] rounded-full bg-blue-400/5 dark:bg-blue-500/7 blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-6 w-full h-full max-w-[104rem] mx-auto xl:h-[calc(100vh-2rem)] xl:max-h-[calc(100vh-2rem)] xl:overflow-hidden flex flex-col gap-4 animate-in fade-in duration-300">
                {isSchoolAdmin ? (
                    /* ================= SCHOOL ADMIN LAYOUT ================= */
                    <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto pr-1 custom-scrollbar">

                        {/* Admin banner */}
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-slate-900 shadow-sm flex-shrink-0">
                            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500" />
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
                                        Hệ thống quản lý tài khoản trường học và bản quyền Premium. Phê duyệt thành viên, cấp mã mời và theo dõi số lượng bản quyền sử dụng trong thời gian thực.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* School org panel */}
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
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Thành viên đăng ký với mã mời sẽ được kích hoạt toàn bộ bản quyền Premium tự động.
                                        </p>
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
                                                <div key={member.id} className="flex items-center gap-2 bg-white border border-slate-200/60 dark:bg-slate-900/60 dark:border-white/5 px-3 py-1.5 rounded-lg hover:border-slate-300 dark:hover:border-white/10 transition-colors">
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
                        {/* ── TOP: Greeting banner ── */}
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/6 bg-white dark:bg-slate-900 shadow-sm shrink-0">
                            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-amber-400" />
                            <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                                {/* Left: greeting */}
                                <div className="flex items-center gap-3.5">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md
                                        ${userRole === 'admin'
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                            : userRole === 'teacher'
                                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                            : 'bg-gradient-to-br from-indigo-500 to-blue-600'
                                        }`}>
                                        {userRole === 'admin' ? <Crown className="w-5 h-5" /> : userRole === 'teacher' ? <School className="w-5 h-5" /> : <Compass className="w-5 h-5" strokeWidth={2} />}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{greetingTime}</span>
                                            {userSchoolId && schoolInfo && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-500/20">
                                                    <School className="h-2.5 w-2.5" /> {schoolInfo.name}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Chào {userName} &#128075;</h1>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                            <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border
                                                ${userRole === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
                                                : userRole === 'teacher' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                                                : 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20'}`}>
                                                {userRole === 'admin' ? 'Quản trị viên' : userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                            </span>
                                            {userClassName && (
                                                <span className="rounded-md border border-slate-200/60 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                    Lớp {userClassName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: stats HUD */}
                                <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto md:min-w-[22rem]">
                                    {/* Materials count */}
                                    <div className="rounded-xl border border-blue-100 dark:border-blue-500/15 bg-blue-50/60 dark:bg-blue-950/20 p-3 hover:border-blue-300/60 dark:hover:border-blue-500/30 transition-colors">
                                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                                            <Box className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-bold uppercase tracking-wide">Học liệu</span>
                                        </div>
                                        <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">{allMaterials.length}</p>
                                    </div>
                                    {/* Days remaining */}
                                    <div className="rounded-xl border border-emerald-100 dark:border-emerald-500/15 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 hover:border-emerald-300/60 dark:hover:border-emerald-500/30 transition-colors">
                                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-bold uppercase tracking-wide">Thời hạn</span>
                                        </div>
                                        <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">
                                            {isPremiumPlan ? `${daysRemaining}` : '\u221e'}
                                        </p>
                                        {isPremiumPlan && <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">ngày còn lại</p>}
                                    </div>
                                    {/* Plan */}
                                    <div className={`rounded-xl border p-3 transition-colors
                                        ${userPlan === 'pro' ? 'border-amber-100 dark:border-amber-500/15 bg-amber-50/60 dark:bg-amber-950/20 hover:border-amber-300/60 dark:hover:border-amber-500/30'
                                        : userPlan === 'demo' ? 'border-rose-100 dark:border-rose-500/15 bg-rose-50/60 dark:bg-rose-950/20 hover:border-rose-300/60 dark:hover:border-rose-500/30'
                                        : 'border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-white/[0.03] hover:border-slate-300/60 dark:hover:border-white/15'}`}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <PlanIcon className={`w-3.5 h-3.5 ${currentPlanConfig.textClass}`} />
                                            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Gói</span>
                                        </div>
                                        <p className={`text-base font-extrabold uppercase tracking-wide leading-none ${currentPlanConfig.textClass}`}>{currentPlanConfig.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── MAIN GRID ── */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0 overflow-y-auto xl:overflow-hidden pr-1 custom-scrollbar">

                            {/* ── LEFT: 9/12 ── */}
                            <div className="xl:col-span-9 flex flex-col gap-4 min-h-0">

                                {/* Subject cards */}
                                <div className="shrink-0 space-y-2.5">
                                    <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                        Môn học
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {subjects.map((subject) => {
                                            const Icon = subject.icon;
                                            const circumference = 2 * Math.PI * 20;
                                            const strokeDashoffset = circumference - (subject.progress / 100) * circumference;
                                            const themeMapping: Record<string, { bg: string; border: string; iconBg: string; progressStroke: string; badgeBg: string }> = {
                                                physics: {
                                                    bg: 'bg-blue-50/80 dark:bg-blue-950/20',
                                                    border: 'border-blue-100 dark:border-blue-500/15 hover:border-blue-300/60 dark:hover:border-blue-500/30',
                                                    iconBg: 'from-blue-500 to-cyan-500',
                                                    progressStroke: '#3b82f6',
                                                    badgeBg: 'bg-blue-100/80 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
                                                },
                                                chemistry: {
                                                    bg: 'bg-emerald-50/80 dark:bg-emerald-950/20',
                                                    border: 'border-emerald-100 dark:border-emerald-500/15 hover:border-emerald-300/60 dark:hover:border-emerald-500/30',
                                                    iconBg: 'from-emerald-500 to-teal-500',
                                                    progressStroke: '#10b981',
                                                    badgeBg: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
                                                },
                                                biology: {
                                                    bg: 'bg-rose-50/80 dark:bg-rose-950/20',
                                                    border: 'border-rose-100 dark:border-rose-500/15 hover:border-rose-300/60 dark:hover:border-rose-500/30',
                                                    iconBg: 'from-rose-500 to-orange-500',
                                                    progressStroke: '#f43f5e',
                                                    badgeBg: 'bg-rose-100/80 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
                                                }
                                            };
                                            const config = themeMapping[subject.id] || themeMapping.physics;

                                            return (
                                                <Link
                                                    id={`card-subject-${subject.id}`}
                                                    key={subject.id}
                                                    to={`/library?subject=${subject.id}`}
                                                    className={`group relative overflow-hidden rounded-xl ${config.bg} border ${config.border} shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md`}
                                                >
                                                    <div className="p-4 flex flex-col gap-3">
                                                        <div className="flex justify-between items-start">
                                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                                                                <Icon className="w-5 h-5" strokeWidth={1.75} />
                                                            </div>
                                                            {/* Progress ring */}
                                                            <div className="relative w-11 h-11">
                                                                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 56 56">
                                                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="3" className="stroke-slate-200 dark:stroke-white/10" />
                                                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="3.5" strokeLinecap="round"
                                                                        style={{ strokeDasharray: circumference, strokeDashoffset, color: config.progressStroke }} />
                                                                </svg>
                                                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-slate-200">{subject.progress}%</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{subject.name}</h3>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subject.desc}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-200/60 dark:border-white/5">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${config.badgeBg}`}>{subject.count} học liệu</span>
                                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">{subject.subtopics.length} chủ đề</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* AI & Library quick-action cards */}
                                <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* AI Search */}
                                    <Link id="link-ai-search-card" to="/find-ai"
                                        className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-500/15 shadow-sm hover:shadow-md hover:border-indigo-300/60 dark:hover:border-indigo-500/30 transition-all duration-250 hover:-translate-y-0.5 flex flex-col p-4 min-h-[130px]">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Truy vấn thông minh AI</h2>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Phân tích bài toán và tìm tài nguyên tức thì.</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between gap-2">
                                            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/6 rounded-lg py-2 px-3 flex items-center gap-2">
                                                <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                <span className="text-xs text-slate-600 dark:text-slate-300">Cấu trúc tế bào động vật</span>
                                                <span className="w-0.5 h-3 bg-indigo-400 animate-cursor-blink ml-auto shrink-0" />
                                            </div>
                                            <div className="flex gap-1.5 flex-wrap">
                                                <span id="pill-suggest-cell" className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/15">Tế bào nhan thuc</span>
                                                <span id="pill-suggest-chloroplast" className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/15">Chu trình Krebs</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-1.5 transition-all">
                                            Tìm kiếm AI <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </Link>

                                    {/* Library */}
                                    <Link id="link-library-card" to="/library"
                                        className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-500/15 shadow-sm hover:shadow-md hover:border-teal-300/60 dark:hover:border-teal-500/30 transition-all duration-250 hover:-translate-y-0.5 flex flex-col p-4 min-h-[130px]">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                                                <Library className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Kho học liệu tuong tac</h2>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tổng hợp {allMaterials.length} tài nguyên thí nghiệm ảo 3D.</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center gap-5">
                                            {([
                                                { icon: Library, label: 'Phòng ảo', color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/15' },
                                                { icon: BookOpen, label: 'Sách 3D', color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15' },
                                                { icon: BookMarked, label: 'Sưu tập', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15' },
                                            ] as const).map(({ icon: ItemIcon, label, color }) => (
                                                <div key={label} className="flex flex-col items-center gap-1.5">
                                                    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                        <ItemIcon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:gap-1.5 transition-all">
                                            Vào thư viện <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </Link>
                                </div>

                                {/* Recent materials */}
                                <div className="flex-1 flex flex-col min-h-0 gap-2.5">
                                    <div className="flex items-center justify-between shrink-0">
                                        <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Tiếp tục học
                                        </h2>
                                        <Link id="link-view-all-materials" to="/library" className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                            Xem tất cả &rarr;
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-grow min-h-0 overflow-y-auto xl:overflow-visible pr-1 custom-scrollbar">
                                        {recentMaterials.map((material) => {
                                            const cardBorder =
                                                material.subject === 'physics' ? 'hover:border-blue-300/60 dark:hover:border-blue-500/25' :
                                                material.subject === 'chemistry' ? 'hover:border-emerald-300/60 dark:hover:border-emerald-500/25' :
                                                'hover:border-rose-300/60 dark:hover:border-rose-500/25';
                                            const badgeColor =
                                                material.subject === 'physics' ? 'bg-blue-500 text-white' :
                                                material.subject === 'chemistry' ? 'bg-emerald-500 text-white' :
                                                'bg-rose-500 text-white';
                                            const SubjectIcon = material.subject === 'physics' ? Atom : material.subject === 'chemistry' ? FlaskConical : Sprout;

                                            return (
                                                <Link id={`link-recent-material-${material.id}`} key={material.id} to={`/material/${material.id}`}
                                                    className={`group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-250 hover:-translate-y-1 ${cardBorder}`}>
                                                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden">
                                                        {material.thumbnail && material.thumbnail !== '3d-placeholder' ? (
                                                            <img loading="lazy" decoding="async" src={material.thumbnail} alt={material.title}
                                                                className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                                                                <Box className="w-8 h-8 text-indigo-200 dark:text-indigo-800" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 left-2 flex gap-1">
                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold shadow-sm uppercase ${badgeColor}`}>{getSubjectName(material.subject)}</span>
                                                            <span className="px-1.5 py-0.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm rounded text-[8px] font-bold text-slate-700 dark:text-slate-200 shadow-sm uppercase">
                                                                {material.type === '3d-model' ? '3D' : 'INFO'}
                                                            </span>
                                                        </div>
                                                        <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                                                            <div className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-transform">
                                                                <PlayCircle className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-2.5 flex flex-col gap-1.5">
                                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[11px] line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                                            <LatexText text={material.title} />
                                                        </h3>
                                                        <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                                                            <span className="flex items-center gap-0.5 uppercase tracking-wide">
                                                                <SubjectIcon className="w-2.5 h-2.5 text-indigo-400" /> Khối {material.grade}
                                                            </span>
                                                            <span className="font-mono">{formatRelativeTime(material.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ── RIGHT: 3/12 ── */}
                            <div className="xl:col-span-3 flex flex-col gap-4 h-full min-h-0">

                                {/* Brand / Plan card */}
                                <div className="rounded-xl border border-slate-200/60 dark:border-white/6 bg-white dark:bg-slate-900 shadow-sm p-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-slate-800 shadow-sm p-1.5 shrink-0">
                                            <img src="/edutech_logo_new.jpg" alt="EduTech Logo" className="h-full w-full object-contain rounded-md" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Edu Tech Ecosystem</p>
                                            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">Trung tâm học tập</h2>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-white/6 pt-3.5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Gói hien tai</span>
                                            <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${currentPlanConfig.colorClass}`}>
                                                {currentPlanConfig.label}
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
                                            <div className={`h-full rounded-full bg-gradient-to-r ${currentPlanConfig.barColor} transition-all duration-700`} style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Study guide card */}
                                <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/6 shadow-sm flex-1 min-h-[200px] flex flex-col p-4">
                                    <div className="shrink-0 mb-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Study Blueprint</span>
                                        </div>
                                        <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Chiến thuật học tập hiệu quả</h2>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            Áp dụng phương pháp Pomodoro 25 phút tập trung để tối ưu khả năng ghi nhớ.
                                        </p>
                                    </div>

                                    <div className="flex-grow divide-y divide-slate-100 dark:divide-white/5 overflow-y-auto custom-scrollbar pr-0.5 min-h-0">
                                        {([
                                            { n: 1, title: 'Mở mô hình 3D', desc: 'Xoay, thu phóng và phân rã các lớp tế bào cấu trúc.', color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/15' },
                                            { n: 2, title: 'Hỏi AI chi tiết', desc: 'Yêu cầu giải thích chi tiết chức năng của các bào quan.', color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-100 dark:border-violet-500/15' },
                                            { n: 3, title: 'Lưu nội dung bài', desc: 'Đánh dấu bookmark mô hình quan trọng để ôn trước kỳ thi.', color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/15' },
                                        ] as const).map(({ n, title, desc, color }) => (
                                            <div key={n} className="py-2.5 flex items-start gap-2.5 group/step">
                                                <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold shrink-0 ${color} group-hover/step:scale-110 transition-transform`}>{n}</span>
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-snug">{title}</p>
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Link id="btn-start-pomodoro" to={recentMaterials[0] ? `/material/${recentMaterials[0].id}` : '/library'}
                                        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200 shrink-0">
                                        <span>Bắt đầu phiên học tập</span>
                                        <ChevronRight className="w-4 h-4" />
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
