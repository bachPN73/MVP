import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
    className?: string;
    variant?: 'ghost' | 'glass' | 'sidebar';
}

export default function ThemeToggle({ className = "", variant = 'ghost' }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();

    const baseStyles = "relative flex items-center justify-center rounded-xl transition-all duration-300 active:scale-90 overflow-hidden cursor-pointer";
    
    const variants = {
        ghost: "p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 border border-transparent",
        glass: "p-2.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white shadow-sm hover:bg-white/60 dark:hover:bg-slate-900/60 hover:shadow-md",
        sidebar: "w-full flex items-center justify-start gap-3.5 px-3.5 py-3 rounded-2xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
    };

    if (variant === 'sidebar') {
        return (
            <button
                onClick={toggleTheme}
                className={`${variants.sidebar} ${className}`}
                title={theme === 'light' ? "Chuyển sang giao diện Tối" : "Chuyển sang giao diện Sáng"}
            >
                <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                    <Sun className={`w-5 h-5 absolute transition-all duration-500 transform ${theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'}`} />
                    <Moon className={`w-5 h-5 absolute transition-all duration-500 transform ${theme === 'light' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`} />
                </div>
                <span className="text-[13px] font-semibold tracking-wide">
                    {theme === 'light' ? 'Giao diện Tối' : 'Giao diện Sáng'}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            title={theme === 'light' ? "Chuyển sang giao diện Tối" : "Chuyển sang giao diện Sáng"}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <Sun className={`w-5 h-5 transition-all duration-500 transform ${theme === 'dark' ? 'scale-100 rotate-0 opacity-100 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'scale-0 rotate-90 opacity-0'}`} />
                <Moon className={`w-5 h-5 transition-all duration-500 transform ${theme === 'light' ? 'scale-100 rotate-0 opacity-100 text-indigo-600' : 'scale-0 -rotate-90 opacity-0'}`} />
            </div>
        </button>
    );
}
