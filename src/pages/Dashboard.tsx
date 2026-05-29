import { Layout } from '../layout/MainLayout';
import { BookOpen, FlaskConical, Sprout, Sparkles, ChevronRight, PlayCircle, Box, Compass, ShieldCheck, Clock, Crown, School } from 'lucide-react';
import { Link } from 'react-router';
import { materials as mockMaterials, getSubjectName, Material, formatRelativeTime } from '../data/materialsData';
import { useState, useEffect, useMemo } from 'react';
import { api, BASE_URL } from '../api';

export default function Dashboard() {
    const [allMaterials, setAllMaterials] = useState<Material[]>(mockMaterials);
    const [userName, setUserName] = useState('Học sinh');
    const [userPlan, setUserPlan] = useState('free');
    const [daysRemaining] = useState(30);

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

                            if (updatedUser.plan?.toLowerCase() === 'school' && updatedUser.schoolId) {
                                loadSchoolData(updatedUser.schoolId, updatedUser.id, updatedUser.role);
                            }
                        }
                    }
                })
                .catch(err => console.error("Error syncing profile state on dashboard:", err));
        }

        // 2. Fetch school details if user plan is school and schoolId exists
        if (currentUser && currentUser.plan?.toLowerCase() === 'school' && currentUser.schoolId) {
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

    const recentMaterials = allMaterials.slice(0, 4);

    const subjects = useMemo(() => [
        { id: 'physics', name: 'Vật lý', icon: FlaskConical, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20', hoverShadow: 'hover:shadow-blue-500/15', hoverBorder: 'hover:border-blue-500/20', count: allMaterials.filter(m => m.subject === 'physics').length },
        { id: 'chemistry', name: 'Hóa học', icon: FlaskConical, color: 'from-emerald-500 to-green-400', shadow: 'shadow-emerald-500/20', hoverShadow: 'hover:shadow-emerald-500/15', hoverBorder: 'hover:border-emerald-500/20', count: allMaterials.filter(m => m.subject === 'chemistry').length },
        { id: 'biology', name: 'Sinh học', icon: Sprout, color: 'from-rose-500 to-orange-400', shadow: 'shadow-rose-500/20', hoverShadow: 'hover:shadow-rose-500/15', hoverBorder: 'hover:border-rose-500/20', count: allMaterials.filter(m => m.subject === 'biology').length },
    ], [allMaterials]);

    const isPremiumPlan = ['premium', 'pro', 'school', 'combo'].includes(userPlan);
    const isSchoolAdmin = userPlan === 'school' && userRole === 'admin';
    const planBgClass = isPremiumPlan
        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30'
        : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30';

    return (
        <Layout>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* 1. Hero Welcome & Search Area */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] rounded-full bg-indigo-600/20 blur-3xl"></div>
                        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[120%] rounded-full bg-blue-500/10 blur-3xl"></div>
                    </div>

                    <div className="relative p-8 md:p-12 z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-6 w-full">
                            {isSchoolAdmin ? (
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 font-heading">
                                        Chào Quản trị viên <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">{userName}</span>,
                                    </h1>
                                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-medium">
                                        Chào mừng bạn đến với Cổng quản trị trường học. Quản lý tài nguyên, mã mời và phê duyệt thành viên cho trường của bạn.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 font-heading">
                                        Chào <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{userName}</span>,
                                    </h1>
                                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-medium">
                                        Chúc bạn một ngày học tập hiệu quả cùng Edu Tech nhé!
                                    </p>
                                </div>
                            )}

                            {!isSchoolAdmin && (
                                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 mt-8 max-w-2xl">
                                    <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/15 transition-all group">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0 transition-transform group-hover:scale-110 ${planBgClass}`}>
                                            {isPremiumPlan ? <Crown className="w-6 h-6 text-white" /> : <ShieldCheck className="w-6 h-6 text-white" />}
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium mb-1 line-clamp-1">Gói dịch vụ hiện tại</p>
                                            <p className="text-white font-bold text-lg flex items-center gap-2">
                                                {userPlan === 'premium' || userPlan === 'pro' ? 'Premium PRO' : 
                                                 userPlan === 'school' ? 'Trường học' :
                                                 userPlan === 'combo' ? 'Combo' :
                                                 userPlan === 'basic' ? 'Cơ bản' : 'Cơ bản (Free)'}
                                                {['premium', 'pro', 'school', 'combo'].includes(userPlan) && <Sparkles className="w-4 h-4 text-amber-300" />}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/15 transition-all group">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0 transition-transform group-hover:scale-110">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium mb-1 line-clamp-1">Thời gian sử dụng</p>
                                            <p className="text-white font-bold text-lg">
                                                {['premium', 'pro', 'school', 'basic'].includes(userPlan) ? `Còn ${daysRemaining} ngày` : 'Vĩnh viễn'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:flex relative w-64 h-64 shrink-0 items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full animate-pulse-slow border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                                <Compass className="w-32 h-32 text-indigo-300/80 drop-shadow-2xl" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1.5 School Organization Premium Dashboard - Only for school plan */}
                {userPlan === 'school' && (
                    userSchoolId ? (
                        <div className="rounded-3xl border border-teal-200/60 dark:border-teal-500/20 bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-teal-950/20 dark:to-indigo-950/20 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden animate-fadeIn">
                            {/* Decorative glowing backdrops */}
                            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -left-20 -top-20 w-60 h-60 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
                                <div>
                                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest text-xs font-mono">
                                        <School className="w-4.5 h-4.5 animate-pulse" />
                                        Cổng thông tin Trường học
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-1 font-heading">
                                        {schoolInfo?.name || "Đang cập nhật"}
                                    </h2>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20">
                                        Mã mời: {schoolInfo?.schoolCode || "Đang cập nhật"}
                                    </span>
                                    {userClassName && (
                                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                                            Lớp: {userClassName}
                                        </span>
                                    )}
                                    {userRole === 'admin' && (
                                        <Link
                                            to="/school/dashboard"
                                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center gap-1.5"
                                        >
                                            <School className="w-3.5 h-3.5 animate-pulse-slow" />
                                            <span>Cổng Quản Trị</span>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: Organization Overview */}
                                <div className="lg:col-span-1 bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Thông tin niên khóa</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                                            Chào mừng bạn đến với mạng lưới tri thức trực quan cao cấp! Nhà trường đã tài trợ toàn bộ quyền lợi bản quyền Premium cho tài khoản của bạn.
                                        </p>
                                    </div>
                                    {userRole === 'admin' ? (
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Giáo viên</span>
                                                <p className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5">{schoolInfo?.teacherSeatsUsed || 0} / {schoolInfo?.teacherQuota || 5}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Học sinh</span>
                                                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{schoolInfo?.studentSeatsUsed || 0} / {schoolInfo?.studentQuota || 10}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Niên khóa</span>
                                                <p className="text-[13px] font-black text-teal-600 dark:text-teal-400 mt-1">{schoolInfo?.schoolYear || 'Chưa cập nhật'}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Tiết học</span>
                                                <p className="text-[13px] font-black text-indigo-600 dark:text-indigo-400 mt-1">{schoolInfo?.tiet || 'Chưa cập nhật'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right/Middle: Classmates & Teachers list for admin OR Personal profile welcome for teacher/student */}
                                {userRole === 'admin' ? (
                                    <div className="lg:col-span-2 bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider mb-3 flex items-center justify-between">
                                                <span>Thành viên cùng trường ({classmates.length + 1})</span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-400 normal-case font-bold font-sans">Đang trực tuyến</span>
                                            </h3>
                                            
                                            <div className="flex flex-wrap gap-3 overflow-y-auto max-h-28 custom-scrollbar pr-2">
                                                {/* Current User avatar */}
                                                <div className="flex items-center gap-2 bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-100 dark:from-teal-500/20 dark:to-indigo-500/20 dark:border-teal-500/30 px-3 py-1.5 rounded-xl shrink-0">
                                                    <div className="w-6 h-6 rounded-lg bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                                        {userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-[11px] font-bold text-slate-800 dark:text-white">
                                                        {userName} <span className="text-[9px] text-teal-600 dark:text-teal-400 font-extrabold uppercase ml-1">(Bạn)</span>
                                                    </div>
                                                </div>

                                                {/* Classmates avatars */}
                                                {classmates.length === 0 ? (
                                                    <p className="text-xs text-slate-500 font-semibold italic py-2">Chưa có thành viên khác tham gia trường học của bạn.</p>
                                                ) : (
                                                    classmates.map((member) => (
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
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-teal-600 dark:text-teal-400/80 font-black tracking-widest uppercase flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-white/5">
                                            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                            Đã kích hoạt toàn bộ bản quyền học liệu tương tác 3D
                                        </div>
                                    </div>
                                ) : (
                                    <div className="lg:col-span-2 bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider mb-3">
                                                Thông tin tài khoản học đường
                                            </h3>
                                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-indigo-500/5 to-purple-500/10 border border-teal-500/20">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-md">
                                                    {userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 text-center sm:text-left space-y-1">
                                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                        <span className="text-sm font-bold text-slate-800 dark:text-white">{userName}</span>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-700 dark:text-teal-400">
                                                            {userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                                        </span>
                                                        {userClassName && (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                                                                Lớp {userClassName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        Đã liên kết quyền lợi học đường thành công. Sử dụng học liệu trực quan bản quyền do nhà trường cấp.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-teal-600 dark:text-teal-400/80 font-black tracking-widest uppercase flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-white/5">
                                            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                            Đã kích hoạt toàn bộ bản quyền học liệu tương tác 3D
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-amber-200/60 dark:border-amber-500/25 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/15 p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden animate-fadeIn">
                            {/* Decorative glowing backdrops */}
                            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -left-20 -top-20 w-60 h-60 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 flex items-start gap-4.5 flex-1">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                                    <School className="w-6 h-6 animate-pulse" />
                                </div>
                                <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest text-xs font-mono">
                                        Cần liên kết trường học
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight font-heading">
                                        Chưa có thông tin tổ chức trường học
                                    </h2>
                                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold max-w-2xl">
                                        Tài khoản của bạn đã được cấu hình với gói **Trường học**, nhưng chưa thực hiện liên kết chính thức. Hãy điền Mã mời của trường tại trang cá nhân để tự động kích hoạt đầy đủ bản quyền và đồng bộ hóa lớp học của bạn ngay!
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 shrink-0 w-full md:w-auto">
                                <Link
                                    to="/profile"
                                    className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>Liên kết ngay</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )
                )}

                {!isSchoolAdmin && (
                    <>
                        {/* 3. Browse by Subjects */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 font-heading">
                                Môn học
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {subjects.map((subject) => {
                                    const Icon = subject.icon;
                                    return (
                                        <Link
                                            key={subject.id}
                                            to={`/library?subject=${subject.id}`}
                                            className={`group relative overflow-hidden rounded-[2rem] p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-xl ${subject.hoverShadow} ${subject.hoverBorder} transition-all duration-300 hover:-translate-y-1.5`}
                                        >
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex-1 pr-4">
                                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{subject.count} học liệu</p>
                                                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-slate-900 dark:group-hover:text-white font-heading">{subject.name}</h3>
                                                </div>
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-white shadow-lg ${subject.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                            </div>
                                            {/* Decorative background shape */}
                                            <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${subject.color} opacity-5 rounded-full blur-xl group-hover:opacity-15 transition-opacity pointer-events-none`}></div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* 2. Feature Highlights (Super Actions) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link
                                to="/find-ai"
                                className="group relative overflow-hidden rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:dark:shadow-indigo-950/20 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-50 dark:bg-indigo-950/30 rounded-full blur-3xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/20 transition-all pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 text-white group-hover:scale-110 transition-transform duration-300">
                                        <Sparkles className="w-7 h-7 md:w-8 md:h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-heading">Tìm kiếm với AI</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                            Không nhớ tên mô hình? Hãy mô tả bằng văn bản, trợ lý AI sẽ gợi ý tài liệu học tập chuẩn xác nhất.
                                        </p>
                                        <span className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                            Tìm kiếm ngay <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                to="/library"
                                className="group relative overflow-hidden rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:dark:shadow-blue-950/20 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-50 dark:bg-blue-950/30 rounded-full blur-3xl group-hover:bg-blue-100 dark:group-hover:bg-blue-950/20 transition-all pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 text-white group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen className="w-7 h-7 md:w-8 md:h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-heading">Thư Viện Trực Quan</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                            Duyệt qua không gian 3D tương tác và infographic sinh động, chia theo môn học và lớp học.
                                        </p>
                                        <span className="inline-flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                            Mở thư viện <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* 4. Recent/Trending Materials */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-heading">
                                    Tiếp tục học tập
                                </h2>
                                <Link to="/library" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline">
                                    Xem tất cả &rarr;
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                {recentMaterials.map((material) => {
                                    const materialHoverClass = 
                                        material.subject === 'physics' ? 'hover:shadow-blue-500/5 hover:border-blue-500/25 dark:hover:border-blue-500/40' :
                                        material.subject === 'chemistry' ? 'hover:shadow-emerald-500/5 hover:border-emerald-500/25 dark:hover:border-emerald-500/40' :
                                        'hover:shadow-rose-500/5 hover:border-rose-500/25 dark:hover:border-rose-500/40';

                                    const subjectBadgeClass = 
                                        material.subject === 'physics' ? 'bg-cyan-500/90 text-white' :
                                        material.subject === 'chemistry' ? 'bg-emerald-500/90 text-white' :
                                        'bg-orange-500/90 text-white';

                                    return (
                                        <Link
                                            key={material.id}
                                            to={`/material/${material.id}`}
                                            className={`group flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 ${materialHoverClass}`}
                                        >
                                            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden">
                                                {material.thumbnail && material.thumbnail !== '3d-placeholder' ? (
                                                    <img
                                                        loading="lazy"
                                                        decoding="async"
                                                        src={material.thumbnail}
                                                        alt={material.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 group-hover:scale-105 transition-transform duration-500">
                                                        <Box className="w-12 h-12 text-indigo-200 dark:text-indigo-800" />
                                                    </div>
                                                )}

                                                {/* Type badge */}
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md uppercase tracking-wider ${subjectBadgeClass}`}>
                                                        {getSubjectName(material.subject)}
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm uppercase tracking-wider">
                                                        {material.type === '3d-model' ? '3D' : 'INFO'}
                                                    </span>
                                                </div>

                                                {/* Play Overlay */}
                                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                                                    <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={1.5} />
                                                </div>
                                            </div>
                                            <div className="p-4 sm:p-5 flex-1 flex flex-col">
                                                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base mb-1.5 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight font-heading">{material.title}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                                                    {material.description}
                                                </p>
                                                <div className="mt-auto pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">DÀNH CHO KHỐI {material.grade}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none">
                                                        {formatRelativeTime(material.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </Layout>
    );
}
