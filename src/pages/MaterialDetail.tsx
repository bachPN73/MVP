import { Layout } from '../layout/MainLayout';
import { useParams, Link, useNavigate } from 'react-router';
import { materials as mockMaterials, getSubjectName, getTypeName, Material } from '../data/materialsData';
import { ArrowLeft, Maximize2, Minimize2, BookOpen, Tag, GraduationCap, Loader2, Play, ZoomIn, RotateCcw, Move, Compass, Sparkles } from 'lucide-react';
import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { api, BASE_URL } from '../api';
import { useTheme } from '../components/ThemeProvider';

const SUBJECT_CONFIGS: Record<string, {
    subjectName: string;
    subtitle: { label: string; placeholder: string };
    category: { label: string; placeholder: string };
    size: { label: string; placeholder: string };
    location: { label: string; placeholder: string };
    visibleInLM: { label: string; placeholder: string };
    featuresText: { label: string; placeholder: string };
    funFact: { label: string; placeholder: string };
}> = {
    biology: {
        subjectName: "sinh học",
        subtitle: { label: "Phụ đề mô hình (Subtitle)", placeholder: "Ví dụ: Tế bào nhân thực · Sinh vật tự dưỡng" },
        category: { label: "Phân nhóm (Category)", placeholder: "Ví dụ: Tế bào nhân thực" },
        size: { label: "Kích thước thực tế (Size)", placeholder: "Ví dụ: 10 – 100 micromét" },
        location: { label: "Vị trí phân bố (Location)", placeholder: "Ví dụ: Nhân tế bào, ty thể, lục lạp" },
        visibleInLM: { label: "Khả năng quan sát (Microscope)", placeholder: "Ví dụ: Chỉ có thể quan sát dưới kính hiển vi điện tử." },
        featuresText: { label: "Cấu trúc chính (Mỗi dòng 1 cấu trúc dạng 'Tên: Mô tả')", placeholder: "Ví dụ:\nVách tế bào: Cấu tạo từ cellulose giúp bảo vệ\nLục lạp: Nơi thực hiện quang hợp" },
        funFact: { label: "Sự thật thú vị (Fun Fact)", placeholder: "Ví dụ: Nếu kéo thẳng toàn bộ DNA trong một tế bào, nó sẽ dài khoảng 2 mét." }
    },
    chemistry: {
        subjectName: "hóa học",
        subtitle: { label: "Cấu trúc liên kết / Công thức", placeholder: "Ví dụ: H2O · Liên kết cộng hóa trị phân cực" },
        category: { label: "Phân loại hợp chất (Category)", placeholder: "Ví dụ: Oxit axit / Hợp chất vô cơ / Axit amin" },
        size: { label: "Thông số phân tử / Khối lượng (Size)", placeholder: "Ví dụ: 18.015 g/mol · Góc liên kết 104.5°" },
        location: { label: "Trạng thái tự nhiên & Phân bố", placeholder: "Ví dụ: Dạng lỏng, rắn, khí · Chiếm 70% bề mặt Trái Đất" },
        visibleInLM: { label: "Phương pháp nhận biết / Phản ứng đặc trưng", placeholder: "Ví dụ: Dùng đồng(II) sunfat khan (chuyển xanh) / Quỳ tím hóa đỏ" },
        featuresText: { label: "Liên kết & Thành phần (Mỗi dòng dạng 'Tên: Mô tả')", placeholder: "Ví dụ:\nNguyên tử Oxi: Độ âm điện lớn, mang phần điện tích âm\nLiên kết Hydro: Giúp nước có nhiệt độ sôi cao bất thường" },
        funFact: { label: "Hiện tượng thú vị / Ứng dụng thực tế", placeholder: "Ví dụ: Nước là chất duy nhất giãn nở khi đóng băng từ lỏng sang rắn!" }
    },
    physics: {
        subjectName: "vật lý",
        subtitle: { label: "Định luật & Lĩnh vực", placeholder: "Ví dụ: Vật lý thiên văn · Định luật vạn vật hấp dẫn" },
        category: { label: "Phân loại đại lượng / Phân môn", placeholder: "Ví dụ: Cơ học cổ điển / Cơ học lượng tử / Vũ trụ học" },
        size: { label: "Thông số kỹ thuật / Đại lượng vật lý", placeholder: "Ví dụ: Bán kính: 6,371 km · Khối lượng: 5.97e24 kg" },
        location: { label: "Phạm vi áp dụng / Môi trường hoạt động", placeholder: "Ví dụ: Quy mô vĩ mô · Toàn vũ trụ / Điều kiện tiêu chuẩn" },
        visibleInLM: { label: "Thiết bị đo lường / Công thức cốt lõi", placeholder: "Ví dụ: F = G * (m1 * m2) / r^2" },
        featuresText: { label: "Các thông số cấu thành (Mỗi dòng dạng 'Tên: Mô tả')", placeholder: "Ví dụ:\nLực hấp dẫn: Lực hút giữa mọi vật có khối lượng\nQuỹ đạo: Đường đi cong của một thiên thể quanh thiên thể khác" },
        funFact: { label: "Hiện tượng thực tế / Sự thật kỳ thú", placeholder: "Ví dụ: Trọng lực ở Mặt Trăng chỉ bằng khoảng 1/6 so với trên Trái Đất!" }
    }
};

const cleanLabel = (label: string) => label.split(' (')[0];

const ModelViewer = lazy(() => import('../components/ModelViewer'));

export default function MaterialDetail() {
    const { id } = useParams();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [material, setMaterial] = useState<Material | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewerActive, setViewerActive] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'structure' | 'related'>('info');
    const containerRef = useRef<HTMLDivElement>(null);

    // Infographic Crisp Zoom State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchMaterial = async () => {
            if (!id) return;

            const normalizeStr = (str: any) => typeof str === 'string' ? str.normalize('NFC') : (str || '');

            if (id.startsWith('db-')) {
                const dbId = id.replace('db-', '');
                try {
                    const data = await api.getModel(dbId);
                    if (data && !data.error) {
                        setMaterial({
                            id: id,
                            title: normalizeStr(data.title),
                            subject: data.subject,
                            type: data.type || '3d-model',
                            description: normalizeStr(data.description),
                            thumbnail: data.thumbnail 
                                ? (data.thumbnail.startsWith('http') ? data.thumbnail : `${BASE_URL}${data.thumbnail}`)
                                : '3d-placeholder',
                            tags: Array.isArray(data.tags) ? data.tags.map(t => normalizeStr(t)) : [],
                            grade: data.grade || 10,
                            file_url: data.file_url 
                                ? (data.file_url.startsWith('http') ? data.file_url : `${BASE_URL}${data.file_url}`)
                                : '',
                            subtitle: normalizeStr(data.subtitle),
                            category: normalizeStr(data.category),
                            size: normalizeStr(data.size),
                            location: normalizeStr(data.location),
                            visibleInLM: normalizeStr(data.visibleInLM),
                            features: Array.isArray(data.features) 
                                ? data.features.map((f: any) => ({
                                    name: normalizeStr(f.name),
                                    detail: normalizeStr(f.detail)
                                  }))
                                : [],
                            funFact: normalizeStr(data.funFact),
                            whereItOccurs: data.whereItOccurs 
                                ? {
                                    text: normalizeStr(data.whereItOccurs.text),
                                    habitat: normalizeStr(data.whereItOccurs.habitat)
                                  } 
                                : undefined
                        } as any);
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy chi tiết học liệu:", error);
                }
            } else {
                const found = mockMaterials.find(m => m.id === id);
                if (found) {
                    setMaterial({
                        ...found,
                        title: normalizeStr(found.title),
                        description: normalizeStr(found.description),
                        subtitle: normalizeStr(found.subtitle),
                        category: normalizeStr(found.category),
                        size: normalizeStr(found.size),
                        location: normalizeStr(found.location),
                        visibleInLM: normalizeStr(found.visibleInLM),
                        tags: Array.isArray(found.tags) ? found.tags.map(t => normalizeStr(t)) : [],
                        features: Array.isArray(found.features)
                            ? found.features.map((f: any) => ({
                                name: normalizeStr(f.name),
                                detail: normalizeStr(f.detail)
                              }))
                            : [],
                        funFact: normalizeStr(found.funFact),
                        whereItOccurs: found.whereItOccurs 
                            ? {
                                text: normalizeStr(found.whereItOccurs.text),
                                habitat: normalizeStr(found.whereItOccurs.habitat)
                              } 
                            : undefined
                    } as any);
                }
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

    // Reset zoom when model or scale changes
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Crisp Zoom Mouse Events
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const zoomFactor = 0.1;
        const newScale = e.deltaY < 0 
            ? Math.min(5, scale + zoomFactor) 
            : Math.max(0.5, scale - zoomFactor);
        
        if (newScale === 1) {
            setPosition({ x: 0, y: 0 });
        }
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (scale <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || scale <= 1) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium">Đang tải thông tin học liệu...</p>
                </div>
            </Layout>
        );
    }

    if (!material) {
        return (
            <Layout>
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy học liệu</h1>
                    <Link to="/library" className="text-primary hover:underline">
                        Quay lại thư viện
                    </Link>
                </div>
            </Layout>
        );
    }

    const getFullModelUrl = (url: string | undefined) => {
        if (!url) return "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb";
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) {
            // Built-in mock materials are stored in the frontend's public folder
            if (id && !id.startsWith('db-')) {
                return url;
            }
            return `${BASE_URL}${url}`;
        }
        return url;
    };

    const relatedMaterials = mockMaterials
        .filter(m => m.id !== material.id && m.subject === material.subject)
        .slice(0, 3);
    const fileUrl = (material as any).file_url || "";
    const ext = fileUrl.split('.').pop()?.toLowerCase() || '';
    const is3D = ['glb', 'gltf', 'fbx'].includes(ext);
    const thumbnailUrl = material.thumbnail && material.thumbnail !== '3d-placeholder'
        ? material.thumbnail
        : '3d-placeholder';
    const isPDF = ext === 'pdf';
    const config = SUBJECT_CONFIGS[material.subject as keyof typeof SUBJECT_CONFIGS] || SUBJECT_CONFIGS.physics;

    return (
        <Layout>
            <div className={`transition-colors duration-500 w-full h-auto lg:h-screen lg:overflow-hidden flex flex-col ${
                material.subtitle 
                    ? (theme === 'light' ? 'bg-[#f4ebe1]/60 text-stone-900' : 'bg-slate-950 text-slate-100') 
                    : 'bg-background text-foreground'
            }`}>
                {/* Fixed Top Header Bar */}
                <div className={`h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 md:px-8 border-b transition-colors duration-500 z-20 ${
                    material.subtitle 
                        ? (theme === 'light' ? 'border-stone-200/40 bg-white/60' : 'border-white/10 bg-slate-900/60') 
                        : 'border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/60'
                } backdrop-blur-md`}>
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Quay lại</span>
                        </button>
                        <div className="h-4 w-px bg-stone-300 dark:bg-slate-800 hidden sm:block" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                material.subtitle 
                                    ? (theme === 'light' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400') 
                                    : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                            }`}>
                                {getSubjectName(material.subject)}
                            </span>
                            <span className={`text-xs font-semibold ${
                                material.subtitle ? 'text-stone-500' : 'text-slate-400'
                            } hidden md:inline`}>
                                &gt;
                            </span>
                            <span className={`text-sm font-bold truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] font-heading ${
                                material.subtitle ? 'text-stone-800 dark:text-stone-100 font-serif' : 'text-slate-900 dark:text-white'
                            }`}>
                                {material.title}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                            material.subtitle 
                                ? (theme === 'light' ? 'bg-stone-200/60 text-stone-600' : 'bg-slate-800 text-slate-300') 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        } flex items-center gap-1`}>
                            <GraduationCap className="w-3.5 h-3.5" />
                            Lớp {material.grade}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md hidden sm:inline-block ${
                            material.subtitle 
                                ? (theme === 'light' ? 'bg-sky-500/10 text-sky-700' : 'bg-sky-500/20 text-sky-400') 
                                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                            {getTypeName(material.type)}
                        </span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-4 sm:p-6 gap-6">
                    {/* Left Pane: Trình xem mô hình (Model Viewer) */}
                    <div className="flex-1 min-h-[380px] lg:min-h-0 lg:h-full flex flex-col relative bg-transparent rounded-2xl overflow-hidden">
                        <div className={`flex-1 min-h-0 border rounded-2xl overflow-hidden shadow-lg relative flex flex-col ${
                            material.subtitle 
                                ? (theme === 'light' ? 'bg-transparent border-stone-200/40 shadow-inner' : 'bg-slate-950/40 border-white/10 shadow-inner') 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10'
                        }`}>
                            <div
                                id="viewer-wrapper"
                                ref={containerRef}
                                className={`flex-1 min-h-0 w-full h-full relative flex items-center justify-center group overflow-hidden transition-all duration-500 rounded-2xl ${
                                    material.subtitle
                                        ? (theme === 'light' ? "border border-stone-200/40 shadow-inner shadow-amber-950/5" : "border border-white/5 shadow-inner")
                                        : "bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950"
                                }`}
                                style={
                                    material.subtitle && theme === 'light'
                                        ? {
                                              background: `radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, ${
                                                  material.id === 'dna' ? '#9cc4e4' :
                                                  material.id === 'plant-cell' ? '#7fb069' :
                                                  material.id === 'animal-cell' ? '#e8859a' :
                                                  material.id === 'white-blood-cell' ? '#c8a2d8' : '#f0a868'
                                              } 14%, #fbf7ec) 0%, #f3ead7 55%, #e8ddc4 100%)`,
                                          }
                                        : material.subtitle && theme === 'dark'
                                        ? {
                                              background: `radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, ${
                                                  material.id === 'dna' ? '#1e293b' :
                                                  material.id === 'plant-cell' ? '#064e3b' :
                                                  material.id === 'animal-cell' ? '#4c0519' :
                                                  material.id === 'white-blood-cell' ? '#3b0764' : '#451a03'
                                              } 40%, #030712) 0%, #030712 60%, #0f172a 100%)`,
                                          }
                                        : {}
                                }
                            >
                                {/* Floating Title for Premium Models */}
                                {viewerActive && material.subtitle && (
                                    <div className="absolute top-6 left-8 z-10 pointer-events-none select-none">
                                        <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] mb-1 ${theme === 'light' ? 'text-stone-500/70' : 'text-stone-400/70'}`}>
                                            PHẦN NÀY TẬP TRUNG VÀO
                                        </div>
                                        <h2 className={`text-3xl sm:text-4xl font-bold font-serif tracking-wide drop-shadow-sm ${theme === 'light' ? 'text-stone-900' : 'text-white'}`}>
                                            {material.title}
                                        </h2>
                                        <p className={`text-sm sm:text-lg font-serif italic mt-1 tracking-wide drop-shadow-sm ${theme === 'light' ? 'text-emerald-800/80' : 'text-emerald-400/80'}`}>
                                            {material.subtitle}
                                        </p>
                                    </div>
                                )}

                                {!viewerActive ? (
                                    /* ======================== CLICK-TO-LOAD PLACEHOLDER ======================== */
                                    <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
                                        onClick={() => setViewerActive(true)}
                                    >
                                        {/* Show thumbnail as blurred background */}
                                        {thumbnailUrl && (
                                            <img
                                                src={thumbnailUrl}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-60"
                                            />
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-slate-900/10"></div>

                                        {/* Play / View button */}
                                        <div className="relative z-10 flex flex-col items-center gap-4">
                                            <div className={`
                                                w-20 h-20 rounded-full flex items-center justify-center
                                                bg-white/20 backdrop-blur-md border-2 border-white/40
                                                shadow-2xl shadow-black/20
                                                hover:bg-white/30 hover:scale-110 transition-all duration-300
                                            `}>
                                                {is3D ? (
                                                    <Play className="w-8 h-8 text-white ml-1" />
                                                ) : (
                                                    <ZoomIn className="w-8 h-8 text-white" />
                                                )}
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="text-white font-bold text-lg drop-shadow-lg">
                                                    {is3D ? 'Nhấn để tải mô hình 3D' : isPDF ? 'Nhấn để xem tài liệu' : 'Nhấn để xem Infographic'}
                                                </p>
                                                <p className="text-white/70 text-sm font-medium mt-1">
                                                    {is3D ? 'Xoay, zoom và tương tác mô hình' : 'Phóng to, di chuyển để xem chi tiết'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Type indicator */}
                                        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg">
                                            <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
                                                {is3D ? '🧊 Mô hình 3D' : isPDF ? '📄 PDF' : '🖼️ Infographic'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    /* ======================== ACTIVE VIEWER ======================== */
                                    <>
                                        {is3D ? (
                                            <div id="3d-viewer-container" className={`absolute inset-0 z-10 ${material.subtitle ? 'bg-transparent' : 'bg-black'}`}>
                                                <Suspense fallback={
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 border border-slate-800/80 z-10">
                                                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                                        <p className="text-slate-300 font-medium tracking-wide">Khởi tạo Engine 3D...</p>
                                                    </div>
                                                }>
                                                    <ModelViewer modelUrl={getFullModelUrl(fileUrl)} />
                                                </Suspense>
                                                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm z-50 shadow-md pointer-events-none">
                                                    <p className="text-slate-800 dark:text-slate-200 font-medium">Kéo chuột trái để xoay • Cuộn để zoom</p>
                                                </div>
                                            </div>
                                        ) : isPDF ? (
                                            <div className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden">
                                                <iframe
                                                    src={getFullModelUrl(fileUrl)}
                                                    className="w-full h-full border-none"
                                                    title={material.title}
                                                />
                                            </div>
                                        ) : (
                                            /* ============ INFOGRAPHIC VIEWER with CRISP ZOOM ============ */
                                            <div
                                                className="absolute inset-0 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden"
                                                onWheel={handleWheel}
                                                onMouseDown={handleMouseDown}
                                                onMouseMove={handleMouseMove}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
                                            >
                                                <img
                                                    src={getFullModelUrl(fileUrl || material.thumbnail)}
                                                    alt={material.title}
                                                    draggable={false}
                                                    style={{
                                                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                                        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                                                        imageRendering: scale > 1 ? '-webkit-optimize-contrast' : 'auto',
                                                        willChange: 'transform',
                                                    }}
                                                    className="max-w-full max-h-full object-contain select-none"
                                                />

                                                {/* Zoom Controls */}
                                                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-50">
                                                    <button
                                                        onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
                                                        className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all hover:scale-110 cursor-pointer"
                                                        title="Thu nhỏ"
                                                    >
                                                        −
                                                    </button>
                                                    <button
                                                        onClick={resetZoom}
                                                        className="px-3 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all hover:scale-105"
                                                    >
                                                        {Math.round(scale * 100)}%
                                                    </button>
                                                    <button
                                                        onClick={() => setScale(prev => Math.min(5, prev + 0.25))}
                                                        className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all hover:scale-110 cursor-pointer"
                                                        title="Phóng to"
                                                    >
                                                        +
                                                    </button>
                                                    {scale > 1 && (
                                                        <button
                                                            onClick={resetZoom}
                                                            className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all hover:scale-110 cursor-pointer"
                                                            title="Đặt lại"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Pan hint */}
                                                {scale > 1 && (
                                                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white/70 text-xs font-medium pointer-events-none z-50">
                                                        <Move className="w-3.5 h-3.5" />
                                                        <span>Kéo để di chuyển</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Fullscreen button (visible when viewer is active) */}
                                {viewerActive && (
                                    <button
                                        onClick={() => {
                                            const viewerElement = document.getElementById('viewer-wrapper');
                                            if (!document.fullscreenElement) {
                                                if (viewerElement && viewerElement.requestFullscreen) {
                                                    viewerElement.requestFullscreen();
                                                }
                                            } else {
                                                if (document.exitFullscreen) {
                                                    document.exitFullscreen();
                                                }
                                            }
                                        }}
                                        className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-lg cursor-pointer text-slate-800 dark:text-white"
                                        title={isFullscreen ? "Thu nhỏ" : "Mở toàn màn hình"}
                                    >
                                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        <span className="text-sm font-medium">{isFullscreen ? "Quay về" : "Chế độ trình chiếu"}</span>
                                    </button>
                                )}
                            </div>

                            {/* Minimal bottom layout status to reduce clutter */}
                            {material.subtitle ? (
                                <div className={`px-6 py-4 border-t flex items-center justify-between rounded-b-2xl ${
                                    theme === 'light' ? 'border-stone-200/40 bg-white/40' : 'border-white/5 bg-slate-900/40'
                                }`}>
                                    <span className={`text-xs font-medium ${theme === 'light' ? 'text-stone-400' : 'text-slate-500'}`}>
                                        Mã học liệu: {material.id}
                                    </span>
                                    <span className={`text-xs font-medium uppercase tracking-wider ${theme === 'light' ? 'text-stone-400' : 'text-slate-500'}`}>
                                        Mô hình sinh học cao cấp
                                    </span>
                                </div>
                            ) : (
                                <div className="px-6 py-3 border-t border-slate-200 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm flex items-center justify-between rounded-b-2xl">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        Mã học liệu: {material.id}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                                        Học liệu tương tác Edu Tech
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Sidebar thông tin chi tiết */}
                    <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 lg:h-full flex flex-col min-h-0">
                        <div className={`flex-1 flex flex-col min-h-0 rounded-[2rem] border shadow-xl p-5 sm:p-6 transition-all duration-500 ${
                            material.subtitle 
                                ? (theme === 'light' ? 'bg-white/85 border-stone-200/40 shadow-stone-100/30 text-stone-900' : 'bg-slate-900/85 dark:border-white/10 shadow-black/20 text-white') 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-md text-slate-900 dark:text-white'
                        } backdrop-blur-md`}>
                            {/* Sidebar Header: Tiêu đề & Thông số nhanh */}
                            <div className="mb-4 flex-shrink-0">
                                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                        material.subtitle 
                                            ? (theme === 'light' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-emerald-500/25 text-emerald-400') 
                                            : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                                    }`}>
                                        {getSubjectName(material.subject)}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                        material.subtitle 
                                            ? (theme === 'light' ? 'bg-sky-500/10 text-sky-700' : 'bg-sky-500/25 text-sky-400') 
                                            : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                    }`}>
                                        {getTypeName(material.type)}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-0.5">
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        Lớp {material.grade}
                                    </span>
                                </div>
                                
                                <h2 className={`text-xl sm:text-2xl font-black leading-tight tracking-tight font-heading text-slate-900 dark:text-white ${
                                    material.subtitle ? 'font-serif text-stone-800 dark:text-stone-100' : ''
                                }`}>
                                    {material.title}
                                </h2>
                                {material.subtitle && (
                                    <p className={`font-serif italic text-xs sm:text-sm mt-1 leading-relaxed ${
                                        theme === 'light' ? 'text-emerald-800/85' : 'text-emerald-400/85'
                                    }`}>
                                        {material.subtitle}
                                    </p>
                                )}
                            </div>

                            {/* Tab Selection Bar */}
                            <div className={`flex border p-1 rounded-2xl mb-4 flex-shrink-0 bg-slate-50 dark:bg-slate-950/60 ${
                                material.subtitle 
                                    ? (theme === 'light' ? 'border-stone-200/50' : 'border-white/10') 
                                    : 'border-slate-200 dark:border-white/10'
                            }`}>
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        activeTab === 'info'
                                            ? (material.subtitle 
                                                ? (theme === 'light' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/10' : 'bg-slate-800 text-white shadow-sm border border-white/5')
                                                : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700')
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Giới thiệu</span>
                                </button>
                                
                                {(material.features?.length > 0 || material.whereItOccurs) && (
                                    <button
                                        onClick={() => setActiveTab('structure')}
                                        className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            activeTab === 'structure'
                                                ? (material.subtitle 
                                                    ? (theme === 'light' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/10' : 'bg-slate-800 text-white shadow-sm border border-white/5')
                                                    : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700')
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <Compass className="w-3.5 h-3.5" />
                                        <span>{material.subtitle ? cleanLabel(config.featuresText.label) : 'Cấu trúc'}</span>
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => setActiveTab('related')}
                                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        activeTab === 'related'
                                            ? (material.subtitle 
                                                ? (theme === 'light' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/10' : 'bg-slate-800 text-white shadow-sm border border-white/5')
                                                : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700')
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Học liệu</span>
                                </button>
                            </div>

                            {/* Tab Content: Scrollable Area */}
                            <div className="flex-1 overflow-y-auto pr-1 min-h-0 scrollbar-thin space-y-4">
                                {activeTab === 'info' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        {/* Concept Card */}
                                        <div className={`p-4 sm:p-5 rounded-2xl border ${
                                            material.subtitle 
                                                ? (theme === 'light' ? 'bg-stone-50/50 border-stone-200/30' : 'bg-slate-950/40 border-white/5') 
                                                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-white/5'
                                        }`}>
                                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2">
                                                Khái niệm khoa học
                                            </h3>
                                            <p className={`text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-normal ${
                                                material.subtitle ? 'font-sans font-light' : ''
                                            }`}>
                                                {material.description}
                                            </p>
                                        </div>

                                        {/* Quick Stats Grid for Premium Models */}
                                        {material.subtitle && (
                                            <div className={`grid grid-cols-2 gap-3 p-4 sm:p-5 rounded-2xl border ${
                                                theme === 'light' ? 'bg-stone-50/50 border-stone-200/30' : 'bg-slate-950/40 border-white/5'
                                            }`}>
                                                <div>
                                                    <div className="text-stone-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                                                        {cleanLabel(config.category.label)}
                                                    </div>
                                                    <div className="text-stone-800 dark:text-slate-200 text-xs font-semibold">
                                                        {material.category || 'Mô hình 3D'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-stone-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                                                        {cleanLabel(config.size.label)}
                                                    </div>
                                                    <div className="text-stone-800 dark:text-slate-200 text-xs font-semibold">
                                                        {material.size || 'N/A'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-stone-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                                                        {cleanLabel(config.location.label)}
                                                    </div>
                                                    <div className="text-stone-800 dark:text-slate-200 text-xs font-semibold">
                                                        {material.location || 'N/A'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-stone-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5 leading-snug">
                                                        {cleanLabel(config.visibleInLM.label)}
                                                    </div>
                                                    <div className="text-stone-800 dark:text-slate-200 text-xs font-semibold">
                                                        {material.id === 'dna' ? (
                                                            <span className="text-[#b53b3b] dark:text-[#f472b6] font-bold">Điện tử</span>
                                                        ) : (
                                                            <span>{material.visibleInLM || 'Có thể'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tags for Normal Models */}
                                        {!material.subtitle && material.tags && material.tags.length > 0 && (
                                            <div className="p-4 sm:p-5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-white/5">
                                                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">
                                                    Từ khóa liên quan
                                                </h3>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {material.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs border border-slate-100 dark:border-white/5 shadow-sm"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Fun Fact (Premium Only) */}
                                        {material.funFact && (
                                            <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm bg-gradient-to-b ${
                                                theme === 'light'
                                                    ? 'bg-amber-50/30 border-amber-200/25 from-amber-50/20 to-white/40 text-amber-900/85'
                                                    : 'bg-amber-950/15 border-amber-900/35 from-amber-950/5 to-slate-900/10 text-amber-200/85'
                                            }`}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <span className="text-sm">💡</span>
                                                    <div className={`text-[9px] font-bold uppercase tracking-[0.15em] ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>
                                                        {cleanLabel(config.funFact.label)}
                                                    </div>
                                                </div>
                                                <p className="text-xs font-serif italic leading-relaxed">
                                                    "{material.funFact}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'structure' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        {/* Main Features */}
                                        {material.features && material.features.length > 0 && (
                                            <div className={`p-4 sm:p-5 rounded-2xl border ${
                                                material.subtitle 
                                                    ? (theme === 'light' ? 'bg-stone-50/50 border-stone-200/30' : 'bg-slate-950/40 border-white/5') 
                                                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-white/5'
                                            }`}>
                                                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4">
                                                    {material.subtitle ? cleanLabel(config.featuresText.label) : 'Cấu trúc chính'}
                                                </h3>
                                                <ul className="flex flex-col gap-4">
                                                    {material.features.map((feature, idx) => (
                                                        <li key={idx} className="flex gap-2.5 items-start">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 border border-sky-300 shadow-sm flex-shrink-0 mt-1.5" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`text-slate-900 dark:text-white font-bold text-xs ${material.subtitle ? 'font-serif' : ''}`}>
                                                                    {feature.name}
                                                                </div>
                                                                <div className={`text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed font-normal ${material.subtitle ? 'font-sans' : ''}`}>
                                                                    {feature.detail}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Where It Occurs (Premium Only) */}
                                        {material.whereItOccurs && (
                                            <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm bg-gradient-to-b ${
                                                theme === 'light'
                                                    ? 'bg-emerald-50/30 border-emerald-200/25 from-emerald-50/20 to-white/40 text-emerald-950'
                                                    : 'bg-emerald-950/10 border-emerald-900/30 from-emerald-950/5 to-slate-900/10 text-emerald-200'
                                            }`}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <span className="text-sm">🌍</span>
                                                    <div className={`text-[9px] font-bold uppercase tracking-[0.15em] ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                                        Phân bố & nguồn gốc
                                                    </div>
                                                </div>
                                                <p className="leading-relaxed mb-3 text-xs font-normal">
                                                    {material.whereItOccurs.text}
                                                </p>
                                                <div className={`flex flex-wrap gap-1 pt-2 border-t ${theme === 'light' ? 'border-emerald-100/30' : 'border-emerald-900/25'}`}>
                                                    {material.whereItOccurs.habitat.split('·').map((hab, idx) => (
                                                        <span 
                                                            key={idx} 
                                                            className={`px-2 py-0.5 text-[9px] font-bold rounded-md border shadow-sm uppercase tracking-wider ${
                                                                theme === 'light'
                                                                    ? 'bg-white border-emerald-200/40 text-emerald-800'
                                                                    : 'bg-slate-900 border-white/5 text-emerald-400'
                                                            }`}
                                                        >
                                                            {hab.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'related' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        {/* Related Materials Card */}
                                        <div className={`p-4 sm:p-5 rounded-2xl border ${
                                            material.subtitle 
                                                ? (theme === 'light' ? 'bg-stone-50/50 border-stone-200/30' : 'bg-slate-950/40 border-white/5') 
                                                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-white/5'
                                        }`}>
                                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3">
                                                Học liệu cùng chuyên mục
                                            </h3>
                                            {relatedMaterials.length > 0 ? (
                                                <div className="flex flex-col gap-2.5">
                                                    {relatedMaterials.map((relatedMaterial) => (
                                                        <Link
                                                            key={relatedMaterial.id}
                                                            to={`/material/${relatedMaterial.id}`}
                                                            className={`group block rounded-xl p-2.5 border transition-all duration-300 ${
                                                                material.subtitle
                                                                    ? (theme === 'light' ? 'bg-white border-stone-200/30 hover:border-stone-300 hover:shadow-sm' : 'bg-slate-950 border-white/5 hover:border-white/10 hover:shadow-sm')
                                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/40 dark:to-cyan-950/40 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors border border-slate-100 dark:border-white/5 shadow-sm">
                                                                    <BookOpen className="w-3.5 h-3.5 text-indigo-500/70 group-hover:text-indigo-600 transition-colors" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
                                                                        {relatedMaterial.title}
                                                                    </h4>
                                                                    <span className="inline-block text-[7.5px] font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded uppercase tracking-wider mt-0.5">
                                                                        {getTypeName(relatedMaterial.type)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-400 dark:text-slate-500 text-xs font-light text-center py-2">
                                                    Không có học liệu liên quan.
                                                </p>
                                            )}
                                            
                                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40 text-center">
                                                <Link
                                                    to={`/library?subject=${material.subject}`}
                                                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                                                >
                                                    Xem toàn bộ thư viện &rarr;
                                                </Link>
                                            </div>
                                        </div>

                                        {/* How to Interact Card */}
                                        <div className={`p-4 sm:p-5 rounded-2xl border ${
                                            material.subtitle 
                                                ? (theme === 'light' ? 'bg-stone-50/50 border-stone-200/30' : 'bg-slate-950/40 border-white/5') 
                                                : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-white/5'
                                        }`}>
                                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">
                                                Hướng dẫn tương tác
                                            </h3>
                                            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                {material.type === '3d-model' ? (
                                                    <>
                                                        <li className="flex gap-2"><span className="text-indigo-500">•</span> Nhấn để tải mô hình 3D</li>
                                                        <li className="flex gap-2"><span className="text-indigo-500">•</span> Kéo chuột trái để xoay mô hình</li>
                                                        <li className="flex gap-2"><span className="text-indigo-500">•</span> Cuộn chuột để phóng to/thu nhỏ</li>
                                                        <li className="flex gap-2"><span className="text-indigo-500">•</span> Kéo chuột phải để di chuyển góc nhìn</li>
                                                        <li className="flex gap-2"><span className="text-indigo-500">•</span> Nhấn "Trình chiếu" để xem toàn màn hình</li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li className="flex gap-2"><span className="text-indigo-500">•</span> Cuộn chuột để zoom cực kỳ sắc nét</li>
                                                        <li className="flex gap-2"><span className="text-indigo-500">•</span> Nhấp và kéo chuột để di chuyển vùng nhìn</li>
                                                        <li className="flex gap-2"><span className="text-indigo-500">•</span> Dùng các nút +, −, đặt lại để điều khiển</li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Footer */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between flex-shrink-0">
                                <Link
                                    to={`/library?subject=${material.subject}`}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                    Xem tất cả thư viện →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
