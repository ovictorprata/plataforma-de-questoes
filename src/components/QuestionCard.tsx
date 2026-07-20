import React, { useState, useEffect } from 'react';
import { Flag, HelpCircle, X, Send, AlertTriangle, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '../types/question';

import { QuestionHeader } from './question/QuestionHeader';
import { TextoAssociadoAccordion } from './question/TextoAssociadoAccordion';
import { QuestionMediaSupport } from './question/QuestionMediaSupport';
import { QuestionAlternativeItem } from './question/QuestionAlternativeItem';
import { ImageLightboxModal } from './question/ImageLightboxModal';
import { MathText } from './MathText';

// 🚀 Dados reais do seu Google Forms
const REPORT_FORM_ACTION_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdCCPEONgifuMsDuKoW2Jy3Dm3wPqQVHMhBU-YJLDwsF0Oamg/formResponse';
const ENTRY_TIPO_PROBLEMA = 'entry.902632617';   // Qual é o problema?
const ENTRY_CODIGO_QUESTAO = 'entry.510910820';  // Qual é o código da questão?
const ENTRY_DETALHE_PROBLEMA = 'entry.607703748'; // Detalhe o problema:
const ANSWERS_FORM_ACTION_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSf9liLj43-pirNjAqSTmsU6HQclOuj9sH4mW5I7LFoI6CSSzQ/formResponse';
const ENTRY_ID_PERGUNTA = 'entry.1117922377'; // ID Pergunta
const ENTRY_RESPOSTA = 'entry.821502335';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
}

const OPCOES_PROBLEMA = [
  'Alternativa errada',
  'Enunciado errado',
  'Disciplina ou assunto errado',
  'Questão anulada',
  'Questão repetida',
  'Erro de digitação/formatação no enunciado',
];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, questionId }) => {
  const [tipoProblema, setTipoProblema] = useState<string>('');
  const [detalhe, setDetalhe] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoProblema || !detalhe.trim()) return;

    setIsSubmitting(true);

    const formData = new URLSearchParams();
    formData.append(ENTRY_TIPO_PROBLEMA, tipoProblema);
    formData.append(ENTRY_CODIGO_QUESTAO, questionId);
    formData.append(ENTRY_DETALHE_PROBLEMA, detalhe);

    try {
      await fetch(REPORT_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setTipoProblema('');
        setDetalhe('');
        onClose();
      }, 1800);
    } catch (error) {
      console.error('Erro ao enviar o relato:', error);
      alert('Houve um erro ao enviar seu relato. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-5 shadow-xl relative space-y-4 cursor-default"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Reportar Problema</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-slate-800">Relato enviado com sucesso!</p>
            <p className="text-xs text-slate-500">Obrigado por ajudar a melhorar o banco de questões.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" value={questionId} />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Qual é o problema? <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {OPCOES_PROBLEMA.map((opcao) => (
                  <label
                    key={opcao}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      tipoProblema === opcao
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoProblema"
                      value={opcao}
                      checked={tipoProblema === opcao}
                      onChange={(e) => setTipoProblema(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      required
                    />
                    <span>{opcao}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detalhe o problema: <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={detalhe}
                onChange={(e) => setDetalhe(e.target.value)}
                placeholder="Descreva o que encontrou de errado para podermos corrigir..."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !tipoProblema || !detalhe.trim()}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Relato'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface QuestionCardProps {
  question: Question;
  // 🎯 Assinatura atualizada: (isCorrect, isAnulada, questionId, bloco)
  onAnswerLogged?: (isCorrect: boolean, isAnulada?: boolean, questionId?: string, bloco?: string) => void;
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
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // 🎯 Estado para controlar o aviso visual do mobile
  const [hideSwipeHint, setHideSwipeHint] = useState<boolean>(() => {
    return localStorage.getItem('hide_swipe_hint') === 'true';
  });

  // 🎯 Escuta mudanças de evento para ocultar em todas as questões da tela simultaneamente
  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.getItem('hide_swipe_hint') === 'true') {
        setHideSwipeHint(true);
      }
    };

    window.addEventListener('swipe_hint_dismissed', handleStorageChange);
    return () => {
      window.removeEventListener('swipe_hint_dismissed', handleStorageChange);
    };
  }, []);

  const activeSelectedKey = isSimulado ? selectedAnswer : localSelectedKey;
  const activeIsSubmitted = isSimulado ? isSubmitted : localIsSubmitted;

  const idQuestaoPuro = question.id;

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

  const handleLocalSubmit = async () => {
    if (!localSelectedKey || localIsSubmitted) return;

    // 1. Atualiza o estado da tela imediatamente para o usuário
    setLocalIsSubmitted(true);

    // 🎯 Verifica se a questão é anulada pelo gabarito 'N'
    const isAnulada = question.gabarito?.trim().toUpperCase() === 'N';

    if (onAnswerLogged) {
      onAnswerLogged(
        localSelectedKey === question.gabarito,
        isAnulada,
        idQuestaoPuro,
        question.taxonomia?.bloco || 'Geral'
      );
    }

    // 2. Prepara os dados no padrão URLSearchParams
    const formData = new URLSearchParams();
    formData.append(ENTRY_ID_PERGUNTA, idQuestaoPuro);
    formData.append(ENTRY_RESPOSTA, localSelectedKey.toUpperCase());

    // 3. Envia os dados de forma assíncrona para o Google Forms
    try {
      await fetch(ANSWERS_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
    } catch (error) {
      console.error('Erro ao registrar a resposta no Google Forms:', error);
    }
  };

  const handleDismissSwipeHint = () => {
    localStorage.setItem('hide_swipe_hint', 'true');
    setHideSwipeHint(true);
    window.dispatchEvent(new Event('swipe_hint_dismissed'));
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-4 relative">
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

      {/* 💡 Banner Explicativo do Mobile (Alinhado à esquerda: Lâmpada no topo + Texto + Checkbox) */}
      {!hideSwipeHint && !activeIsSubmitted && (
        <div className="sm:hidden flex flex-col items-start text-left gap-2 p-3.5 mb-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 shadow-xs">
          {/* Ícone da Lâmpada no topo à esquerda */}
          <div className="p-1.5 bg-amber-100/80 rounded-full text-amber-600">
            <Lightbulb className="w-4 h-4" />
          </div>

          {/* Mensagem alinhada à esquerda */}
          <p className="font-medium leading-tight text-amber-950">
            Deslize a alternativa para o lado para riscá-la.
          </p>

          {/* Checkbox "Não mostrar novamente" alinhado à esquerda na base */}
          <div className="w-full pt-2 mt-0.5 border-t border-amber-200/60 flex items-center justify-start">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[11px] text-amber-800 font-medium select-none">
              <input
                type="checkbox"
                onChange={handleDismissSwipeHint}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-amber-300 accent-amber-600 cursor-pointer"
              />
              <span>Não mostrar novamente</span>
            </label>
          </div>
        </div>
      )}

      {/* ⚠️ Alerta Visual de Questão Anulada (Exibido apenas se o gabarito for 'N') */}
     {question.gabarito?.toUpperCase() === 'N' && (
      <div className="flex items-center gap-2.5 p-3 mb-4 bg-rose-50/90 border border-rose-200/90 rounded-xl text-rose-900 text-xs font-semibold shadow-xs">
        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>Esta questão foi <strong>ANULADA</strong> e não possui alternativa correta.</span>
      </div>
    )}

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
              <span>
                Gabarito Comentado{' '}
                {question.gabarito?.toUpperCase() === 'N'
                  ? '(Questão Anulada)'
                  : `(Alternativa ${question.gabarito})`}
                :
              </span>
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
          onClick={() => {
            if (onReportIssue) onReportIssue(idQuestaoPuro);
            setIsReportModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-rose-50/50"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reportar problema</span>
        </button>

        {!isSimulado && localSelectedKey && !localIsSubmitted && (
          <button
            onClick={handleLocalSubmit}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs"
          >
            Responder Questão
          </button>
        )}
      </div>

      {/* Modal Zoom da Imagem */}
      <ImageLightboxModal activeImage={activeImage} onClose={() => setActiveImage(null)} />

      {/* Modal Silencioso de Reportar Problema via Google Forms */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        questionId={idQuestaoPuro}
      />
    </div>
  );
};