import { Canvas, ThreeElements } from '@react-three/fiber';
import { useGLTF, useFBX, OrbitControls, Stage, Environment } from '@react-three/drei';
import { Suspense, useEffect, useMemo } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import * as THREE from 'three';

// Declare R3F elements for TypeScript
declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements extends ThreeElements { }
        }
    }
}

function Model({ url }: { url: string }) {
    const isFbx = url.toLowerCase().endsWith('.fbx');
    const gltf = useGLTF(isFbx ? '' : url, undefined, undefined, (loader) => {
        // Optional: setup loader
    });
    const fbx = useFBX(isFbx ? url : '');

    const scene = useMemo(() => {
        if (isFbx) return fbx;
        return gltf.scene;
    }, [isFbx, fbx, gltf]);

    useEffect(() => {
        if (!scene) return;
        
        scene.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;

                // Nâng cấp vật liệu nếu cần
                if (mesh.material && !(mesh.material as any).isMeshPhysicalMaterial) {
                    const oldMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
                    const oldMatAny = oldMat as any;
                    
                    mesh.material = new THREE.MeshPhysicalMaterial({
                        map: oldMatAny.map,
                        color: oldMatAny.color,
                        normalMap: oldMatAny.normalMap,
                        roughness: oldMatAny.roughness || 0.5,
                        metalness: oldMatAny.metalness || 0.5,
                        name: oldMatAny.name
                    });
                }

                const material = mesh.material as THREE.MeshPhysicalMaterial;

                // Tinh chỉnh vật liệu hổ phách chuyên sâu (Physical PBR)
                if (material.name?.toLowerCase().includes('amber') ||
                    material.name?.toLowerCase().includes('vỏ') ||
                    mesh.name?.toLowerCase().includes('amber')) {

                    material.color.set('#ff9d00'); // Màu cam mật ong rực rỡ
                    material.emissive.set('#4d2600');
                    material.emissiveIntensity = 0.3;
                    material.roughness = 0.05; // Độ bóng bề mặt cao
                    material.metalness = 0.0;

                    // Transmission + Thickness (Physical Material)
                    material.transmission = 1.0; // Độ xuyên thấu ánh sáng tối đa
                    material.ior = 1.55; // Chỉ số khúc xạ chuẩn hổ phách
                    material.thickness = 3.5; // Tạo độ dày để ánh sáng bẻ cong (refraction)
                    material.transparent = true;
                } else {
                    // Đảm bảo các phần khác không bị tối
                    if (material.color && material.color.r < 0.1 && material.color.g < 0.1 && material.color.b < 0.1) {
                        material.color.set('#666666');
                    }
                }
            }
        });
    }, [scene]);

    if (!scene) return null;

    return <primitive object={scene} />;
}

function Loader() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/50 backdrop-blur-sm z-10">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Đang tải mô hình 3D...</p>
        </div>
    );
}

export default function ModelViewer({ modelUrl }: { modelUrl: string }) {
    const is3DFile = useMemo(() => {
        const url = modelUrl.toLowerCase();
        return url.endsWith('.glb') || url.endsWith('.gltf') || url.endsWith('.fbx');
    }, [modelUrl]);

    if (!modelUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">
                <p>Không có đường dẫn mô hình</p>
            </div>
        );
    }

    if (!is3DFile) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 p-6 text-center">
                <BookOpen className="w-12 h-12 text-amber-400 mb-3" />
                <h3 className="text-amber-800 font-semibold mb-1">Định dạng không hỗ trợ 3D</h3>
                <p className="text-amber-600 text-sm">
                    Tệp tin này không phải là mô hình 3D (.glb, .gltf, .fbx).
                </p>
                <a 
                    href={modelUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 text-xs text-primary hover:underline"
                >
                    Xem tệp gốc
                </a>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden border border-border shadow-2xl">
            <Suspense fallback={<Loader />}>
                <Canvas
                    frameloop="demand"
                    performance={{ min: 0.5 }}
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 0, 4], fov: 45 }}
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        toneMapping: 4, // ACESFilmicToneMapping
                    }}
                    onCreated={({ gl }) => {
                        gl.toneMappingExposure = 1.5; // Cân bằng phơi sáng HDR
                    }}
                    onError={(e) => {
                        console.error("R3F Canvas Error:", e);
                    }}
                >
                    <color attach="background" args={['#ffffff']} />

                    {/* HDR Environment - Studio preset cung cấp phản chiếu HDR sắc nét */}
                    <Environment preset="studio" />

                    {/* Hệ thống ánh sáng phối hợp */}
                    <ambientLight intensity={1.5} />

                    {/* Key Light phía trước */}
                    <directionalLight position={[10, 10, 10]} intensity={1.2} />

                    {/* Back Light (Rim Light) phía sau model - Tạo độ tách khối và sáng viền */}
                    <directionalLight position={[-10, 5, -10]} intensity={2.5} color="#ffffff" />

                    {/* Fill Light bổ trợ vùng dưới */}
                    <pointLight position={[0, -5, 5]} intensity={0.5} color="#ffffff" />

                    <Stage environment={null} intensity={0.8} shadows={false}>
                        <Model url={modelUrl} />
                    </Stage>

                    <OrbitControls makeDefault enableZoom={true} enablePan={true} zoomSpeed={1.2} />
                </Canvas>
            </Suspense>

            {/* Interaction Help Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-[10px] text-white/70 uppercase tracking-widest border border-white/10 pointer-events-none">
                <span>Xoay chuột</span>
                <div className="w-px h-3 bg-white/20" />
                <span>Cuộn để Zoom</span>
                <div className="w-px h-3 bg-white/20" />
                <span>Kéo để Di chuyển</span>
            </div>
        </div >
    );
}
