import React, { useState, useEffect } from 'react';
import { User as UserIcon, Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackText?: string;
  gender?: 'Bride' | 'Groom';
  onClick?: (e: React.MouseEvent<HTMLDivElement | HTMLImageElement>) => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  aspectRatio?: string;
}

export default function SafeImage({
  src,
  alt = 'Image',
  className = 'w-full h-full object-cover',
  fallbackText,
  gender,
  onClick,
  referrerPolicy = 'no-referrer',
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    // Generate clean initial or symbol
    const initial = fallbackText ? fallbackText.trim().charAt(0).toUpperCase() : '';
    const isGroom = gender === 'Groom';
    const isBride = gender === 'Bride';

    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center select-none overflow-hidden ${
          isGroom
            ? 'bg-gradient-to-br from-blue-900 via-neutral-900 to-indigo-950 text-blue-100'
            : isBride
            ? 'bg-gradient-to-br from-rose-900 via-neutral-900 to-purple-950 text-rose-100'
            : 'bg-gradient-to-br from-neutral-800 to-neutral-950 text-neutral-300'
        } ${className}`}
        title={alt}
      >
        <div className="flex flex-col items-center justify-center p-1 text-center font-serif leading-none">
          {initial ? (
            <span className="font-extrabold text-sm sm:text-base tracking-wider">{initial}</span>
          ) : isGroom ? (
            <span className="text-sm sm:text-base">🤵</span>
          ) : isBride ? (
            <span className="text-sm sm:text-base">👰</span>
          ) : (
            <UserIcon className="h-4 w-4 opacity-70" />
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      onClick={onClick}
      referrerPolicy={referrerPolicy}
      className={className}
    />
  );
}
