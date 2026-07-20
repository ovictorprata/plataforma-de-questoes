import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { getTextoAssociadoById } from '../../utils/loadTextoAssociado';

interface TextoAssociadoAccordionProps {
  textoId?: string | null;
}

export const TextoAssociadoAccordion: React.FC<TextoAssociadoAccordionProps> = ({ textoId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const textoApoio = getTextoAssociadoById(textoId);

  if (!textoApoio) return null;

  return (
    <div className="mb-6 border border-slate-200 rounded-xl bg-slate-50/70 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="truncate">{textoApoio.titulo || 'Ler Texto de Apoio'}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 max-h-80 overflow-y-auto border-t border-slate-200/60 bg-white">
          <p className="whitespace-pre-line">{textoApoio.conteudo}</p>
          {textoApoio.fonte && (
            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
              {textoApoio.fonte}
            </p>
          )}
        </div>
      )}
    </div>
  );
};