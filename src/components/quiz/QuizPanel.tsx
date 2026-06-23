import { useState } from 'react';
import { QuizQuestion } from '../../data/materialsData';
import { CheckCircle2, XCircle, HelpCircle, ChevronRight, RefreshCcw } from 'lucide-react';

interface QuizPanelProps {
    quiz: QuizQuestion[];
    theme: 'light' | 'dark';
}

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
        let classes = `w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group backdrop-blur-sm `;
        
        if (!isAnswerSubmitted) {
            if (selectedOption === index) {
                classes += theme === 'light' 
                    ? "border-indigo-500 bg-indigo-50/80 text-indigo-700 shadow-md scale-[1.02]" 
                    : "border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-md scale-[1.02]";
            } else {
                classes += theme === 'light'
                    ? "border-white/60 bg-white/50 hover:border-indigo-300 hover:bg-white/90 hover:shadow-md hover:scale-[1.01]"
                    : "border-white/10 bg-slate-900/40 hover:border-indigo-400/50 hover:bg-slate-800/60 hover:scale-[1.01]";
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
                    ? "border-slate-200 bg-white/40 opacity-50"
                    : "border-white/5 bg-slate-900/20 opacity-50";
            }
        }
        return classes;
    };

    if (quizCompleted) {
        return (
            <div className={`w-full h-full p-8 flex flex-col items-center justify-center rounded-2xl ${baseClasses}`}>
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-500/30 rotate-3 hover:rotate-6 transition-transform">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black mb-2 font-heading bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Hoàn thành!</h3>
                <p className={`text-lg font-medium mb-8 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    Bạn đã trả lời đúng <span className="text-indigo-600 dark:text-indigo-400 font-bold">{score}</span> / {quiz.length} câu hỏi.
                </p>
                <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-lg shadow-indigo-500/25"
                >
                    <RefreshCcw className="w-5 h-5" /> Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={`w-full h-full p-6 md:p-8 flex flex-col rounded-2xl overflow-y-auto custom-scrollbar ${baseClasses}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Trắc nghiệm</span>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm backdrop-blur-md ${theme === 'light' ? 'bg-white/80 border border-white/50 text-slate-600' : 'bg-slate-800/80 border border-white/10 text-slate-300'}`}>
                    Câu {currentQuestionIndex + 1} / {quiz.length}
                </div>
            </div>

            {/* Question */}
            <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed font-heading">
                {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-8">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        disabled={isAnswerSubmitted}
                        className={getOptionClasses(index)}
                    >
                        <span className="font-medium">{option}</span>
                        {isAnswerSubmitted && index === currentQuestion.correctAnswerIndex && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {isAnswerSubmitted && selectedOption === index && index !== currentQuestion.correctAnswerIndex && (
                            <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Explanation & Action */}
            <div className="mt-auto">
                {isAnswerSubmitted && currentQuestion.explanation && (
                    <div className={`p-4 rounded-xl mb-6 text-sm leading-relaxed border-l-4 ${
                        selectedOption === currentQuestion.correctAnswerIndex 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' 
                            : 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                    }`}>
                        <p className="font-bold mb-1">Giải thích:</p>
                        {currentQuestion.explanation}
                    </div>
                )}

                <div className="flex justify-end">
                    {!isAnswerSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 ${
                                selectedOption !== null 
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:-translate-y-1 shadow-indigo-500/25' 
                                    : 'bg-white/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                            }`}
                        >
                            Trả lời
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:-translate-y-1 transition-all duration-300"
                        >
                            {currentQuestionIndex < quiz.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'} <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
