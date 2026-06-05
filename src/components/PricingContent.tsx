import { Check, Sparkles, Zap, Crown, CheckCircle2, Globe2 } from "lucide-react";
import { Link } from "react-router";
import { plans } from "../data/plans";

export default function PricingContent() {
    const storedUser = localStorage.getItem("edu_tech_user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const currentPlan = (currentUser?.plan || "free").toLowerCase();

    const planTiers: Record<string, number> = {
        free: 0,
        demo: 1,
        basic: 2,
        pro: 3,
        combo: 4,
        school: 5
    };
    const currentPlanTier = planTiers[currentPlan] || 0;

    return (
        <div className="p-3 sm:p-6 max-w-[95rem] mx-auto text-slate-800 dark:text-white">
            {/* Header - Tối ưu cực gọn nhưng đầy đủ khoảng cách để không bị cắt xén */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-50 dark:bg-indigo-500/10 border border-violet-100 dark:border-indigo-500/20 text-violet-600 dark:text-indigo-300 rounded-full mb-3 shadow-sm animate-pulse-slow">
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
            <div className="flex overflow-x-auto xl:grid xl:grid-cols-6 gap-5 pb-8 pt-10 snap-x snap-mandatory scrollbar-thin scroll-smooth items-stretch">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isFeatured = plan.id === "pro";
                    const isOwned = plan.id.toLowerCase() === currentPlan;
                    const itemPlanTier = planTiers[plan.id.toLowerCase()] || 0;
                    
                    // Xác định màu sắc cụ thể cho từng gói
                    let themeColor = "";
                    let borderTop = "";
                    let shadowHover = "";
                    let btnStyle = "";
                    let iconBg = "";
                    let cardBorder = "";

                    if (isOwned) {
                        themeColor = "text-slate-400 dark:text-slate-500";
                        borderTop = "border-t-[6px] border-t-slate-400 dark:border-t-slate-600";
                        shadowHover = "hover:shadow-none";
                        btnStyle = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-none shadow-none";
                        iconBg = "bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500";
                        cardBorder = "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 opacity-90";
                    } else if (plan.id === "free") {
                        themeColor = "text-slate-600 dark:text-slate-300";
                        borderTop = "border-t-[6px] border-t-slate-400 dark:border-t-slate-600";
                        shadowHover = "hover:shadow-slate-500/10 dark:hover:shadow-slate-500/5";
                        // Nút Outline cho gói Miễn phí
                        btnStyle = "border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-600";
                        iconBg = "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300";
                        cardBorder = "border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-white/95 dark:bg-slate-900/60";
                    } else if (plan.id === "demo") {
                        themeColor = "text-rose-600 dark:text-rose-400";
                        borderTop = "border-t-[6px] border-t-rose-500";
                        shadowHover = "hover:shadow-rose-500/15 dark:hover:shadow-rose-500/10";
                        btnStyle = "border-2 border-rose-500 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm hover:shadow-[0_4px_15px_rgba(244,63,94,0.15)]";
                        iconBg = "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400";
                        cardBorder = "border-rose-200 dark:border-rose-500/10 hover:border-rose-400 dark:hover:border-rose-400/50 bg-white/95 dark:bg-slate-900/60";
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
                        cardBorder = "border-violet-500 dark:border-indigo-500/70 bg-gradient-to-b from-violet-50/40 to-white dark:from-slate-900/90 dark:to-slate-950/95 shadow-[0_20px_50px_rgba(99,102,241,0.16)] dark:shadow-[0_20px_50px_rgba(99,102,241,0.3)] xl:scale-[1.04] z-10 hover:border-violet-600 dark:hover:border-indigo-400";
                    } else if (plan.id === "school") {
                        themeColor = "text-emerald-700 dark:text-emerald-400";
                        // Hạ tông xanh lá rực rỡ thành màu xanh mint trầm, nhã nhặn hơn để nhường sự chú ý cho gói Pro
                        borderTop = "border-t-[6px] border-t-emerald-600/40 dark:border-t-emerald-600/30";
                        shadowHover = "hover:shadow-emerald-600/10 dark:hover:shadow-emerald-600/5";
                        // Nút Outline cho gói Trường học
                        btnStyle = "border-2 border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-transparent shadow-sm hover:shadow-[0_4px_15px_rgba(16,185,129,0.1)]";
                        iconBg = "bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400";
                        cardBorder = "border-slate-200 dark:border-white/5 hover:border-emerald-600/30 dark:hover:border-emerald-600/20 bg-white/95 dark:bg-slate-900/60";
                    }

                    return (
                        <div
                            key={plan.id}
                            className={`
                                flex-shrink-0 w-[310px] sm:w-[330px] xl:w-auto snap-center
                                relative flex flex-col rounded-[2.25rem] border-2 transition-all duration-300 group
                                hover:-translate-y-1.5 shadow-md backdrop-blur-xl
                                min-h-[520px] sm:min-h-[550px] xl:min-h-[590px]
                                ${borderTop}
                                ${cardBorder}
                                ${shadowHover}
                            `}
                        >
                            {/* Featured Badge - Tối ưu padding và góc bo tròn pill-shape cao cấp */}
                            {isFeatured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap">
                                    <div className="relative px-5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-md animate-pulse-slow">
                                        <span>Phổ biến nhất</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-5 sm:p-6 flex flex-col flex-1 h-full">
                                {/* Icon, Name & Period */}
                                <div className="flex items-center gap-4 mb-5">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300 ${iconBg}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base sm:text-lg font-[900] font-heading text-slate-900 dark:text-white truncate leading-snug">{plan.name}</h2>
                                        <span className="text-[9px] text-slate-400 dark:text-indigo-300/70 font-bold uppercase tracking-[0.1em]">{plan.period}</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-3xl sm:text-4xl font-[950] font-heading text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                                    <span className="text-xs text-slate-400 dark:text-slate-400 font-bold">VND</span>
                                </div>

                                {/* Description */}
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed mb-4 min-h-[2.5rem] font-sans">
                                    {plan.description}
                                </p>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/15 to-transparent mb-5"></div>

                                {/* Features List - Tăng độ giãn dòng, checkmark SVG tròn đồng bộ */}
                                <div className="flex-1 space-y-4 mb-6 sm:mb-8">
                                    {plan.features.map((feature, idx) => {
                                        // Xác định vòng viền tròn checkmark riêng theo từng Plan
                                        let checkBadge = "";
                                        if (isOwned) {
                                            checkBadge = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/50";
                                        } else if (plan.id === "free") {
                                            checkBadge = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                                        } else if (plan.id === "demo") {
                                            checkBadge = "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";
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
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border shadow-sm transition-transform duration-300 group-hover:scale-105 ${checkBadge}`}>
                                                    <Check className="w-3 h-3" strokeWidth={3.5} />
                                                </div>
                                                <span className={`text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed font-semibold ${isOwned ? 'text-slate-400 dark:text-slate-500 line-through opacity-70' : ''}`}>
                                                    {feature}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* CTA Button - Đẩy sát đáy, cấu trúc nút phân cấp cực nét */}
                                {itemPlanTier < currentPlanTier ? (
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

            {/* Bottom Enterprise CTA - Tối giản tinh gọn để lấp đầy không gian */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 p-5 max-w-6xl mx-auto mt-6 animate-in fade-in duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200/10 via-violet-100/5 to-blue-200/5 dark:from-slate-950/20 dark:via-violet-950/5 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                    <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
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
