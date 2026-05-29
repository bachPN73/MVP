import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
    size?: "sm" | "md" | "lg";
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    onClick,
    className = "",
    disabled = false,
    type = "button",
}: ButtonProps) {
    const baseStyles =
        "rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97]";

    const variantStyles = {
        primary:
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
        secondary:
            "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30",
        outline:
            "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
        ghost:
            "text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
        gradient:
            "bg-gradient-to-r from-violet-600 to-indigo-600 text-white focus:ring-violet-500 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:from-violet-700 hover:to-indigo-700",
    };

    const sizeStyles = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

    return (
        <button
            type={type}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
