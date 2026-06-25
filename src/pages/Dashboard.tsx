import { Layout } from '../layout/MainLayout';
import { useNavigate } from 'react-router';
import { Mic, Search, Bell, ArrowRight, Heart, Sparkles, BookOpen, Database, Timer, Crown, School, Archive, Folder, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { api } from '../api';

const ModelViewer = lazy(() => import('../components/ModelViewer'));

export default function Dashboard() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Học sinh');
    const [materialCount, setMaterialCount] = useState(0);
    const [models3DCount, setModels3DCount] = useState(0);
    const [infoCount, setInfoCount] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [userPlan, setUserPlan] = useState('FREE');
    const [daysLeft, setDaysLeft] = useState<number | '∞'>('∞');
    const [schoolName, setSchoolName] = useState('Chưa tham gia');
    const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
    const [storageUsage, setStorageUsage] = useState(0);
    const [vaultPeriods, setVaultPeriods] = useState<any[]>([]);
    const [showAllPeriods, setShowAllPeriods] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const fetchModels = async () => {
        setIsRefreshing(true);
        try {
            const dbModels = await api.getModels();
            setMaterialCount(dbModels.length);
            
            // Giả lập phân loại (nếu API có type, hãy đếm theo type thực tế)
            const count3D = dbModels.filter((m: any) => m.type === '3d-model' || !m.type).length;
            const countInfo = dbModels.filter((m: any) => m.type === 'infographic').length;
            
            setModels3DCount(count3D > 0 ? count3D : dbModels.length); // Fallback tạm
            setInfoCount(countInfo);
        } catch (error) {
            console.error("Error fetching models for dashboard:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500); // UI feedback
        }
    };

    useEffect(() => {
        try {
            const stored = localStorage.getItem('edu_tech_user');
            if (stored) {
                const currentUser = JSON.parse(stored);
                if (currentUser.name) setUserName(currentUser.name);
                
                let currentPlan = (currentUser.plan || 'free').toUpperCase();
                setUserPlan(currentPlan);

                if (currentUser.schoolId) {
                    setUserSchoolId(currentUser.schoolId);
                    // Fetch or use cached school name. For now, fallback to something if not found
                    // In a real app we would call getSchoolInfo or store schoolName in user.
                    // For demo, we might not have it in user, so let's set a placeholder or use what's there
                    setSchoolName("Tổ chức giáo dục"); 
                } else {
                    setUserSchoolId(null);
                    setSchoolName('Chưa tham gia');
                }
                
                if (currentUser.storageUsage !== undefined) {
                    setStorageUsage(currentUser.storageUsage);
                } else {
                    setStorageUsage(25); // Fallback demo (25%)
                }

                if (currentUser.planExpiry) {
                    const expiryDate = new Date(currentUser.planExpiry);
                    const now = new Date();
                    const diffTime = expiryDate.getTime() - now.getTime();
                    if (diffTime > 0) {
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        setDaysLeft(diffDays);
                    } else {
                        setDaysLeft(0);
                    }
                } else if (currentPlan !== 'FREE') {
                    setDaysLeft(30); // Fallback: mặc định 30 ngày nếu gói trả phí nhưng thiếu expiry
                } else {
                    setDaysLeft('∞');
                }
            }
        } catch (e) { }

        try {
            const storedPeriods = localStorage.getItem('edu_tech_vault_periods');
            if (storedPeriods) {
                setVaultPeriods(JSON.parse(storedPeriods));
            }
        } catch (e) { }

        fetchModels();
    }, []);

    const searchSuggestions = [
        "Cấu tạo tế bào", "Phản ứng oxi hóa", "ADN là gì?", "Nguyên tử carbon"
    ];

    return (
        <Layout>
            <div className="relative z-10 p-3 md:p-6 w-full h-full max-w-[100rem] mx-auto flex flex-col lg:justify-between gap-3.5 xl:gap-6 animate-in fade-in duration-500 overflow-y-auto overflow-x-hidden pb-24 lg:pb-6">
                
                {/* 1. Header Section - Unified Bar */}
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl lg:rounded-[1.5rem] shadow-md border-2 lg:border-[3px] border-slate-200 dark:border-slate-600 p-2.5 sm:p-3 lg:p-5 px-3 sm:px-4 lg:px-8 flex flex-row justify-between items-center gap-2 sm:gap-3 lg:gap-6 shrink-0 transition-all duration-300">
                    <div className="flex-1 min-w-0 text-left">
                        <h1 className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center justify-start gap-1 truncate">
                            Xin chào, {userName} <span className="animate-wave inline-block origin-bottom-right hover:rotate-[20deg] transition-transform cursor-default">👋</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-[10px] sm:text-xs md:text-sm font-medium hidden sm:block">Hôm nay bạn muốn khám phá điều gì?</p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 lg:gap-8 shrink-0 mt-0">
                        {/* HỌC LIỆU */}
                        <div className="flex flex-col items-center lg:items-start group cursor-default">
                            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold mb-0.5 text-[8px] sm:text-[10px] md:text-xs group-hover:scale-105 origin-center lg:origin-left transition-transform">
                                <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 group-hover:-rotate-6 transition-transform" /> HỌC LIỆU
                            </div>
                            <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{materialCount}</span>
                        </div>

                        <div className="hidden sm:block w-px h-8 lg:h-10 bg-slate-200 dark:bg-slate-600"></div>

                        {/* THỜI HẠN */}
                        <div className="flex flex-col items-center lg:items-start group cursor-default">
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold mb-0.5 text-[8px] sm:text-[10px] md:text-xs group-hover:scale-105 origin-center lg:origin-left transition-transform">
                                <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 group-hover:rotate-12 transition-transform" /> THỜI HẠN
                            </div>
                            <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {daysLeft === '∞' ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/></svg>
                                ) : (
                                    <div className="flex items-baseline gap-0.5">
                                        <span>{daysLeft}</span>
                                        <span className="text-[9px] sm:text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400">ngày</span>
                                    </div>
                                )}
                            </span>
                        </div>

                        <div className="hidden sm:block w-px h-8 lg:h-10 bg-slate-200 dark:bg-slate-600"></div>

                        {/* GÓI */}
                        <div className="flex flex-col items-center lg:items-start group cursor-default">
                            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold mb-0.5 text-[8px] sm:text-[10px] md:text-xs group-hover:scale-105 origin-center lg:origin-left transition-transform">
                                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform" /> GÓI
                            </div>
                            <span className={`text-sm sm:text-xl md:text-2xl lg:text-3xl font-black transition-colors ${userPlan !== 'FREE' ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500' : 'text-slate-800 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400'}`}>
                                {userPlan}
                            </span>
                        </div>

                        <div className="hidden sm:block w-px h-8 lg:h-10 bg-slate-200 dark:bg-slate-600"></div>

                        {/* Notification Bell */}
                        <button className="p-1.5 sm:p-2 lg:p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center group shrink-0" aria-label="Notifications">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-300 group-hover:animate-wiggle" />
                        </button>
                    </div>
                </div>

                {/* 2. Middle Grid Section */}
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-3.5 md:gap-6 flex-none lg:flex-1">
                    
                    {/* A. Banner Mùa Hè (Col 5) -> Thay bằng hiển thị 1 model 3D */}
                    <div className="col-span-2 lg:col-span-5 relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-md shadow-indigo-500/5 dark:shadow-indigo-500/10 border-2 lg:border-[3px] border-slate-200 dark:border-slate-600 group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-slate-950 flex flex-col min-h-[14rem] md:min-h-[15rem] xl:min-h-[17rem]">
                        <div className="absolute inset-0 z-0">
                            <Suspense fallback={
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                                    <p className="text-slate-400 text-sm">Đang tải mô hình 3D...</p>
                                </div>
                            }>
                                <ModelViewer 
                                    modelUrl="/models/plant-cell.glb" 
                                    autoRotate={true} 
                                    minimal={true} 
                                    modelRotation={[0, Math.PI / 2, 0]} 
                                    cameraTarget={[0, -0.2, 0]} 
                                />
                            </Suspense>
                        </div>
                        
                        {/* Overlay thông tin hoặc nút bấm */}
                        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-slate-700/50 flex items-center gap-1.5 md:gap-2">
                            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400 animate-pulse" />
                            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-wider">Mô hình 3D tương tác</span>
                        </div>

                        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10">
                            <button 
                                onClick={() => navigate('/material/plant-cell')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] md:text-xs px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1 md:gap-1.5"
                            >
                                Chi tiết <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            </button>
                        </div>

                        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-10 bg-black/60 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg">
                            <span className="text-[9px] md:text-[0.6875rem] text-slate-300 font-bold">Tế bào thực vật (3D)</span>
                        </div>
                    </div>

                    {/* B. AI Search (Col 4) */}
                    <div 
                        onClick={() => navigate('/find-ai')}
                        className="col-span-1 lg:col-span-4 bg-white dark:bg-slate-800/90 rounded-2xl lg:rounded-3xl relative shadow-md shadow-violet-500/5 dark:shadow-violet-500/10 border-2 lg:border-[3px] border-slate-200 dark:border-slate-600 flex flex-col overflow-hidden aspect-square lg:aspect-auto min-h-[11rem] md:min-h-[12.5rem] xl:min-h-[15.625rem] group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-violet-300 dark:hover:border-violet-500"
                    >
                        
                        {/* Background Image Robot spanning the whole card */}
                        <div className="absolute inset-0 z-0">
                            <img src="/images/robot2.png" alt="AI Background" className="absolute right-0 bottom-0 h-full w-auto max-w-[50%] sm:max-w-[50%] object-contain object-right-bottom opacity-80 group-hover:scale-110 group-hover:-translate-y-3 group-hover:-translate-x-2 transition-transform duration-700" />
                            {/* Gradient to ensure text readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-800 dark:via-slate-800/95 dark:to-transparent" />
                        </div>

                        <div className="relative z-10 p-3.5 sm:p-6 flex flex-col h-full w-[90%] sm:w-[85%]">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-violet-700 dark:text-violet-400 font-extrabold mb-1.5 sm:mb-3 text-[9px] sm:text-xs uppercase tracking-wider">
                                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:rotate-12 transition-transform" /> AI HỖ TRỢ TÌM KIẾM
                            </div>
                            <h2 className="text-xs sm:text-xl md:text-2xl font-black text-violet-700 dark:text-violet-400 mb-2 sm:mb-5 leading-tight">Bạn muốn tìm gì<br className="hidden sm:block" /> hôm nay?</h2>
                            
                            {/* Thanh tìm kiếm thật cho Desktop */}
                            <div className="hidden sm:block relative mb-4 md:mb-5 group/search">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Ví dụ: Cấu trúc tế bào thực vật"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2.5 md:py-3 pl-9 pr-9 text-slate-700 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-xs md:text-sm group-hover/search:border-indigo-300 dark:group-hover/search:border-indigo-600"
                                />
                                <Mic className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500 cursor-pointer hover:scale-125 transition-transform" />
                            </div>

                            {/* Thanh tìm kiếm giả lập cho Mobile */}
                            <div className="sm:hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-full py-1.5 px-3 flex items-center justify-between shadow-sm mb-2">
                                <span className="text-[10px] text-slate-400 truncate">Tìm kiếm...</span>
                                <Search className="w-3 h-3 text-slate-400" />
                            </div>

                            {/* Robot Bubble - Ẩn trên Mobile */}
                            <div className="hidden sm:block mt-auto relative z-20 pb-2 md:pb-4">
                                <div className="bg-white dark:bg-slate-700 p-2.5 md:p-3 rounded-2xl rounded-br-none shadow-md border border-slate-100 dark:border-slate-600 max-w-[12.5rem] text-[11px] md:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                                    Tôi có thể giúp bạn tìm hiểu chủ đề bạn học nhé!
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* C. Library Stats (Col 3) */}
                    <div className="col-span-1 lg:col-span-3 bg-white dark:bg-slate-800/90 rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 xl:p-6 shadow-md shadow-emerald-500/5 dark:shadow-emerald-500/10 border-2 lg:border-[3px] border-slate-200 dark:border-slate-600 flex flex-col justify-between relative overflow-hidden aspect-square lg:aspect-auto min-h-[11rem] md:min-h-[12.5rem] xl:min-h-[15.625rem] group/lib transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-500">
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1 sm:mb-1.5 text-[9px] sm:text-xs uppercase tracking-wider">
                                    <ClockIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/lib:animate-spin-slow" /> THƯ VIỆN HỌC LIỆU
                                </div>
                                <h2 className="text-xs sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1 leading-tight sm:leading-relaxed truncate sm:whitespace-normal">Kho học liệu 3D phong phú</h2>
                                <p className="hidden sm:block text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4 md:mb-8 leading-relaxed">Tổng hợp tất cả mô hình, infographic, video và bài tập.</p>
                            </div>
                            
                            {/* Grid 2 cột cho Mô hình 3D và Infographic */}
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-3 md:gap-4 text-center my-1 sm:mb-6">
                                <div 
                                    onClick={(e) => { e.stopPropagation(); navigate('/library?type=3d-model'); }}
                                    className="flex flex-col items-center group/stat cursor-pointer bg-slate-50 dark:bg-slate-800/80 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-md"
                                >
                                    <div className="mb-1 sm:mb-2 md:mb-3 text-blue-600 group-hover/stat:scale-110 group-hover/stat:-rotate-3 transition-transform duration-300">
                                        <BoxIcon className="w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 mx-auto" />
                                    </div>
                                    <span className="text-[8px] sm:text-[0.625rem] md:text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 md:mb-1">3D Model</span>
                                    <span className="text-xs sm:text-xl md:text-2xl font-black text-blue-700 dark:text-blue-400">{models3DCount}</span>
                                </div>
                                <div 
                                    onClick={(e) => { e.stopPropagation(); navigate('/library?type=infographic'); }}
                                    className="flex flex-col items-center group/stat cursor-pointer bg-slate-50 dark:bg-slate-800/80 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-md"
                                >
                                    <div className="mb-1 sm:mb-2 md:mb-3 text-orange-500 group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-transform duration-300">
                                        <FileTextIcon className="w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 mx-auto" />
                                    </div>
                                    <span className="text-[8px] sm:text-[0.625rem] md:text-[0.6875rem] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 md:mb-1">Infographic</span>
                                    <span className="text-xs sm:text-xl md:text-2xl font-black text-slate-800 dark:text-white">{infoCount}</span>
                                </div>
                            </div>

                            {/* Nút Xem tất cả / Cập nhật */}
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2.5 mt-auto sm:pt-3 sm:border-t sm:border-slate-100 sm:dark:border-slate-700">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); fetchModels(); }}
                                    disabled={isRefreshing}
                                    className={`hidden sm:flex items-center justify-center gap-1.5 text-xs md:text-[0.8125rem] text-red-600 dark:text-red-500 font-bold hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group/btn border border-red-100 dark:border-red-900/30 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl w-full sm:w-auto ${isRefreshing ? 'opacity-50' : ''}`}
                                >
                                    <RefreshIcon strokeWidth={2.5} className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isRefreshing ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} /> 
                                    Cập nhật
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigate('/library'); }}
                                    className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-[10px] sm:text-xs md:text-[0.8125rem] whitespace-nowrap w-full sm:w-auto"
                                >
                                    Xem học liệu →
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 2.5. Info & Storage Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 md:gap-6 shrink-0">
                    {/* Thông tin trường */}
                    <div className="bg-white dark:bg-slate-800/90 rounded-2xl lg:rounded-3xl p-4 md:p-6 shadow-md shadow-indigo-500/5 dark:shadow-indigo-500/10 border-2 lg:border-[3px] border-slate-200 dark:border-slate-600 flex items-center gap-4 md:gap-6 group hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <School className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[10px] md:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5 md:mb-1">Trường đang tham gia</div>
                            <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{schoolName}</h3>
                            {userSchoolId ? (
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1">Hệ thống liên kết học liệu trực tuyến</p>
                            ) : (
                                <button 
                                    onClick={() => navigate('/join-school')}
                                    className="mt-1.5 text-xs md:text-[0.8125rem] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl transition-colors shadow-sm"
                                >
                                    Hãy tham gia
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Kho tạm thời */}
                    <div 
                        onClick={() => navigate('/vault')} 
                        className="bg-white dark:bg-slate-800/90 rounded-2xl lg:rounded-3xl p-4 md:p-6 shadow-md shadow-emerald-500/5 dark:shadow-emerald-500/10 border-2 lg:border-[3px] border-slate-200 dark:border-slate-600 flex items-center gap-4 md:gap-6 group hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                            <Archive className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5 md:mb-1">Lưu trữ cá nhân</div>
                            <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Kho tạm thời</h3>
                            
                            {vaultPeriods.length > 0 ? (
                                <div className="flex items-center gap-1 mt-2.5 md:mt-3">
                                    <button 
                                        onClick={scrollLeft}
                                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>
                                    
                                    <div 
                                        ref={scrollContainerRef}
                                        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 scroll-smooth"
                                    >
                                        {vaultPeriods.map((p: any) => (
                                            <div 
                                                key={p.id} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/vault?period=${p.id}`);
                                                }}
                                                className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold shrink-0 shadow-sm transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer"
                                            >
                                                <Folder className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                <span className="truncate max-w-[8.5rem] md:max-w-[9.375rem]">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={scrollRight}
                                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1">Chưa có tiết học nào được lưu</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Subjects Section */}
                <div className="flex-none lg:flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold mb-2.5 md:mb-3 text-[10px] md:text-xs uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" /> KHÁM PHÁ THEO MÔN HỌC
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 md:gap-6 flex-1 min-h-0">
                        
                        {/* Biology Card */}
                        <div 
                            onClick={() => navigate('/library?subject=biology')}
                            className="bg-white dark:bg-slate-800/80 rounded-2xl lg:rounded-3xl relative overflow-hidden cursor-pointer shadow-md shadow-emerald-500/5 dark:shadow-emerald-500/10 border-2 lg:border-[3px] border-emerald-200/50 dark:border-emerald-500/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 h-full flex group hover:border-emerald-400 dark:hover:border-emerald-500"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <img src="/images/subject-biology.png" alt="Sinh học" className="w-full h-full object-cover object-right group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                            </div>

                            <div className="flex-1 z-10 relative p-4 md:p-6 pr-3 md:pr-4 w-2/3">
                                <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-emerald-500 text-white text-[10px] md:text-[0.625rem] font-bold rounded-full mb-3 md:mb-4 tracking-wider group-hover:scale-105 transition-transform origin-left">SINH-01</span>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1.5 md:mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Sinh học</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-[10rem] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Khám phá sự sống và thế giới sinh vật</p>
                            </div>
                            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                                <DotsIcon className="w-4.5 h-4.5 md:w-5 h-5 text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-full p-0.5 backdrop-blur-sm group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                            </div>
                        </div>

                        {/* Chemistry Card */}
                        <div 
                            onClick={() => navigate('/library?subject=chemistry')}
                            className="bg-white dark:bg-slate-800/80 rounded-2xl lg:rounded-3xl relative overflow-hidden cursor-pointer shadow-md shadow-orange-500/5 dark:shadow-orange-500/10 border-2 lg:border-[3px] border-orange-200/50 dark:border-orange-500/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 h-full flex group hover:border-orange-400 dark:hover:border-orange-500"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <img src="/images/subject-chemistry.png" alt="Hóa học" className="w-full h-full object-cover object-right group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                            </div>

                            <div className="flex-1 z-10 relative p-4 md:p-6 pr-3 md:pr-4 w-2/3">
                                <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-orange-500 text-white text-[10px] md:text-[0.625rem] font-bold rounded-full mb-3 md:mb-4 tracking-wider group-hover:scale-105 transition-transform origin-left">CHEM-01</span>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1.5 md:mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Hóa học</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-[10rem] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Khám phá thế giới của nguyên tố và phản ứng</p>
                            </div>
                            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                                <DotsIcon className="w-4.5 h-4.5 md:w-5 h-5 text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-full p-0.5 backdrop-blur-sm group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                            </div>
                        </div>

                        {/* Physics Card */}
                        <div 
                            onClick={() => navigate('/library?subject=physics')}
                            className="bg-white dark:bg-slate-800/80 rounded-2xl lg:rounded-3xl relative overflow-hidden cursor-pointer shadow-md shadow-blue-500/5 dark:shadow-blue-500/10 border-2 lg:border-[3px] border-blue-200/50 dark:border-blue-500/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 h-full flex group hover:border-blue-400 dark:hover:border-blue-500"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <img src="/images/subject-physics.png" alt="Vật lý" className="w-full h-full object-cover object-right group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                            </div>

                            <div className="flex-1 z-10 relative p-4 md:p-6 pr-3 md:pr-4 w-2/3">
                                <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-blue-500 text-white text-[10px] md:text-[0.625rem] font-bold rounded-full mb-3 md:mb-4 tracking-wider group-hover:scale-105 transition-transform origin-left">PHYS-01</span>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1.5 md:mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Vật lý</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-[10rem] group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Khám phá vật chất, năng lượng và vũ trụ</p>
                            </div>
                            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                                <DotsIcon className="w-4.5 h-4.5 md:w-5 h-5 text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-full p-0.5 backdrop-blur-sm group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </Layout>
    );
}

// Icon Helpers
function BoxIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
}

function ClockIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
}

function DiamondIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 3h12l4 6-10 13L2 9Z"></path><path d="M11 3 8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path></svg>;
}

function FileTextIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
}

function RefreshIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>;
}

function DotsIcon(props: any) {
    return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle><circle cx="5" cy="12" r="1.5"></circle></svg>;
}
