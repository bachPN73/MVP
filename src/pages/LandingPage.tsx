import { Link } from 'react-router';
import { BookOpen, Sparkles, Maximize2, ChevronRight, FlaskConical, Sprout, Users, Globe2, Lightbulb, Menu, X, Eye } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
    const aboutUsRef = useRef<HTMLElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<{ name: string; image: string; description: string } | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToAbout = () => {
        setIsMenuOpen(false);
        aboutUsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const features = [
        {
            icon: BookOpen,
            title: 'Thư viện phong phú',
            description: 'Hàng trăm mô hình 3D và infographic về Vật lý, Hóa học, Sinh học',
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: Sparkles,
            title: 'AI tìm kiếm',
            description: 'Tìm kiếm học liệu phù hợp bằng AI từ mô tả văn bản',
            color: 'from-green-500 to-green-600',
        },
        {
            icon: Maximize2,
            title: 'Chế độ trình chiếu',
            description: 'Hiển thị toàn màn hình cho dạy học trên lớp',
            color: 'from-purple-500 to-purple-600',
        },
    ];

    const subjects = [
        {
            name: 'Vật lý',
            icon: FlaskConical,
            color: 'bg-blue-500',
            image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1200&auto=format&fit=crop',
            description: 'Khám phá thế giới qua các định luật chuyển động, điện từ và quang học với mô hình 3D trực quan.'
        },
        {
            name: 'Hóa học',
            icon: FlaskConical,
            color: 'bg-green-500',
            image: 'https://images.unsplash.com/photo-1603126010305-2f19069c9d4b?q=80&w=1200&auto=format&fit=crop',
            description: 'Quan sát các phản ứng hóa học và cấu trúc phân tử một cách sống động, không cần vào phòng thí nghiệm.'
        },
        {
            name: 'Sinh học',
            icon: Sprout,
            color: 'bg-emerald-500',
            image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=1200&auto=format&fit=crop',
            description: 'Đi sâu vào cấu trúc tế bào và các hệ cơ quan với kho tàng infographic chi tiết và chính xác.'
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Header */}
            <header className={`fixed top-4 left-4 right-4 z-50 transition-all duration-350 ${
                scrolled 
                    ? 'bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-[0_15px_45px_-10px_rgba(0,0,0,0.12)] rounded-3xl max-w-6xl mx-auto' 
                    : 'bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/40 dark:border-white/5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] rounded-3xl max-w-6xl mx-auto'
            }`}>
                <div className="max-w-7xl mx-auto px-6 py-3 sm:py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-blue-700 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent leading-none">Edu Tech</h1>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Khoa học Tự nhiên</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            to="/guide"
                            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-all font-bold text-[14px] hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-xl animate-in fade-in"
                        >
                            Hướng dẫn
                        </Link>
                        <Link
                            to="/login"
                            className="px-5 py-2 text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-primary/30 rounded-xl font-bold text-[14px] transition-all hover:bg-slate-50/80 dark:hover:bg-white/5 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 shadow-sm"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="ml-2 px-6 py-2 bg-gradient-to-r from-primary via-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 text-[14px] flex items-center justify-center shadow-md cursor-pointer"
                        >
                            Đăng ký
                        </Link>
                        <div className="border-l border-slate-200 dark:border-white/10 h-6 mx-2"></div>
                        <ThemeToggle variant="glass" />
                    </div>

                    {/* Mobile Navigation Trigger & Theme Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle variant="ghost" className="p-2" />
                        <button
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/5 shadow-xl animate-in slide-in-from-top-2 duration-300">
                        <div className="p-4 flex flex-col gap-2">
                            <Link to="/guide" className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                Hướng dẫn
                            </Link>
                            <Link to="/login" className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="px-4 py-4 bg-primary text-white rounded-xl font-bold text-center mt-2" onClick={() => setIsMenuOpen(false)}>
                                Đăng ký miễn phí
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 lg:pt-56 lg:pb-36 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-[0.05] opacity-[0.03]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
                        {/* Left Column: Text Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-full mb-5 animate-in fade-in slide-in-from-left-4 shadow-sm">
                                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase">Nền tảng học tập THPT Việt Nam</span>
                            </div>

                            <h1 className="font-black mb-6 tracking-tight leading-[1.08] text-slate-900 dark:text-white">
                                <span className="block text-3xl sm:text-4xl md:text-5xl xl:text-6xl whitespace-nowrap pb-1 w-fit mb-1">
                                    Khoa học Tự nhiên
                                </span>
                                <span className="block text-3xl sm:text-4xl md:text-5xl xl:text-6xl whitespace-nowrap mt-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent pb-3 pt-1 w-fit">
                                    Tương tác & Sống động
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mx-auto lg:mx-0 mb-8 leading-relaxed max-w-lg font-semibold">
                                Biến những bài giảng nhàm chán thành trải nghiệm thị giác tuyệt
                                vời với mô hình 3D và infographic. Tiếp thu kiến thức Vật lý, Hóa học, Sinh học một cách tự nhiên nhất.
                            </p>

                            <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3">
                                <Link
                                    to="/register"
                                    className="px-7 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold transition-all flex items-center gap-2 text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                                >
                                    Đăng ký ngay
                                    <ChevronRight className="w-4 h-4" />
                                </Link>

                                <Link
                                    to="/login"
                                    className="px-7 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center gap-2 text-base shadow-sm cursor-pointer"
                                >
                                    Đăng nhập
                                </Link>
                                
                                <Link
                                    to="/intro-deck"
                                    className="px-7 py-3.5 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-2xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-all flex items-center gap-2 text-base shadow-sm cursor-pointer"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Giới thiệu 3 Phút (Slide)
                                </Link>
                            </div>

                            {/* Subject badges */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-8">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mr-1">Khám phá:</span>
                                {subjects.map((subject) => {
                                    const Icon = subject.icon;
                                    const subjectGradient = 
                                        subject.name === 'Vật lý' ? 'from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/10' :
                                        subject.name === 'Hóa học' ? 'from-emerald-600 via-teal-600 to-green-700 shadow-emerald-500/10' :
                                        'from-green-600 via-emerald-600 to-green-700 shadow-green-500/10';
                                    return (
                                        <button
                                            key={subject.name}
                                            onClick={() => setSelectedSubject(subject)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-xl shadow-sm hover:border-indigo-500 hover:shadow-[0_6px_16px_rgba(99,102,241,0.12)] transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                                        >
                                            <div className={`w-5 h-5 bg-gradient-to-br ${subjectGradient} rounded-lg flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform`}>
                                                <Icon className="w-3 h-3 text-white" strokeWidth={2.5} />
                                            </div>
                                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 tracking-wide">{subject.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Column: Demo Video/Graphics */}
                        <div className="flex-1 w-full max-w-2xl lg:max-w-none relative animate-in zoom-in duration-700 group/hero">
                            {/* Viền phát sáng gradient xoay mượt mà */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-[2.5rem] blur-xl opacity-40 group-hover/hero:opacity-60 transition-all duration-700 animate-pulse-glow"></div>
                            
                            {/* Main Image Container */}
                            <div className="relative rounded-[2.2rem] bg-slate-950/80 backdrop-blur-md shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden aspect-[16/10] border border-white/15 transform transition-all duration-700 hover:scale-[1.02] hover:-rotate-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/60 z-10 pointer-events-none"></div>
                                <img
                                    src="/Image.png"
                                    alt="Edu Tech Platform Preview"
                                    className="w-full h-full object-cover relative z-0 opacity-90 transition-all duration-700 scale-100 group-hover/hero:scale-103"
                                />
                                
                                {/* Một lớp mờ kính che phủ nhẹ để cảm giác premium */}
                                <div className="absolute bottom-5 left-5 right-5 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-4.5 z-20 flex items-center justify-between text-white transform translate-y-0 opacity-100 transition-all duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
                                            <Sparkles className="w-4.5 h-4.5 text-indigo-300" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black tracking-wider uppercase text-indigo-200">Giao diện học liệu</p>
                                            <p className="text-[10px] text-slate-300 font-medium">Tích hợp mô hình 3D xoay chiều linh hoạt</p>
                                        </div>
                                    </div>
                                    <Link to="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-[11px] font-black uppercase rounded-xl tracking-wider transition-all shadow-lg shadow-indigo-600/20 hover:scale-105">Thử ngay</Link>
                                </div>
                            </div>

                             {/* Floating decorative badges - Highly visual physics and biology elements */}
                             <div className="hidden sm:flex absolute -left-8 top-1/4 w-14 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-2xl shadow-xl items-center justify-center border border-slate-200/80 dark:border-white/10 animate-float transition-all hover:scale-115 hover:shadow-2xl z-20 cursor-pointer">
                                 <FlaskConical className="w-7 h-7 text-emerald-500" strokeWidth={2.5} />
                             </div>
                             <div className="hidden sm:flex absolute -right-6 bottom-1/4 w-16 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-2xl shadow-xl items-center justify-center border border-slate-200/80 dark:border-white/10 animate-float-delayed transition-all hover:scale-115 hover:shadow-2xl z-20 cursor-pointer">
                                 <BookOpen className="w-8 h-8 text-indigo-600" strokeWidth={2.5} />
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Subject Preview Modal */}
            {selectedSubject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
                    {/* Glassmorphic Modal Wrapper */}
                    <div className="relative w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Close button with premium look */}
                        <button
                            onClick={() => setSelectedSubject(null)}
                            className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-slate-800/85 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/60 dark:border-white/10 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-md transition-all hover:rotate-90 cursor-pointer animate-in fade-in"
                        >
                            <X className="w-5 h-5" strokeWidth={2.5} />
                        </button>

                        <div className="flex flex-col lg:flex-row">
                            <div className="flex-1 h-64 lg:h-auto relative group">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent z-10"></div>
                                <img
                                    src={selectedSubject.image}
                                    alt={selectedSubject.name}
                                    className="w-full h-full object-cover min-h-[300px] lg:min-h-[450px]"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-8 z-20">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/30 shadow-md">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-xs font-black tracking-wider uppercase">Học liệu thực tế</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center bg-white/40 dark:bg-slate-900/20">
                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">Tổng quan môn học</span>
                                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-none">{selectedSubject.name}</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 font-semibold text-[15px] sm:text-base">
                                    {selectedSubject.description}
                                </p>
                                <div className="space-y-4">
                                    <Link
                                        to="/register"
                                        className="inline-flex w-full items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white rounded-2xl font-black text-lg hover:shadow-lg hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-98 shadow-md cursor-pointer"
                                    >
                                        Khám phá trọn bộ thư viện
                                        <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                                    </Link>
                                    <p className="text-center text-xs text-slate-400 font-extrabold uppercase tracking-widest">Đăng ký hoàn toàn miễn phí</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* About Us Section */}
            <section ref={aboutUsRef} className="py-20 md:py-32 border-t border-slate-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row gap-12 sm:gap-16 lg:gap-24 items-center">
                        <div className="flex-1 relative w-full group">
                            <div className="aspect-square rounded-full bg-gradient-to-tr from-emerald-100 to-indigo-100 dark:from-emerald-900/30 dark:to-indigo-900/30 absolute -inset-6 blur-3xl -z-10 opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
                            <div className="grid grid-cols-2 gap-4 sm:gap-6 relative z-10">
                                <img src="/Image.png" alt="Education" className="w-full aspect-[4/5] object-cover rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none mt-8 sm:mt-12 group-hover:-translate-y-2 transition-transform duration-700 border border-slate-100 dark:border-white/10" />
                                <img src="/vietnamese-classroom.png" alt="Classroom" className="w-full aspect-[4/5] object-cover rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none group-hover:-translate-y-2 transition-transform duration-700 delay-100 border border-slate-100 dark:border-white/10" />
                            </div>
                            {/* Floating label */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-8 py-4 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/10 text-center hidden sm:block z-20 hover:scale-105 transition-transform duration-500">
                                <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600 dark:from-indigo-400 dark:to-cyan-400 font-black text-3xl tracking-tight mb-1">VN STEM</p>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Nền tảng số</p>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full mb-6 border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm">
                                <Globe2 className="w-3.5 h-3.5" />
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest">Về Chúng Tôi</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                Edu Tech - Sứ mệnh chuyển đổi số giáo dục
                            </h2>
                            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed font-medium">
                                Được thành lập với mong muốn mang công nghệ 3D và AI tiên tiến vào các lớp học phổ thông, Edu Tech là nền tảng cung cấp học liệu trực quan chất lượng cao tại Việt Nam.
                            </p>
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start group/item">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20 group-hover/item:scale-110 group-hover/item:bg-indigo-100 dark:group-hover/item:bg-indigo-500/20 transition-all duration-300">
                                        <Lightbulb className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">Tầm nhìn</h4>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Trở thành bách khoa toàn thư 3D lớn nhất cho giáo dục trung học tại Việt Nam, khơi dậy đam mê khoa học.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start group/item">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20 group-hover/item:scale-110 group-hover/item:bg-emerald-100 dark:group-hover/item:bg-emerald-500/20 transition-all duration-300">
                                        <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">Giá trị cốt lõi</h4>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Lấy học sinh làm trung tâm, giáo dục không giới hạn sự sáng tạo, đề cao tính tương tác thực tiễn.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 relative">
                <div className="absolute top-40 right-10 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 text-slate-900 dark:text-white tracking-tight">Tính năng nổi bật</h2>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Công cụ học tập hiện đại giúp học sinh và giáo viên dễ dàng tiếp cận kiến thức nhanh chóng
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-8 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-2 duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50 dark:to-slate-800/50 rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-${feature.color.split('-')[1]}-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 tracking-tight">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-20">
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-950 rounded-[2.5rem] p-10 sm:p-16 md:p-20 text-white text-center shadow-2xl overflow-hidden group border border-indigo-400/20">
                    {/* Decorative patterns */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight text-white drop-shadow-md">
                            Sẵn sàng bứt phá <br className="sm:hidden" /> kiến thức?
                        </h2>
                        <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
                            Tham gia Edu Tech và khám phá cách học Khoa học Tự nhiên hiện đại,
                            tương tác và hiệu quả nhất ngay hôm nay
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-10 py-4 bg-white text-indigo-700 rounded-2xl font-bold hover:bg-indigo-50 hover:shadow-xl hover:shadow-white/20 transition-all text-lg active:scale-95 cursor-pointer"
                            >
                                Đăng ký miễn phí
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-10 py-4 bg-indigo-700/50 backdrop-blur-md border border-indigo-300/30 hover:bg-indigo-700/70 text-white rounded-2xl font-bold transition-all text-lg hover:shadow-lg active:scale-95 cursor-pointer"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                        <p className="text-indigo-200/80 text-[11px] sm:text-xs mt-8 font-bold uppercase tracking-widest">Không yêu cầu thẻ tín dụng • Truy cập tức thì</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-100 dark:border-white/5 mt-10 md:mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-black bg-gradient-to-r from-primary to-blue-700 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">Edu Tech</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6 font-medium leading-relaxed">
                                Nền tảng học liệu 3D và tương tác hàng đầu cho học sinh THPT chuyên ngành học tự nhiên tại Việt Nam.
                            </p>
                            <div className="flex gap-4">
                                {/* Social mockups */}
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer">
                                    <Globe2 className="w-5 h-5" />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-slate-900 dark:text-white font-black mb-6 uppercase tracking-widest text-sm">Hướng dẫn</h4>
                            <ul className="space-y-4">
                                <li><Link to="/guide" className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 font-bold transition-colors">Tài liệu học tập</Link></li>
                                <li><Link to="/guide" className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 font-bold transition-colors">Cách dùng Mô hình 3D</Link></li>
                                <li><Link to="/pricing" className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 font-bold transition-colors">Bảng giá</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-slate-900 dark:text-white font-black mb-6 uppercase tracking-widest text-sm">Pháp lý</h4>
                            <ul className="space-y-4">
                                <li><button className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 font-bold transition-colors cursor-pointer">Điều khoản dịch vụ</button></li>
                                <li><button className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 font-bold transition-colors cursor-pointer">Chính sách bảo mật</button></li>
                                <li><button className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 font-bold transition-colors cursor-pointer">Liên hệ hỗ trợ</button></li>
                            </ul>
                        </div>
                    </div>

                </div>
            </footer>
        </div>
    );
}
