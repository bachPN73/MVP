import { Link } from 'react-router';
import {
    BookOpen,
    ChevronRight,
    Dna,
    Eye,
    Globe2,
    GraduationCap,
    Library,
    Lightbulb,
    Maximize2,
    Menu,
    Microscope,
    Rotate3d,
    Search,
    Sparkles,
    Sprout,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';

type SubjectPreview = {
    name: string;
    icon: LucideIcon;
    image: string;
    description: string;
    tone: string;
    topics: string[];
};

export default function Landing() {
    const aboutUsRef = useRef<HTMLElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<SubjectPreview | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToAbout = () => {
        setIsMenuOpen(false);
        aboutUsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const stats = [
        { value: '3D', label: 'học liệu trực quan' },
        { value: 'AI', label: 'tìm kiếm theo bài học' },
        { value: 'THPT', label: 'bám sát lớp học Việt Nam' },
    ];

    const features = [
        {
            icon: Library,
            title: 'Kho học liệu theo môn',
            description: 'Mỗi mô hình được gắn môn, khối lớp, chủ đề và mô tả ngắn để giáo viên mở đúng nội dung nhanh hơn.',
        },
        {
            icon: Search,
            title: 'Tìm kiếm bằng ngữ cảnh',
            description: 'Học sinh có thể mô tả khái niệm cần hiểu, hệ thống gợi ý học liệu 3D hoặc infographic phù hợp.',
        },
        {
            icon: Maximize2,
            title: 'Trình chiếu trên lớp',
            description: 'Màn hình học liệu ưu tiên quan sát, xoay mô hình và trình bày kiến thức rõ ràng khi dạy trực tiếp.',
        },
    ];

    const subjects: SubjectPreview[] = [
        {
            name: 'Xem 3D',
            icon: Rotate3d,
            image: '/Image.png',
            description: 'Xoay, phóng to và quan sát mô hình 3D ngay trong lớp học để hiểu cấu trúc khó bằng hình ảnh trực quan.',
            tone: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200',
            topics: ['Xoay mô hình', 'Phóng to', 'Trình chiếu'],
        },
        {
            name: 'DNA',
            icon: Dna,
            image: '/thumbnails/images/dna.jpg',
            description: 'Khám phá chuỗi xoắn kép DNA, các cặp base và cách thông tin di truyền được lưu trữ trong tế bào.',
            tone: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-200',
            topics: ['Xoắn kép', 'Di truyền', 'Nucleotide'],
        },
        {
            name: 'Tế bào thực vật',
            icon: Sprout,
            image: '/thumbnails/images/plant-cell.jpg',
            description: 'Quan sát lục lạp, nhân tế bào, không bào và vách tế bào để hiểu cấu trúc cơ bản của thực vật.',
            tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200',
            topics: ['Lục lạp', 'Nhân tế bào', 'Không bào'],
        },
    ];

    const learningFlow = [
        {
            icon: BookOpen,
            title: 'Chọn bài học',
            description: 'Bắt đầu từ môn, khối lớp hoặc chủ đề trong thư viện.',
        },
        {
            icon: Eye,
            title: 'Quan sát mô hình',
            description: 'Xoay, phóng to và nhìn cấu trúc từ nhiều góc.',
        },
        {
            icon: Lightbulb,
            title: 'Ghi nhớ bằng hình ảnh',
            description: 'Kết nối mô hình với giải thích ngắn, thuật ngữ và ví dụ.',
        },
    ];

    const SelectedSubjectIcon = selectedSubject?.icon;

    return (
        <div className="min-h-screen bg-[#f6f8fb] text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <header
                className={`fixed left-3 right-3 top-3 z-50 mx-auto max-w-6xl border backdrop-blur-xl transition-all duration-300 ${
                    scrolled
                        ? 'border-slate-200/50 bg-white/70 shadow-lg shadow-slate-900/5 dark:border-white/5 dark:bg-slate-950/70'
                        : 'border-white/20 bg-white/60 shadow-sm dark:border-white/5 dark:bg-slate-950/50'
                } rounded-2xl`}
            >
                <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                    <button
                        className="group flex items-center gap-3 text-left"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <span className="flex h-14 w-14 items-center justify-center rounded-lg overflow-hidden transition-transform group-hover:-translate-y-0.5">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </span>
                        <span>
                            <span className="block text-lg font-black leading-none tracking-tight text-slate-950 dark:text-white">
                                Edu Tech
                            </span>
                        </span>
                    </button>

                    <nav className="hidden items-center gap-1 md:flex">
                        <button
                            onClick={scrollToAbout}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-indigo-400 hover:scale-105 active-press"
                        >
                            Về Edu
                        </button>
                        <Link
                            to="/guide"
                            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-indigo-400 hover:scale-105 active-press"
                        >
                            Hướng dẫn
                        </Link>
                        <Link
                            to="/pricing"
                            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-indigo-400 hover:scale-105 active-press"
                        >
                            Bảng giá
                        </Link>
                        <Link
                            to="/login"
                            className="ml-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm hover:border-blue-300 hover:text-blue-650 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-blue-300/30 hover:scale-105 active-press"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 px-4 py-2 text-sm font-bold text-white shadow-sm hover:shadow-primary-glow hover:scale-105 active-press"
                        >
                            Đăng kí/ Bắt đầu
                        </Link>
                        <div className="ml-2 border-l border-slate-200 pl-2 dark:border-white/10">
                            <ThemeToggle variant="glass" />
                        </div>
                    </nav>

                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle variant="ghost" className="p-2" />
                        <button
                            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.08]"
                            onClick={() => setIsMenuOpen((value) => !value)}
                            aria-label="Mở menu"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950 md:hidden">
                        <button
                            onClick={scrollToAbout}
                            className="block w-full rounded-lg px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.08]"
                        >
                            Về Edu
                        </button>
                        <Link
                            to="/guide"
                            className="block rounded-lg px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.08]"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Hướng dẫn
                        </Link>
                        <Link
                            to="/login"
                            className="block rounded-lg px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.08]"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="mt-2 block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 px-4 py-3 text-center text-sm font-bold text-white shadow-sm hover:scale-[1.02] active-press"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Đăng ký miễn phí
                        </Link>
                    </div>
                )}
            </header>

            <main>
                <section className="relative min-h-[88vh] overflow-hidden pb-16 pt-28 text-white sm:pb-20 sm:pt-36 lg:min-h-[92vh]">
                    <img
                        src="/vietnamese-classroom.png"
                        alt="Lớp học Việt Nam sử dụng học liệu số"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/70 to-slate-950/20" />
                    <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f6f8fb] to-transparent dark:from-slate-950" />

                    <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl pt-10 lg:pt-16">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100 backdrop-blur animate-pulse-slow">
                                <GraduationCap className="h-4 w-4 text-blue-300" />
                                Học liệu 3D cho lớp học Việt Nam
                            </div>
                            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
                                Edu Tech
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-100 sm:text-xl">
                                Nền tảng học Khoa học Tự nhiên giúp học sinh quan sát khái niệm khó bằng mô hình 3D,
                                infographic và tìm kiếm AI theo đúng ngữ cảnh bài học.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 px-6 py-3.5 text-base font-black text-white shadow-lg shadow-blue-600/25 hover:shadow-indigo-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                                >
                                    Học thử miễn phí
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                                <Link
                                    to="/intro-deck"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-base font-black text-white backdrop-blur hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Xem slide giới thiệu
                                </Link>
                            </div>
                        </div>

                        <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                            {stats.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 hover:border-white/25 hover:shadow-md"
                                >
                                    <div className="text-2xl font-black text-white">{item.value}</div>
                                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-200">
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto -mt-10 grid max-w-7xl grid-cols-1 gap-3 px-4 pb-16 sm:px-6 md:grid-cols-3 lg:px-8">
                    {learningFlow.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 group hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-500/30 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-blue-700 dark:bg-white/[0.08] dark:text-blue-300 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 group-hover:text-blue-650 dark:group-hover:text-blue-400 transition-colors">
                                        0{index + 1}
                                    </span>
                                </div>
                                <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </h2>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </section>

                <section className="border-y border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-slate-900/60">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                                    Học liệu trực quan
                                </p>
                                <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                                    Học bằng cách nhìn, xoay và so sánh.
                                </h2>
                            </div>
                            <Link
                                to="/register"
                                className="inline-flex w-max items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 hover:border-blue-300 hover:text-blue-650 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-blue-300/30 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                            >
                                Vào thư viện
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                            {subjects.map((subject) => {
                                const Icon = subject.icon;
                                const getSubjectGlow = (name: string) => {
                                    if (name.includes('3D')) return 'hover-glow-physics';
                                    if (name.includes('DNA')) return 'hover-glow-chemistry';
                                    return 'hover-glow-biology';
                                };
                                const glowClass = getSubjectGlow(subject.name);
                                return (
                                    <button
                                        key={subject.name}
                                        onClick={() => setSelectedSubject(subject)}
                                        className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-950 ${glowClass}`}
                                    >
                                        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                                            <img
                                                src={subject.image}
                                                alt={subject.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${subject.tone}`}>
                                                    <Icon className="h-4 w-4" />
                                                    {subject.name}
                                                </span>
                                                <ChevronRight className="h-5 w-5 text-slate-400 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-450" />
                                            </div>
                                            <p className="mt-4 text-sm font-medium leading-6 text-slate-600 dark:text-slate-350">
                                                {subject.description}
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {subject.topics.map((topic) => (
                                                    <span
                                                        key={topic}
                                                        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-white/[0.08] dark:text-slate-300"
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section ref={aboutUsRef} className="py-16 sm:py-20">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
                        <div className="grid grid-cols-2 gap-4">
                            <img
                                src="/Image.png"
                                alt="Giao diện học liệu Edu Tech"
                                className="mt-8 aspect-[4/5] w-full rounded-2xl object-cover shadow-md hover:scale-[1.02] transition-transform duration-300"
                            />
                            <img
                                src="/vietnamese-classroom.png"
                                alt="Học liệu số Edu Tech"
                                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-md hover:scale-[1.02] transition-transform duration-300"
                            />
                        </div>

                        <div className="flex flex-col justify-center">
                            <div className="inline-flex w-max items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-200">
                                <Globe2 className="h-4 w-4" />
                                Dành cho giáo dục phổ thông
                            </div>
                            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl leading-tight">
                                Một không gian học tập đủ trực quan cho học sinh, đủ nhanh cho giáo viên.
                            </h2>
                            <p className="mt-5 text-base font-medium leading-8 text-slate-600 dark:text-slate-350">
                                Edu Tech tập trung vào các tình huống học thật: cần mở học liệu nhanh trong tiết học,
                                cần nhìn rõ cấu trúc khó, cần tìm lại mô hình theo câu hỏi tự nhiên và cần trình bày
                                mạch lạc trên màn hình lớp.
                            </p>

                            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 group hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-500/30 transition-all duration-300">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300" />
                                    <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">Học sinh</h3>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                                        Tự khám phá mô hình, ôn lại khái niệm và ghi nhớ bằng hình ảnh.
                                    </p>
                                </div>
                                <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 group hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-500/30 transition-all duration-300">
                                    <Microscope className="h-6 w-6 text-teal-600 dark:text-teal-300 group-hover:scale-110 transition-transform duration-300" />
                                    <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">Giáo viên</h3>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                                        Chuẩn bị bài giảng trực quan và trình chiếu học liệu ngay trong lớp.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-950 py-16 text-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={feature.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 hover:from-white/[0.12] hover:border-white/15 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-5 text-xl font-black tracking-tight group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                                        <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 md:grid-cols-[1fr_auto] md:p-8 hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                                Sẵn sàng vào lớp học số
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
                                Bắt đầu với thư viện 3D và AI tìm kiếm của Edu Tech.
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-350">
                                Tạo tài khoản để trải nghiệm các mô hình đầu tiên và mở rộng dần theo môn học.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-md hover:shadow-primary-glow hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                            >
                                Đăng ký miễn phí
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-black text-slate-800 hover:border-blue-350 hover:text-blue-650 dark:border-white/10 dark:text-slate-100 dark:hover:border-blue-300/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 bg-white dark:bg-white/5"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {selectedSubject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md transition-all duration-300">
                    <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-950 lg:grid-cols-[1.05fr_0.95fr] animate-in zoom-in-95 duration-250">
                        <button
                            onClick={() => setSelectedSubject(null)}
                            className="absolute right-4 top-4 z-10 rounded-xl bg-white/95 p-2 text-slate-700 shadow-md hover:bg-white dark:bg-slate-900/95 dark:text-slate-200 hover:scale-105 active-press"
                            aria-label="Đóng"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="relative min-h-[300px]">
                            <img
                                src={selectedSubject.image}
                                alt={selectedSubject.name}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                            <div className="absolute bottom-5 left-5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                                Học liệu thực tế
                            </div>
                        </div>
                        <div className="p-6 sm:p-8">
                            <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${selectedSubject.tone}`}>
                                {SelectedSubjectIcon && <SelectedSubjectIcon className="h-4 w-4" />}
                                {selectedSubject.name}
                            </span>
                            <h3 className="mt-5 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                                Khám phá {selectedSubject.name}
                            </h3>
                            <p className="mt-4 text-sm font-medium leading-7 text-slate-600 dark:text-slate-350">
                                {selectedSubject.description}
                            </p>
                            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {selectedSubject.topics.map((topic) => (
                                    <div
                                        key={topic}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-black uppercase tracking-[0.12em] text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300"
                                    >
                                        {topic}
                                    </div>
                                ))}
                            </div>
                            <Link
                                to="/register"
                                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-md hover:shadow-primary-glow hover:scale-[1.02] active-press transition-all duration-300"
                            >
                                Khám phá trọn bộ thư viện
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <footer className="border-t border-slate-200 bg-white py-10 dark:border-white/10 dark:bg-slate-950">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="font-black tracking-tight text-slate-950 dark:text-white">Edu Tech</div>
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                Học liệu 3D cho Khoa học Tự nhiên
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                        <Link to="/guide" className="hover:text-blue-700 dark:hover:text-blue-300">
                            Hướng dẫn
                        </Link>
                        <Link to="/pricing" className="hover:text-blue-700 dark:hover:text-blue-300">
                            Bảng giá
                        </Link>
                        <button className="hover:text-blue-700 dark:hover:text-blue-300">Liên hệ hỗ trợ</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
