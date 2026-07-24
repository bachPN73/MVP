import { useState } from 'react';
import { QuizQuestion } from '../../data/materialsData';
import { CheckCircle2, XCircle, HelpCircle, ChevronRight, RefreshCcw } from 'lucide-react';

interface QuizPanelProps {
    quiz: QuizQuestion[];
    theme: 'light' | 'dark';
}

const formatQuestionText = (text: string) => {
    if (!text) return '';
    return text.replace(/^(?:C\d+|Câu\s*\d+|Question\s*\d+|\d+)[\.\:]\s*/i, '').trim();
};

const formatOptionText = (text: string) => {
    if (!text) return '';
    return text.replace(/^[A-D1-4][\.\)\/\-]\s*/i, '').trim();
};

export function QuizPanel({ quiz, theme }: QuizPanelProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    if (!quiz || quiz.length === 0) return null;

    const currentQuestion = quiz[currentQuestionIndex];

    const handleSelectOption = (index: number) => {
        if (isAnswerSubmitted) return;
        setSelectedOption(index);
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;
        setIsAnswerSubmitted(true);
        if (selectedOption === currentQuestion.correctAnswerIndex) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswerSubmitted(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setScore(0);
        setQuizCompleted(false);
    };

    const baseClasses = "bg-transparent text-slate-800 dark:text-white";

    const getOptionClasses = (index: number) => {
        let classes = `w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex items-start justify-between gap-3 group backdrop-blur-sm `;
        
        if (!isAnswerSubmitted) {
            if (selectedOption === index) {
                classes += theme === 'light' 
                    ? "border-indigo-500 bg-indigo-50/90 text-indigo-700 shadow-md scale-[1.01]" 
                    : "border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-md scale-[1.01]";
            } else {
                classes += theme === 'light'
                    ? "border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-md hover:scale-[1.005]"
                    : "border-white/10 bg-slate-900/40 hover:border-indigo-400/50 hover:bg-slate-800/60 hover:scale-[1.005]";
            }
        } else {
            if (index === currentQuestion.correctAnswerIndex) {
                classes += theme === 'light'
                    ? "border-emerald-500 bg-emerald-50/90 text-emerald-700 shadow-sm"
                    : "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm";
            } else if (selectedOption === index) {
                classes += theme === 'light'
                    ? "border-rose-500 bg-rose-50/90 text-rose-700 shadow-sm"
                    : "border-rose-500 bg-rose-500/20 text-rose-300 shadow-sm";
            } else {
                classes += theme === 'light'
                    ? "border-slate-200 bg-white/40 opacity-40"
                    : "border-white/5 bg-slate-900/20 opacity-40";
            }
        }
        return classes;
    };

    const getBadgeClasses = (index: number) => {
        if (!isAnswerSubmitted) {
            if (selectedOption === index) {
                return theme === 'light'
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-500 text-white";
            }
            return theme === 'light' 
                ? "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600" 
                : "bg-slate-800 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300";
        } else {
            if (index === currentQuestion.correctAnswerIndex) {
                return "bg-emerald-500 text-white";
            }
            if (selectedOption === index) {
                return "bg-rose-500 text-white";
            }
            return theme === 'light' 
                ? "bg-slate-100 text-slate-400" 
                : "bg-slate-800/40 text-slate-600";
        }
    };

    if (quizCompleted) {
        return (
            <div className={`w-full p-6 flex flex-col items-center justify-center rounded-2xl ${baseClasses}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-500/30 rotate-3 hover:rotate-6 transition-transform">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black mb-2 font-heading bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Hoàn thành!</h3>
                <p className={`text-sm font-medium mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    Bạn đã trả lời đúng <span className="text-indigo-600 dark:text-indigo-400 font-bold">{score}</span> / {quiz.length} câu hỏi.
                </p>
                <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-transform hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25 active:scale-95"
                >
                    <RefreshCcw className="w-4 h-4" /> Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={`w-full p-5 sm:p-6 flex flex-col ${baseClasses}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded-xl">
                        <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Trắc nghiệm</span>
                </div>
                <div className={`px-3 py-1 rounded-xl text-[0.6875rem] font-bold shadow-sm backdrop-blur-md ${theme === 'light' ? 'bg-white/80 border border-slate-200/80 text-slate-600' : 'bg-slate-800/80 border border-white/10 text-slate-300'}`}>
                    Câu {currentQuestionIndex + 1} / {quiz.length}
                </div>
            </div>

            {/* Question */}
            <h2 className="text-base sm:text-lg font-bold mb-5 leading-relaxed font-heading text-slate-900 dark:text-white break-words">
                {formatQuestionText(currentQuestion.question)}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-2.5 mb-6">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        disabled={isAnswerSubmitted}
                        className={getOptionClasses(index)}
                    >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-black transition-all duration-300 mt-0.5 ${getBadgeClasses(index)}`}>
                                {['A', 'B', 'C', 'D'][index]}
                            </span>
                            <span className="font-semibold text-sm leading-relaxed text-left break-words flex-1">{formatOptionText(option)}</span>
                        </div>
                        {isAnswerSubmitted && index === currentQuestion.correctAnswerIndex && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        )}
                        {isAnswerSubmitted && selectedOption === index && index !== currentQuestion.correctAnswerIndex && (
                            <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                        )}
                    </button>
                ))}
            </div>

            {/* Explanation & Action */}
            <div className="mt-auto pt-4 border-t border-slate-200/60 dark:border-white/10">
                {isAnswerSubmitted && currentQuestion.explanation && (
                    <div className={`p-3.5 rounded-xl mb-4 text-xs leading-relaxed border-l-4 ${
                        selectedOption === currentQuestion.correctAnswerIndex 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' 
                            : 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                    }`}>
                        <p className="font-bold mb-0.5">Giải thích:</p>
                        {currentQuestion.explanation}
                    </div>
                )}

                <div className="flex items-center justify-between pb-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                        {currentQuestion.source ? `Nguồn: ${currentQuestion.source}` : ''}
                    </div>
                    {!isAnswerSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                            className={`px-7 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md ${
                                selectedOption !== null 
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:-translate-y-0.5 shadow-indigo-500/25 active:scale-[0.98] cursor-pointer' 
                                    : 'bg-slate-200/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                            }`}
                        >
                            Trả lời
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer"
                        >
                            {currentQuestionIndex < quiz.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'} <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
