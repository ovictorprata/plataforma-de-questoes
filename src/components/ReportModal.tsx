import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
}

// ⚠️ Substitua com os dados do seu Google Forms
const GOOGLE_FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/SEU_ID_DO_FORM_AQUI/formResponse';
const ENTRY_QUESTION_ID = 'entry.123456789'; // Campo do ID da questão
const ENTRY_REASON = 'entry.987654321'; // Campo do Motivo/Descrição

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  questionId,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepara os dados para enviar no formato de formulário HTML
    const formData = new URLSearchParams();
    formData.append(ENTRY_QUESTION_ID, questionId);
    formData.append(ENTRY_REASON, reason);

    try {
      // 🚀 Envio silencioso em background
      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors', // Essencial para ignorar o bloqueio de CORS do Google Forms
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReason('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-xl relative space-y-4">
        {/* Cabeçalho */}
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
            <p className="text-sm font-bold text-slate-800">
              Relato enviado com sucesso!
            </p>
            <p className="text-xs text-slate-500">
              Obrigado por ajudar a melhorar a plataforma.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                ID da Questão
              </label>
              <input
                type="text"
                value={questionId}
                readOnly
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 font-bold outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Qual é o erro nesta questão?
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Gabarito incorreto, erro de digitação no enunciado, formatação da fórmula..."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
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
