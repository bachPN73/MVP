import { Link } from 'react-router';
import { ChevronRight, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import ModelViewer from '../components/ModelViewer';

/* ─────────────────────────────────────────────────────────
   MODEL DATA – 5 cards đúng theo ảnh
───────────────────────────────────────────────────────── */
const MODELS = [
    {
        id: 'animal-cell',
        title: 'Tế bào động vật',
        category: 'Tế bào',
        img: '/A1.png',
        fallbackBg: '#fef3c7',
    },
    {
        id: 'plant-cell',
        title: 'Tế bào thực vật',
        category: 'Tế bào',
        img: '/A2.png',
        fallbackBg: '#d1fae5',
    },
    {
        id: 'bacteria',
        title: 'Tế bào nhân sơ (vi khuẩn)',
        category: 'Vi sinh vật',
        img: '/A3.png',
        fallbackBg: '#ede9fe',
    },
    {
        id: 'dna',
        title: 'Cấu trúc ADN',
        category: 'Di truyền',
        img: '/A4.png',
        fallbackBg: '#dbeafe',
    },
    {
        id: 'heart',
        title: 'Cấu tạo tim người',
        category: 'Cơ thể người',
        img: '/A5.png',
        fallbackBg: '#fee2e2',
    },
];

/* ─────────────────────────────────────────────────────────
   FEATURE ICONS – panel dưới hero
───────────────────────────────────────────────────────── */
const FEATURES = [
    {
        icon: (
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                <polygon points="20,4 36,32 4,32" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                <polygon points="20,10 30,28 10,28" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
            </svg>
        ),
        title: 'Mô hình 3D\ntrực quan',
        sub: 'Hiểu nhanh hơn\nnhớ lâu hơn',
    },
    {
        icon: (
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                <rect x="4" y="6" width="32" height="22" rx="2" stroke="#ffffff" strokeWidth="2.2" />
                <line x1="10" y1="13" x2="30" y2="13" stroke="#ffffff" strokeWidth="2" />
                <line x1="10" y1="18" x2="30" y2="18" stroke="#ffffff" strokeWidth="2" />
                <line x1="10" y1="23" x2="20" y2="23" stroke="#ffffff" strokeWidth="2" />
                <rect x="14" y="28" width="12" height="5" rx="1" fill="#ffffff" opacity="0.5" />
            </svg>
        ),
        title: 'Infographic\nsinh động',
        sub: 'Tổng hợp kiến\nthức sinh động',
    },
    {
        icon: (
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                <rect x="4" y="4" width="32" height="26" rx="3" stroke="#ffffff" strokeWidth="2.2" />
                <text x="20" y="22" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ffffff">AI</text>
            </svg>
        ),
        title: 'AI tìm kiếm\nthông minh',
        sub: 'Đúng bài học\nđúng ngữ cảnh',
    },
    {
        icon: (
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                <rect x="6" y="3" width="22" height="28" rx="2" stroke="#ffffff" strokeWidth="2.2" />
                <path d="M14 3v28" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />
                <rect x="28" y="18" width="8" height="15" rx="1" stroke="#ffffff" strokeWidth="1.8" />
                <line x1="10" y1="10" x2="22" y2="10" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="10" y1="15" x2="22" y2="15" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="10" y1="20" x2="18" y2="20" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
        ),
        title: 'Bám sát sách\ngiáo khoa',
        sub: 'Chuẩn chương\ntrình học trên lớp',
    },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Landing() {
    const storyRef = useRef<HTMLElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToStory = () => {
        setIsMenuOpen(false);
        storyRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
            {/* Inline CSS dành riêng cho màn hình 1366x768 để phóng to chữ và thanh menu mà không ảnh hưởng đến màn hình khác */}
            <style>{`
                @media (min-width: 1300px) and (max-width: 1400px) {
                    .custom-1366-navbar-wrapper {
                        max-width: 84rem !important;
                    }
                    .custom-1366-navbar-container {
                        padding-top: 1.5rem !important;
                        padding-bottom: 1.5rem !important;
                        padding-left: 2.75rem !important;
                        padding-right: 2.75rem !important;
                    }
                    .custom-1366-logo-img {
                        width: 5.25rem !important;
                        height: 5.25rem !important;
                    }
                    .custom-1366-logo-text-title {
                        font-size: 1.85rem !important;
                    }
                    .custom-1366-logo-text-sub {
                        font-size: 1.05rem !important;
                    }
                    .custom-1366-nav-btn {
                        font-size: 1.25rem !important;
                        padding-left: 1.5rem !important;
                        padding-right: 1.5rem !important;
                        padding-top: 0.85rem !important;
                        padding-bottom: 0.85rem !important;
                    }
                    .custom-1366-nav-action-btn {
                        font-size: 1.25rem !important;
                        padding-left: 2.25rem !important;
                        padding-right: 2.25rem !important;
                        padding-top: 0.85rem !important;
                        padding-bottom: 0.85rem !important;
                    }
                    .custom-1366-hero-padding {
                        padding-top: 13.5rem !important;
                    }
                    .custom-1366-h1 {
                        font-size: 8.5rem !important;
                    }
                    .custom-1366-tagline {
                        font-size: 3.5rem !important;
                        max-width: 60rem !important;
                    }
                    .custom-1366-subdesc {
                        font-size: 1.55rem !important;
                        max-width: 52rem !important;
                    }
                    .custom-1366-hero-btn {
                        font-size: 1.25rem !important;
                        padding-left: 2.5rem !important;
                        padding-right: 2.5rem !important;
                        padding-top: 1rem !important;
                        padding-bottom: 1rem !important;
                    }
                    .custom-1366-card {
                        padding: 1.5rem !important;
                        min-height: 10.5rem !important;
                    }
                    .custom-1366-card-title {
                        font-size: 1.35rem !important;
                    }
                    .custom-1366-card-sub {
                        font-size: 1.05rem !important;
                    }
                }
            `}</style>

            {/* ══════════════════════════════════════
                NAVBAR – pill bar, đúng theo ảnh
            ══════════════════════════════════════ */}
            <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
                <div
                    className={`mx-auto max-w-7xl xl:max-w-[92rem] rounded-3xl border transition-all duration-300 custom-1366-navbar-wrapper ${
                        scrolled
                            ? 'border-slate-200/80 bg-white/95 shadow-md backdrop-blur-md'
                            : 'border-white/30 bg-white/80 shadow-sm backdrop-blur-sm'
                    }`}
                >
                    <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 custom-1366-navbar-container">
                        {/* Logo – square */}
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex items-center gap-4 group"
                        >
                            <div className="h-16 w-16 overflow-hidden rounded-none flex-shrink-0 custom-1366-logo-img">
                                <img src="/logo.png" alt="EduTech" className="h-full w-full object-contain" />
                            </div>
                            <div className="leading-tight mt-1 text-left">
                                <p className="text-xl sm:text-2xl font-black text-black custom-1366-logo-text-title">Edu Tech</p>
                                <p className="text-xs sm:text-sm font-bold text-black mt-0.5 custom-1366-logo-text-sub">Học liệu 3D cho KHTN</p>
                            </div>
                        </button>

                        {/* Desktop nav */}
                        <nav className="hidden items-center gap-2 md:flex">
                            <button
                                onClick={scrollToStory}
                                className="rounded-xl px-5 py-3 text-base sm:text-lg font-bold text-slate-900 hover:bg-slate-100 transition-all custom-1366-nav-btn"
                            >
                                Về Edu
                            </button>
                            <Link
                                to="/guide"
                                className="rounded-xl px-5 py-3 text-base sm:text-lg font-bold text-slate-900 hover:bg-slate-100 transition-all custom-1366-nav-btn"
                            >
                                Hướng dẫn
                            </Link>

                            <div className="ml-4 flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="rounded-full border-2 border-slate-200 bg-white px-7 py-3 text-base sm:text-lg font-bold text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm custom-1366-nav-action-btn"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-full bg-blue-600 px-7 py-3 text-base sm:text-lg font-bold text-white hover:bg-blue-700 transition-all shadow-sm custom-1366-nav-action-btn"
                                >
                                    Đăng ký
                                </Link>
                                {/* Theme toggle đã bỏ theo yêu cầu */}
                            </div>
                        </nav>

                        {/* Mobile toggle */}
                        <button
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                            onClick={() => setIsMenuOpen(v => !v)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile menu */}
                    {isMenuOpen && (
                        <div className="border-t border-slate-100 px-6 pb-5 pt-3 md:hidden">
                            <button onClick={scrollToStory} className="block w-full rounded-xl px-5 py-3.5 text-left text-base font-bold text-slate-900 hover:bg-slate-50">
                                Về Edu
                            </button>
                            <Link to="/guide" className="block rounded-xl px-5 py-3.5 text-base font-bold text-slate-900 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                                Hướng dẫn
                            </Link>
                            <div className="mt-4 flex flex-col gap-3">
                                <Link to="/login" className="block w-full rounded-full border-2 border-slate-200 px-5 py-3.5 text-center text-base font-bold text-slate-900" onClick={() => setIsMenuOpen(false)}>
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="block w-full rounded-full bg-blue-600 px-5 py-3.5 text-center text-base font-bold text-white" onClick={() => setIsMenuOpen(false)}>
                                    Đăng ký
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main>
                {/* ══════════════════════════════════════
                    HERO SECTION
                    - Background: ảnh landing-bg.png (dark navy + 3D objects)
                    - Text trái, objects phải
                ══════════════════════════════════════ */}
                <section className="relative" style={{ minHeight: '100dvh' }}>
                    {/* Background: hero-bg.png = EduTechvn.png (chỉ hero, không có navbar) */}
                    <div
                        className="absolute inset-0 overflow-hidden flex justify-center"
                        style={{ background: '#071428' }}
                    >
                        <div className="relative w-full h-full">
                            <img
                                src="/Backgrod.png"
                                alt=""
                                aria-hidden
                                decoding="async"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'right top',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}
                            />
                            {/* Overlay Mobile */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#071428] via-[#071428]/80 to-transparent sm:hidden" />
                            {/* Overlay Desktop: ôm sát text theo mọi tỷ lệ */}
                            <div 
                                className="absolute inset-0 hidden sm:block" 
                                style={{ background: 'linear-gradient(to right, #071428 0%, #071428 calc(50% - 100px), rgba(7,20,40,0.4) calc(50% + 150px), transparent calc(50% + 400px))' }} 
                            />
                        </div>
                    </div>


                    {/* Content */}
                    <div className="relative z-10 mx-auto max-w-[90rem] px-6 sm:px-12 lg:px-16 flex flex-col min-h-[100dvh] pt-[8rem] sm:pt-[9.5rem] lg:pt-[10rem] custom-1366-hero-padding">
                        <div className="my-auto py-4 sm:py-8">
                            {/* Brand title */}
                            <h1
                                className="font-black text-white leading-none text-5xl sm:text-7xl lg:text-[6.5rem] xl:text-[7.5rem] tracking-tight custom-1366-h1"
                            >
                                EduTech
                            </h1>

                            {/* Tagline */}
                            <p className="mt-4 sm:mt-6 [@media(max-height:750px)]:mt-3 font-bold text-white leading-tight text-xl sm:text-3xl lg:text-[2.85rem] xl:text-[3.25rem] max-w-[55rem] custom-1366-tagline">
                                Biến kiến thức trừu tượng
                                <br className="hidden sm:inline" />
                                {' '}thành trải nghiệm trực quan
                            </p>

                            {/* Sub-description */}
                            <p className="mt-3 sm:mt-5 [@media(max-height:750px)]:mt-3 font-medium text-slate-200 leading-relaxed text-base sm:text-xl lg:text-[1.35rem] xl:text-[1.5rem] max-w-[48rem] custom-1366-subdesc">
                                Hiểu nhanh hơn nhớ lâu hơn với mô hình 3D, infographic và AI
                                <br className="hidden sm:inline" />
                                {' '}Tiết kiệm thời gian soạn bài và tìm học liệu trực quan
                            </p>

                            {/* CTA – rounded pill blue button */}
                            <div className="mt-6 sm:mt-10 [@media(max-height:750px)]:mt-5">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 sm:px-10 sm:py-4 font-bold text-white shadow-lg hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-blue-600/40 hover:shadow-xl transition-all duration-200 text-base sm:text-lg lg:text-[1.125rem] xl:text-[1.25rem] custom-1366-hero-btn"
                                >
                                    Trải nghiệm ngay
                                </Link>
                            </div>

                            {/* ── FEATURE ICONS PANEL (nằm bên dưới, trong hero) ── */}
                            <div
                                className="mt-6 sm:mt-10 lg:mt-12 [@media(max-height:750px)]:mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 max-w-[74rem]"
                            >
                                {FEATURES.map((f, i) => (
                                    <div
                                        key={i}
                                        className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 transition-colors p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col items-center justify-center min-h-[7.5rem] sm:min-h-[8rem] lg:min-h-[8.5rem] xl:min-h-[9rem] custom-1366-card"
                                    >
                                        <div className="flex justify-center scale-90 sm:scale-100 lg:scale-110 mb-1.5 sm:mb-2">{f.icon}</div>
                                        <p className="mt-1 sm:mt-1.5 text-center font-black text-white leading-snug whitespace-pre-line text-[0.95rem] sm:text-sm lg:text-[1.15rem] xl:text-[1.25rem] tracking-wide custom-1366-card-title">
                                            {f.title}
                                        </p>
                                        <p className="mt-1.5 sm:mt-2 text-center text-white leading-relaxed whitespace-pre-line text-[0.78rem] sm:text-xs lg:text-[0.925rem] xl:text-[0.975rem] font-medium opacity-90 custom-1366-card-sub">
                                            {f.sub}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════
                    CÂU CHUYỆN EDUTECH
                    - Background trắng, có molecule dots trang trí
                    - Text trái, placeholder 3D phải
                ══════════════════════════════════════ */}
                <section ref={storyRef} className="relative bg-white py-20 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
                    {/* Decorative molecule dots */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none select-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)',
                            backgroundSize: '18px 18px',
                        }}
                    />
                    <div
                        className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none select-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)',
                            backgroundSize: '18px 18px',
                        }}
                    />

                    <div className="mx-auto max-w-[100rem] px-4 sm:px-8 lg:px-12">
                        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.8fr_1.1fr_1.6fr] lg:gap-12 xl:gap-16">
                            {/* Left – Story */}
                            <div className="flex flex-col">
                                <h2 className="font-black text-blue-700 leading-tight text-3xl sm:text-4xl lg:text-[3.25rem] xl:text-[3.75rem]">
                                    Câu chuyện của EduTech
                                </h2>
                                <div className="mt-6 leading-relaxed text-slate-700 font-medium text-base sm:text-lg lg:text-[1.25rem] xl:text-[1.5rem]">
                                    <p className="mb-4">
                                        Nhiều kiến thức Khoa học quá trừu tượng để chỉ truyền đạt bằng hình ảnh tĩnh.
                                    </p>
                                    <p className="mb-4">
                                        Trong khi đó, các mô hình minh họa 3D còn ít và nằm rải rác trên các nền tảng khác nhau khiến giáo viên phải mất nhiều thời gian tìm kiếm học liệu minh họa phù hợp.
                                    </p>
                                    <p className="text-blue-700 font-bold">
                                        Đó là lý do EduTech ra đời.
                                    </p>
                                </div>
                            </div>

                            {/* Middle - User cards */}
                            <div className="flex flex-col gap-6">
                                {/* Học sinh */}
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-lg sm:text-xl font-bold text-slate-900">Học sinh</h3>
                                    <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed">
                                        Tự khám phá mô hình, ôn lại khái niệm và ghi nhớ bằng hình ảnh.
                                    </p>
                                </div>
                                {/* Giáo viên */}
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-lg sm:text-xl font-bold text-slate-900">Giáo viên</h3>
                                    <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed">
                                        Chuẩn bị bài giảng trực quan và trình chiếu học liệu ngay trong lớp.
                                    </p>
                                </div>
                            </div>

                            {/* Right – 3D model placeholder */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-full max-w-lg">
                                    {/* Video replacing 3D Model for performance */}
                                    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden aspect-square shadow-lg relative group mb-5 flex items-center justify-center">
                                        <video 
                                            src="/videodna.mp4" 
                                            autoPlay 
                                            loop 
                                            muted 
                                            playsInline 
                                            className="w-full h-full object-cover scale-105"
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <Link
                                            to="/register"
                                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                                        >
                                            Trải nghiệm ngay
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════
                    QUOTE BANNER – dark teal/navy
                ══════════════════════════════════════ */}
                <section className="bg-[#1b3a5c] py-20 text-center">
                    <div className="mx-auto max-w-4xl px-8">
                        <p className="font-medium italic leading-loose text-white/95 text-lg sm:text-xl lg:text-[1.5rem] xl:text-[1.875rem]">
                            <em>EduTech giúp việc giảng dạy trở nên trực quan hơn.</em>
                            <br />
                            <em>Để mỗi học sinh không còn phải nói...</em>
                            <br />
                            <em className="text-blue-300 font-bold">"Em không hình dung được."</em>
                        </p>
                    </div>
                </section>

                {/* ══════════════════════════════════════
                    MÔ HÌNH 3D NỔI BẬT
                ══════════════════════════════════════ */}
                <section className="bg-white py-16">
                    <div className="mx-auto max-w-[90rem] px-6 sm:px-10 lg:px-16">
                        {/* Header row */}
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[0.8125rem] sm:text-base font-bold uppercase tracking-widest text-blue-600">
                                Học liệu trực quan
                            </p>
                        </div>
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-black text-slate-900 leading-tight text-2xl sm:text-3xl lg:text-[2.5rem] xl:text-[3rem]">
                                Mô hình 3D nổi bật
                            </h2>
                            <Link
                                to="/register"
                                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                Xem tất cả <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Cards grid – 5 cards */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            {MODELS.map((m) => (
                                <Link
                                    key={m.id}
                                    to="/register"
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-100 transition-all duration-200"
                                >
                                    {/* Image thumbnail */}
                                    <div
                                        className="relative aspect-[4/3] overflow-hidden flex items-center justify-center"
                                        style={{ background: m.fallbackBg }}
                                    >

                                        <img
                                            src={m.img}
                                            alt={m.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                                        <p className="text-sm sm:text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
                                            {m.title}
                                        </p>
                                        <p className="mt-1 text-xs sm:text-sm text-slate-400">{m.category}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs sm:text-sm text-slate-400 font-medium">Xem chi tiết</span>
                                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile "Xem tất cả" */}
                        <div className="mt-5 text-center sm:hidden">
                            <Link to="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
                                Xem tất cả <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════
                    SẴN SÀNG VÀO LỚP HỌC SỐ – CTA lớn
                    Dùng hero-bg.png (EduTechvn.png) làm trang trí
                ══════════════════════════════════════ */}
                <section className="relative overflow-hidden bg-white py-24 text-center">
                    {/* Decorative molecule dots giống trong ảnh */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none select-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                    <div
                        className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none select-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)',
                            backgroundSize: '20px 20px',
                        }}
                    />

                    <div className="relative z-10 mx-auto max-w-4xl px-6">
                        <h2 className="font-black text-slate-900 leading-tight text-3xl sm:text-5xl lg:text-[3.75rem] xl:text-[4.5rem]">
                            Sẵn sàng vào lớp học số
                        </h2>

                        <div className="mt-8 sm:mt-10">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-full bg-blue-600 font-bold text-white shadow-lg hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-blue-600/40 hover:shadow-xl transition-all duration-200 py-3 px-6 sm:py-4 sm:px-10 lg:py-[1rem] lg:px-[2.5rem] text-base sm:text-lg lg:text-[1.125rem] xl:text-[1.25rem]"
                            >
                                Trải nghiệm ngay
                            </Link>
                        </div>

                        {/* Secondary login link */}
                        <p className="mt-4 text-sm text-slate-400">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </section>
            </main>

            {/* ══════════════════════════════════════
                FOOTER – Logo trái + Liên hệ phải
            ══════════════════════════════════════ */}
            {/* ══ FOOTER – đồng màu với Quote section (#1b3a5c) ══ */}
            <footer className="py-16 bg-[#1b3a5c]">
                <div className="mx-auto max-w-[90rem] px-6 sm:px-10 lg:px-16">
                    <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
                        {/* Logo block – vuông, to hơn */}
                        <div className="flex items-start gap-5">
                            <div className="h-24 w-24 overflow-hidden rounded-none flex-shrink-0 bg-white p-1.5 shadow-sm">
                                <img src="/logo.png" alt="EduTech" className="h-full w-full object-contain" />
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-black text-white tracking-wide">Edu Tech</p>
                                <p className="text-base font-medium text-white/80 mt-1">Học liệu 3D cho Khoa học Tự nhiên</p>
                            </div>
                        </div>

                        {/* Liên hệ block */}
                        <div>
                            <p className="mb-5 text-lg font-bold text-white uppercase tracking-wider">Liên hệ</p>
                            <ul className="space-y-4 text-base font-medium text-white/85">
                                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
                                    <svg className="h-5 w-5 text-white/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    0982143958
                                </li>
                                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
                                    <svg className="h-5 w-5 text-white/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    netangedutech@gmail.com
                                </li>
                                <li className="flex items-start gap-3 hover:text-white transition-colors">
                                    <svg className="h-5 w-5 text-white/70 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <a
                                        href="https://www.facebook.com/profile.php?id=61590611280153"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        facebook.com/EduTech
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <p className="mt-12 border-t border-white/20 pt-8 text-center text-sm font-medium text-white/60 tracking-wide">
                        © {new Date().getFullYear()} EduTech · Học liệu 3D cho Khoa học Tự nhiên
                    </p>
                </div>
            </footer>

            {/* ── Mobile sticky bottom bar (đăng nhập/đăng ký) ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-slate-100 bg-white/95 p-3 backdrop-blur-sm md:hidden">
                <Link
                    to="/login"
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-center text-sm font-bold text-slate-700 hover:border-blue-300 transition-colors"
                >
                    Đăng nhập
                </Link>
                <Link
                    to="/register"
                    className="flex-1 rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                >
                    Đăng ký miễn phí
                </Link>
            </div>
        </div>
    );
}
