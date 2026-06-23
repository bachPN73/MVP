import { ShieldCheck, Crown, School, Compass, Clock, Box, Zap } from 'lucide-react';
import { Link } from 'react-router';

interface WelcomeBannerProps {
    userName: string;
    userRole: string;
    greetingTime: string;
    userClassName?: string;
    schoolInfo?: { name: string; schoolCode: string };
    materialCount: number;
    daysRemaining: number;
    isPremiumPlan: boolean;
    userPlan: string;
    currentPlanConfig: {
        label: string;
        icon: any;
        colorClass: string;
        textClass: string;
    };
}

export function WelcomeBanner({
    userName, userRole, greetingTime, userClassName, schoolInfo,
    materialCount, daysRemaining, isPremiumPlan, userPlan, currentPlanConfig
}: WelcomeBannerProps) {
    const PlanIcon = currentPlanConfig.icon;

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-white/6 bg-white dark:bg-slate-900 shadow-sm shrink-0">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-amber-400 opacity-90" />
            <div className="p-5 md:p-7 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
                {/* Left: greeting */}
                <div className="flex items-center gap-5">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg
                        ${userRole === 'admin'
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/20'
                            : userRole === 'teacher'
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-teal-500/20'
                            : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/20'
                        }`}>
                        {userRole === 'admin' ? <Crown className="w-7 h-7" /> : userRole === 'teacher' ? <School className="w-7 h-7" /> : <Compass className="w-7 h-7" strokeWidth={2} />}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{greetingTime}</span>
                            {schoolInfo && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-500/20">
                                    <School className="h-3 w-3" /> {schoolInfo.name}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Chào {userName} <span className="inline-block animate-wave origin-[70%_70%]">👋</span></h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border shadow-sm
                                ${userRole === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20'
                                : userRole === 'teacher' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20'}`}>
                                {userRole === 'admin' ? 'Quản trị viên' : userRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                            </span>
                            {userClassName && (
                                <span className="rounded-md border border-slate-200/60 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 shadow-sm">
                                    Lớp {userClassName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: stats HUD */}
                <div className="grid grid-cols-3 gap-3 w-full md:w-auto md:min-w-[24rem]">
                    {/* Materials count */}
                    <div className="rounded-2xl border border-blue-100 dark:border-blue-500/15 bg-blue-50/60 dark:bg-blue-950/20 p-4 hover:border-blue-300/60 dark:hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1.5">
                            <Box className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Học liệu</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white leading-none font-heading">{materialCount}</p>
                    </div>
                    {/* Days remaining */}
                    <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/15 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 hover:border-emerald-300/60 dark:hover:border-emerald-500/30 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1.5">
                            <Clock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Thời hạn</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-black text-slate-800 dark:text-white leading-none font-heading">
                                {isPremiumPlan ? `${daysRemaining}` : '\u221e'}
                            </p>
                            {isPremiumPlan && <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-bold">ngày</p>}
                        </div>
                    </div>
                    {/* Plan */}
                    <div className={`rounded-2xl border p-4 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group relative overflow-hidden
                        ${userPlan === 'pro' ? 'border-amber-200 dark:border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 hover:border-amber-400/60 dark:hover:border-amber-500/40'
                        : userPlan === 'demo' ? 'border-rose-200 dark:border-rose-500/20 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 hover:border-rose-400/60 dark:hover:border-rose-500/40'
                        : 'border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.02] dark:to-white/[0.05] hover:border-slate-300 dark:hover:border-white/20'}`}>
                        {userPlan === 'pro' && <div className="absolute -right-2 -top-2 w-12 h-12 bg-amber-400/20 rounded-full blur-xl" />}
                        <div className="flex items-center gap-2 mb-1.5 relative z-10">
                            <PlanIcon className={`w-4 h-4 group-hover:scale-110 transition-transform ${currentPlanConfig.textClass}`} />
                            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Gói</span>
                        </div>
                        <p className={`text-xl font-black uppercase tracking-widest leading-none mt-1 font-heading ${currentPlanConfig.textClass} relative z-10`}>{currentPlanConfig.label}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
