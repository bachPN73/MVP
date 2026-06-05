import { useParams, useNavigate } from 'react-router';
import { materials as mockMaterials, Material } from '../data/materialsData';
import { X, Maximize2, Minimize2, RotateCcw, BookOpen, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api';
import ModelViewer from '../components/ModelViewer';

export default function PresentationMode() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState<Material | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const fetchMaterial = async () => {
            if (!id) { setIsLoading(false); return; }

            if (id.startsWith('db-')) {
                // Fetch from database API
                const dbId = id.replace('db-', '');
                try {
                    const data = await api.getModel(dbId);
                    if (data && !data.error) {
                        setMaterial({
                            id, title: data.title, subject: data.subject,
                            type: '3d-model', description: data.description,
                            thumbnail: '3d-placeholder', tags: data.tags || [],
                            grade: data.grade || 10, file_url: data.file_url,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching model for presentation:", error);
                }
            } else {
                // Find from mock data
                const found = mockMaterials.find(m => m.id === id);
                if (found) setMaterial(found);
            }
            setIsLoading(false);
        };
        fetchMaterial();
    }, [id]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#070913] text-white">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold font-sans">Đang chuẩn bị học liệu trình chiếu...</p>
            </div>
        );
    }

    if (!material) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#070913] text-white p-6">
                <div className="text-center max-w-sm bg-slate-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl">
                    <div className="w-16 h-16 bg-rose-950/40 border border-rose-900/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold font-heading mb-2 text-slate-100">Không tìm thấy học liệu</h1>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">Học liệu bạn yêu cầu không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
                    <button
                        onClick={() => navigate('/library')}
                        className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer font-sans"
                    >
                        Quay lại thư viện
                    </button>
                </div>
            </div>
        );
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const getFullModelUrl = (url: string | undefined) => {
        if (!url) return "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb";
        if (url.startsWith('/models/')) {
            return `http://127.0.0.1:3005${url}`;
        }
        return url;
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleClose = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
            {/* Top control bar */}
            <div className="bg-[#0a0c16]/75 backdrop-blur-xl border-b border-white/5 px-6 py-4.5 z-20 relative shadow-2xl transition-all">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 max-w-[65%]">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold text-[10px] uppercase rounded-md tracking-wider font-sans">
                                {material.subject === 'physics' ? 'Vật lý' : material.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'} - Lớp {material.grade}
                            </span>
                            <h1 className="text-base md:text-lg font-extrabold font-heading text-white truncate tracking-tight">{material.title}</h1>
                        </div>
                        <p className="text-xs text-slate-400 font-sans truncate font-medium">{material.description}</p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        {material.type === '3d-model' && (
                            <button
                                onClick={handleRotate}
                                className="p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm cursor-pointer"
                                title="Xoay mô hình 90°"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={toggleFullscreen}
                            className="p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm cursor-pointer"
                            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            onClick={handleClose}
                             className="p-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:text-rose-400 rounded-xl transition-all shadow-sm cursor-pointer"
                            title="Thoát trình chiếu"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main presentation area */}
            <div className={`flex-1 relative w-full ${isFullscreen ? 'bg-black' : 'p-6 md:p-8'}`}>
                <div className={`absolute inset-0 ${isFullscreen ? '' : 'p-6 md:p-8'}`}>
                    <div
                        className={`w-full h-full mx-auto relative transition-all duration-300 ${isFullscreen ? 'max-w-none' : 'max-w-7xl'}`}
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        {material.type === '3d-model' ? (
                            <div className={`absolute inset-0 overflow-hidden bg-[#05070f] ${isFullscreen ? 'rounded-none border-none' : 'rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.05)] relative transition-all duration-500'}`}>
                                <div className="absolute top-5 left-5 z-10 pointer-events-none">
                                     <span className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/90 backdrop-blur-md border border-white/10 text-slate-300 text-[11px] font-black uppercase rounded-xl shadow-2xl font-mono tracking-wider">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                        Môi trường 3D tương tác
                                    </span>
                                </div>
                                <ModelViewer modelUrl={getFullModelUrl((material as any).file_url)} />
                            </div>
                        ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-950/20 to-slate-950/40 flex items-center justify-center p-8 overflow-hidden bg-[#0a0c16] ${isFullscreen ? 'rounded-none border-none' : 'rounded-2xl border border-white/10 shadow-2xl'}`}>
                                {material.file_url ? (
                                    <img
                                        src={getFullModelUrl(material.file_url)}
                                        alt={material.title}
                                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5"
                                    />
                                ) : (
                                    <div className="text-center max-w-2xl w-full p-8 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-xl animate-fadeIn">
                                        <BookOpen className="w-24 h-24 text-indigo-500/25 mx-auto mb-6" />
                                        <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight mb-4">{material.title}</h2>
                                         <p className="text-sm text-slate-400 leading-relaxed mb-8 font-semibold">
                                            {material.description}
                                        </p>

                                        <div className="flex flex-wrap justify-center gap-2">
                                            {material.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 font-sans tracking-wide"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom info bar */}
            <div className="bg-[#0b0c16]/90 backdrop-blur-md border-t border-white/5 px-6 py-4.5 z-20 relative">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-sans font-bold">
                    <div className="flex items-center gap-5.5">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Định dạng: <strong className="text-slate-200 ml-0.5">{material.type === '3d-model' ? 'Mô hình 3D' : 'Hình ảnh Infographic'}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Môn học: <strong className="text-slate-200 ml-0.5">{material.subject === 'physics' ? 'Vật lý' : material.subject === 'chemistry' ? 'Hóa học' : 'Sinh học'}</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-0.5 bg-slate-900 border border-white/10 text-white rounded text-[10px] shadow-sm font-sans tracking-wider">ESC</kbd>
                        <span className="text-[11px] text-slate-500">để thoát trình chiếu</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
