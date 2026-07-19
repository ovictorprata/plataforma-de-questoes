import React, { useState } from 'react';
import { Scissors, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionCardProps {
  question: {
    id: string;
    bloco: string;
    enunciado: string;
    alternativas: Record<string, string>;
    gabarito: string;
    ano: number;
    imagem_antes: string | null;
    imagem_depois: string | null;
  };
  onAnswerLogged: (isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerLogged }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [struckOptions, setStruckOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const toggleStrike = (key: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the option item container automatically
    if (isSubmitted) return;
    
    setStruckOptions((prev) => {
      const active = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      if (active.includes(key) && selectedKey === key) {
        setSelectedKey(null); // Reset selection safely if it becomes disabled via scissors
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
      {/* Meta context header layout */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        <span>{question.bloco}</span>
        <span>Ano: {question.ano}</span>
      </div>

      {/* Conditional Media Rendering Slot: Imagem Antes */}
      {question.imagem_antes && (
        <div className="mb-4 rounded-lg overflow-hidden border border-slate-100 max-w-full flex justify-center bg-slate-50 p-2">
          <img src={question.imagem_antes} alt="Suporte Enunciado" className="max-h-64 object-contain" />
        </div>
      )}

      {/* Main Statement Content Text */}
      <p className="text-slate-800 text-base leading-relaxed font-medium mb-6 whitespace-pre-line">
        <span className="text-indigo-600 font-bold mr-1">Q{question.id}.</span> {question.enunciado}
      </p>

      {/* Conditional Media Rendering Slot: Imagem Depois */}
      {question.imagem_depois && (
        <div className="mb-6 rounded-lg overflow-hidden border border-slate-100 max-w-full flex justify-center bg-slate-50 p-2">
          <img src={question.imagem_depois} alt="Suporte Adicional" className="max-h-64 object-contain" />
        </div>
      )}

      {/* Alternative Selection Array Stack */}
      <div className="space-y-2 mb-6">
        {Object.entries(question.alternativas).map(([key, text]) => {
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

            return (
                <div
                key={key}
                onClick={() => !isStruck && !isSubmitted && setSelectedKey(key)}
                className={`group flex items-start gap-3 p-3.5 rounded-xl border text-slate-700 transition-all text-sm cursor-pointer relative ${borderStyle}`}
                >
                {/* 1. A Tesoura -> Agora na extrema esquerda e SEMPRE visível */}
                {!isSubmitted ? (
                    <button
                    onClick={(e) => toggleStrike(key, e)}
                    title="Eliminar alternativa"
                    className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0 text-slate-400 ${
                        isStruck ? 'text-rose-500 bg-rose-50' : ''
                    }`}
                    >
                    <Scissors className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    /* Espaçador invisível para manter o alinhamento perfeito após responder */
                    <div className="w-6.5 h-6.5 shrink-0" />
                )}

                {/* 2. Indicador da Letra (A, B, C...) -> Agora fica depois da tesoura */}
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border shrink-0 transition-colors ${
                    isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                    {key}
                </span>

                {/* 3. Texto da Alternativa */}
                <span className={`pt-0.5 flex-1 ${isStruck ? 'line-through select-none' : ''}`}>
                    {text}
                </span>

                {/* 4. Ícones de Correção (Certo/Errado) -> Na ponta direita */}
                {isSubmitted && key === question.gabarito && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 self-center" />
                )}
                {isSubmitted && isSelected && key !== question.gabarito && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 self-center" />
                )}
                </div>
            );
            })}
      </div>

      {/* Action Footer Drawer */}
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
  );
};