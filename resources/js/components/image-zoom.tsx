import { Minus, Plus, RotateCw } from 'lucide-react';
import { useRef, useState } from 'react';

interface InteractiveImageProps {
    src: string;
    alt: string;
    maxHeight?: string;
    maxWidth?: string;
    minZoom?: number;
    maxZoom?: number;
}

export default function InteractiveImage({
    src,
    alt,
    maxHeight = '12rem',
    maxWidth = '20rem',
    minZoom = 1,
    maxZoom = 5,
}: InteractiveImageProps) {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, maxZoom));
    const handleZoomOut = () =>
        setZoom((prev) => Math.max(prev - 0.5, minZoom));
    const handleReset = () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setStartDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        const x = e.clientX - startDrag.x;
        const y = e.clientY - startDrag.y;
        setOffset({ x, y });
    };

    const handleMouseUp = () => setDragging(false);
    const handleMouseLeave = () => setDragging(false);

    return (
        <div className="space-y-2">
            {/* Controls */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleZoomIn}
                    className="rounded bg-secondary p-2 hover:bg-accent"
                >
                    <Plus size={20} />
                </button>
                <button
                    type="button"
                    onClick={handleZoomOut}
                    className="rounded bg-secondary p-2 hover:bg-accent"
                >
                    <Minus size={20} />
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                >
                    <RotateCw size={20} />
                </button>
            </div>

            {/* Image Container */}
            <div
                ref={containerRef}
                className={`relative cursor-grab overflow-hidden rounded border border-border`}
                style={{ maxHeight, maxWidth }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={src}
                    alt={alt}
                    className="transition-transform duration-200"
                    style={{
                        transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                        transformOrigin: 'center',
                        cursor: dragging ? 'grabbing' : 'grab',
                    }}
                />
            </div>
        </div>
    );
}
