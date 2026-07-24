import React, { useState } from 'react';
import { Scissors, CheckCircle2, XCircle, ZoomIn } from 'lucide-react';
import { MathText } from '../MathText';

interface QuestionAlternativeItemProps {
  chave: string;
  texto?: string | null;
  imagem?: string | null;
  gabarito: string;
  isSelected: boolean;
  isStruck: boolean;
  isSubmitted: boolean;
  isSimulado?: boolean;
  onSelect: () => void;
  onToggleStrike: (e?: React.MouseEvent) => void;
  onOpenZoom: (src: string) => void;
}

export const QuestionAlternativeItem: React.FC<
  QuestionAlternativeItemProps
> = ({
  chave,
  texto,
  imagem,
  gabarito,
  isSelected,
  isStruck,
  isSubmitted,
  isSimulado,
  onSelect,
  onToggleStrike,
  onOpenZoom,
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);

  const SWIPE_THRESHOLD = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSubmitted) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    setTouchCurrentX(e.touches[0].clientX);
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (
      touchStartX !== null &&
      touchCurrentX !== null &&
      touchStartY !== null &&
      touchCurrentY !== null
    ) {
      const diffX = touchCurrentX - touchStartX;
      const diffY = touchCurrentY - touchStartY;

      if (
        Math.abs(diffX) > Math.abs(diffY) &&
        Math.abs(diffX) > SWIPE_THRESHOLD
      ) {
        onToggleStrike();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchCurrentX(null);
    setTouchCurrentY(null);
  };

  const isHorizontalSwipe =
    touchStartX !== null &&
    touchCurrentX !== null &&
    touchStartY !== null &&
    touchCurrentY !== null &&
    Math.abs(touchCurrentX - touchStartX) >
      Math.abs(touchCurrentY - touchStartY);

  const swipeOffset = isHorizontalSwipe ? touchCurrentX - touchStartX : 0;

  let borderStyle = 'border-slate-200 hover:border-slate-300 bg-white';
  if (isSelected) borderStyle = 'border-indigo-600 bg-indigo-50/40';
  if (isStruck) borderStyle = 'border-slate-100 bg-slate-50/60 opacity-40';

  const isAnulada = gabarito?.toUpperCase() === 'N';
  const showFeedback = (!isSimulado || isSubmitted) && !isAnulada; // 🎯 Se for anulada, não mostra feedback verde/vermelho

  if (showFeedback && isSubmitted) {
    if (chave === gabarito) {
      borderStyle =
        'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
    } else if (isSelected && chave !== gabarito) {
      borderStyle = 'border-rose-500 bg-rose-50 text-rose-900';
    }
  }

  return (
    <div
      onClick={onSelect}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: touchStartX !== null ? 'none' : 'transform 0.2s ease-out',
      }}
      className={`group p-3.5 rounded-xl border text-slate-700 transition-colors text-sm cursor-pointer relative select-none touch-pan-y ${borderStyle}`}
    >
      <div className="flex items-center gap-3">
        {/* Mobile: Apenas o badge da letra (A, B, C...) */}
        <span
          className={`sm:hidden w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border shrink-0 transition-colors ${
            isSelected
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {chave}
        </span>

        {/* Desktop: Tesoura + Badge (exibido apenas a partir da tela sm) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {!isSubmitted ? (
            <button
              type="button"
              onClick={onToggleStrike}
              title="Eliminar alternativa"
              className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0 text-slate-400 ${
                isStruck ? 'text-rose-500 bg-rose-50' : ''
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="w-6 shrink-0" />
          )}

          <span
            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border shrink-0 transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {chave}
          </span>
        </div>

        {/* Texto / Imagem */}
        <div
          className={`flex-1 leading-relaxed ${isStruck ? 'line-through select-none' : ''}`}
        >
          {texto && <MathText text={texto} variant="alternativa" />}
          {imagem && (
            <div className="mt-1 max-w-xs">
              <div
                className="relative group cursor-zoom-in"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenZoom(imagem);
                }}
              >
                <img
                  src={imagem}
                  alt={`Alternativa ${chave}`}
                  className="max-h-36 object-contain rounded border border-slate-100 bg-white p-1 hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                  <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback visual de certo/errado */}
        {showFeedback && isSubmitted && chave === gabarito && (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        )}
        {showFeedback && isSubmitted && isSelected && chave !== gabarito && (
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
        )}
      </div>
    </div>
  );
};
