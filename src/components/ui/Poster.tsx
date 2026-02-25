"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface PosterProps {
    src?: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const SIZES = {
    sm: 'w-24 h-24 min-w-[96px]',
    md: 'w-32 h-32 min-w-[128px]',
    lg: 'w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 min-w-[288px]',
};

/** Generates a deterministic gradient based on the alt text for a placeholder */
function generatePlaceholderGradient(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 180) % 360;
    // Enhanced cyberpunk palette (deeper colors, sharper contrast)
    return `linear-gradient(135deg, hsl(${h1}, 80%, 15%), hsl(${h2}, 80%, 10%))`;
}

export const Poster = ({ src, alt, size = 'md', className }: PosterProps) => {
    const [imgError, setImgError] = useState(false);
    const showPlaceholder = !src || imgError;

    return (
        <div
            className={cn(
                SIZES[size],
                "relative group overflow-hidden border border-primary/20 bg-background",
                // Cyberpunk chamfer effect via clip-path
                "clip-corner",
                className
            )}
            style={{
                boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 40px rgba(180,245,0,0.05)',
            }}
        >
            {/* Glitch Overlay Effect */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(transparent_0%,rgba(180,245,0,0.05)_50%,transparent_100%)] bg-[size:100%_4px] animate-scanline" />

            {showPlaceholder ? (
                <div
                    className="w-full h-full flex flex-col items-center justify-center gap-3 relative"
                    style={{ background: generatePlaceholderGradient(alt) }}
                    aria-label={alt}
                    role="img"
                >
                    {/* Decorative Corner Accents */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/40" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/40" />

                    <div className="relative">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 translate-y-2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M15 8l-5 5 5 5" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[0.5rem] font-mono text-primary tracking-[0.3em] uppercase opacity-60">
                            PROPOSAL
                        </div>
                    </div>

                    <div className="font-mono text-[0.55rem] text-muted tracking-widest uppercase mt-4 max-w-[80%] text-center px-4 leading-relaxed">
                        No visual media linked to CID
                    </div>
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    loading="lazy"
                />
            )}

            {/* Boundary Frame */}
            <div className="absolute inset-0 border border-primary/10 pointer-events-none" />
        </div>
    );
};
