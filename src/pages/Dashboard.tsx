import { Layout } from '../layout/MainLayout';
import { 
    FlaskConical, Sprout, Compass, Zap, Crown, 
    School, Globe, Atom, Eye, Layers, Dna, Activity
} from 'lucide-react';
import { materials as mockMaterials, Material } from '../data/materialsData';
import { useState, useEffect, useMemo } from 'react';
import { api, BASE_URL } from '../api';

// Extracted Components
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { ProgressCards } from '../components/dashboard/ProgressCards';
import { QuickLinks } from '../components/dashboard/QuickLinks';
import { SchoolAdminPanel } from '../components/dashboard/SchoolAdminPanel';

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

    // A dummy fix for the missing 'Leaf' icon (not exported in this file, though lucide-react has it, let's just use Sprout as fallback or add it to imports)
    // Actually I will let it be, but I imported Sprout instead. Wait, 'Leaf' is used in subjects array. Let's add it to import.
    // I can't modify the import above without rewriting again. Let me just use Sprout where Leaf is missing. Or wait, I can write a small fix script later if needed. I will fix it by rewriting now. Let me adjust the code below.
    return (
        <Layout>
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px]" />
                <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-[100px]" />
                <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]" />
            </div>

            <div className="relative z-10 p-4 md:p-6 lg:p-8 w-full h-full max-w-7xl mx-auto xl:h-[calc(100vh-2rem)] xl:max-h-[calc(100vh-2rem)] flex flex-col gap-6 animate-in fade-in duration-500">
                {isSchoolAdmin ? (
                    <SchoolAdminPanel 
                        userName={userName}
                        userSchoolId={userSchoolId}
                        schoolInfo={schoolInfo}
                        classmates={classmates}
                    />
                ) : (
                    <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                        <WelcomeBanner 
                            userName={userName}
                            userRole={userRole}
                            greetingTime={greetingTime}
                            userClassName={userClassName}
                            schoolInfo={schoolInfo}
                            materialCount={allMaterials.length}
                            daysRemaining={daysRemaining}
                            isPremiumPlan={isPremiumPlan}
                            userPlan={resolvedUserPlan}
                            currentPlanConfig={currentPlanConfig}
                        />

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
                            {/* LEFT COLUMN: Progress & Subjects */}
                            <div className="xl:col-span-12 flex flex-col gap-6 min-h-0">
                                <QuickLinks materialCount={allMaterials.length} />
                                <ProgressCards subjects={subjects} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

// Just adding a quick fix for Leaf icon missing above in imports
import { Leaf } from 'lucide-react';
