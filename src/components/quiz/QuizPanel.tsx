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

    const baseClasses = theme === 'light'
        ? "bg-white border-stone-200 text-slate-800"
        : "bg-slate-900 border-white/10 text-white";

    const getOptionClasses = (index: number) => {
        let classes = `w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group `;
        
        if (!isAnswerSubmitted) {
            if (selectedOption === index) {
                classes += theme === 'light' 
                    ? "border-indigo-500 bg-indigo-50" 
                    : "border-indigo-500 bg-indigo-500/20";
            } else {
                classes += theme === 'light'
                    ? "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    : "border-white/10 hover:border-indigo-400 hover:bg-white/5";
            }
        } else {
            if (index === currentQuestion.correctAnswerIndex) {
                classes += theme === 'light'
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-emerald-500 bg-emerald-500/20";
            } else if (selectedOption === index) {
                classes += theme === 'light'
                    ? "border-rose-500 bg-rose-50"
                    : "border-rose-500 bg-rose-500/20";
            } else {
                classes += theme === 'light'
                    ? "border-slate-200 opacity-50"
                    : "border-white/10 opacity-50";
            }
        }
        return classes;
    };

    if (quizCompleted) {
        return (
            <div className={`w-full h-full p-8 flex flex-col items-center justify-center rounded-2xl shadow-inner ${baseClasses}`}>
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-6 shadow-lg">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black mb-2 font-heading">Hoàn thành!</h3>
                <p className={`text-lg font-medium mb-8 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    Bạn đã trả lời đúng {score} / {quiz.length} câu hỏi.
                </p>
                <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-md"
                >
                    <RefreshCcw className="w-5 h-5" /> Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={`w-full h-full p-6 md:p-8 flex flex-col rounded-2xl shadow-inner overflow-y-auto custom-scrollbar ${baseClasses}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold text-sm uppercase tracking-widest text-indigo-500">Trắc nghiệm</span>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-300'}`}>
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
                            className={`px-8 py-3 rounded-xl font-bold shadow-md transition-all ${
                                selectedOption !== null 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5' 
                                    : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Trả lời
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all"
                        >
                            {currentQuestionIndex < quiz.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'} <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
