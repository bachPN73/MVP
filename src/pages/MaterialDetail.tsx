import { Layout } from '../layout/MainLayout';
import { useParams, Link, useNavigate } from 'react-router';
import { materials as mockMaterials, getSubjectName, getTypeName, Material } from '../data/materialsData';
import { ArrowLeft, Maximize2, Minimize2, BookOpen, Tag, GraduationCap, Loader2, Play, ZoomIn, RotateCcw, Move, Compass, Sparkles, Search, Lock, Zap, BookmarkPlus, BookmarkCheck, Clock } from 'lucide-react';
import { useState, useEffect, lazy, Suspense, useRef, useMemo } from 'react';
import { api, BASE_URL } from '../api';
import { useTheme } from '../components/ThemeProvider';
import { LatexText } from '../components/LatexText';

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

// Type for 24h Temporary Vault entries
interface VaultEntry {
    id: string;
    title: string;
    subject: string;
    type: string;
    thumbnail: string;
    addedAt: number;
    expiresAt: number; // timestamp ms
}

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

    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [relatedSearch, setRelatedSearch] = useState('');

    const [userRole, setUserRole] = useState('student');
    const [userPlan, setUserPlan] = useState('free');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        subject: 'physics',
        grade: 10,
        type: '3d-model',
        tags: '',
        subtitle: '',
        category: '',
        size: '',
        location: '',
        visibleInLM: '',
        funFact: '',
        featuresText: '',
        whereItOccursText: '',
        whereItOccursHabitat: '',
        relatedMaterials: [] as string[]
    });

    useEffect(() => {
        const loadAllMaterials = async () => {
            try {
                const dbModels = await api.getModels();
                const formatted = dbModels.map((m: any) => ({
                    id: `db-${m.id}`,
                    title: m.title,
                    subject: m.subject,
                    type: m.type || '3d-model',
                    description: m.description,
                    thumbnail: m.thumbnail 
                        ? (m.thumbnail.startsWith('http') ? m.thumbnail : `${BASE_URL}${m.thumbnail}`)
                        : '3d-placeholder',
                    tags: m.tags || [],
                    grade: m.grade || 10,
                    file_url: m.file_url 
                        ? (m.file_url.startsWith('http') ? m.file_url : `${BASE_URL}${m.file_url}`)
                        : '',
                    createdAt: m.createdAt || m.created_at,
                    relatedMaterials: m.relatedMaterials || []
                }));
                setAllMaterials([...mockMaterials, ...formatted]);
            } catch (error) {
                console.error("Lỗi khi tải danh sách học liệu:", error);
                setAllMaterials(mockMaterials);
            }
        };
        loadAllMaterials();
    }, []);

    const allAvailableRelated = useMemo(() => {
        if (!material) return [];
        return allMaterials.filter(m => m.id !== material.id);
    }, [allMaterials, material]);

    const filteredAvailableRelated = useMemo(() => {
        const query = relatedSearch.toLowerCase().trim();
        if (!query) return allAvailableRelated;
        return allAvailableRelated.filter(m => 
            m.title.toLowerCase().includes(query) || 
            m.subject.toLowerCase().includes(query)
        );
    }, [allAvailableRelated, relatedSearch]);

    const relatedMaterials = useMemo(() => {
        if (!material) return [];
        if (material.relatedMaterials && material.relatedMaterials.length > 0) {
            return material.relatedMaterials
                .map(relId => allMaterials.find(m => m.id === relId))
                .filter((m): m is Material => !!m);
        }
        return allMaterials
            .filter(m => m.id !== material.id && m.subject === material.subject)
            .slice(0, 3);
    }, [material, allMaterials]);

    useEffect(() => {
        const stored = localStorage.getItem('edu_tech_user');
        if (stored) {
            try {
                const user = JSON.parse(stored);
                if (user.role) setUserRole(user.role);
                if (user.plan) setUserPlan(user.plan.toLowerCase());
            } catch (e) {}
        }
    }, []);

    const handleStartEdit = () => {
        if (!material) return;
        setEditFormData({
            title: material.title || '',
            description: material.description || '',
            subject: material.subject || 'physics',
            grade: material.grade || 10,
            type: material.type || '3d-model',
            tags: material.tags ? material.tags.join(', ') : '',
            subtitle: material.subtitle || '',
            category: material.category || '',
            size: material.size || '',
            location: material.location || '',
            visibleInLM: material.visibleInLM || '',
            funFact: material.funFact || '',
            featuresText: material.features ? material.features.map((f: any) => `${f.name}: ${f.detail}`).join('\n') : '',
            whereItOccursText: material.whereItOccurs?.text || '',
            whereItOccursHabitat: material.whereItOccurs?.habitat || '',
            relatedMaterials: material.relatedMaterials || []
        });
        setRelatedSearch('');
        setErrorMsg('');
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!material || !id) return;
        setIsSaving(true);
        setErrorMsg('');

        // Parse featuresText
        const features = editFormData.featuresText
            .split('\n')
            .map(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    return {
                        name: parts[0].trim(),
                        detail: parts.slice(1).join(':').trim()
                    };
                }
                return null;
            })
            .filter(Boolean);

        const updatedData = {
            title: editFormData.title,
            description: editFormData.description,
            subject: editFormData.subject,
            grade: Number(editFormData.grade),
            type: editFormData.type,
            tags: editFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
            subtitle: editFormData.subtitle || undefined,
            category: editFormData.category || undefined,
            size: editFormData.size || undefined,
            location: editFormData.location || undefined,
            visibleInLM: editFormData.visibleInLM || undefined,
            funFact: editFormData.funFact || undefined,
            features: features,
            whereItOccurs: (editFormData.whereItOccursText || editFormData.whereItOccursHabitat) ? {
                text: editFormData.whereItOccursText,
                habitat: editFormData.whereItOccursHabitat
            } : undefined,
            relatedMaterials: editFormData.relatedMaterials
        };

        try {
            const dbId = id.replace('db-', '');
            await api.updateModel(dbId, updatedData as any);
            
            // Update local material state
            setMaterial({
                ...material,
                ...updatedData
            } as any);
            setIsEditing(false);
        } catch (error: any) {
            console.error("Lỗi khi cập nhật học liệu:", error);
            setErrorMsg(error.message || "Có lỗi xảy ra khi lưu thay đổi.");
        } finally {
            setIsSaving(false);
        }
    };

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
                                : undefined,
                            relatedMaterials: data.relatedMaterials || []
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
                            : undefined,
                        relatedMaterials: found.relatedMaterials || []
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

    // ── 24h Temporary Vault ──────────────────────────────────────────────────
    const VAULT_KEY = 'edu_tech_pro_vault';
    const [isInVault, setIsInVault] = useState(false);
    const [vaultSaveMsg, setVaultSaveMsg] = useState('');

    useEffect(() => {
        if (!material) return;
        const vaultStr = localStorage.getItem(VAULT_KEY);
        if (vaultStr) {
            try {
                const vault: VaultEntry[] = JSON.parse(vaultStr);
                const now = Date.now();
                // Clean expired entries
                const live = vault.filter(e => now < e.expiresAt);
                setIsInVault(live.some(e => e.id === material.id));
            } catch (_) {}
        }
    }, [material]);

    const handleSaveToVault = () => {
        if (!material) return;
        const isPro = ['pro', 'combo', 'school', 'demo'].includes(userPlan);
        if (!isPro) {
            navigate('/pricing');
            return;
        }

        const vaultStr = localStorage.getItem(VAULT_KEY);
        let vault: VaultEntry[] = [];
        try { vault = vaultStr ? JSON.parse(vaultStr) : []; } catch (_) {}

        const now = Date.now();
        // Clean expired entries first
        vault = vault.filter(e => now < e.expiresAt);

        if (isInVault) {
            // Remove from vault
            vault = vault.filter(e => e.id !== material.id);
            setIsInVault(false);
            setVaultSaveMsg('Đã xóa khỏi kho tạm thời');
        } else {
            // Add to vault with 24h expiry
            const entry: VaultEntry = {
                id: material.id,
                title: material.title,
                subject: material.subject,
                type: material.type,
                thumbnail: material.thumbnail || '',
                addedAt: now,
                expiresAt: now + 24 * 60 * 60 * 1000,
            };
            vault.push(entry);
            setIsInVault(true);
            setVaultSaveMsg('✓ Đã lưu! Tự xóa sau 24h');
        }
        localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
        setTimeout(() => setVaultSaveMsg(''), 3000);
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

    // relatedMaterials is defined above before early returns
    const fileUrl = (material as any).file_url || "";
    const ext = fileUrl.split('.').pop()?.toLowerCase() || '';
    const is3D = ['glb', 'gltf', 'fbx'].includes(ext);
    const thumbnailUrl = material.thumbnail && material.thumbnail !== '3d-placeholder'
        ? material.thumbnail
        : '3d-placeholder';
    const isPDF = ext === 'pdf';
    const config = SUBJECT_CONFIGS[material.subject as keyof typeof SUBJECT_CONFIGS] || SUBJECT_CONFIGS.physics;
    const isPremiumMaterial = id ? !id.toLowerCase().includes('demo') : true;
    const isBlocked = isPremiumMaterial && userPlan === 'free';

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
                                material.subtitle ? 'text-stone-800 dark:text-stone-100' : 'text-slate-900 dark:text-white'
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

                        {/* Admin Edit Controls */}
                        {userRole === 'admin' && id && id.startsWith('db-') && (
                            <div className="ml-2 flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-705 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={isSaving}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                                        >
                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Lưu'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleStartEdit}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        )}
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
                                        <h2 className={`text-3xl sm:text-4xl font-bold font-heading tracking-wide drop-shadow-sm ${theme === 'light' ? 'text-stone-900' : 'text-white'}`}>
                                            {material.title}
                                        </h2>
                                        <p className={`text-sm sm:text-lg font-heading italic mt-1 tracking-wide drop-shadow-sm ${theme === 'light' ? 'text-emerald-800/80' : 'text-emerald-400/80'}`}>
                                            {material.subtitle}
                                        </p>
                                    </div>
                                )}

                                 {isBlocked ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md z-30">
                                        {thumbnailUrl && (
                                            <img
                                                src={thumbnailUrl}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover filter blur-md opacity-20"
                                            />
                                        )}
                                        <div className="relative z-10 max-w-md p-8 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 animate-pulse">
                                                <Lock className="w-8 h-8" />
                                            </div>
                                            
                                            <div className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                                <Zap className="w-3 h-3 text-indigo-400" /> Tính Năng Trả Phí
                                            </div>

                                            <h3 className="text-xl font-bold font-heading text-white">
                                                Mở khóa học liệu: {material.title}
                                            </h3>

                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                Học liệu này thuộc danh mục <strong className="text-indigo-400">Premium</strong>. Hãy nâng cấp tài khoản của bạn để xem và tương tác hoàn toàn với mô hình sinh động này!
                                            </p>

                                            <div className="w-full h-px bg-white/5 my-2" />

                                            <div className="grid grid-cols-2 gap-3 w-full text-left text-xs text-slate-400 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-400 font-bold">✓</span> Xem 100+ mô hình 3D
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-400 font-bold">✓</span> Lưu học liệu 24h vào kho
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-400 font-bold">✓</span> Trợ lý AI học tập 24/7
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-400 font-bold">✓</span> Không quảng cáo
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate('/pricing')}
                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                                            >
                                                Nâng cấp gói dịch vụ ngay
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
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
                                                        className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-102 opacity-50 transition-all duration-700 group-hover:scale-105"
                                                    />
                                                )}

                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/20"></div>

                                                {/* Play / View button */}
                                                <div className="relative z-10 flex flex-col items-center gap-5 p-6 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 group-hover:scale-102 group-hover:bg-slate-900/50">
                                                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary/25 backdrop-blur-md border-2 border-primary/40 shadow-2xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all duration-300">
                                                        {is3D ? (
                                                            <Play className="w-8 h-8 text-white ml-1 animate-pulse" />
                                                        ) : (
                                                            <ZoomIn className="w-8 h-8 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="text-center px-4">
                                                        <p className="text-white font-black text-xl tracking-tight drop-shadow-md">
                                                            {is3D ? 'Nhấn để khám phá 3D' : isPDF ? 'Nhấn để xem tài liệu' : 'Nhấn để xem Infographic'}
                                                        </p>
                                                        <p className="text-slate-350 text-xs font-semibold mt-1">
                                                            {is3D ? 'Xoay, thu phóng và tương tác mô hình' : 'Phóng to và di chuyển để quan sát'}
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
                                                    /* ============ INFOGRAPHIC VIEWER – landscape & portrait adaptive ============ */
                                                    <div
                                                        className="absolute inset-0 overflow-hidden"
                                                        style={{
                                                            background: 'radial-gradient(ellipse at center, #f8fafc 0%, #e2e8f0 100%)',
                                                        }}
                                                    >
                                                        {/* Dark mode background */}
                                                        <div className="absolute inset-0 dark:bg-slate-950 hidden dark:block" />

                                                        {/* Scrollable zoom container */}
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center overflow-hidden"
                                                            onWheel={handleWheel}
                                                            onMouseDown={handleMouseDown}
                                                            onMouseMove={handleMouseMove}
                                                            onMouseUp={handleMouseUp}
                                                            onMouseLeave={handleMouseUp}
                                                            style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
                                                        >
                                                            {/* Image wrapper — fills available space while preserving aspect ratio */}
                                                            <div
                                                                className="relative flex items-center justify-center w-full h-full"
                                                                style={{
                                                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                                                    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                                    willChange: 'transform',
                                                                }}
                                                            >
                                                                <img
                                                                    src={getFullModelUrl(fileUrl || material.thumbnail)}
                                                                    alt={material.title}
                                                                    draggable={false}
                                                                    style={{
                                                                        maxWidth: '100%',
                                                                        maxHeight: '100%',
                                                                        width: 'auto',
                                                                        height: 'auto',
                                                                        objectFit: 'contain',
                                                                        imageRendering: scale > 1.5 ? '-webkit-optimize-contrast' : 'auto',
                                                                        display: 'block',
                                                                        borderRadius: '0.5rem',
                                                                        boxShadow: '0 8px 40px 0 rgba(0,0,0,0.10)',
                                                                    }}
                                                                    className="select-none"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Top-left orientation badge */}
                                                        <div className="absolute top-4 left-4 z-50 pointer-events-none">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-md text-white/80 text-[10px] font-bold uppercase tracking-widest">
                                                                🖼️ Infographic
                                                            </span>
                                                        </div>

                                                        {/* Zoom Controls */}
                                                        <div className="absolute bottom-5 right-5 flex items-center gap-1.5 z-50 p-1.5 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
                                                            <button
                                                                onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
                                                                className="w-8 h-8 bg-white/10 hover:bg-white/25 border border-white/10 text-white rounded-full flex items-center justify-center text-base font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                                title="Thu nhỏ"
                                                            >−</button>
                                                            <span className="px-2.5 text-white text-[11px] font-bold font-mono tabular-nums min-w-[44px] text-center">
                                                                {Math.round(scale * 100)}%
                                                            </span>
                                                            <button
                                                                onClick={() => setScale(prev => Math.min(6, prev + 0.25))}
                                                                className="w-8 h-8 bg-white/10 hover:bg-white/25 border border-white/10 text-white rounded-full flex items-center justify-center text-base font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                                title="Phóng to"
                                                            >+</button>
                                                            {scale !== 1 && (
                                                                <button
                                                                    onClick={resetZoom}
                                                                    className="w-8 h-8 bg-rose-500/25 hover:bg-rose-500/40 border border-rose-500/30 text-rose-300 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ml-0.5"
                                                                    title="Đặt lại"
                                                                >
                                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Pan hint */}
                                                        {scale > 1 && (
                                                            <div className="absolute bottom-5 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white/70 text-[11px] font-semibold pointer-events-none z-50">
                                                                <Move className="w-3 h-3" />
                                                                <span>Kéo để di chuyển</span>
                                                            </div>
                                                        )}

                                                        {/* Scroll hint when at default zoom */}
                                                        {scale === 1 && (
                                                            <div className="absolute bottom-5 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white/60 text-[11px] font-semibold pointer-events-none z-50">
                                                                <ZoomIn className="w-3 h-3" />
                                                                <span>Cuộn chuột để phóng to</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
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
                            ) : null}
                        </div>
                    </div>

                    {/* Right Pane: Sidebar thông tin chi tiết */}
                    <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 lg:h-full flex flex-col min-h-0">
                        <div className={`flex-1 flex flex-col min-h-0 rounded-[2rem] border shadow-xl p-5 sm:p-6 transition-all duration-500 ${
                            material.subtitle 
                                ? (theme === 'light' ? 'bg-white/85 border-stone-200/40 shadow-stone-100/30 text-stone-900' : 'bg-slate-900/85 dark:border-white/10 shadow-black/20 text-white') 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-md text-slate-900 dark:text-white'
                        } backdrop-blur-md`}>
                            {isEditing ? (
                                /* ==================== EDIT FORM ==================== */
                                <div className="flex-1 flex flex-col min-h-0">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-4 font-sans">
                                        Chỉnh sửa chi tiết học liệu
                                    </h3>
                                    
                                    {errorMsg && (
                                        <div className="mb-4 p-3 bg-rose-550/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-sans text-xs">
                                        {/* Tiêu đề */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-bold text-slate-400 uppercase tracking-wider">Tiêu đề</label>
                                            <input 
                                                type="text" 
                                                className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                value={editFormData.title}
                                                onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                                            />
                                        </div>

                                        {/* Phụ đề */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-bold text-slate-400 uppercase tracking-wider">Phụ đề (Subtitle)</label>
                                            <input 
                                                type="text" 
                                                className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                value={editFormData.subtitle}
                                                onChange={e => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                                            />
                                        </div>

                                        {/* Dropdowns: Môn học, Lớp, Loại */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Môn học</label>
                                                <select
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.subject}
                                                    onChange={e => setEditFormData({ ...editFormData, subject: e.target.value })}
                                                >
                                                    <option value="physics">Vật lý</option>
                                                    <option value="chemistry">Hóa học</option>
                                                    <option value="biology">Sinh học</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Lớp</label>
                                                <select
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.grade}
                                                    onChange={e => setEditFormData({ ...editFormData, grade: Number(e.target.value) })}
                                                >
                                                    <option value={10}>Lớp 10</option>
                                                    <option value={11}>Lớp 11</option>
                                                    <option value={12}>Lớp 12</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Loại</label>
                                                <select
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.type}
                                                    onChange={e => setEditFormData({ ...editFormData, type: e.target.value })}
                                                >
                                                    <option value="3d-model">Mô hình 3D</option>
                                                    <option value="infographic">Infographic</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Phân nhóm & Kích thước */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Phân nhóm</label>
                                                <input 
                                                    type="text" 
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.category}
                                                    onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Kích thước</label>
                                                <input 
                                                    type="text" 
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.size}
                                                    onChange={e => setEditFormData({ ...editFormData, size: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Phân bố & Khả năng quan sát */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Phân bố chính</label>
                                                <input 
                                                    type="text" 
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.location}
                                                    onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Cách quan sát</label>
                                                <input 
                                                    type="text" 
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.visibleInLM}
                                                    onChange={e => setEditFormData({ ...editFormData, visibleInLM: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Sự thật thú vị */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-bold text-slate-400 uppercase tracking-wider">Sự thật thú vị (Fun Fact)</label>
                                            <input 
                                                type="text" 
                                                className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                value={editFormData.funFact}
                                                onChange={e => setEditFormData({ ...editFormData, funFact: e.target.value })}
                                            />
                                        </div>

                                        {/* Nguồn gốc phân bố (whereItOccurs) */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Thông số phân bố (Text)</label>
                                                <input 
                                                    type="text" 
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.whereItOccursText}
                                                    onChange={e => setEditFormData({ ...editFormData, whereItOccursText: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="font-bold text-slate-400 uppercase tracking-wider">Khu vực phân bố (Habitat)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Cách nhau bằng dấu ·"
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                    value={editFormData.whereItOccursHabitat}
                                                    onChange={e => setEditFormData({ ...editFormData, whereItOccursHabitat: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Mô tả chính */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-bold text-slate-400 uppercase tracking-wider">Mô tả học liệu</label>
                                            <textarea 
                                                rows={3} 
                                                className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none resize-none w-full text-slate-950 dark:text-white"
                                                value={editFormData.description}
                                                onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                            />
                                        </div>

                                        {/* Từ khóa */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-bold text-slate-400 uppercase tracking-wider">Từ khóa (Tags - cách nhau bằng dấu phẩy)</label>
                                            <input 
                                                type="text" 
                                                className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none w-full text-slate-950 dark:text-white"
                                                value={editFormData.tags}
                                                onChange={e => setEditFormData({ ...editFormData, tags: e.target.value })}
                                            />
                                        </div>

                                        {/* Chi tiết cấu trúc */}
                                        <div className="flex flex-col gap-1.5 font-mono">
                                            <label className="font-bold text-slate-400 uppercase tracking-wider font-sans">Chi tiết cấu trúc (Mỗi dòng dạng 'Tên: Mô tả')</label>
                                            <textarea 
                                                rows={4} 
                                                placeholder="Màng sinh chất: Bảo vệ tế bào&#10;Nhân tế bào: Chứa DNA"
                                                className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none resize-none w-full text-slate-950 dark:text-white"
                                                value={editFormData.featuresText}
                                                onChange={e => setEditFormData({ ...editFormData, featuresText: e.target.value })}
                                            />
                                        </div>

                                         {/* Học liệu liên quan */}
                                         <div className="flex flex-col gap-1.5 font-sans">
                                             <label className="font-bold text-slate-400 uppercase tracking-wider">
                                                 Học liệu liên quan ({editFormData.relatedMaterials?.length || 0} đã chọn)
                                             </label>
                                             <div className="border border-slate-200 dark:border-white/10 rounded-xl p-3 bg-slate-50 dark:bg-slate-950/40 flex flex-col gap-2">
                                                 <div className="relative shrink-0">
                                                     <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                     <input
                                                         type="text"
                                                         placeholder="Tìm học liệu để liên kết..."
                                                         value={relatedSearch}
                                                         onChange={(e) => setRelatedSearch(e.target.value)}
                                                         className="w-full pl-7 pr-4 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-955 dark:text-white"
                                                     />
                                                 </div>
                                                 <div className="max-h-[120px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 pr-1">
                                                     {filteredAvailableRelated.map(m => {
                                                         const isSelected = editFormData.relatedMaterials?.includes(m.id);
                                                         return (
                                                             <div
                                                                 key={m.id}
                                                                 onClick={() => {
                                                                     setEditFormData(prev => {
                                                                         const current = [...(prev.relatedMaterials || [])];
                                                                         const index = current.indexOf(m.id);
                                                                         if (index > -1) {
                                                                             current.splice(index, 1);
                                                                         } else {
                                                                             current.push(m.id);
                                                                         }
                                                                         return { ...prev, relatedMaterials: current };
                                                                     });
                                                                 }}
                                                                 className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors"
                                                             >
                                                                 <input
                                                                     type="checkbox"
                                                                     checked={isSelected}
                                                                     onChange={() => {}}
                                                                     className="w-3 h-3 text-indigo-600 rounded cursor-pointer pointer-events-none"
                                                                 />
                                                                 <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">{m.title}</span>
                                                                 <span className="text-[7.5px] font-bold text-slate-400 dark:text-slate-500 ml-auto shrink-0 uppercase tracking-wider">{m.subject === 'biology' ? 'Sinh' : m.subject === 'chemistry' ? 'Hóa' : 'Lý'} · Lớp {m.grade}</span>
                                                             </div>
                                                         );
                                                     })}
                                                     {filteredAvailableRelated.length === 0 && (
                                                         <div className="text-center py-4 text-slate-400 text-[11px]">Không tìm thấy học liệu phù hợp.</div>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                    </div>
                                </div>
                            ) : (
                                /* ==================== VIEW MODE ==================== */
                                <>
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
                                            material.subtitle ? 'text-stone-800 dark:text-stone-100' : ''
                                        }`}>
                                            <LatexText text={material.title} />
                                        </h2>
                                        {material.subtitle && (
                                            <p className={`font-heading italic text-xs sm:text-sm mt-1 leading-relaxed ${
                                                theme === 'light' ? 'text-emerald-800/85' : 'text-emerald-400/85'
                                            }`}>
                                                <LatexText text={material.subtitle} />
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
                                                <LatexText text={material.description} />
                                            </p>
                                        </div>

                                        {/* 24h Temporary Vault Button */}
                                        {!isBlocked && (['pro', 'combo', 'school', 'demo'].includes(userPlan) ? (
                                            <div className="pt-1 space-y-1">
                                                <button
                                                    onClick={handleSaveToVault}
                                                    className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                                                        isInVault
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                                            : (material.subtitle
                                                                ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white hover:shadow-violet-500/20'
                                                                : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white hover:shadow-violet-500/20')
                                                    }`}
                                                >
                                                    {isInVault ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                                                    {isInVault ? 'Đã lưu vào kho tạm thời' : 'Lưu vào kho tạm thời (24h)'}
                                                </button>
                                                {vaultSaveMsg && (
                                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 dark:text-emerald-400 px-1">
                                                        <Clock className="w-3 h-3" />
                                                        {vaultSaveMsg}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="pt-1">
                                                <button
                                                    onClick={() => navigate('/pricing')}
                                                    className="w-full py-2.5 px-4 rounded-xl border border-violet-300/40 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all cursor-pointer"
                                                >
                                                    <BookmarkPlus className="w-4 h-4" />
                                                    Nâng cấp để lưu kho tạm thời
                                                </button>
                                            </div>
                                        ))}

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
                                                        <LatexText text={material.category || 'Mô hình 3D'} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-stone-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                                                        {cleanLabel(config.size.label)}
                                                    </div>
                                                    <div className="text-stone-800 dark:text-slate-200 text-xs font-semibold">
                                                        <LatexText text={material.size || 'N/A'} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-stone-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                                                        {cleanLabel(config.location.label)}
                                                    </div>
                                                    <div className="text-stone-800 dark:text-slate-200 text-xs font-semibold">
                                                        <LatexText text={material.location || 'N/A'} />
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
                                                            <LatexText text={material.visibleInLM || 'Có thể'} />
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
                                                            #<LatexText text={tag} />
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
                                                <p className="text-xs font-heading italic leading-relaxed">
                                                    "<LatexText text={material.funFact} />"
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
                                                                <div className={`text-slate-900 dark:text-white font-bold text-xs ${material.subtitle ? 'font-heading' : ''}`}>
                                                                    <LatexText text={feature.name} />
                                                                </div>
                                                                <div className={`text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed font-normal ${material.subtitle ? 'font-sans' : ''}`}>
                                                                    <LatexText text={feature.detail} />
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
                                                    <LatexText text={material.whereItOccurs.text} />
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
                        </>
                    )}
                </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
