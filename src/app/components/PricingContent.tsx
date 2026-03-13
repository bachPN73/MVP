import { Check, Zap, Crown, CheckCircle2, Globe2, X, LogIn, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import Button from "./Button";

export default function PricingContent() {
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const handleChoosePlan = (planId: string) => {
        const user = localStorage.getItem("edu_tech_user");
        if (user) {
            navigate(`/payment/${planId}`);
        } else {
            setSelectedPlanId(planId);
            setShowAuthModal(true);
        }
    };

    const plans = [
        {
            id: "free",
            name: "Miễn phí",
            price: "0",
            period: "VND",
            description: "Hạn chế truy cập vào nội dung mẫu",
            features: [
                "Tải xuống các mô hình mẫu được chọn (có giới hạn)",
                "Xem các đồ họa thông tin (infographic) & mô hình 3D bản demo",
                "Trải nghiệm Trình tạo bài giảng bằng AI",
            ],
            icon: CheckCircle2,
            color: "text-slate-400",
            bg: "bg-slate-50",
            border: "border-slate-200",
            buttonVariant: "outline" as const,
        },
        {
            id: "basic",
            name: "Cơ bản",
            price: "249.000",
            period: "VND / 3 THÁNG",
            description: "Truy cập toàn bộ đồ họa thông tin cho một môn học",
            features: [
                "Tải xuống các mô hình 3D cơ bản",
                "Tích hợp các mô hình 3D đa chủ đề",
                "Sử dụng nội dung trong lớp học",
                "Cập nhật nội dung miễn phí trong thời gian đăng ký",
                "Thư viện bài tập & bài kiểm tra",
                "Hỗ trợ kỹ thuật qua email",
            ],
            icon: Zap,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
            buttonVariant: "primary" as const,
        },
        {
            id: "pro",
            name: "Chuyên nghiệp (Pro)",
            price: "499.000",
            period: "VND / 3 THÁNG",
            description: "Bao gồm tất cả quyền lợi gói Cơ bản",
            features: [
                "Truy cập toàn bộ thư viện đồ họa thông tin & 3D cho 3 môn học",
                "Đề xuất AI nâng cao & gợi ý bài giảng",
                "Tải xuống tệp kỹ thuật số không giới hạn",
                "Ưu tiên hỗ trợ kỹ thuật",
            ],
            icon: Crown,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-200",
            featured: true,
            buttonVariant: "primary" as const,
        },
        {
            id: "school",
            name: "Trường học",
            price: "9.000.000",
            period: "VND / 3 THÁNG",
            description: "Quyền quản lý cho nhiều giáo viên (25-30 giáo viên)",
            features: [
                "Tạo bài giảng bằng AI",
                "Thư viện đồ họa thông tin cho 3 môn học",
                "Truy cập toàn bộ tất cả các mô hình 3D",
                "Quản lý tài khoản nhóm & quyền truy cập",
                "Báo cáo sử dụng",
                "Phân tích hiệu suất theo lớp/giáo viên",
            ],
            icon: Globe2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            buttonVariant: "secondary" as const,
        },
    ];

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900 tracking-tight">Chọn gói dịch vụ phù hợp</h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                    Nâng tầm trải nghiệm học tập của bạn với các tính năng nâng cao và nội dung độc quyền từ Edu Tech.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col p-6 sm:p-8 rounded-[2rem] border-2 transition-all hover:shadow-2xl hover:-translate-y-2 ${plan.featured
                                ? `${plan.border} shadow-xl bg-white scale-105 z-10`
                                : "border-slate-100 bg-white"
                                }`}
                        >
                            {plan.featured && (
                                <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-20">
                                    PHỔ BIẾN NHẤT
                                </div>
                            )}

                            <div className={`w-14 h-14 ${plan.bg} ${plan.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                                <Icon className="w-8 h-8" />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h2>
                            <div className="flex flex-col mb-4">
                                <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">{plan.period}</span>
                            </div>
                            <p className="text-slate-400 mb-8 text-[13px] font-semibold leading-relaxed">
                                {plan.description}
                            </p>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <Check className={`w-4 h-4 ${plan.color} flex-shrink-0 mt-0.5`} />
                                        <span className="text-[13px] text-slate-600 font-medium leading-snug">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => handleChoosePlan(plan.id)}
                                variant={plan.buttonVariant}
                                className={`w-full py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all ${plan.featured ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                            >
                                Chọn gói này
                            </Button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-20 bg-white rounded-[2.5rem] p-8 sm:p-12 text-center border-2 border-slate-50 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-4">Bạn cần giải pháp riêng cho tổ chức?</h3>
                <p className="text-slate-500 mb-8 max-w-2xl mx-auto font-semibold">
                    Chúng tôi cũng cung cấp các gói dịch vụ tùy chỉnh cho các trung tâm đào tạo và cơ sở giáo dục với hỗ trợ kỹ thuật 24/7.
                </p>
                <Button variant="outline" className="px-10 py-4 rounded-2xl font-black text-primary border-slate-200 hover:border-primary hover:bg-slate-50 transition-all shadow-sm">
                    Liên hệ bộ phận tư vấn
                </Button>
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 max-w-sm w-full relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <LogIn className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Đăng ký hoặc Đăng nhập</h3>
                            <p className="text-slate-500 font-medium">Vui lòng đăng nhập để tiếp tục chọn gói dịch vụ của bạn.</p>
                        </div>

                        <div className="space-y-4">
                            <Link
                                to={`/login?redirect=/payment/${selectedPlanId}`}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                            >
                                <LogIn className="w-5 h-5" />
                                Đăng nhập ngay
                            </Link>
                            <Link
                                to={`/register?redirect=/payment/${selectedPlanId}`}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <UserPlus className="w-5 h-5" />
                                Tạo tài khoản mới
                            </Link>
                        </div>

                        <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-8">
                            Tham gia cùng cộng đồng Edu Tech
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
