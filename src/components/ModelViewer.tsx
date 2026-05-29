import { Canvas, ThreeElements } from '@react-three/fiber';
import { useFBX, OrbitControls, Stage, Environment } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { Loader2, HelpCircle, HardDrive, RefreshCw } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

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

function applyPBRUpgrades(scene: THREE.Group | THREE.Object3D) {
    scene.traverse((child) => {
        if ((child as any).isMesh) {
            const mesh = child as THREE.Mesh;

            // Upgrade materials if they are not already Physical Materials
            if (mesh.material && !(mesh.material as any).isMeshPhysicalMaterial) {
                const oldMat = mesh.material as any;
                mesh.material = new THREE.MeshPhysicalMaterial({
                    map: oldMat.map,
                    color: oldMat.color,
                    normalMap: oldMat.normalMap,
                    roughness: oldMat.roughness || 0.5,
                    metalness: oldMat.metalness || 0.0,
                    name: oldMat.name
                });
            }

            const material = mesh.material as THREE.MeshPhysicalMaterial;

            // Amber materials refinement (Physical PBR)
            if (material.name?.toLowerCase().includes('amber') ||
                material.name?.toLowerCase().includes('vỏ') ||
                mesh.name?.toLowerCase().includes('amber')) {

                material.color.set('#ff9d00');
                material.emissive.set('#4d2600');
                material.emissiveIntensity = 0.3;
                material.roughness = 0.05;
                material.metalness = 0.0;
                material.transmission = 1.0;
                material.ior = 1.55;
                material.thickness = 3.5;
                material.transparent = true;
            } else {
                if (material.color.r < 0.1 && material.color.g < 0.1 && material.color.b < 0.1) {
                    material.color.set('#666666');
                }
            }
        }
    });
}

// Fetch with Progressive ReadableStream
async function fetchWithProgress(url: string, onProgress: (loaded: number, total: number) => void): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Tải mô hình thất bại: HTTP status ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.body?.getReader();
    if (!reader) {
        return await response.arrayBuffer();
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

    return allChunks.buffer;
}

// GLTF model with progressive stream loading & DRACO decoder
function ProgressiveGLTFModel({
    url,
    onProgress,
    onLoaded,
    onError
}: {
    url: string;
    onProgress: (pct: number, loadedMb: string, totalMb: string) => void;
    onLoaded: () => void;
    onError: (err: any) => void;
}) {
    const [scene, setScene] = useState<THREE.Group | null>(null);

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
                gltfLoader.parse(
                    arrayBuffer,
                    '',
                    (gltf) => {
                        if (!isMounted) return;
                        applyPBRUpgrades(gltf.scene);
                        setScene(gltf.scene);
                        onLoaded();
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
        };
    }, [url]);

    if (!scene) return null;
    return <primitive object={scene} />;
}

function FBXModel({ url }: { url: string }) {
    const fbx = useFBX(url);
    useEffect(() => {
        applyPBRUpgrades(fbx);
    }, [fbx, url]);
    return <primitive object={fbx} />;
}

// Loading Overlay Component with beautiful glassmorphism design
function StreamingLoadingOverlay({
    pct,
    loadedMb,
    totalMb,
    loadingStage,
    errorMsg
}: {
    pct: number;
    loadedMb: string;
    totalMb: string;
    loadingStage: 'downloading' | 'decoding' | 'done' | 'error';
    errorMsg?: string;
}) {
    if (loadingStage === 'done') return null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-30 pointer-events-auto select-none transition-all duration-300">
            <div className="max-w-md w-11/12 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg shadow-2xl flex flex-col items-center text-center">
                {loadingStage === 'error' ? (
                    <>
                        <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 animate-bounce">
                            ⚠️
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">Không thể tải mô hình 3D</h4>
                        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                            {errorMsg || "Lỗi mạng hoặc tệp mô hình đã bị di chuyển khỏi Supabase."}
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
                            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                            <div className="text-white font-bold text-sm">
                                {pct >= 0 ? `${pct}%` : "..."}
                            </div>
                        </div>

                        <h4 className="text-white font-semibold tracking-wide text-sm mb-1 uppercase">
                            {loadingStage === 'decoding' ? "🛠️ Đang giải nén mô hình..." : "📥 Đang tải mô hình từ Supabase"}
                        </h4>

                        {/* Progress Bar container */}
                        <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-4 relative">
                            {pct >= 0 ? (
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${pct}%` }}
                                />
                            ) : (
                                <div className="h-full bg-indigo-500 animate-pulse w-full" />
                            )}
                        </div>

                        {/* Sub-status data stats */}
                        <div className="flex items-center gap-6 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                                {loadedMb} MB / {totalMb === "0" ? "???" : totalMb} MB
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                                Streaming
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ModelViewer({ modelUrl }: { modelUrl: string }) {
    const isMobile = window.innerWidth < 768;

    // Loading stages & metrics states
    const [loadingStage, setLoadingStage] = useState<'downloading' | 'decoding' | 'done' | 'error'>('downloading');
    const [pct, setPct] = useState(0);
    const [loadedMb, setLoadedMb] = useState("0");
    const [totalMb, setTotalMb] = useState("0");
    const [errorMsg, setErrorMsg] = useState("");

    const isFBX = modelUrl.toLowerCase().endsWith('.fbx');

    // Reset state on model url change
    useEffect(() => {
        if (isFBX) {
            setLoadingStage('done');
        } else {
            setLoadingStage('downloading');
            setPct(0);
            setLoadedMb("0");
            setTotalMb("0");
        }
    }, [modelUrl, isFBX]);

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Real-time Streaming Download Status Layer */}
            {!isFBX && (
                <StreamingLoadingOverlay
                    pct={pct}
                    loadedMb={loadedMb}
                    totalMb={totalMb}
                    loadingStage={loadingStage}
                    errorMsg={errorMsg}
                />
            )}

            <Suspense fallback={null}>
                <Canvas
                    frameloop="demand"
                    performance={{ min: isMobile ? 0.3 : 0.5 }}
                    dpr={isMobile ? [1, 1] : [1, 1.5]}
                    camera={{ position: [0, 0, 4], fov: 45 }}
                    gl={{
                        antialias: !isMobile,
                        powerPreference: "high-performance",
                        toneMapping: 4,
                    }}
                    onCreated={({ gl }) => {
                        gl.toneMappingExposure = 0.95;
                    }}
                >
                    <Environment preset="studio" />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 10]} intensity={0.6} />

                    {!isMobile && (
                        <>
                            <directionalLight position={[-10, 5, -10]} intensity={0.6} color="#ffffff" />
                            <pointLight position={[0, -5, 5]} intensity={0.4} color="#ffffff" />
                        </>
                    )}

                    <Stage environment={null} intensity={0.4} shadows={false}>
                        {isFBX ? (
                            <FBXModel url={modelUrl} />
                        ) : (
                            <ProgressiveGLTFModel
                                url={modelUrl}
                                onProgress={(percent, loaded, total) => {
                                    setPct(percent);
                                    setLoadedMb(loaded);
                                    setTotalMb(total);
                                    if (percent === 100) {
                                        setLoadingStage('decoding');
                                    }
                                }}
                                onLoaded={() => {
                                    setLoadingStage('done');
                                }}
                                onError={(err) => {
                                    setErrorMsg(err.message || "Không thể tải hoặc giải nén mô hình GLTF.");
                                    setLoadingStage('error');
                                }}
                            />
                        )}
                    </Stage>

                    <OrbitControls makeDefault enableZoom={true} enablePan={true} zoomSpeed={1.2} />
                </Canvas>
            </Suspense>

            {/* Premium Interaction Help Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3.5 px-4.5 py-2.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-white/95 uppercase tracking-widest border border-white/10 pointer-events-none transition-all duration-300 hover:bg-black/85">
                <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Xoay chuột</span>
                <div className="w-px h-3.5 bg-white/20" />
                <span>Cuộn để Zoom</span>
                <div className="w-px h-3.5 bg-white/20" />
                <span>Kéo để Di chuyển</span>
            </div>
        </div>
    );
}
