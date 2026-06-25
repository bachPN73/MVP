import { ReactNode, useEffect, useState, useCallback } from 'react';

const BASE_W = 1920;
const BASE_H = 1080;
const MOBILE_BP = 1024;

interface ScaledCanvasProps {
    children: ReactNode;
    className?: string;
}

export function ScaledCanvas({ children, className = '' }: ScaledCanvasProps) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false);

    const compute = useCallback(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (vw < MOBILE_BP) {
            setIsMobile(true);
            return;
        }
        setIsMobile(false);
        const s = Math.min(vw / BASE_W, vh / BASE_H);
        const x = Math.max(0, (vw - BASE_W * s) / 2);
        const y = Math.max(0, (vh - BASE_H * s) / 2);
        setScale(s);
        setOffset({ x, y });
    }, []);

    useEffect(() => {
        compute();
        window.addEventListener('resize', compute);
        return () => window.removeEventListener('resize', compute);
    }, [compute]);

    if (isMobile) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 overflow-hidden" style={{ background: 'transparent' }}>
            <div
                style={{
                    width: BASE_W,
                    height: BASE_H,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    left: offset.x,
                    top: offset.y,
                    overflow: 'hidden',
                }}
                className={className}
            >
                {children}
            </div>
        </div>
    );
}
