import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
    ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw, 
    BookOpen, Sparkles, Maximize2, FlaskConical, Atom, 
    GraduationCap, Search, ShieldCheck, CreditCard, ChevronUp, ChevronDown, BookmarkCheck
} from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        title: "Edu Tech - Chạm vào kiến thức khoa học",
        tagline: "Nền tảng học liệu tương tác 3D & AI dành cho Khối tự nhiên",
        content: (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] mb-4">
                    <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
                    Edu Tech
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 font-medium">Chạm vào kiến thức - Kiến tạo tương lai</p>
            </div>
        ),
        targetTime: 20,
        notes: "Kính chào quý vị. Hôm nay tôi xin giới thiệu Edu Tech - Nền tảng học liệu trực quan, sinh động dành riêng cho học sinh và giáo viên trung học phổ thông. Edu Tech ra đời với sứ mệnh chuyển đổi số việc giảng dạy các môn khoa học tự nhiên."
    },
    {
        id: 2,
        title: "Vấn đề của Giáo dục truyền thống",
        tagline: "Pain Points",
        content: (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-center">
                <div className="bg-slate-900/50 p-8 rounded-2xl border border-rose-500/20 text-center">
                    <BookOpen className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Lý thuyết khô khan</h3>
                    <p className="text-sm text-slate-400">Học sinh khó hình dung các khái niệm trừu tượng, vi mô.</p>
                </div>
                <div className="bg-slate-900/50 p-8 rounded-2xl border border-orange-500/20 text-center">
                    <FlaskConical className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Phòng Lab đắt đỏ</h3>
                    <p className="text-sm text-slate-400">Thiếu trang thiết bị hóa chất, tốn kém và nguy hiểm.</p>
                </div>
                <div className="bg-slate-900/50 p-8 rounded-2xl border border-amber-500/20 text-center">
                    <Maximize2 className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Bài giảng tĩnh</h3>
                    <p className="text-sm text-slate-400">Giáo viên mất nhiều thời gian soạn bài nhưng thiếu tính tương tác.</p>
                </div>
            </div>
        ),
        targetTime: 25,
        notes: "Nhìn vào thực trạng hiện nay, việc dạy và học các môn như Vật lý, Hóa học hay Sinh học gặp nhiều khó khăn. Các em học sinh phải tưởng tượng những kiến thức trừu tượng qua trang sách tĩnh 2 chiều. Các trường học cũng gặp áp lực về chi phí đầu tư phòng thí nghiệm và rủi ro hóa chất."
    },
    {
        id: 3,
        title: "Giải pháp đột phá - Edu Tech",
        tagline: "Công nghệ WebGL 3D & AI",
        content: (
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                        <Atom className="w-10 h-10 text-indigo-400" />
                    </div>
                    <span className="text-3xl text-slate-500">+</span>
                    <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                        <Sparkles className="w-10 h-10 text-cyan-400" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-white max-w-2xl leading-relaxed">
                    Số hóa 100% không gian học tập bằng <span className="text-indigo-400">Mô hình 3D đa chiều</span> tích hợp <span className="text-cyan-400">Trí tuệ Nhân tạo AI</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-semibold text-slate-300">Không cần cài đặt ứng dụng</span>
                    <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-semibold text-slate-300">Tương thích mọi thiết bị</span>
                    <span className="px-4 py-2 bg-slate-800 rounded-full text-sm font-semibold text-slate-300">Chạy mượt mà trên trình duyệt</span>
                </div>
            </div>
        ),
        targetTime: 25,
        notes: "Để giải quyết vấn đề đó, Edu Tech mang đến giải pháp Số hóa học liệu bằng công nghệ WebGL tiên tiến và Trí tuệ nhân tạo. Thay vì mua thiết bị đắt tiền, mọi mô hình vật lý, hóa học, sinh học đều được chạy mượt mà ngay trên trình duyệt web mà không cần cài đặt."
    },
    {
        id: 4,
        title: "Giá trị mang lại",
        tagline: "Đối tượng thụ hưởng",
        content: (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-center">
                <div className="bg-gradient-to-b from-indigo-900/40 to-slate-900/50 p-8 rounded-3xl border border-indigo-500/20 h-full flex flex-col">
                    <GraduationCap className="w-10 h-10 text-indigo-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-4">Học sinh</h3>
                    <ul className="space-y-3 text-slate-300 text-sm flex-1">
                        <li className="flex items-start gap-2"><span className="text-indigo-400">✓</span> Kích thích tư duy sáng tạo</li>
                        <li className="flex items-start gap-2"><span className="text-indigo-400">✓</span> Tiếp thu tự nhiên, nhớ lâu hơn</li>
                        <li className="flex items-start gap-2"><span className="text-indigo-400">✓</span> Tự do khám phá không giới hạn</li>
                    </ul>
                </div>
                <div className="bg-gradient-to-b from-purple-900/40 to-slate-900/50 p-8 rounded-3xl border border-purple-500/20 h-full flex flex-col">
                    <BookOpen className="w-10 h-10 text-purple-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-4">Giáo viên</h3>
                    <ul className="space-y-3 text-slate-300 text-sm flex-1">
                        <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Tiết kiệm 80% thời gian soạn bài</li>
                        <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Bài giảng lôi cuốn, sinh động 100%</li>
                        <li className="flex items-start gap-2"><span className="text-purple-400">✓</span> Dễ dàng trình chiếu trên lớp</li>
                    </ul>
                </div>
                <div className="bg-gradient-to-b from-emerald-900/40 to-slate-900/50 p-8 rounded-3xl border border-emerald-500/20 h-full flex flex-col">
                    <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-4">Nhà trường</h3>
                    <ul className="space-y-3 text-slate-300 text-sm flex-1">
                        <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Tiết kiệm chi phí phòng thí nghiệm</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Đảm bảo an toàn tuyệt đối</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Đi đầu trong chuyển đổi số STEM</li>
                    </ul>
                </div>
            </div>
        ),
        targetTime: 25,
        notes: "Mô hình này mang lại 3 giá trị to lớn: Học sinh tiếp thu bài học một cách chủ động và tự nhiên. Giáo viên có sẵn kho học liệu khổng lồ tiết kiệm thời gian soạn giảng. Và nhà trường tiết kiệm được hàng tỷ đồng chi phí đầu tư phòng thí nghiệm thực tế."
    },
    {
        id: 5,
        title: "Tính năng 1: Thư viện & Trình xem 3D",
        tagline: "Học liệu cốt lõi",
        content: (
            <div className="flex flex-col md:flex-row gap-8 h-full items-center">
                <div className="flex-1 space-y-6">
                    <h3 className="text-2xl font-bold text-white">Khám phá thế giới đa chiều</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><BookOpen /></div>
                            <div>
                                <h4 className="font-bold text-white">Vật lý, Hóa học, Sinh học</h4>
                                <p className="text-xs text-slate-400">Bộ lọc linh hoạt từ lớp 10 đến lớp 12.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400"><RotateCcw /></div>
                            <div>
                                <h4 className="font-bold text-white">Tương tác 360 độ</h4>
                                <p className="text-xs text-slate-400">Phóng to, xoay đa chiều với độ nét chuẩn xác cao.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 h-64 md:h-full bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden relative shadow-2xl flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
                    <div className="w-32 h-32 rounded-full border border-indigo-500/30 bg-indigo-500/10 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                        <Atom className="w-16 h-16 text-indigo-400" />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 p-2 rounded-lg border border-white/10 flex gap-2 items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-0.5" />
                        <span className="text-[10px] text-white font-bold tracking-wider">LIVE 3D RENDER</span>
                    </div>
                </div>
            </div>
        ),
        targetTime: 25,
        notes: "Tính năng cốt lõi đầu tiên là Thư viện 3D. Chúng tôi cung cấp các mô hình Vật lý, Hóa học, Sinh học chuẩn theo chương trình GDPT mới. Người dùng có thể xoay 360 độ, phóng to để xem cận cảnh từng tế bào, phân tử với độ sắc nét tuyệt đối."
    },
    {
        id: 6,
        title: "Tính năng 2: Chế độ Trình chiếu Lớp học",
        tagline: "Công cụ cho Giáo viên",
        content: (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-full max-w-3xl aspect-[16/9] bg-black rounded-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col justify-between p-6 shadow-2xl shadow-indigo-500/20">
                    <div className="flex justify-between w-full opacity-50">
                        <span className="px-3 py-1 bg-white/10 rounded text-xs text-white">Môn: Sinh học</span>
                        <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-white drop-shadow-lg mb-2">Mô hình Chuỗi Xoắn DNA</h2>
                        <p className="text-slate-300">Nhấn Kéo để xoay góc nhìn</p>
                    </div>
                    <div className="flex justify-between items-end w-full opacity-50">
                        <span className="text-[10px] text-white">ESC để thoát</span>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/10" />
                            <div className="w-8 h-8 rounded-full bg-white/10" />
                        </div>
                    </div>
                </div>
                <p className="text-lg text-slate-400 max-w-2xl">Giao diện tối giản toàn màn hình, hỗ trợ mượt mà trên máy chiếu và bảng tương tác thông minh tại lớp học.</p>
            </div>
        ),
        targetTime: 20,
        notes: "Tiếp theo là Chế độ trình chiếu. Chế độ này loại bỏ hoàn toàn các thanh menu thừa, đẩy màn hình lên mức Full-Screen tối đa. Giáo viên chỉ cần cắm máy tính vào máy chiếu hoặc bảng tương tác là có ngay một buổi dạy cực kỳ ấn tượng."
    },
    {
        id: 7,
        title: "Tính năng 3: AI Trợ lý Tìm kiếm",
        tagline: "Tìm nhanh - Trúng đích",
        content: (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
                <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-2 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />
                    <Search className="w-6 h-6 text-indigo-400 mx-4 z-10" />
                    <div className="flex-1 text-left text-slate-300 font-mono text-sm z-10 border-r border-slate-700 pr-4">
                        "Tôi muốn tìm mô hình về sự phân chia tế bào..." <span className="animate-pulse">|</span>
                    </div>
                    <button className="bg-indigo-600 px-6 py-3 rounded-xl text-white font-bold ml-2 z-10 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Tìm với AI
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl opacity-80">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                        <div className="w-16 h-12 bg-slate-700 rounded-lg"></div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-white">Quá trình Nguyên phân</h4>
                            <p className="text-[10px] text-emerald-400">Phù hợp 98%</p>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                        <div className="w-16 h-12 bg-slate-700 rounded-lg"></div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-white">Tế bào Động vật</h4>
                            <p className="text-[10px] text-emerald-400">Phù hợp 85%</p>
                        </div>
                    </div>
                </div>
            </div>
        ),
        targetTime: 25,
        notes: "Tính năng thứ ba vô cùng đột phá là Trợ lý AI Tìm kiếm. Người dùng không cần nhớ tên bài học khô khan, chỉ cần gõ yêu cầu bằng ngôn ngữ tự nhiên như 'Tôi muốn tìm về cấu tạo trái tim', AI Gemini sẽ tự phân tích và gợi ý chuẩn xác nhất."
    },
    {
        id: 8,
        title: "Tính năng Nâng cao: Pro Vault & Quản trị",
        tagline: "Mở rộng giới hạn",
        content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">
                <div className="bg-gradient-to-br from-violet-900/30 to-slate-900 p-8 rounded-3xl border border-violet-500/20 text-left h-full flex flex-col justify-center shadow-lg hover:shadow-violet-500/10 transition-shadow">
                    <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 mb-6">
                        <BookmarkCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Kho lưu trữ 24h (Pro Vault)</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Giáo viên có thể đánh dấu bài học vào kho riêng biệt. Bài học sẽ <strong>tự động xóa sau 24h</strong> để đảm bảo sự gọn gàng cho bài giảng theo ngày.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-teal-900/30 to-slate-900 p-8 rounded-3xl border border-teal-500/20 text-left h-full flex flex-col justify-center shadow-lg hover:shadow-teal-500/10 transition-shadow">
                    <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 mb-6">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Bảng Quản trị (Admin)</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Dành cho trường học giám sát tiến độ giáo viên và Hệ thống quản trị viên cho phép đăng tải file mô hình GLB 3D trực tiếp lên thư viện một cách dễ dàng.
                    </p>
                </div>
            </div>
        ),
        targetTime: 25,
        notes: "Ở cấp độ cao hơn, chúng tôi có tính năng Pro Vault 24h giúp giáo viên lưu nhanh các bài học vào một kho tạm và hệ thống tự động dọn dẹp sau 1 ngày giảng dạy. Đồng thời, nền tảng cũng có Bảng điều khiển Admin để dễ dàng cập nhật học liệu và giám sát tài khoản."
    },
    {
        id: 9,
        title: "Sẵn sàng bứt phá kiến thức?",
        tagline: "Kêu gọi hành động",
        content: (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Edu Tech - Nền tảng Giáo dục <br/> Số 1 Việt Nam
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
                    <div className="bg-slate-800/80 px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 text-left shadow-lg">
                        <CreditCard className="text-emerald-400 w-8 h-8" />
                        <div>
                            <p className="text-white font-bold">Thanh toán QR tự động</p>
                            <p className="text-[10px] text-slate-400">Kích hoạt ngay lập tức qua MoMo</p>
                        </div>
                    </div>
                    <div className="bg-slate-800/80 px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 text-left shadow-lg">
                        <GraduationCap className="text-indigo-400 w-8 h-8" />
                        <div>
                            <p className="text-white font-bold">Gói linh hoạt</p>
                            <p className="text-[10px] text-slate-400">Đăng ký theo Tháng, Năm hoặc Trọn đời</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button onClick={() => window.location.href='/register'} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-indigo-500/25 cursor-pointer">
                        Đăng ký trải nghiệm miễn phí
                    </button>
                </div>
            </div>
        ),
        targetTime: 20,
        notes: "Cuối cùng, Edu Tech cung cấp các gói dịch vụ linh hoạt từ Tháng, Năm đến Trọn đời với hình thức thanh toán QR code tự động hóa hoàn toàn. Cảm ơn quý vị đã lắng nghe, hãy đăng ký miễn phí ngay hôm nay để trải nghiệm sự khác biệt của Edu Tech!"
    }
];

export default function PresentationIntroPage() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showNotes, setShowNotes] = useState(true);

    // Xử lý phím điều hướng
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'Escape') {
                navigate('/');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide]);

    // Timer logic
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isPlaying) {
            timer = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isPlaying]);

    const nextSlide = () => {
        setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide(prev => Math.max(0, prev - 1));
    };

    const formatTime = (totalSecs: number) => {
        const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const s = (totalSecs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const slide = SLIDES[currentSlide];

    return (
        <div className="fixed inset-0 bg-slate-950 text-white flex flex-col overflow-hidden font-sans select-none z-50">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

            {/* Top Navigation & Timer */}
            <div className="relative z-20 flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Thoát trình chiếu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Edu Tech Pitch Deck</span>
                        <span className="text-sm font-semibold text-slate-300">Slide {currentSlide + 1} / {SLIDES.length}</span>
                    </div>
                </div>

                {/* Presentation Timer helper */}
                <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 rounded-2xl p-1.5 shadow-lg">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${isPlaying ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                        title={isPlaying ? "Tạm dừng" : "Bắt đầu tính giờ"}
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div className="flex flex-col px-2 w-20 text-center border-r border-white/10">
                        <span className={`text-lg font-mono font-black ${elapsedSeconds > 240 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                            {formatTime(elapsedSeconds)}
                        </span>
                    </div>
                    <div className="flex flex-col px-2 w-32">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Mục tiêu Slide này</span>
                        <span className="text-sm font-bold text-indigo-400">{slide.targetTime} giây</span>
                    </div>
                    <button 
                        onClick={() => { setElapsedSeconds(0); setIsPlaying(false); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors mr-1 cursor-pointer"
                        title="Reset đồng hồ"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Slide Content Area */}
            <div className="flex-1 relative z-10 flex items-center justify-center p-6 md:p-12 transition-all duration-500 overflow-hidden">
                <div key={currentSlide} className="w-full max-w-6xl h-full flex flex-col animate-in fade-in zoom-in-95 duration-500 ease-out">
                    <div className="text-center mb-8">
                        <span className="inline-block px-3 py-1 mb-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                            {slide.tagline}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">{slide.title}</h2>
                    </div>
                    
                    <div className="flex-1 min-h-0 relative">
                        {slide.content}
                    </div>
                </div>
            </div>

            {/* Bottom Controls & Notes */}
            <div className={`relative z-20 bg-slate-900 border-t border-white/5 transition-all duration-300 ${showNotes ? 'h-48' : 'h-16'}`}>
                {/* Notes Toggle Button */}
                <button 
                    onClick={() => setShowNotes(!showNotes)}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-full p-1 shadow-lg cursor-pointer"
                    title={showNotes ? "Ẩn ghi chú" : "Hiện ghi chú"}
                >
                    {showNotes ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>

                <div className="flex h-full max-w-6xl mx-auto w-full">
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2 p-4 shrink-0">
                        <button 
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            disabled={currentSlide === SLIDES.length - 1}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition-colors shadow-lg cursor-pointer"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Presenter Notes */}
                    <div className={`flex-1 p-4 border-l border-white/5 transition-opacity duration-300 ${showNotes ? 'opacity-100' : 'opacity-0 invisible'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lời thuyết trình gợi ý</h4>
                        </div>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                            {slide.notes}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Bar overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-50">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300" 
                    style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
                ></div>
            </div>
        </div>
    );
}
