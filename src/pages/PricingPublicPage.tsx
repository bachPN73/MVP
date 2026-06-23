import { Link } from 'react-router';
import { BookOpen, ArrowLeft } from 'lucide-react';
import PricingContent from '../components/PricingContent';
import ThemeToggle from '../components/ThemeToggle';

export default function PricingPublicPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100/50 via-slate-50 to-green-100/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-700 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent leading-none">Edu Tech</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Khoa học Tự nhiên</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        <Link
                            to="/"
                            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                        >
                            Trang chủ
                        </Link>
                        <Link
                            to="/guide"
                            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                        >
                            Hướng dẫn
                        </Link>
                        <Link
                            to="/pricing"
                            className="rounded-lg px-4 py-2 text-sm font-bold text-primary dark:text-white bg-slate-100 dark:bg-white/[0.08]"
                        >
                            Bảng giá
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <ThemeToggle variant="glass" />
                        <Link
                            to="/login"
                            className="hidden xs:block px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors font-bold"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Quay lại trang chủ
                    </Link>
                </div>
                <PricingContent isPublic={true} />
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-white/5 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-black text-primary dark:text-indigo-400">Edu Tech</span>
                        </div>
                        {/* Removed footer copyright text */}
                    </div>
                </div>
            </footer>
        </div>
    );
}

