import { useState } from 'react';

interface PosterProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
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
  const h2 = (h1 + 120) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,35%), hsl(${h2},70%,25%))`;
}

export default function Poster({ src, alt, size = 'md' }: PosterProps) {
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !src || imgError;

  return (
    <div
      className={`${SIZES[size]} rounded-2xl overflow-hidden shrink-0 relative`}
      style={{
        border: '1px solid rgba(168,85,247,0.25)',
        boxShadow: '0 0 24px rgba(168,85,247,0.15), 0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {showPlaceholder ? (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-2"
          style={{ background: generatePlaceholderGradient(alt) }}
          aria-label={alt}
          role="img"
        >
          {/* Minimal icon placeholder */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-[0.6rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Event
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}
