import { Layers } from 'lucide-react';
import { Link } from 'react-router';

interface Subject {
    id: string;
    name: string;
    icon: any;
    progress: number;
    subtopics: any[];
    desc: string;
    count: number;
}

interface ProgressCardsProps {
    subjects: Subject[];
}

export function ProgressCards({ subjects }: ProgressCardsProps) {
    return (
        <div className="shrink-0 space-y-3">
            <h2 className="text-[0.6875rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Tiến độ & Môn học
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subjects.map((subject) => {
                    const Icon = subject.icon;
                    const circumference = 2 * Math.PI * 20;
                    const strokeDashoffset = circumference - (subject.progress / 100) * circumference;
                    const themeMapping: Record<string, { bg: string; border: string; iconBg: string; progressStroke: string; badgeBg: string }> = {
                        physics: {
                            bg: 'bg-white dark:bg-slate-900',
                            border: 'border-blue-100 dark:border-blue-500/15 hover:border-blue-300/60 dark:hover:border-blue-500/30',
                            iconBg: 'from-blue-500 to-cyan-500 shadow-blue-500/20',
                            progressStroke: '#3b82f6',
                            badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
                        },
                        chemistry: {
                            bg: 'bg-white dark:bg-slate-900',
                            border: 'border-emerald-100 dark:border-emerald-500/15 hover:border-emerald-300/60 dark:hover:border-emerald-500/30',
                            iconBg: 'from-emerald-500 to-teal-500 shadow-emerald-500/20',
                            progressStroke: '#10b981',
                            badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
                        },
                        biology: {
                            bg: 'bg-white dark:bg-slate-900',
                            border: 'border-rose-100 dark:border-rose-500/15 hover:border-rose-300/60 dark:hover:border-rose-500/30',
                            iconBg: 'from-rose-500 to-orange-500 shadow-rose-500/20',
                            progressStroke: '#f43f5e',
                            badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
                        }
                    };
                    const config = themeMapping[subject.id] || themeMapping.physics;

                    return (
                        <Link
                            id={`card-subject-${subject.id}`}
                            key={subject.id}
                            to={`/library?subject=${subject.id}`}
                            className={`group relative overflow-hidden rounded-2xl ${config.bg} border ${config.border} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col`}
                        >
                            <div className="p-5 flex flex-col gap-4 flex-1">
                                <div className="flex justify-between items-start">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-6 h-6" strokeWidth={1.75} />
                                    </div>
                                    {/* Progress ring */}
                                    <div className="relative w-12 h-12 flex items-center justify-center">
                                        <svg className="w-12 h-12 -rotate-90 absolute inset-0" viewBox="0 0 56 56">
                                            <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4" className="stroke-slate-100 dark:stroke-slate-800" />
                                            <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4" strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                                style={{ strokeDasharray: circumference, strokeDashoffset, color: config.progressStroke }} />
                                        </svg>
                                        <span className="relative z-10 text-[0.625rem] font-black text-slate-700 dark:text-slate-200">{subject.progress}%</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-heading">{subject.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subject.desc}</p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[0.625rem] font-bold ${config.badgeBg}`}>{subject.count} học liệu</span>
                                    <span className="px-2.5 py-1 rounded-md text-[0.625rem] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{subject.subtopics.length} chủ đề</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
