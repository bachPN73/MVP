import { Link } from 'react-router';
import { BookOpen, Sparkles, Library, Maximize2, Search, MousePointer, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function GuidePublic() {
    const sections = [
        {
            icon: Library,
            title: 'Thư viện học liệu',
            description: 'Khám phá hàng trăm mô hình 3D và infographic',
            steps: [
                'Truy cập trang Thư viện từ menu bên trái',
                'Sử dụng bộ lọc để tìm theo môn học, loại nội dung, và lớp học',
                'Tìm kiếm nhanh bằng thanh tìm kiếm',
                'Nhấp vào học liệu để xem chi tiết',
            ],
        },
        {
            icon: Sparkles,
            title: 'Find with AI',
            description: 'Tìm học liệu phù hợp bằng AI',
            steps: [
                'Mô tả nội dung bạn muốn tìm bằng văn bản tự nhiên',
                'Nhấn "Tìm kiếm" hoặc Enter để bắt đầu',
                'AI sẽ phân tích và gợi ý các học liệu phù hợp nhất',
                'Xem và chọn học liệu từ kết quả tìm kiếm',
            ],
        },
        {
            icon: MousePointer,
            title: 'Xem mô hình 3D',
            description: 'Tương tác với mô hình 3D',
            steps: [
                'Nhấp vào mô hình 3D để kích hoạt chế độ tương tác',
                'Kéo chuột để xoay mô hình',
                'Cuộn chuột để phóng to/thu nhỏ',
                'Nhấp đúp để đặt lại góc nhìn ban đầu',
            ],
        },
        {
            icon: Maximize2,
            title: 'Chế độ trình chiếu',
            description: 'Hiển thị toàn màn hình cho lớp học',
            steps: [
                'Mở học liệu bạn muốn trình chiếu',
                'Nhấn nút "Chế độ trình chiếu" ở góc trên bên phải',
                'Sử dụng nút toàn màn hình để hiển thị tốt nhất',
                'Nhấn ESC hoặc nút X để thoát',
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100/50 via-slate-50 to-green-100/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-700 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">Edu Tech</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Khoa học Tự nhiên</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <ThemeToggle variant="glass" />
                        <Link
                            to="/"
                            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors font-medium rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5"
                        >
                            Trang chủ
                        </Link>
                        <Link
                            to="/login"
                            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors font-medium rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-600/95 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Back button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại trang chủ
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Hướng dẫn sử dụng</h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400">Tìm hiểu cách sử dụng Edu Tech</p>
                        </div>
                    </div>
                </div>

                {/* Introduction */}
                <div className="bg-gradient-to-br from-primary to-blue-600 dark:from-indigo-950 dark:to-indigo-900 rounded-2xl p-8 text-white mb-12 shadow-lg shadow-primary/10">
                    <h2 className="text-2xl font-bold font-heading mb-4">Chào mừng đến với Edu Tech!</h2>
                    <p className="text-blue-100 dark:text-slate-200 text-lg leading-relaxed max-w-3xl">
                        Edu Tech là nền tảng học tập Khoa học Tự nhiên (Vật lý, Hóa học, Sinh học)
                        cho học sinh THPT Việt Nam. Khám phá thư viện mô hình 3D và infographic tương tác,
                        tìm kiếm nội dung bằng AI, và sử dụng chế độ trình chiếu cho dạy học trên lớp.
                    </p>
                </div>

                {/* Guide sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <div key={index} className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-md">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-blue-600/10 dark:from-primary/20 dark:to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-6 h-6 text-primary dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-heading mb-1 text-slate-950 dark:text-white">{section.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400">{section.description}</p>
                                    </div>
                                </div>
                                <ol className="space-y-3 ml-16">
                                    {section.steps.map((step, stepIndex) => (
                                        <li key={stepIndex} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 text-primary dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-medium">
                                                {stepIndex + 1}
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-300 pt-0.5">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        );
                    })}
                </div>

                {/* Tips */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-5 transition-all duration-300 mb-12">
                    <h2 className="text-lg font-extrabold font-heading text-slate-950 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
                        Mẹo học tập & giảng dạy tối ưu
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-secondary/10 dark:bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Search className="w-4 h-4 text-secondary dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold font-heading mb-1 text-slate-900 dark:text-white">Tìm kiếm hiệu quả</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Sử dụng từ khóa cụ thể và mô tả chi tiết khi dùng Find with AI để có kết quả tốt nhất
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-secondary/10 dark:bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Maximize2 className="w-4 h-4 text-secondary dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold font-heading mb-1 text-slate-900 dark:text-white">Trình chiếu trong lớp</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Sử dụng chế độ toàn màn hình để hiển thị rõ ràng trên màn hình lớn hoặc máy chiếu
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-secondary/10 dark:bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-secondary dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold font-heading mb-1 text-slate-900 dark:text-white">Học liệu liên quan</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Xem mục "Học liệu liên quan" để khám phá thêm nội dung cùng chủ đề
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-secondary/10 dark:bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-secondary dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold font-heading mb-1 text-slate-900 dark:text-white">Thử các ví dụ</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Nhấp vào các gợi ý tìm kiếm trong Find with AI để xem cách sử dụng hiệu quả
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-secondary to-green-600 dark:from-emerald-950 dark:to-teal-950 rounded-2xl p-8 text-white text-center shadow-lg shadow-emerald-500/10">
                    <h3 className="text-2xl font-bold font-heading mb-3">Sẵn sàng bắt đầu?</h3>
                    <p className="text-green-100 dark:text-slate-300 mb-6 text-lg">
                        Đăng ký tài khoản miễn phí để khám phá thư viện học liệu và tính năng Find with AI
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 text-secondary dark:text-emerald-400 hover:bg-green-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors border border-slate-200/50 dark:border-white/10 shadow-md"
                    >
                        Đăng ký miễn phí
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm mt-20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-primary dark:text-indigo-400">Edu Tech</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Khoa học Tự nhiên THPT</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            © 2026 Edu Tech. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
