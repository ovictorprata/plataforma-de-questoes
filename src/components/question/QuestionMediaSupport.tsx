import React from 'react';
import { ZoomIn } from 'lucide-react';

interface QuestionMediaSupportProps {
  imageSrc?: string | null;
  altText: string;
  onOpenZoom: (src: string) => void;
}

export const QuestionMediaSupport: React.FC<QuestionMediaSupportProps> = ({
  imageSrc,
  altText,
  onOpenZoom,
}) => {
  if (!imageSrc) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-slate-100 max-w-full flex justify-center bg-slate-50 p-2">
      <div
        className="relative group cursor-zoom-in"
        onClick={() => onOpenZoom(imageSrc)}
      >
        <img
          src={imageSrc}
          alt={altText}
          className="max-h-64 object-contain hover:opacity-90 transition-opacity"
        />
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
          <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      </div>
    </div>
  );
};
