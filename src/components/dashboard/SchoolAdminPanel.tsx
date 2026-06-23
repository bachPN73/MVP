import { ShieldCheck, School, ArrowUpRight, BarChart3, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

interface SchoolAdminPanelProps {
    userName: string;
    userSchoolId: string | null;
    schoolInfo: any;
    classmates: any[];
}

export function SchoolAdminPanel({ userName, userSchoolId, schoolInfo, classmates }: SchoolAdminPanelProps) {
    return (
        <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            {/* Admin banner */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-slate-900 shadow-sm flex-shrink-0">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 opacity-90" />
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 border border-teal-200/60 dark:border-teal-500/25 shadow-sm">
                            <ShieldCheck className="w-4 h-4" />
                            School Control Unit
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
                            Chào Quản trị viên <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">{userName}</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                            Hệ thống quản lý tài khoản trường học và bản quyền Premium. Phê duyệt thành viên, cấp mã mời và theo dõi số lượng bản quyền sử dụng trong thời gian thực.
                        </p>
                    </div>
                </div>
            </div>

            {/* School org panel */}
            {userSchoolId && schoolInfo && (
                <div className="rounded-3xl border border-teal-200/40 dark:border-teal-500/20 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden flex-1 min-h-0 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100 dark:border-white/8 shrink-0">
                        <div>
                            <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2">
                                <School className="w-4 h-4" /> Cổng thông tin Trường học
                            </p>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-1 font-heading">{schoolInfo.name || 'Đang cập nhật'}</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/25 shadow-sm">
                                Mã: {schoolInfo.schoolCode || '--'}
                            </span>
                            <Link id="btn-school-dashboard" to="/school/dashboard"
                                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 transition-all hover:-translate-y-1 flex items-center gap-2">
                                <School className="w-4 h-4" /> Quản lý trường <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 space-y-5">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                                <BarChart3 className="w-4 h-4 text-teal-500" /> Thông tin niên khóa
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Thành viên đăng ký với mã mời sẽ được kích hoạt toàn bộ bản quyền Premium tự động.
                            </p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        <span>Giáo viên</span>
                                        <span>{schoolInfo.teacherSeatsUsed || 0} / {schoolInfo.teacherQuota || 5}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-700 shadow-sm"
                                            style={{ width: `${Math.min(100, ((schoolInfo.teacherSeatsUsed || 0) / (schoolInfo.teacherQuota || 5)) * 100)}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        <span>Học sinh</span>
                                        <span>{schoolInfo.studentSeatsUsed || 0} / {schoolInfo.studentQuota || 10}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all duration-700 shadow-sm"
                                            style={{ width: `${Math.min(100, ((schoolInfo.studentSeatsUsed || 0) / (schoolInfo.studentQuota || 10)) * 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                            <h3 className="font-bold text-slate-700 dark:text-white text-xs uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-500" /> Thành viên ({classmates.length + 1})</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold normal-case bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Active
                                </span>
                            </h3>
                            <div className="flex-1 flex flex-wrap content-start gap-2.5 overflow-y-auto custom-scrollbar pr-1 min-h-0">
                                <div className="flex items-center gap-2.5 bg-teal-50 border border-teal-200/50 dark:bg-teal-500/10 dark:border-teal-500/20 px-3 py-2 rounded-xl shadow-sm">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-white">{userName}</span>
                                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-100/50 dark:bg-teal-500/20 px-1.5 py-0.5 rounded-md">(Bạn)</span>
                                </div>
                                {classmates.map((member) => (
                                    <div key={member.id} className="flex items-center gap-2.5 bg-white border border-slate-200/60 dark:bg-slate-900/60 dark:border-white/5 px-3 py-2 rounded-xl hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                            {(member.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{member.name}</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${member.role === 'teacher' ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
                                            {member.role === 'teacher' ? 'GV' : member.className || 'HS'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-2 pt-4 border-t border-slate-200/60 dark:border-white/5">
                                <Sparkles className="w-4 h-4" /> Đã kích hoạt quyền lợi học tập không giới hạn
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
