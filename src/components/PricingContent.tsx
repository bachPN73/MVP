import { Check, Sparkles, Zap, Crown, CheckCircle2, Globe2, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import { plans } from "../data/plans";
import { useState } from "react";

export default function PricingContent({ isPublic = false }: { isPublic?: boolean }) {
    const storedUser = localStorage.getItem("edu_tech_user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const currentPlan = (currentUser?.plan || "free").toLowerCase();
    const [showCompareTable, setShowCompareTable] = useState(false);

    const planTiers: Record<string, number> = {
        free: 0,
        basic: 1,
        pro: 2,
        combo: 3,
        school: 4
    };
    const currentPlanTier = planTiers[currentPlan] || 0;

    return (
        <div className="p-3 sm:p-6 max-w-[95rem] mx-auto text-slate-800 dark:text-white">
            {/* Header - Tối ưu cực gọn nhưng đầy đủ khoảng cách để không bị cắt xén */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-50 dark:bg-indigo-500/10 border border-violet-100 dark:border-indigo-500/20 text-violet-600 dark:text-indigo-300 rounded-full mb-3 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black tracking-wider uppercase">Bảng giá dịch vụ</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-[950] font-heading mb-2 text-slate-900 dark:text-white tracking-tight leading-tight animate-fadeIn">
                    Chọn gói dịch vụ{" "}
                    <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        phù hợp với bạn
                    </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-medium font-sans">
                    Nâng tầm học tập trực quan 3D với các gói dịch vụ đa dạng
                </p>
            </div>

            {/* Plans Container - Thiết kế Kính mờ (Glassmorphism) với màu sắc đặc trưng của từng Plan */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 xl:gap-3 pb-8 pt-10 snap-x snap-mandatory scrollbar-thin scroll-smooth items-stretch justify-center">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isFeatured = plan.id === "pro";
                    const isOwned = currentUser ? (plan.id.toLowerCase() === currentPlan) : false;
                    const itemPlanTier = planTiers[plan.id.toLowerCase()] || 0;
                    
                    // Xác định màu sắc cụ thể cho từng gói
                    let themeColor = "";
                    let borderTop = "";
                    let shadowHover = "";
                    let btnStyle = "";
                    let iconBg = "";
                    let cardBorder = "";

                    if (plan.id === "free") {
                        themeColor = "text-slate-600 dark:text-slate-300";
                        borderTop = "border-t-[6px] border-t-slate-400 dark:border-t-slate-600";
                        shadowHover = "hover:shadow-slate-500/10 dark:hover:shadow-slate-500/5";
                        // Nút Outline cho gói Miễn phí
                        btnStyle = "border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-600";
                        iconBg = "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300";
                        cardBorder = "border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-white/95 dark:bg-slate-900/60";
                    } else if (plan.id === "basic") {
                        themeColor = "text-blue-600 dark:text-blue-400";
                        borderTop = "border-t-[6px] border-t-blue-500/80";
                        shadowHover = "hover:shadow-blue-500/15 dark:hover:shadow-blue-500/10";
                        // Nút Outline cho gói Cơ bản
                        btnStyle = "border-2 border-blue-500 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm hover:shadow-[0_4px_15px_rgba(59,130,246,0.15)]";
                        iconBg = "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400";
                        cardBorder = "border-blue-200 dark:border-blue-500/10 hover:border-blue-400 dark:hover:border-blue-400/50 bg-white/95 dark:bg-slate-900/60";
                    } else if (plan.id === "combo") {
                        themeColor = "text-orange-600 dark:text-orange-400";
                        borderTop = "border-t-[6px] border-t-orange-500";
                        shadowHover = "hover:shadow-orange-500/25 dark:hover:shadow-orange-500/15";
                        // Nút Solid nổi bật trung bình cho gói Combo
                        btnStyle = "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md active:scale-[0.98] hover:from-orange-600 hover:to-amber-600 hover:shadow-[0_4px_18px_rgba(249,115,22,0.3)] hover:scale-[1.01]";
                        iconBg = "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400";
                        cardBorder = "border-orange-300 dark:border-orange-500/20 hover:border-orange-500 dark:hover:border-orange-400 bg-white/95 dark:bg-slate-900/60";
                    } else if (plan.id === "pro") {
                        themeColor = "text-violet-600 dark:text-indigo-400";
                        borderTop = "border-t-[6px] border-t-violet-500 dark:border-t-indigo-500";
                        shadowHover = "hover:shadow-violet-500/35 dark:hover:shadow-indigo-500/25";
                        // Nút Solid tím đậm nổi bật nhất cho gói Pro chủ lực
                        btnStyle = "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/35 active:scale-[0.98] hover:from-violet-700 hover:to-indigo-700 hover:shadow-[0_6px_25px_rgba(99,102,241,0.5)] hover:scale-[1.03]";
                        iconBg = "bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-indigo-300";
                        // Cực kỳ nổi bật gói PRO chủ lực
                        cardBorder = "border-violet-500 dark:border-indigo-500/70 bg-gradient-to-b from-violet-50/40 to-white dark:from-slate-900/90 dark:to-slate-950/95 shadow-[0_20px_50px_rgba(99,102,241,0.16)] dark:shadow-[0_20px_50px_rgba(99,102,241,0.3)] z-10 hover:border-violet-600 dark:hover:border-indigo-400";
                    } else if (plan.id === "school") {
                        themeColor = "text-emerald-700 dark:text-emerald-400";
                        // Gói Trường học
                        borderTop = "border-t-[6px] border-t-emerald-600/40 dark:border-t-emerald-600/30";
                        shadowHover = "hover:shadow-emerald-600/10 dark:hover:shadow-emerald-600/5";
                        // Nút Outline cho gói Trường học
                        btnStyle = "border-2 border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-transparent shadow-sm hover:shadow-[0_4px_15px_rgba(16,185,129,0.1)]";
                        iconBg = "bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400";
                        cardBorder = "border-slate-200 dark:border-white/5 hover:border-emerald-600/30 dark:hover:border-emerald-600/20 bg-white/95 dark:bg-slate-900/60";
                    }

                    if (isOwned) {
                        btnStyle = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-none shadow-none ring-1 ring-inset ring-slate-200 dark:ring-slate-700";
                    }

                    return (
                        <div
                            key={plan.id}
                            className={`
                                flex-shrink-0 w-[275px] xs:w-[290px] md:w-auto snap-center
                                relative flex flex-col rounded-[2rem] border-2 transition-all duration-300 group
                                hover:-translate-y-1.5 shadow-md backdrop-blur-xl
                                min-h-[460px] md:min-h-0 h-full flex-grow
                                ${borderTop}
                                ${cardBorder}
                                ${shadowHover}
                            `}
                        >
                            {/* Featured Badge - Tối ưu padding và góc bo tròn pill-shape cao cấp */}
                            {isFeatured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap">
                                    <div className="relative px-5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-md">
                                        <span>Phổ biến nhất</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 sm:p-5 xl:p-3.5 flex flex-col flex-1 h-full">
                                {/* Icon, Name & Period */}
                                <div className="flex items-center gap-3 xl:gap-2 mb-4 xl:mb-2.5">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300 ${iconBg}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base sm:text-lg xl:text-md font-[900] font-heading text-slate-900 dark:text-white truncate leading-snug">{plan.name}</h2>
                                        <span className="text-[9px] text-slate-400 dark:text-indigo-300/70 font-bold uppercase tracking-[0.1em]">{plan.period}</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-0.5 mb-2 xl:mb-1.5">
                                    <span className="text-2xl sm:text-3xl xl:text-2xl font-[950] font-heading text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold ml-0.5">VND</span>
                                </div>

                                {/* Description */}
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs font-semibold leading-relaxed mb-3 xl:mb-2 min-h-[2.2rem] xl:min-h-[2.8rem] font-sans">
                                    {plan.description}
                                </p>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/15 to-transparent mb-4 xl:mb-2.5"></div>

                                {/* Features List */}
                                <div className="flex-grow space-y-3 xl:space-y-2 mb-5 xl:mb-3 flex-1">
                                    {plan.features.map((feature, idx) => {
                                        // Xác định vòng viền tròn checkmark riêng theo từng Plan
                                        let checkBadge = "";
                                        if (plan.id === "free") {
                                            checkBadge = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                                        } else if (plan.id === "basic") {
                                            checkBadge = "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
                                        } else if (plan.id === "combo") {
                                            checkBadge = "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50";
                                        } else if (plan.id === "pro") {
                                            checkBadge = "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-indigo-400 border-violet-200 dark:border-indigo-900/50";
                                        } else if (plan.id === "school") {
                                            checkBadge = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
                                        }

                                        return (
                                            <div key={idx} className="flex items-start gap-2.5 xl:gap-1.5">
                                                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5 border shadow-sm transition-transform duration-300 group-hover:scale-105 ${checkBadge}`}>
                                                    <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
                                                </div>
                                                <span className={`text-xs sm:text-[12.5px] xl:text-[11.5px] text-slate-700 dark:text-slate-200 leading-snug font-semibold`}>
                                                    {feature}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* CTA Button - Đẩy sát đáy */}
                                {isPublic || !currentUser ? (
                                     <Link to="/login" className="mt-auto block">
                                         <button
                                             className={`
                                                 w-full py-3 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer font-sans
                                                 active:scale-[0.98] ${btnStyle}
                                             `}
                                         >
                                             {plan.id === "free" ? "Trải nghiệm ngay" : "Chọn gói này"}
                                         </button>
                                     </Link>
                                 ) : itemPlanTier < currentPlanTier ? (
                                     <div className="mt-auto block">
                                         <button
                                             disabled
                                             className="w-full py-3 rounded-xl text-xs font-black transition-all duration-300 font-sans bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed border-none opacity-50"
                                         >
                                             Gói cấp dưới
                                         </button>
                                     </div>
                                 ) : isOwned ? (
                                     <div className="mt-auto block">
                                         <button
                                             disabled
                                             className={`
                                                 w-full py-3 rounded-xl text-xs font-black transition-all duration-300 font-sans
                                                 ${btnStyle}
                                             `}
                                         >
                                             Gói hiện tại
                                         </button>
                                     </div>
                                 ) : (
                                     <Link to={`/payment/${plan.id}`} className="mt-auto block">
                                         <button
                                             className={`
                                                 w-full py-3 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer font-sans
                                                 active:scale-[0.98] ${btnStyle}
                                             `}
                                         >
                                             {plan.id === "free" ? "Trải nghiệm ngay" : "Chọn gói này"}
                                         </button>
                                     </Link>
                                 )}
                             </div>
                        </div>
                    );
                })}
            </div>

            {/* Collapsible Comparison Table - Hỗ trợ xem toàn bộ gói cùng 1 lúc */}
            <div className="mt-4 mb-8 text-center">
                <button
                    onClick={() => setShowCompareTable(!showCompareTable)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-violet-500/20 active:scale-95 transition-all cursor-pointer font-sans"
                >
                    <span>{showCompareTable ? "Ẩn bảng so sánh chi tiết" : "Xem bảng so sánh chi tiết các gói"}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-350 ${showCompareTable ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {showCompareTable && (
                <div className="mt-6 mb-10 overflow-x-auto max-w-6xl mx-auto rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <table className="w-full text-left border-collapse text-xs md:text-sm font-semibold font-sans">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.02]">
                                <th className="p-4 font-black uppercase tracking-wider text-slate-550 dark:text-slate-400">Tính năng</th>
                                <th className="p-4 font-black uppercase tracking-wider text-slate-650 dark:text-slate-350">Miễn phí</th>
                                <th className="p-4 font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Cơ bản</th>
                                <th className="p-4 font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">Combo Pro</th>
                                <th className="p-4 font-black uppercase tracking-wider text-violet-600 dark:text-indigo-400">Chuyên nghiệp</th>
                                <th className="p-4 font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Trường học</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-black text-slate-900 dark:text-white">Giá cả</td>
                                <td className="p-4 font-extrabold text-slate-600 dark:text-slate-400">Miễn phí</td>
                                <td className="p-4 font-extrabold text-blue-600 dark:text-blue-400">59K / tháng</td>
                                <td className="p-4 font-extrabold text-orange-600 dark:text-orange-400">189K / tháng</td>
                                <td className="p-4 font-extrabold text-violet-600 dark:text-indigo-400">99K / tháng</td>
                                <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">1.5M / tháng</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-black text-slate-900 dark:text-white">Kho mô hình 3D</td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">Bản demo giới hạn</td>
                                <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">Cơ bản</td>
                                <td className="p-4 text-orange-600 dark:text-orange-400 font-bold">Nâng cao</td>
                                <td className="p-4 text-violet-600 dark:text-indigo-400 font-bold">Toàn bộ 3D</td>
                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Toàn bộ 3D</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-black text-slate-900 dark:text-white">Xem Infographic</td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">Một số mẫu demo</td>
                                <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">Toàn bộ của 1 môn</td>
                                <td className="p-4 text-orange-600 dark:text-orange-400 font-bold">Mở khóa nâng cao</td>
                                <td className="p-4 text-violet-600 dark:text-indigo-400 font-bold">Mở khóa toàn bộ</td>
                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">Mở khóa toàn bộ</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-black text-slate-900 dark:text-white">Trợ lý bài giảng AI</td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">Giới hạn số lượt</td>
                                <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">Tính năng cơ bản</td>
                                <td className="p-4 text-orange-600 dark:text-orange-400 font-bold">AI nâng cao</td>
                                <td className="p-4 text-violet-600 dark:text-indigo-400 font-bold">AI nâng cao + Đề xuất</td>
                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">AI soạn bài giảng</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-black text-slate-900 dark:text-white">Kho tạm lưu học liệu</td>
                                <td className="p-4 text-slate-400 dark:text-slate-500 font-medium">✕ Không hỗ trợ</td>
                                <td className="p-4 text-slate-400 dark:text-slate-500 font-medium">✕ Không hỗ trợ</td>
                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Có (24h)</td>
                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Có (24h)</td>
                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Có (24h)</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-black text-slate-900 dark:text-white">In mô hình 3D thực tế</td>
                                <td className="p-4 text-slate-400 dark:text-slate-500 font-medium">✕ Không hỗ trợ</td>
                                <td className="p-4 text-slate-400 dark:text-slate-500 font-medium">✕ Không hỗ trợ</td>
                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-extrabold">✓ 1 mô hình / tháng</td>
                                <td className="p-4 text-slate-400 dark:text-slate-500 font-medium">✕ Không hỗ trợ</td>
                                <td className="p-4 text-slate-400 dark:text-slate-500 font-medium">✕ Không hỗ trợ</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-black text-slate-900 dark:text-white">Số lượng tài khoản</td>
                                <td className="p-4 text-slate-600 dark:text-slate-500">1 tài khoản cá nhân</td>
                                <td className="p-4 text-slate-600 dark:text-slate-500">1 tài khoản cá nhân</td>
                                <td className="p-4 text-slate-600 dark:text-slate-500">1 tài khoản cá nhân</td>
                                <td className="p-4 text-slate-600 dark:text-slate-500">1 tài khoản cá nhân</td>
                                <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">30 giáo viên + Admin</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-black text-slate-900 dark:text-white">Hỗ trợ kỹ thuật</td>
                                <td className="p-4 text-slate-600 dark:text-slate-500">Hỏi đáp cộng đồng</td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">Hỗ trợ qua email</td>
                                <td className="p-4 text-orange-600 dark:text-orange-400 font-bold">Hỗ trợ ưu tiên</td>
                                <td className="p-4 text-orange-600 dark:text-orange-400 font-bold">Hỗ trợ ưu tiên</td>
                                <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">Triển khai & hỗ trợ 24/7</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bottom Enterprise CTA - Tối giản tinh gọn để lấp đầy không gian */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 p-5 max-w-6xl mx-auto mt-6 animate-in fade-in duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200/10 via-violet-100/5 to-blue-200/5 dark:from-slate-950/20 dark:via-violet-950/5 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                    <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            Bạn cần một giải pháp tùy biến cho tổ chức của mình?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed font-sans">
                            Chúng tôi cung cấp các gói dịch vụ riêng cho các trung tâm đào tạo, sở giáo dục và trường học với hỗ trợ kỹ thuật chuyên sâu 24/7 và in 3D theo yêu cầu.
                        </p>
                    </div>
                    <button className="px-6 py-3 rounded-xl text-xs font-black shrink-0 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-violet-300 dark:hover:border-indigo-500 hover:text-violet-700 dark:hover:text-indigo-400 hover:bg-violet-50 dark:hover:bg-indigo-500/10 transition-all duration-300 active:scale-[0.98] cursor-pointer font-sans">
                        Liên hệ tư vấn viên
                    </button>
                </div>
            </div>
        </div>
    );
}
