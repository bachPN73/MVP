import { Canvas, ThreeElements } from '@react-three/fiber';
import { useFBX, OrbitControls, Stage, Environment } from '@react-three/drei';
import React, { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { Loader2, HelpCircle, HardDrive, RefreshCw, Zap, Sparkles, Sun, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useTheme } from './ThemeProvider';

// Declare R3F elements for TypeScript
declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements extends ThreeElements { }
        }
    }
}

// Global DRACO Loader decoder setup once to prevent memory leaks
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

class WebGLErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("WebGL error caught in boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const errorMessage = this.state.error?.message || "";
            const errorStack = this.state.error?.stack || "";
            const isWebGLRelated = 
                errorMessage.toLowerCase().includes("webgl") || 
                errorMessage.toLowerCase().includes("context lost") || 
                errorMessage.toLowerCase().includes("renderer") ||
                errorStack.toLowerCase().includes("webgl") || 
                errorStack.toLowerCase().includes("contextlost");

            return (
                <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-slate-950/40 border border-white/5 rounded-2xl text-slate-100 backdrop-blur-md">
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4 animate-pulse">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold mb-1.5 text-white tracking-wide">
                        {isWebGLRelated ? "Sự cố hiển thị 3D (WebGL)" : "Lỗi tải mô hình 3D"}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                        {isWebGLRelated ? (
                            <span>Trình duyệt không thể khởi tạo ngữ cảnh WebGL. Vui lòng bật <strong>Tăng tốc phần cứng</strong> trong cài đặt trình duyệt để xem học liệu 3D.</span>
                        ) : (
                            <span>Không thể tải hoặc xử lý tệp mô hình 3D này. Vui lòng kiểm tra kết nối mạng, đảm bảo tệp mô hình hợp lệ hoặc thử lại sau.</span>
                        )}
                    </p>
                    <div className="flex flex-wrap gap-2.5 justify-center">
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-3.5 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1"
                        >
                            Thử tải lại
                        </button>
                        {isWebGLRelated && (
                            <a 
                                href="https://get.webgl.org/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3.5 py-1.5 text-[11px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-lg transition-all border border-white/10"
                            >
                                Kiểm tra WebGL
                            </a>
                        )}
                    </div>
                    <div className="mt-4 text-[9px] text-slate-600 font-mono select-all bg-black/20 px-2.5 py-1 rounded-md border border-white/5">
                        {this.state.error?.message || "WebGL Context Creation Failed"}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

function applyPBRUpgrades(scene: THREE.Group | THREE.Object3D, isAmber: boolean, highQuality: boolean) {
    scene.traverse((child) => {
        if ((child as any).isMesh) {
            const mesh = child as THREE.Mesh;
            if (!mesh.material) return;

            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

            materials.forEach((mat: any) => {
                if (isAmber) {
                    // Upgrade to physical material for amber rendering
                    if (!mat.isMeshPhysicalMaterial) {
                        const newMat = new THREE.MeshPhysicalMaterial({
                            map: mat.map,
                            color: mat.color,
                            normalMap: mat.normalMap,
                            roughness: mat.roughness || 0.05,
                            metalness: mat.metalness || 0.0,
                            name: mat.name,
                            transparent: mat.transparent,
                            opacity: mat.opacity
                        });
                        mesh.material = newMat;
                        mat = newMat;
                    }
                    
                    if (mat.name?.toLowerCase().includes('amber') ||
                        mat.name?.toLowerCase().includes('vỏ') ||
                        mesh.name?.toLowerCase().includes('amber')) {
                        mat.color.set('#ff9d00');
                        mat.emissive.set('#4d2600');
                        mat.emissiveIntensity = 0.3;
                        mat.roughness = 0.05;
                        mat.metalness = 0.0;
                        mat.transparent = true;
                        
                        if (highQuality) {
                            mat.transmission = 1.0;
                            mat.ior = 1.55;
                            mat.thickness = 3.5;
                            mat.opacity = 1.0; // Let transmission calculate transparency refraction
                        } else {
                            mat.transmission = 0.0;
                            mat.ior = 1.0;
                            mat.thickness = 0.0;
                            mat.opacity = 0.6; // High performance standard alpha blending
                        }
                    }
                } else {
                    // Non-amber model optimization: if performance mode is active, disable heavy physical transparency features
                    if (!highQuality && mat.isMeshPhysicalMaterial && mat.transmission > 0) {
                        mat.transmission = 0.0;
                        mat.thickness = 0.0;
                        mat.transparent = true;
                        mat.opacity = mat.opacity < 1 ? mat.opacity : 0.6;
                    }
                }
            });
        }
    });
}

// Fetch with Progressive ReadableStream and Browser Caching
async function fetchWithProgress(url: string, onProgress: (loaded: number, total: number) => void): Promise<ArrayBuffer> {
    const CACHE_NAME = '3d-models-cache-v1';
    
    // 1. Try to load from cache first
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(url);
        
        if (cachedResponse) {
            // Fake loading progress for smooth UI
            onProgress(1, 1);
            return await cachedResponse.arrayBuffer();
        }
    } catch (e) {
        console.warn("Cache API không khả dụng", e);
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Tải mô hình thất bại: HTTP status ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.body?.getReader();
    if (!reader) {
        const buffer = await response.arrayBuffer();
        onProgress(1, 1);
        try {
            const cache = await caches.open(CACHE_NAME);
            cache.put(url, new Response(buffer.slice(0)));
        } catch (e) {}
        return buffer;
    }

    let loadedBytes = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loadedBytes += value.length;
        onProgress(loadedBytes, totalBytes);
    }

    // Combine Uint8Array chunks into one ArrayBuffer
    const allChunks = new Uint8Array(loadedBytes);
    let position = 0;
    for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
    }

    const finalBuffer = allChunks.buffer;
    
    // 2. Save to cache in background for next time
    try {
        caches.open(CACHE_NAME).then(cache => {
            cache.put(url, new Response(finalBuffer.slice(0)));
        });
    } catch (e) {}

    return finalBuffer;
}

// GLTF model with progressive stream loading & DRACO decoder
function ProgressiveGLTFModel({
    url,
    highQuality,
    onProgress,
    onLoaded,
    onError
}: {
    url: string;
    highQuality: boolean;
    onProgress: (pct: number, loadedMb: string, totalMb: string) => void;
    onLoaded: (scene: THREE.Group) => void;
    onError: (err: any) => void;
}) {
    const [scene, setScene] = useState<THREE.Group | null>(null);
    const sceneRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        sceneRef.current = scene;
    }, [scene]);

    useEffect(() => {
        let isMounted = true;
        setScene(null);

        async function load() {
            try {
                const arrayBuffer = await fetchWithProgress(url, (loaded, total) => {
                    if (!isMounted) return;
                    const loadedMb = (loaded / (1024 * 1024)).toFixed(2);
                    if (total > 0) {
                        const totalMb = (total / (1024 * 1024)).toFixed(2);
                        const pct = Math.round((loaded / total) * 100);
                        onProgress(pct, loadedMb, totalMb);
                    } else {
                        onProgress(-1, loadedMb, "N/A");
                    }
                });

                if (!isMounted) return;

                // Decompress & Parse GLTF using DRACOLoader
                const isAmber = url.toLowerCase().includes('amber') || url.toLowerCase().includes('muoi');
                gltfLoader.parse(
                    arrayBuffer,
                    '',
                    (gltf) => {
                        if (!isMounted) return;
                        applyPBRUpgrades(gltf.scene, isAmber, highQuality);
                        setScene(gltf.scene);
                        onLoaded(gltf.scene);
                    },
                    (err) => {
                        if (!isMounted) return;
                        onError(err);
                    }
                );
            } catch (err: any) {
                if (!isMounted) return;
                onError(err);
            }
        }

        load();

        return () => {
            isMounted = false;
            // Giải phóng tài nguyên Three.js của scene cũ khi đổi model hoặc unmount để tránh rò rỉ GPU
            if (sceneRef.current) {
                try {
                    sceneRef.current.traverse((object: any) => {
                        if (object.isMesh) {
                            if (object.geometry) {
                                object.geometry.dispose();
                            }
                            if (object.material) {
                                const materials = Array.isArray(object.material) ? object.material : [object.material];
                                materials.forEach((material: any) => {
                                    for (const key in material) {
                                        if (material[key] && material[key].isTexture) {
                                            material[key].dispose();
                                        }
                                    }
                                    if (typeof material.dispose === 'function') {
                                        material.dispose();
                                    }
                                });
                            }
                        }
                    });
                } catch (e) {
                    console.warn("Lỗi khi giải phóng tài nguyên GLTF scene:", e);
                }
            }
        };
    }, [url]);

    return null;
}

function FBXModel({ url, highQuality }: { url: string; highQuality: boolean }) {
    const fbx = useFBX(url);
    useEffect(() => {
        const isAmber = url.toLowerCase().includes('amber') || url.toLowerCase().includes('muoi');
        applyPBRUpgrades(fbx, isAmber, highQuality);
        fbx.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    materials.forEach((mat: any) => {
                        mat.needsUpdate = true;
                    });
                }
            }
        });
    }, [fbx, url, highQuality]);
    return <primitive object={fbx} />;
}

// Loading Overlay Component with beautiful glassmorphism design
function StreamingLoadingOverlay({
    pct,
    loadedMb,
    totalMb,
    loadingStage,
    errorMsg,
    theme
}: {
    pct: number;
    loadedMb: string;
    totalMb: string;
    loadingStage: 'downloading' | 'decoding' | 'stabilizing' | 'done' | 'error';
    errorMsg?: string;
    theme: 'light' | 'dark';
}) {
    if (loadingStage === 'done') return null;

    return (
        <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md z-30 pointer-events-auto select-none transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-200/60'
        }`}>
            <div className={`max-w-md w-11/12 border rounded-2xl p-6 backdrop-blur-lg shadow-2xl flex flex-col items-center text-center transition-all duration-300 ${
                theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-white/80 border-slate-200/80 text-slate-800 shadow-slate-200/50'
            }`}>
                {loadingStage === 'error' ? (
                    <>
                        <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 animate-bounce">
                            ⚠️
                        </div>
                        <h4 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Không thể tải mô hình 3D</h4>
                        <p className={`text-sm mb-4 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            {errorMsg || "Lỗi mạng hoặc tệp mô hình không còn khả dụng trên máy chủ."}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg"
                        >
                            <RefreshCw className="w-4 h-4" /> Tải lại trang
                        </button>
                    </>
                ) : (
                    <>
                        {/* Interactive glow spinner */}
                        <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
                            <div className={`absolute inset-0 rounded-full border-4 ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`} />
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                            <div className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                {loadingStage === 'stabilizing' ? "100%" : pct >= 0 ? `${pct}%` : "..."}
                            </div>
                        </div>

                        <h4 className={`font-semibold tracking-wide text-sm mb-1 uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                            {loadingStage === 'decoding' 
                                ? "🛠️ Đang xử lý không gian 3D..." 
                                : loadingStage === 'stabilizing' 
                                  ? "✨ Đang tối ưu hóa vật liệu & ánh sáng..." 
                                  : "📥 Đang kết nối dữ liệu học liệu..."}
                        </h4>

                        {/* Progress Bar container */}
                        <div className={`w-full h-2.5 rounded-full overflow-hidden mb-4 relative ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                            {loadingStage === 'stabilizing' ? (
                                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full w-full animate-pulse" />
                            ) : pct >= 0 ? (
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${pct}%` }}
                                />
                            ) : (
                                <div className="h-full bg-indigo-500 animate-pulse w-full" />
                            )}
                        </div>

                        {/* Sub-status data stats */}
                        <div className={`flex items-center gap-6 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="flex items-center gap-1.5">
                                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                                {loadedMb} MB / {totalMb === "0" ? "???" : totalMb} MB
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                                {loadingStage === 'stabilizing' ? "Đang dựng hình..." : "Streaming"}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ModelViewerInner({ 
    modelUrl, 
    minimal = false, 
    autoRotate = false,
    modelRotation,
    modelPosition,
    modelScale,
    cameraTarget
}: { 
    modelUrl: string; 
    minimal?: boolean; 
    autoRotate?: boolean;
    modelRotation?: [number, number, number];
    modelPosition?: [number, number, number];
    modelScale?: number;
    cameraTarget?: [number, number, number];
}) {
    const isMobile = window.innerWidth < 768;
    const { theme } = useTheme();

    // Loading stages & metrics states
    const [loadingStage, setLoadingStage] = useState<'downloading' | 'decoding' | 'stabilizing' | 'done' | 'error'>('downloading');
    const [pct, setPct] = useState(0);
    const [loadedMb, setLoadedMb] = useState("0");
    const [totalMb, setTotalMb] = useState("0");
    const [errorMsg, setErrorMsg] = useState("");

    // Brightness control: 1.0 = mức sáng mặc định (mốc giữa), range [0.2, 2.0]
    const [lightIntensity, setLightIntensity] = useState<number>(1.0);
    const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);

    // Default overrides for specific models if not provided
    const lowerUrl = modelUrl.toLowerCase();
    const isPlantCell = lowerUrl.includes('plant-cell') || lowerUrl.includes('thuc-vat') || lowerUrl.includes('thực vật');
    const isAnimalCell = lowerUrl.includes('animal-cell') || lowerUrl.includes('dong-vat') || lowerUrl.includes('động vật');
    const isNeuron = lowerUrl.includes('neuron') || lowerUrl.includes('than-kinh') || lowerUrl.includes('thần kinh');
    const isWhiteBloodCell = lowerUrl.includes('white-blood-cell') || lowerUrl.includes('bach-cau') || lowerUrl.includes('bạch cầu');

    const rotationKey = modelRotation ? modelRotation.join(',') : '';
    const finalRotation = useMemo(() => {
        if (modelRotation) return modelRotation;
        if (isPlantCell) return [0, -Math.PI / 2, 0] as [number, number, number];
        if (isAnimalCell || isWhiteBloodCell) return [0, Math.PI, 0] as [number, number, number];
        if (isNeuron) return [0, Math.PI / 2, 0] as [number, number, number];
        return undefined;
    }, [rotationKey, isPlantCell, isAnimalCell, isWhiteBloodCell, isNeuron]);

    const targetKey = cameraTarget ? cameraTarget.join(',') : '';
    const finalTarget = useMemo(() => {
        if (cameraTarget) return cameraTarget;
        if (isPlantCell) return [0, -0.2, 0] as [number, number, number];
        return [0, 0, 0] as [number, number, number];
    }, [targetKey, isPlantCell]);

    const positionKey = modelPosition ? modelPosition.join(',') : '';
    const finalPosition = useMemo(() => {
        return modelPosition;
    }, [positionKey]);

    // Dynamic quality setting, persisted to localStorage. Mặc định là false (Mượt mà) để tránh giật lag ngay từ đầu.
    const [highQuality, setHighQuality] = useState<boolean>(() => {
        const saved = localStorage.getItem('model_viewer_quality');
        if (saved !== null) {
            return saved === 'true';
        }
        return false;
    });

    // Quản lý và dọn dẹp WebGLRenderer tránh rò rỉ WebGL context
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    useEffect(() => {
        return () => {
            if (rendererRef.current) {
                try {
                    const gl = rendererRef.current;
                    const extension = gl.getContext().getExtension('WEBGL_lose_context');
                    if (extension) {
                        extension.loseContext();
                    }
                    gl.dispose();
                } catch (e) {
                    console.warn("Lỗi khi giải phóng WebGL context:", e);
                }
            }
        };
    }, []);

    // Tối ưu hóa: Chỉ render mô hình khi nó nằm trong vùng nhìn thấy của màn hình
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    // Effect to handle stabilization delay (compiling shaders & loading textures offscreen)
    useEffect(() => {
        if (loadingStage === 'stabilizing') {
            const timer = setTimeout(() => {
                setLoadingStage('done');
            }, minimal ? 0 : 400); // 400ms delay to stabilize graphics for snappy load
            return () => clearTimeout(timer);
        }
    }, [loadingStage, minimal]);

    const isFBX = modelUrl.toLowerCase().endsWith('.fbx');
    const isAmber = modelUrl.toLowerCase().includes('amber') || modelUrl.toLowerCase().includes('muoi');

    // Reset state on model url change
    useEffect(() => {
        setLoadedScene(null);
        if (isFBX) {
            setLoadingStage('done');
        } else {
            setLoadingStage('downloading');
            setPct(0);
            setLoadedMb("0");
            setTotalMb("0");
        }
    }, [modelUrl, isFBX]);

    // Save quality preference to localStorage
    useEffect(() => {
        localStorage.setItem('model_viewer_quality', String(highQuality));
    }, [highQuality]);

    // In-place dynamic updates to materials when quality changes (avoiding network reload)
    useEffect(() => {
        if (loadedScene) {
            applyPBRUpgrades(loadedScene, isAmber, highQuality);
            loadedScene.traverse((child) => {
                if ((child as any).isMesh) {
                    const mesh = child as THREE.Mesh;
                    if (mesh.material) {
                        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                        materials.forEach((mat: any) => {
                            mat.needsUpdate = true;
                        });
                    }
                }
            });
        }
    }, [loadedScene, highQuality, isAmber]);

    return (
        <div 
            ref={containerRef}
            className={`relative w-full h-full rounded-2xl overflow-hidden transition-colors duration-300 ${
            theme === 'dark' 
            ? 'bg-transparent text-white' 
            : 'bg-transparent text-slate-800'
        }`}>
            {/* Real-time Streaming Download Status Layer */}
            {!isFBX && !minimal && (
                <StreamingLoadingOverlay
                    pct={pct}
                    loadedMb={loadedMb}
                    totalMb={totalMb}
                    loadingStage={loadingStage}
                    errorMsg={errorMsg}
                    theme={theme}
                />
            )}

            {/* Premium Quality Mode Toggle Switch (Kiểu công tắc) */}
            {!minimal && (
                <div className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-md pointer-events-auto select-none transition-colors duration-300 ${
                    theme === 'dark'
                    ? 'bg-black/40 border-white/10 text-white'
                    : 'bg-white/60 border-slate-300 text-slate-800'
                }`}>
                    <span className="text-[0.6875rem] font-bold tracking-wider uppercase flex items-center gap-1">
                        {highQuality ? (
                            <>
                                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                                <span>Đẹp mắt</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                                <span>Mượt mà</span>
                            </>
                        )}
                    </span>
                    
                    <button
                        onClick={() => setHighQuality(!highQuality)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                            highQuality ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-700'
                        }`}
                        title={highQuality ? "Nhấn để chuyển sang chế độ Mượt mà (⚡)" : "Nhấn để chuyển sang chế độ Đẹp mắt (✨)"}
                    >
                        <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ease-out ${
                                highQuality ? 'translate-x-4.5' : 'translate-x-0.5'
                            }`}
                        />
                    </button>
                </div>
            )}

            {useMemo(() => (
                <WebGLErrorBoundary>
                    <Canvas
                        frameloop={isVisible ? "always" : "demand"} // Ngủ đông (demand) khi khuất màn hình để tránh lag

                        performance={{ min: isMobile ? 0.3 : 0.5 }}
                        dpr={highQuality ? Math.min(2, window.devicePixelRatio) : 1} // Ép độ phân giải 1x khi lag, 2x khi cần chất lượng cao
                        camera={{ position: [0, 0, 4], fov: 45 }}
                        gl={{
                            antialias: highQuality, // Tắt khử răng cưa khi mượt mà để giải phóng tài nguyên GPU
                            powerPreference: "high-performance",
                            precision: highQuality ? "highp" : "mediump", // Giảm độ chính xác shader ở chế độ mượt mà
                            toneMapping: 4,
                        }}
                        onCreated={({ gl }) => {
                            gl.toneMappingExposure = 1.05;
                            rendererRef.current = gl;
                        }}
                    >
                        <Suspense fallback={null}>
                            {highQuality ? (
                                isAmber ? <Environment preset="studio" /> : <Environment preset="city" />
                            ) : (
                                // Fallback ánh sáng Hemisphere khi tắt Environment để đạt hiệu năng cực đại mà vẫn giữ chiều sâu 3D
                                <hemisphereLight skyColor="#ffffff" groundColor="#333333" intensity={isAmber ? 0.9 : 1.1} />
                            )}

                            <ambientLight intensity={(isAmber ? 0.65 : 0.8) * lightIntensity} />
                            <directionalLight position={[10, 10, 10]} intensity={(isAmber ? 0.8 : 1.4) * lightIntensity} />

                            {!isMobile && (
                                <>
                                    <directionalLight position={[-10, 5, -10]} intensity={(isAmber ? 0.75 : 0.55) * lightIntensity} color="#ffffff" />
                                    <pointLight position={[0, -5, 5]} intensity={(isAmber ? 0.5 : 0.35) * lightIntensity} color="#ffffff" />
                                </>
                            )}

                            {isFBX ? (
                                <Stage environment={null} intensity={isAmber ? 0.55 : 1.1} shadows={false} adjustCamera={1.3}>
                                    <FBXModel url={modelUrl} highQuality={highQuality} />
                                </Stage>
                            ) : (
                                <>
                                    <ProgressiveGLTFModel
                                        url={modelUrl}
                                        highQuality={highQuality}
                                        onProgress={(percent, loaded, total) => {
                                            setPct(percent);
                                            setLoadedMb(loaded);
                                            setTotalMb(total);
                                            if (percent === 100) {
                                                setLoadingStage('decoding');
                                            }
                                        }}
                                        onLoaded={(scene) => {
                                            setLoadedScene(scene);
                                            setLoadingStage('stabilizing');
                                        }}
                                        onError={(err) => {
                                            setErrorMsg(err.message || "Không thể tải hoặc giải nén mô hình GLTF.");
                                            setLoadingStage('error');
                                        }}
                                    />
                                    {loadedScene && (
                                        <Stage environment={null} intensity={isAmber ? 0.55 : 1.1} shadows={false} adjustCamera={1.3}>
                                            <primitive 
                                                object={loadedScene} 
                                                rotation={finalRotation} 
                                                position={finalPosition} 
                                                scale={modelScale} 
                                            />
                                        </Stage>
                                    )}
                                </>
                            )}
 
                            <OrbitControls 
                                makeDefault 
                                enableZoom={!minimal} 
                                enablePan={!minimal} 
                                zoomSpeed={1.2} 
                                enableDamping={true} 
                                dampingFactor={0.05} 
                                autoRotate={isVisible && autoRotate} 
                                autoRotateSpeed={0.8} 
                                target={finalTarget} 
                            />
                        </Suspense>
                    </Canvas>
                </WebGLErrorBoundary>
            ), [
                isVisible, isMobile, highQuality, isAmber, lightIntensity, modelUrl, minimal, 
                autoRotate, finalTarget, finalRotation, finalPosition, modelScale, loadedScene, isFBX
            ])}

            {/* Brightness Slider - dọc bên trái */}
            {!minimal && (
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 px-2 py-3 rounded-2xl backdrop-blur-md border shadow-lg transition-colors duration-300 ${
                    theme === 'dark'
                    ? 'bg-black/40 border-white/10'
                    : 'bg-white/70 border-slate-200 shadow-slate-200/50'
                }`}>
                    {/* Icon Sáng - đầu trên */}
                    <Sun className={`w-3.5 h-3.5 shrink-0 ${
                        lightIntensity > 1.4 ? 'text-yellow-400' : theme === 'dark' ? 'text-white/50' : 'text-slate-400'
                    }`} />

                    {/* Slider dọc */}
                    <div className="relative flex items-center justify-center" style={{ height: '100px' }}>
                        <input
                            type="range"
                            min={0.2}
                            max={2.0}
                            step={0.05}
                            value={lightIntensity}
                            onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                            title={`Độ sáng: ${Math.round(lightIntensity * 100)}%`}
                            className="appearance-none cursor-pointer"
                            style={{
                                writingMode: 'vertical-lr' as any,
                                direction: 'rtl',
                                width: '6px',
                                height: '100px',
                                WebkitAppearance: 'slider-vertical',
                                background: `linear-gradient(to top, ${
                                    theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                                } ${((1 - (lightIntensity - 0.2) / 1.8) * 100).toFixed(0)}%, ${
                                    lightIntensity > 1.0 ? '#facc15' : '#818cf8'
                                } ${((1 - (lightIntensity - 0.2) / 1.8) * 100).toFixed(0)}%)`,
                                borderRadius: '999px',
                                outline: 'none',
                                border: 'none',
                                padding: '0',
                            }}
                        />
                        {/* Vạch đánh dấu mốc giữa (mức mặc định = 1.0) */}
                        <div
                            className={`absolute left-1/2 -translate-x-1/2 w-3 h-px pointer-events-none ${
                                theme === 'dark' ? 'bg-white/40' : 'bg-slate-400/60'
                            }`}
                            style={{ bottom: `${((1.0 - 0.2) / 1.8) * 100}%` }}
                            title="Mức sáng mặc định"
                        />
                    </div>

                    {/* Icon Tối - đầu dưới */}
                    <Sun className={`w-3 h-3 shrink-0 ${
                        theme === 'dark' ? 'text-white/20' : 'text-slate-300'
                    }`} />

                    {/* Nút reset về mặc định khi đã chỉnh */}
                    {Math.abs(lightIntensity - 1.0) > 0.08 && (
                        <button
                            onClick={() => setLightIntensity(1.0)}
                            title="Đặt lại mức sáng mặc định"
                            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all hover:scale-110 active:scale-95 ${
                                theme === 'dark'
                                ? 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
                                : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            ↺
                        </button>
                    )}
                </div>
            )}

            {/* Bottom help text */}
            {!minimal && (
                <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-3.5 py-1.5 backdrop-blur-md rounded-full text-[0.55rem] font-bold uppercase tracking-widest border pointer-events-none transition-all duration-300 ${
                    theme === 'dark'
                    ? 'bg-black/60 text-white/95 border-white/10'
                    : 'bg-white/80 text-slate-800 border-slate-200 shadow-md'
                }`}>
                    <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-indigo-400" /> Xoay chuột</span>
                    <div className={`w-px h-2.5 ${theme === 'dark' ? 'bg-white/25' : 'bg-slate-300'}`} />
                    <span>Cuộn để Zoom</span>
                    <div className={`w-px h-2.5 ${theme === 'dark' ? 'bg-white/25' : 'bg-slate-300'}`} />
                    <span>Chuột phải di chuyển</span>
                </div>
            )}
        </div>
    );
}

export default function ModelViewer(props: {
    modelUrl: string;
    minimal?: boolean;
    autoRotate?: boolean;
    modelRotation?: [number, number, number];
    modelPosition?: [number, number, number];
    modelScale?: number;
    cameraTarget?: [number, number, number];
}) {
    return (
        <WebGLErrorBoundary>
            <ModelViewerInner {...props} />
        </WebGLErrorBoundary>
    );
}
