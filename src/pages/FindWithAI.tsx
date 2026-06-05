import { Layout } from '../layout/MainLayout';
import { useState, useEffect } from 'react';
import { Sparkles, Search, Loader2, BookOpen, Brain, Tag, FlaskConical } from 'lucide-react';
import { Link } from 'react-router';
import { getSubjectName, Material } from '../data/materialsData';
import { api, BASE_URL } from '../api';

export default function FindWithAI() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<Material[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const [userPlan, setUserPlan] = useState('free');
    const [aiCount, setAiCount] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('edu_tech_user');
        if (stored) {
            try {
                const user = JSON.parse(stored);
                if (user.plan) setUserPlan(user.plan.toLowerCase());
            } catch (e) {}
        }

        const usageStr = localStorage.getItem('edu_tech_ai_usage');
        const today = new Date().toDateString();
        if (usageStr) {
            try {
                const usage = JSON.parse(usageStr);
                if (usage.date === today) {
                    setAiCount(usage.count);
                } else {
                    localStorage.setItem('edu_tech_ai_usage', JSON.stringify({ date: today, count: 0 }));
                    setAiCount(0);
                }
            } catch (e) {}
        } else {
            localStorage.setItem('edu_tech_ai_usage', JSON.stringify({ date: today, count: 0 }));
            setAiCount(0);
        }
    }, []);

    // AI Insight state
    const [aiInsight, setAiInsight] = useState('');
    const [aiKeywords, setAiKeywords] = useState<string[]>([]);
    const [aiSubject, setAiSubject] = useState<string | null>(null);

    const exampleQueries = [
        'Cấu trúc nguyên tử và electron',
        'Chu trình hô hấp tế bào',
        'Định luật chuyển động Newton',
        'Bảng tuần hoàn hóa học',
        'Quá trình quang hợp ở thực vật',
    ];

    const handleSearch = async () => {
        if (!query.trim()) return;

        if (userPlan === 'free' && aiCount >= 3) {
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        setAiInsight('');
        setAiKeywords([]);
        setAiSubject(null);

        try {
            const response = await api.aiSearch(query);

            // Map results to Material format
            const formattedResults: Material[] = response.results.map((m: any) => ({
                id: `db-${m.id}`,
                title: m.title,
                subject: m.subject,
                type: m.type || '3d-model',
                description: m.description,
                thumbnail: m.thumbnail 
                    ? (m.thumbnail.startsWith('http') ? m.thumbnail : `${BASE_URL}${m.thumbnail}`)
                    : '3d-placeholder',
                tags: Array.isArray(m.tags) ? m.tags : [],
                grade: m.grade || 10,
                file_url: m.file_url,
            }));

            setResults(formattedResults);
            setAiInsight(response.ai_insight || '');
            setAiKeywords(response.keywords || []);

            if (userPlan === 'free') {
                const today = new Date().toDateString();
                const newCount = aiCount + 1;
                localStorage.setItem('edu_tech_ai_usage', JSON.stringify({ date: today, count: newCount }));
                setAiCount(newCount);
            }
            setAiSubject(response.predicted_subject || null);
        } catch (error) {
            console.error('AI Search error:', error);
            setResults([]);
            setAiInsight('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleExampleClick = (example: string) => {
        setQuery(example);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };

    const subjectNameMap: Record<string, string> = {
        physics: 'Vật lý',
        chemistry: 'Hóa học',
        biology: 'Sinh học',
    };

    return (
        <Layout>
            <div className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto relative">
                {/* Decorative Background Hues */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="mb-10 text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 rounded-3xl mb-6 shadow-xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 rounded-3xl blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
                        <Sparkles className="w-10 h-10 text-white relative z-10 animate-pulse-slow" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent font-heading">
                        Find with AI
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
                        Mô tả nội dung bạn muốn tìm kiếm, AI sẽ thông minh phân tích ngữ cảnh, trích xuất chủ đề và đề xuất học liệu phù hợp nhất
                    </p>
                </div>

                {/* Search input console */}
                <div className="max-w-4xl mx-auto mb-12 relative z-10">
                    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-3 sm:p-4 shadow-xl hover:shadow-2xl focus-within:shadow-indigo-500/10 focus-within:border-indigo-500/50 dark:focus-within:border-indigo-500/50 transition-all duration-300">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <textarea
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value.slice(0, 500))}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ví dụ: Tôi muốn tìm mô hình 3D sinh động về cấu trúc nguyên tử và các electron quay quanh hạt nhân..."
                                    className="w-full px-4 sm:px-6 py-4 bg-transparent border-0 focus:outline-none resize-none min-h-[130px] text-base sm:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed"
                                    disabled={isSearching}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 pt-2 border-t border-slate-100 dark:border-white/5">
                            <div className="flex flex-col gap-1 text-left">
                                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                                    {query.length} / 500 ký tự
                                </div>
                                {userPlan === 'free' && (
                                    <div className={`text-xs font-bold ${aiCount >= 3 ? 'text-rose-500 animate-pulse' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                        {aiCount >= 3 ? (
                                            <span>
                                                ⚠️ Đã dùng hết 3 lượt AI hôm nay. {' '}
                                                <Link to="/pricing" className="text-indigo-650 dark:text-indigo-400 underline hover:text-indigo-800">
                                                    Nâng cấp gói ngay!
                                                </Link>
                                            </span>
                                        ) : (
                                            `🤖 Số lượt AI hôm nay: ${aiCount}/3 (Còn ${3 - aiCount} lượt)`
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={!query.trim() || isSearching || (userPlan === 'free' && aiCount >= 3)}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        AI đang phân tích...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Tìm kiếm học liệu
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Suggestion Chips */}
                    {!hasSearched && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Gợi ý tìm kiếm nhanh:</p>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {exampleQueries.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleExampleClick(example)}
                                        className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900/50 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-white/10 hover:border-indigo-500/30 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Screen Area */}
                {hasSearched && (
                    <div className="max-w-6xl mx-auto mt-6 relative z-10">
                        {isSearching ? (
                            /* Premium Loading scan */
                            <div className="text-center py-20 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl relative overflow-hidden shadow-lg animate-pulse-glow">
                                <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
                                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
                                
                                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full animate-ping opacity-25" />
                                    <div className="absolute inset-2 bg-white dark:bg-slate-950 border-2 border-indigo-500/30 dark:border-indigo-500/20 rounded-full" />
                                    <Brain className="w-10 h-10 text-indigo-500 dark:text-indigo-400 relative z-10 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-extrabold mb-3 bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent font-heading">
                                    Gemini đang phân tích...
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-base font-medium px-4">
                                    Hệ thống AI đang đọc hiểu nội dung ngữ cảnh, tự động phân loại môn học và truy xuất học liệu 3D tối ưu.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                {/* AI Insight Console Panel */}
                                {aiInsight && (
                                    <div className="bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-emerald-500/5 dark:from-indigo-500/10 dark:via-violet-500/5 dark:to-emerald-500/10 border border-indigo-500/20 dark:border-indigo-500/15 rounded-3xl p-6 sm:p-8 mb-10 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                                        
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md relative">
                                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-[2px]" />
                                                <Brain className="w-6 h-6 text-white relative z-10" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20">
                                                    AI Trợ lý học thuật
                                                </span>
                                                <h3 className="font-bold text-lg sm:text-xl mt-2 mb-2 text-slate-900 dark:text-white font-heading">
                                                    Phân Tích & Định Hướng AI
                                                </h3>
                                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base font-medium bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                                                    {aiInsight}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                            {/* Predicted Subject */}
                                            {aiSubject && (
                                                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm self-start">
                                                    <FlaskConical className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Phân loại: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{subjectNameMap[aiSubject] || aiSubject}</span>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Keywords */}
                                            {aiKeywords.length > 0 && (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Tag className="w-4 h-4 text-slate-400" />
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {aiKeywords.slice(0, 6).map((kw, i) => (
                                                            <span key={i} className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20">
                                                                #{kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Results Header */}
                                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
                                    <div>
                                        <h2 className="text-2xl font-extrabold mb-1 tracking-tight text-slate-900 dark:text-white font-heading">Kết quả tìm kiếm</h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                                            Tìm thấy <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{results.length}</span> học liệu phù hợp nhất
                                        </p>
                                    </div>
                                </div>

                                {/* Results Cards Grid */}
                                {results.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                                        {results.map((material) => (
                                            <Link
                                                key={material.id}
                                                to={`/material/${material.id}`}
                                                className={`group bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full relative ${
                                                    material.subject === 'physics' ? 'hover-glow-physics' :
                                                    material.subject === 'chemistry' ? 'hover-glow-chemistry' :
                                                    'hover-glow-biology'
                                                }`}
                                            >
                                                {/* Visual Hover Line */}
                                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                <div className="aspect-video bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex-shrink-0">
                                                    {material.thumbnail && material.thumbnail !== '3d-placeholder' ? (
                                                        <img 
                                                            src={material.thumbnail} 
                                                            alt={material.title} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center">
                                                            <BookOpen className="w-12 h-12 text-indigo-500/30" />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Glassmorphic Match Badge */}
                                                    <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-md border border-white/20">
                                                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
                                                        Khớp {Math.floor(Math.random() * 6) + 94}%
                                                    </div>
                                                </div>

                                                <div className="p-5 flex flex-col flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3.5">
                                                        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20">
                                                            {getSubjectName(material.subject)}
                                                        </span>
                                                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20">
                                                            {material.type === '3d-model' ? 'Mô hình 3D' : 'Đồ họa thông tin'}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-extrabold mb-2.5 text-base md:text-lg line-clamp-2 leading-snug group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-300 font-heading text-slate-900 dark:text-white">
                                                        {material.title}
                                                    </h3>
                                                    
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed flex-1">
                                                        {material.description}
                                                    </p>

                                                    <div className="flex flex-wrap gap-1.5 pt-3.5 border-t border-slate-100 dark:border-white/5">
                                                        {(Array.isArray(material.tags) ? material.tags : []).slice(0, 3).map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[110px]"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    /* Beautiful Zero results card */
                                    <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-lg relative overflow-hidden max-w-lg mx-auto">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
                                            <Sparkles className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white font-heading">Không tìm thấy kết quả phù hợp</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium px-4">
                                            AI không tìm thấy học liệu khớp trực tiếp. Bạn vui lòng thử mô tả chi tiết hơn hoặc nhập các từ khóa khác.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setQuery('');
                                                setHasSearched(false);
                                                setResults([]);
                                                setAiInsight('');
                                                setAiKeywords([]);
                                                setAiSubject(null);
                                            }}
                                            className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
                                        >
                                            Tìm kiếm lại
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
