import { Layout } from "../layout/MainLayout";
import { useParams, useNavigate } from "react-router";
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";

export default function PaymentPage() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState(1);

    const plans: Record<string, any> = {
        free: { name: "Miễn phí", price: 0, desc: "Gói cơ bản trải nghiệm dịch vụ" },
        basic: { name: "Cơ bản (Basic)", price: 249000, desc: "Tối ưu cho cá nhân tự học" },
        combo: { name: "Combo Đặc biệt", price: 400000, desc: "Bộ đôi tiết kiệm & đầy đủ học liệu" },
        pro: { name: "Chuyên nghiệp (Pro)", price: 499000, desc: "Dành cho giáo viên & học sinh xuất sắc" },
        school: { name: "Trường học (School)", price: 9000000, desc: "Giải pháp toàn diện cho tổ chức" },
    };

    const plan = plans[planId || "free"] || plans.free;

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setStep(2);
        }, 2000);
    };

    if (step === 2) {
        return (
            <Layout>
                <div className="p-6 md:p-8 min-h-[80vh] flex items-center justify-center animate-fadeIn">
                    <div className="max-w-md w-full text-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-xl text-slate-800 dark:text-slate-100 backdrop-blur-xl relative overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />

                        <div className="relative">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm scale-110">
                                <CheckCircle2 className="w-10 h-10 animate-bounce" />
                            </div>
                            
                            <h1 className="text-3xl font-extrabold font-heading mb-3 text-slate-900 dark:text-white tracking-tight">
                                Thanh toán thành công!
                            </h1>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans font-semibold leading-relaxed mb-8">
                                Cảm ơn bạn đã nâng cấp lên gói <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-heading text-base">{plan.name}</span>. 
                                Giờ đây bạn đã có quyền truy cập không giới hạn vào mọi tài nguyên học liệu.
                            </p>

                            <div className="space-y-3.5 relative z-10">
                                <Button 
                                    variant="gradient"
                                    className="w-full py-3.5 text-sm font-bold uppercase tracking-wider font-sans" 
                                    onClick={() => navigate("/dashboard")}
                                >
                                    Đến Trang Cá Nhân
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full py-3 text-sm font-bold border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 uppercase tracking-wider font-sans" 
                                    onClick={() => navigate("/library")}
                                >
                                    Khám phá thư viện ngay
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Payment Form (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">Thanh toán</h1>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
                                Nhập thông tin thanh toán của bạn bên dưới để hoàn tất giao dịch.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm text-slate-800 dark:text-slate-100 backdrop-blur-xl">
                            <h3 className="text-base font-bold mb-6 flex items-center gap-2.5 font-heading text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4">
                                <CreditCard className="w-5 h-5 text-indigo-500" />
                                Chi tiết thẻ thanh toán
                            </h3>

                            <form onSubmit={handlePayment} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">Số thẻ</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                required
                                                className="w-full p-3 pl-10 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all font-sans"
                                            />
                                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">Hết hạn</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                required
                                                className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all font-sans"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">CVV</label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    placeholder="***"
                                                    required
                                                    className="w-full p-3 pl-10 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all font-sans"
                                                />
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">Tên chủ thẻ</label>
                                        <input
                                            type="text"
                                            placeholder="NGUYEN VAN AN"
                                            required
                                            className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all font-sans uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        className="w-full py-3.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 font-sans"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Đang bảo mật giao dịch...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4.5 h-4.5" />
                                                Thanh toán {plan.price.toLocaleString()}đ
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="flex items-start gap-4 text-slate-500 dark:text-slate-400 text-xs font-sans font-semibold p-4.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-white/5 rounded-2xl">
                            <Lock className="w-5 h-5 flex-shrink-0 text-indigo-500 mt-0.5" />
                            <p className="leading-relaxed">
                                Dữ liệu thanh toán của bạn được bảo mật tuyệt đối theo tiêu chuẩn mã hóa quốc tế **PCI DSS**. Mọi thông tin thẻ truyền đi đều được mã hóa SSL/TLS an toàn.
                            </p>
                        </div>
                    </div>

                    {/* Right: Order Summary (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm lg:sticky lg:top-8 text-slate-800 dark:text-slate-100 backdrop-blur-xl overflow-hidden relative">
                            {/* Accent line top */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />

                            <h3 className="text-lg font-bold mb-6 border-b border-slate-100 dark:border-white/5 pb-4 font-heading text-slate-900 dark:text-white">
                                Tóm tắt đơn hàng
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100/20 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold font-heading text-slate-900 dark:text-white">Gói {plan.name}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-sans font-bold">{plan.desc}</p>
                                        </div>
                                    </div>
                                    <p className="font-extrabold font-heading text-slate-900 dark:text-white text-base">{plan.price.toLocaleString()}đ</p>
                                </div>
                            </div>

                            <div className="space-y-3.5 border-t border-slate-100 dark:border-white/5 pt-5 font-sans text-sm font-semibold">
                                <div className="flex justify-between text-slate-500 dark:text-slate-300">
                                    <span>Tạm tính</span>
                                    <span className="text-slate-700 dark:text-slate-300">{plan.price.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-slate-500 dark:text-slate-300">
                                    <span>Thuế VAT (0%)</span>
                                    <span className="text-slate-700 dark:text-slate-300">0đ</span>
                                </div>
                                <div className="flex justify-between text-xl font-extrabold pt-4 text-slate-900 dark:text-white border-t border-dashed border-slate-200 dark:border-white/10 mt-3 font-heading">
                                    <span>Tổng thanh toán</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black">{plan.price.toLocaleString()}đ</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 text-center font-sans font-bold italic">
                                    Bằng cách thực hiện thanh toán, bạn đồng ý với các Điều khoản dịch vụ và Chính sách bảo mật của hệ thống Edu Tech.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
