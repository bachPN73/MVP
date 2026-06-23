import { Link } from 'react-router';
import { BookOpen, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function GuidePublic() {
    const sections = [
        {
            icon: UserPlus,
            title: 'Hướng dẫn Đăng ký',
            description: 'Tạo tài khoản mới để bắt đầu trải nghiệm nền tảng Edu Tech.',
            steps: [
                'Nhấp vào nút "Đăng ký" ở góc trên bên phải màn hình',
                'Điền đầy đủ thông tin: Họ tên, Email và Mật khẩu (hoặc)',
                'Chọn nút "Tiếp tục với Google" để đăng ký siêu tốc chỉ bằng 1 chạm',
                'Hệ thống sẽ tự động đăng nhập sau khi tạo tài khoản thành công',
            ],
        },
        {
            icon: LogIn,
            title: 'Hướng dẫn Đăng nhập',
            description: 'Truy cập vào tài khoản đã có của bạn để tiếp tục học tập.',
            steps: [
                'Nhấp vào nút "Đăng nhập" trên thanh menu',
                'Nhập Email và Mật khẩu bạn đã dùng để đăng ký (hoặc)',
                'Chọn nút "Tiếp tục với Google" nếu bạn đã liên kết tài khoản Google',
                'Sau khi đăng nhập, bạn sẽ được chuyển đến Bảng điều khiển (Dashboard)',
            ],
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Edu Tech</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Khoa học Tự nhiên</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        <Link
                            to="/"
                            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                            Trang chủ
                        </Link>
                        <Link
                            to="/guide"
                            className="rounded-lg px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50"
                        >
                            Hướng dẫn
                        </Link>
                        <Link
                            to="/pricing"
                            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                            Bảng giá
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            to="/login"
                            className="hidden xs:block px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors font-bold"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-16">
                {/* Back button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại trang chủ
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Hướng dẫn Đăng nhập / Đăng ký</h1>
                            <p className="text-lg text-slate-500 mt-2">Dành cho người dùng mới bắt đầu với Edu Tech</p>
                        </div>
                    </div>
                </div>

                {/* Guide sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <div key={index} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{section.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{section.description}</p>
                                    </div>
                                </div>
                                <ol className="space-y-4">
                                    {section.steps.map((step, stepIndex) => (
                                        <li key={stepIndex} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                                {stepIndex + 1}
                                            </span>
                                            <span className="text-slate-700 leading-relaxed">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-10 text-white text-center shadow-lg">
                    <h3 className="text-2xl font-bold mb-3">Bạn đã sẵn sàng?</h3>
                    <p className="text-blue-100 mb-8 text-lg max-w-xl mx-auto">
                        Chỉ mất 30 giây để tạo tài khoản miễn phí và trải nghiệm học tập mô hình 3D trực quan.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 hover:bg-slate-50 rounded-xl font-bold transition-colors shadow-md"
                    >
                        Tạo tài khoản ngay
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white mt-10">
                <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-700">Edu Tech</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Khoa học Tự nhiên THPT</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        © 2026 Edu Tech.
                    </p>
                </div>
            </footer>
        </div>
    );
}
