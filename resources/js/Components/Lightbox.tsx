import { useEffect } from 'react';

interface LightboxProps {
    src: string | null;
    alt: string;
    onClose: () => void;
}

export default function Lightbox({ src, alt, onClose }: LightboxProps) {
    useEffect(() => {
        if (!src) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [src, onClose]);

    if (!src) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
                aria-label="Close"
            >
                <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
