import { Sparkles, Search, ChevronRight, Library, BookOpen, BookMarked } from 'lucide-react';
import { Link } from 'react-router';

interface QuickLinksProps {
    materialCount: number;
}

export function QuickLinks({ materialCount }: QuickLinksProps) {
    return (
        <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Search */}
            <Link id="link-ai-search-card" to="/find-ai"
                className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-500/15 shadow-sm hover:shadow-md hover:border-indigo-300/60 dark:hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col p-5 md:p-6 min-h-[10rem]">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-slate-800 dark:text-white font-heading">Truy vấn thông minh AI</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Phân tích bài toán và tìm tài nguyên tức thì.</p>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-end gap-3">
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/6 rounded-xl py-2.5 px-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Cấu trúc tế bào động vật</span>
                        <span className="w-0.5 h-4 bg-indigo-400 animate-cursor-blink ml-auto shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all mt-1">
                        Tìm kiếm với AI <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </Link>

            {/* Library */}
            <Link id="link-library-card" to="/library"
                className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-500/15 shadow-sm hover:shadow-md hover:border-teal-300/60 dark:hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col p-5 md:p-6 min-h-[10rem]">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Library className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-slate-800 dark:text-white font-heading">Kho học liệu tương tác</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tổng hợp {materialCount} tài nguyên thí nghiệm ảo 3D.</p>
                    </div>
                </div>
                <div className="flex-1 flex items-end justify-between gap-2">
                    <div className="flex items-center gap-3">
                        {([
                            { icon: Library, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/15' },
                            { icon: BookOpen, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/15' },
                            { icon: BookMarked, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/15' },
                        ] as const).map(({ icon: ItemIcon, color }, idx) => (
                            <div key={idx} className={`w-10 h-10 rounded-xl ${color} border flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform duration-300`} style={{ transitionDelay: `${idx * 50}ms` }}>
                                <ItemIcon className="w-5 h-5" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:gap-2 transition-all">
                        Truy cập <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </Link>
        </div>
    );
}
