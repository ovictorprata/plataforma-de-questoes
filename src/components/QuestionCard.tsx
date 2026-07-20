import React, { useState } from 'react';
import { Flag, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '../types/question';

import { QuestionHeader } from './question/QuestionHeader';
import { TextoAssociadoAccordion } from './question/TextoAssociadoAccordion';
import { QuestionMediaSupport } from './question/QuestionMediaSupport';
import { QuestionAlternativeItem } from './question/QuestionAlternativeItem';
import { ImageLightboxModal } from './question/ImageLightboxModal';
import { MathText } from './MathText';

interface QuestionCardProps {
  question: Question;
  onAnswerLogged?: (isCorrect: boolean) => void;
  onReportIssue?: (questionId: string) => void;
  isSimulado?: boolean;
  isSubmitted?: boolean;
  selectedAnswer?: string | null;
  onSelectAnswer?: (letra: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswerLogged,
  onReportIssue,
  isSimulado = false,
  isSubmitted = false,
  selectedAnswer = null,
  onSelectAnswer,
}) => {
  const [localSelectedKey, setLocalSelectedKey] = useState<string | null>(null);
  const [localIsSubmitted, setLocalIsSubmitted] = useState<boolean>(false);
  const [struckOptions, setStruckOptions] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const activeSelectedKey = isSimulado ? selectedAnswer : localSelectedKey;
  const activeIsSubmitted = isSimulado ? isSubmitted : localIsSubmitted;

  const handleSelectOption = (key: string) => {
    if (activeIsSubmitted) return;

    if (isSimulado) {
      if (onSelectAnswer) onSelectAnswer(key);
      return;
    }

    if (struckOptions.includes(key)) {
      setStruckOptions((prev) => prev.filter((k) => k !== key));
      setLocalSelectedKey(key);
      return;
    }

    setLocalSelectedKey((prev) => (prev === key ? null : key));
  };

  const toggleStrike = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeIsSubmitted) return;

    setStruckOptions((prev) => {
      const active = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      if (active.includes(key) && activeSelectedKey === key) {
        if (!isSimulado) setLocalSelectedKey(null);
      }
      return active;
    });
  };

  const handleLocalSubmit = () => {
    if (!localSelectedKey || localIsSubmitted) return;
    setLocalIsSubmitted(true);
    if (onAnswerLogged) {
      onAnswerLogged(localSelectedKey === question.gabarito);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4 relative">
      <QuestionHeader question={question} />

      <TextoAssociadoAccordion textoId={question.texto_associado} />

      {/* Enunciados e Mídias */}
      <div className="space-y-4 mb-6">
        <QuestionMediaSupport
          imageSrc={question.suporte_midia?.imagem_inicio}
          altText="Suporte Início"
          onOpenZoom={setActiveImage}
        />

        {question.enunciado_inicio && (
          <p className="text-slate-800 text-base leading-relaxed font-medium whitespace-pre-line">
            <span className="text-indigo-600 font-bold mr-1.5">{question.id.toUpperCase()}.</span>
            <MathText text={question.enunciado_inicio} variant="enunciado" />
          </p>
        )}

        <QuestionMediaSupport
          imageSrc={question.suporte_midia?.imagem_meio}
          altText="Suporte Meio"
          onOpenZoom={setActiveImage}
        />

        {question.enunciado_fim && (
          <p className="text-slate-800 text-base leading-relaxed font-medium whitespace-pre-line">
            {!question.enunciado_inicio && (
              <span className="text-indigo-600 font-bold mr-1.5">{question.id.toUpperCase()}.</span>
            )}
            <MathText text={question.enunciado_fim} variant="enunciado" />
          </p>
        )}

        <QuestionMediaSupport
          imageSrc={question.suporte_midia?.imagem_fim}
          altText="Suporte Fim"
          onOpenZoom={setActiveImage}
        />
      </div>

      {/* Lista de Alternativas */}
      <div className="space-y-2 mb-6">
        {question.alternativas.map((alt) => (
          <QuestionAlternativeItem
            key={alt.chave}
            chave={alt.chave}
            texto={alt.texto}
            imagem={alt.imagem}
            gabarito={question.gabarito}
            isSelected={activeSelectedKey === alt.chave}
            isStruck={struckOptions.includes(alt.chave)}
            isSubmitted={activeIsSubmitted}
            isSimulado={isSimulado}
            onSelect={() => handleSelectOption(alt.chave)}
            onToggleStrike={(e) => toggleStrike(alt.chave, e)}
            onOpenZoom={setActiveImage}
          />
        ))}
      </div>

      {/* Gabarito Comentado (se submetido) */}
      <AnimatePresence>
        {activeIsSubmitted && (
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
              {question.explicacao || 'Nenhuma explicação cadastrada para esta questão.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé do Card */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
        <button
          type="button"
          onClick={() => onReportIssue && onReportIssue(question.id)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-rose-50/50"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reportar problema</span>
        </button>

        {!isSimulado && localSelectedKey && !localIsSubmitted && (
          <button
            onClick={handleLocalSubmit}
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Responder Questão
          </button>
        )}
      </div>

      <ImageLightboxModal activeImage={activeImage} onClose={() => setActiveImage(null)} />
    </div>
  );
};