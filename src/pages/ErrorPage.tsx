import { useRouteError, useNavigate } from "react-router";
import { Home, ArrowLeft, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";

export default function ErrorPage() {
    const error = useRouteError() as any;
    const navigate = useNavigate();
    const [showDetails, setShowDetails] = useState(false);

    // Get error status and message
    const status = error?.status || 500;
    const statusText = error?.statusText || "Internal Server Error";
    const errorMessage = error?.message || error?.data || "Đã xảy ra sự cố không mong muốn trong hệ thống.";

    // Check if error is related to WebGL
    const isWebGLRelated = 
        errorMessage.toString().toLowerCase().includes("webgl") || 
        errorMessage.toString().toLowerCase().includes("context lost") ||
        errorMessage.toString().toLowerCase().includes("hardware acceleration") ||
        (error?.stack && (
            error.stack.toString().toLowerCase().includes("webgl") ||
            error.stack.toString().toLowerCase().includes("contextlost") ||
            (error.stack.toString().toLowerCase().includes("three") && 
             (error.stack.toString().toLowerCase().includes("renderer") || 
              error.stack.toString().toLowerCase().includes("canvas")))
        ));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 text-white">
            <div className="max-w-xl w-full text-center bg-slate-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Decorative glow background */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Error Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 text-red-400 shadow-lg shadow-red-500/5">
                    <AlertCircle className="w-8 h-8 animate-pulse" />
                </div>

                <div className="text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-2">
                    Lỗi ứng dụng • Code {status}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight">
                    {isWebGLRelated ? "Sự cố hiển thị 3D (WebGL)" : "Đã xảy ra sự cố"}
                </h1>

                <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
                    {isWebGLRelated ? (
                        "Trình duyệt hoặc phần cứng của bạn không thể render đồ họa 3D. Vui lòng bật Tăng tốc phần cứng (Hardware Acceleration) trong cài đặt trình duyệt và thử lại."
                    ) : (
                        "Ứng dụng gặp lỗi không thể tự phục hồi. Chúng tôi đã ghi nhận sự cố này để khắc phục sớm nhất."
                    )}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mb-8">
                    <Button onClick={() => navigate(-1)} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 active:bg-white/10 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    
                    <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 active:bg-indigo-500/20"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tải lại trang
                    </Button>

                    <Button onClick={() => navigate("/")} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20">
                        <Home className="w-4 h-4 mr-2" />
                        Về trang chủ
                    </Button>
                </div>

                {/* Error Details Accordion */}
                <div className="border-t border-white/5 pt-6 text-left">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <span>CHI TIẾT LỖI KỸ THUẬT</span>
                        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showDetails && (
                        <div className="mt-4 bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-400 overflow-x-auto max-h-48 scrollbar-thin select-all">
                            <div className="font-bold text-red-400 mb-1">
                                {statusText}
                            </div>
                            <div className="mb-2 text-white">
                                {errorMessage}
                            </div>
                            {error?.stack && (
                                <pre className="whitespace-pre text-slate-500 text-[10px]">
                                    {error.stack}
                                </pre>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
