import { Layout } from '../layout/MainLayout';
import { BookOpen, Sparkles, Library, Maximize2, Search, MousePointer, ChevronRight, HelpCircle, CreditCard, LogIn } from 'lucide-react';

export default function Guide() {
    const sections = [
        {
            icon: Library,
            title: 'Thư viện học liệu',
            description: 'Khám phá hàng trăm mô hình 3D và infographic giảng dạy trực quan.',
            steps: [
                'Truy cập trang Thư viện từ menu bên trái hệ thống',
                'Sử dụng bộ lọc thông minh để tìm theo môn học, lớp học và loại nội dung',
                'Tìm kiếm nhanh bằng thanh tìm kiếm thông minh ở đầu trang',
                'Nhấp vào học liệu để chuyển đến trang tương tác chi tiết',
            ],
            color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50',
        },
        {
            icon: Sparkles,
            title: 'AI tìm kiếm',
            description: 'Tìm kiếm học liệu thông minh bằng ngôn ngữ tự nhiên thông qua AI.',
            steps: [
                'Mô tả chủ đề bạn muốn tìm bằng tiếng Việt tự nhiên',
                'Nhấn nút "Tìm kiếm" hoặc phím Enter để kích hoạt AI',
                'AI sẽ phân tích ngữ cảnh và hiển thị các gợi ý chuẩn xác nhất',
                'Nhấp trực tiếp vào kết quả để bắt đầu bài học tương tác',
            ],
            color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
        },
        {
            icon: MousePointer,

            title: 'Tương tác mô hình 3D',
            description: 'Khám phá mọi ngóc ngách của mô hình thông qua cử chỉ tương tác.',
            steps: [
                'Nhấp vào khung hình 3D để kích hoạt tính năng tương tác',
                'Giữ và kéo chuột trái để xoay mô hình đa chiều',
                'Cuộn chuột giữa để phóng to/thu nhỏ chi tiết mô hình',
                'Nhấp đúp chuột để phục hồi về góc nhìn camera mặc định ban đầu',
            ],
            color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
        },
        {
            icon: Maximize2,
            title: 'Chế độ trình chiếu',
            description: 'Hiển thị toàn màn hình tối ưu hóa cho giảng dạy và thuyết trình lớp học.',
            steps: [
                'Mở chi tiết học liệu bạn muốn sử dụng',
                'Nhấp vào nút "Chế độ trình chiếu" ở góc trên bên phải màn hình',
                'Kích hoạt chế độ Fullscreen của trình duyệt để hiển thị tốt nhất',
                'Nhấn phím ESC hoặc nút X để đóng và quay lại giao diện thông thường',
            ],
            color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
        },
        {
            icon: CreditCard,
            title: 'Nâng cấp & Thanh toán',
            description: 'Nâng cấp tài khoản Premium để mở khóa toàn bộ học liệu 3D đặc sắc.',
            steps: [
                'Chọn mục "Bảng giá" từ thanh menu bên trái hệ thống',
                'Lựa chọn gói Premium phù hợp (Tháng, Năm hoặc Trọn đời)',
                'Quét mã QR MoMo/Chuyển khoản hiển thị trên màn hình thanh toán',
                'Tài khoản sẽ được tự động kích hoạt ngay lập tức sau khi hoàn tất thanh toán',
            ],
            color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50',
        },
    ];

    return (
        <Layout>
            <div className="p-6 md:p-8 max-w-[100rem] mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3.5 animate-fadeIn">
                    <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">Hướng dẫn sử dụng</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-sans mt-0.5">Khám phá toàn bộ tính năng và học tập hiệu quả cùng Edu Tech</p>
                    </div>
                </div>



                {/* Guide sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <div key={index} className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5 transition-transform duration-300 group-hover:scale-105 ${section.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold font-heading text-slate-950 dark:text-white leading-tight">{section.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans font-medium">{section.description}</p>
                                        </div>
                                    </div>
                                    <ol className="space-y-3 pt-2">
                                        {section.steps.map((step, stepIndex) => (
                                            <li key={stepIndex} className="flex items-start gap-3.5">
                                                <span className="shrink-0 w-5.5 h-5.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-bold font-heading border border-slate-200/30 dark:border-white/5">
                                                    {stepIndex + 1}
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-semibold pt-0.5 leading-relaxed font-sans">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tips */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-5 transition-all duration-300">
                    <h2 className="text-lg font-extrabold font-heading text-slate-950 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                        Mẹo học tập & giảng dạy tối ưu
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100/20 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-heading">Tìm kiếm từ khóa cụ thể</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans font-semibold leading-relaxed">
                                    Sử dụng thuật ngữ khoa học cụ thể khi tìm bằng AI để nhận kết quả chính xác cao, ví dụ: "cấu tạo hạt nhân tế bào" hay "thuyết động học phân tử".
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-center shrink-0 border border-purple-100/20 dark:border-purple-900/20 text-purple-600 dark:text-purple-400">
                                <Maximize2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-heading">Phóng to để quan sát cấu trúc vi mô</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans font-semibold leading-relaxed">
                                    Một số mô hình sinh học chứa các cấu trúc cực nhỏ bên trong. Đừng ngần ngại cuộn phóng to tối đa để khám phá các hạt nội bào hay sợi phân tử DNA.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100/20 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-heading">Đọc kỹ Fun Fact ở chi tiết học liệu</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans font-semibold leading-relaxed">
                                    Mục "Sự thật thú vị" cung cấp các thông tin thực tiễn ấn tượng liên quan đến mô hình, giúp bài giảng hấp dẫn và ghi nhớ lâu hơn rất nhiều.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center shrink-0 border border-amber-100/20 dark:border-amber-900/20 text-amber-600 dark:text-amber-400">
                                <HelpCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-heading">Tham khảo học liệu cùng chủ đề</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans font-semibold leading-relaxed">
                                    Cuộn xuống cuối trang chi tiết để tìm các đề xuất học liệu cùng môn học hoặc bổ sung, tăng cường sự liền mạch và mở rộng vốn kiến thức của bạn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact/Support */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-2xl p-6 text-white border border-emerald-200/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 animate-fadeIn">
                    <div className="space-y-1">
                        <h3 className="text-lg font-extrabold font-heading">Cần trợ giúp thêm?</h3>
                        <p className="text-emerald-100 text-xs md:text-sm font-sans font-semibold leading-relaxed">
                            Đội ngũ hỗ trợ kỹ thuật và giáo dục của Edu Tech luôn sẵn sàng đồng hành cùng bạn 24/7.
                        </p>
                    </div>
                    <button className="px-5 py-2.5 bg-white text-emerald-700 font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer self-start sm:self-auto shrink-0 font-sans">
                        Gửi phản hồi nhanh
                    </button>
                </div>
            </div>
        </Layout>
    );
}
