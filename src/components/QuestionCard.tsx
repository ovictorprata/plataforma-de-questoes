import React, { useState, useEffect } from 'react';
import { Scissors, CheckCircle2, XCircle, Hand, X, Flag, HelpCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '../types/question';
import { MathText } from './MathText';

interface QuestionCardProps {
  question: Question;
  onAnswerLogged: (isCorrect: boolean) => void;
  onReportIssue?: (questionId: string) => void;
}

const HIDE_TIP_EVENT = 'simulado_pro_hide_swipe_tip_event';

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerLogged, onReportIssue }) => {
  if (!question.taxonomia) {
    console.warn("⚠️ Questão sem taxonomia encontrada:", question);
  }
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [struckOptions, setStruckOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showTextoAssociado, setShowTextoAssociado] = useState<boolean>(true);
  
  const [showSwipeTip, setShowSwipeTip] = useState<boolean>(() => {
    return localStorage.getItem('simulado_pro_hide_swipe_tip') !== 'true';
  });

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [swipingKey, setSwipingKey] = useState<string | null>(null);
  const [isSwipingActive, setIsSwipingActive] = useState<boolean>(false);

  const SWIPE_THRESHOLD = 50; 

  useEffect(() => {
    const handleGlobalHideTip = () => setShowSwipeTip(false);
    window.addEventListener(HIDE_TIP_EVENT, handleGlobalHideTip);
    return () => window.removeEventListener(HIDE_TIP_EVENT, handleGlobalHideTip);
  }, []);

  const handleCloseTipOnly = () => setShowSwipeTip(false);

  const handleNeverShowAgain = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      localStorage.setItem('simulado_pro_hide_swipe_tip', 'true');
      setShowSwipeTip(false);
      window.dispatchEvent(new Event(HIDE_TIP_EVENT));
    }
  };

  const handleTouchStart = (key: string, e: React.TouchEvent) => {
    if (isSubmitted) return;
    setTouchStartX(e.touches[0].clientX);
    setSwipingKey(key);
    setIsSwipingActive(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = (key: string) => {
    if (touchStartX !== null && touchCurrentX !== null && swipingKey === key) {
      const diffX = touchCurrentX - touchStartX;
      if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        setIsSwipingActive(true);
        toggleStrike(key); 
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
    setSwipingKey(null);
  };

  const toggleStrike = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSubmitted) return;

    setStruckOptions((prev) => {
      const active = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      if (active.includes(key) && selectedKey === key) {
        setSelectedKey(null);
      }
      return active;
    });
  };

  const handleSubmit = () => {
    if (!selectedKey || isSubmitted) return;
    setIsSubmitted(true);
    onAnswerLogged(selectedKey === question.gabarito);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
      {/* Cabeçalho Taxonomia */}
      <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-400 gap-2 mb-4">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-indigo-600 font-bold">{question.taxonomia.disciplina}</span>
          {question.taxonomia.bloco && <span>• {question.taxonomia.bloco}</span>}
          {question.taxonomia.topico && <span>• {question.taxonomia.topico}</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {question.banca && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{question.banca}</span>}
          {question.orgao && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{question.orgao}</span>}
          <span>{question.ano}</span>
        </div>
      </div>

      {/* Texto Associado */}
      {question.texto_associado && (
        <div className="mb-6 border border-slate-200 rounded-xl bg-slate-50/70 overflow-hidden">
          <button
            onClick={() => setShowTextoAssociado(!showTextoAssociado)}
            className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100/80 transition-colors border-b border-slate-200/60"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>{question.texto_associado.titulo || "Texto de Apoio / Interpretação"}</span>
            </div>
            {showTextoAssociado ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showTextoAssociado && (
            <div className="p-4 text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 max-h-96 overflow-y-auto">
              <p className="whitespace-pre-line">{question.texto_associado.conteudo}</p>
              {question.texto_associado.imagem && (
                <div className="flex justify-center pt-2">
                  <img src={question.texto_associado.imagem} alt="Suporte do texto associado" className="max-h-64 object-contain rounded-lg border border-slate-200" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enunciado Dinâmico */}
      <div className="space-y-4 mb-6">
        {question.suporte_midia?.imagem_inicio && (
          <div className="rounded-lg overflow-hidden border border-slate-100 max-w-full flex justify-center bg-slate-50 p-2">
            <img src={question.suporte_midia.imagem_inicio} alt="Suporte Início" className="max-h-64 object-contain" />
          </div>
        )}

        {question.enunciado_inicio && (
          <p className="text-slate-800 text-base leading-relaxed font-medium whitespace-pre-line">
            <span className="text-indigo-600 font-bold mr-1.5">Q{question.id.split('-').pop()}.</span>
            <MathText text={question.enunciado_inicio} />
          </p>
        )}

        {question.suporte_midia?.imagem_meio && (
          <div className="rounded-lg overflow-hidden border border-slate-100 max-w-full flex justify-center bg-slate-50 p-2">
            <img src={question.suporte_midia.imagem_meio} alt="Suporte Meio" className="max-h-64 object-contain" />
          </div>
        )}

        {question.enunciado_fim && (
          <p className="text-slate-800 text-base leading-relaxed font-medium whitespace-pre-line">
            {!question.enunciado_inicio && (
              <span className="text-indigo-600 font-bold mr-1.5">Q{question.id.split('-').pop()}.</span>
            )}
            <MathText text={question.enunciado_fim} />
          </p>
        )}

        {question.suporte_midia?.imagem_fim && (
          <div className="rounded-lg overflow-hidden border border-slate-100 max-w-full flex justify-center bg-slate-50 p-2">
            <img src={question.suporte_midia.imagem_fim} alt="Suporte Fim" className="max-h-64 object-contain" />
          </div>
        )}
      </div>

      {/* Dica do Swipe Mobile */}
      {showSwipeTip && !isSubmitted && (
        <div className="sm:hidden mb-3 bg-indigo-50/90 border border-indigo-100 rounded-xl p-3 space-y-2 text-xs text-indigo-950">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Hand className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
              <span><strong>Dica:</strong> Arraste a alternativa para o lado para eliminá-la!</span>
            </div>
            <button onClick={handleCloseTipOnly} className="p-1 text-indigo-400 hover:text-indigo-700 rounded-md shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="pt-1.5 border-t border-indigo-100/60 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-indigo-700 font-medium">
              <input type="checkbox" onChange={handleNeverShowAgain} className="w-3.5 h-3.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600" />
              <span>Não mostrar novamente</span>
            </label>
          </div>
        </div>
      )}

      {/* Alternativas */}
      {/* Trecho das alternativas dentro do QuestionCard.tsx */}
{/* Lista de Alternativas */}
<div className="space-y-2 mb-6">
  {question.alternativas.map((alt) => {
    const key = alt.chave;
    const isStruck = struckOptions.includes(key);
    const isSelected = selectedKey === key;
    
    let borderStyle = 'border-slate-200 hover:border-slate-300 bg-white';
    if (isSelected) borderStyle = 'border-indigo-600 bg-indigo-50/40';
    if (isStruck) borderStyle = 'border-slate-100 bg-slate-50/60 opacity-40';
    
    if (isSubmitted) {
      if (key === question.gabarito) {
        borderStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
      } else if (isSelected && key !== question.gabarito) {
        borderStyle = 'border-rose-500 bg-rose-50 text-rose-900';
      }
    }

    const handleSelectOption = () => {
      if (isSubmitted || isSwipingActive) return;

      // Se a alternativa estiver rasurada, des-rasura e seleciona
      if (isStruck) {
        setStruckOptions((prev) => prev.filter((k) => k !== key));
        setSelectedKey(key);
        return;
      }

      setSelectedKey((prev) => (prev === key ? null : key));
    };

    const isThisSwiping = swipingKey === key;
    const swipeOffset = (isThisSwiping && touchStartX !== null && touchCurrentX !== null)
      ? touchCurrentX - touchStartX
      : 0;

    return (
      <div
        key={key}
        onClick={handleSelectOption}
        onTouchStart={(e) => handleTouchStart(key, e)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => handleTouchEnd(key)}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isThisSwiping ? 'none' : 'transform 0.2s ease-out',
        }}
        className={`group p-3.5 rounded-xl border text-slate-700 transition-colors text-sm cursor-pointer relative select-none touch-pan-y ${borderStyle}`}
      >
        {/* Layout Flexbox: empilhado no mobile (flex-col), em linha no desktop (sm:flex-row) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
          
          {/* Container Superior no Mobile / Esquerda no Desktop */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile: Letra Primeiro / Desktop: Tesoura Primeiro */}
            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border shrink-0 transition-colors order-1 sm:order-2 ${
              isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {key}
            </span>

            {!isSubmitted ? (
              <button
                onClick={(e) => toggleStrike(key, e)}
                title="Eliminar alternativa"
                className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0 text-slate-400 order-2 sm:order-1 ${
                  isStruck ? 'text-rose-500 bg-rose-50' : ''
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="w-6 shrink-0 order-2 sm:order-1" />
            )}
          </div>

          {/* Texto / Imagem da Alternativa (Embaixo no mobile, à direita no desktop) */}
          <div className={`flex-1 leading-relaxed ${isStruck ? 'line-through select-none' : ''}`}>
            {alt.texto && <MathText text={alt.texto} />}
            {alt.imagem && (
              <div className="mt-1 max-w-xs">
                <img src={alt.imagem} alt={`Alternativa ${key}`} className="max-h-36 object-contain rounded border border-slate-100 bg-white p-1" />
              </div>
            )}
          </div>

          {/* Feedback de acerto/erro após submeter */}
          {isSubmitted && key === question.gabarito && (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 self-end sm:self-center" />
          )}
          {isSubmitted && isSelected && key !== question.gabarito && (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 self-end sm:self-center" />
          )}
        </div>
      </div>
    );
  })}
</div>

      {/* Explicação */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs md:text-sm text-slate-700 space-y-2"
          >
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Gabarito Comentado (Alternativa {question.gabarito}):</span>
            </div>
            <p className="leading-relaxed pl-6 text-slate-600 whitespace-pre-line">
              {question.explicacao || "Nenhuma explicação cadastrada para esta questão."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé de Ações */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
        <button
          onClick={() => onReportIssue && onReportIssue(question.id)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-rose-50/50"
          title="Reportar erro nesta questão"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reportar problema</span>
        </button>

        <div className="flex items-center justify-end h-10">
          <AnimatePresence mode="wait">
            {selectedKey && !isSubmitted && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={handleSubmit}
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Responder Questão
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};