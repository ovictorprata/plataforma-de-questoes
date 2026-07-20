import React, { useMemo } from 'react';
import { Award, BookOpen, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import type { Question } from '../types/question';
import type { QuestionWithSource } from '../App';

interface SimuladoResultSummaryProps {
  questions: (Question | QuestionWithSource)[];
  answers: Record<string, string>;
  tempoTotalSegundos?: number; // 👈 Novo tempo gasto em segundos
}

export const SimuladoResultSummary: React.FC<SimuladoResultSummaryProps> = ({
  questions,
  answers,
  tempoTotalSegundos = 0,
}) => {
  const metrics = useMemo(() => {
    let totalAcertos = 0;
    let totalErros = 0;
    let totalEmBranco = 0;

    const blocosMap: Record<string, { acertos: number; total: number }> = {};

    questions.forEach((q) => {
      const origem = 'origemJson' in q ? (q as QuestionWithSource).origemJson : 'q';
      const idComposto = `${origem}-${q.id}`;
      const respostaUsuario = answers[idComposto];
      const bloco = q.taxonomia?.disciplina || q.taxonomia?.bloco || 'Geral';

      if (!blocosMap[bloco]) {
        blocosMap[bloco] = { acertos: 0, total: 0 };
      }
      blocosMap[bloco].total += 1;

      if (!respostaUsuario) {
        totalEmBranco += 1;
      } else if (respostaUsuario === q.gabarito) {
        totalAcertos += 1;
        blocosMap[bloco].acertos += 1;
      } else {
        totalErros += 1;
      }
    });

    const totalQuestions = questions.length;
    const taxaAcertoGeral =
      totalQuestions > 0 ? Math.round((totalAcertos / totalQuestions) * 100) : 0;

    // Cálculo do tempo médio por questão
    const tempoMedioPorQuestao =
      totalQuestions > 0 ? Math.round(tempoTotalSegundos / totalQuestions) : 0;

    const formatSegundos = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      if (m > 0) return `${m}min ${s}s`;
      return `${s}s`;
    };

    return {
      totalQuestions,
      totalAcertos,
      totalErros,
      totalEmBranco,
      taxaAcertoGeral,
      tempoMedioFormatado: formatSegundos(tempoMedioPorQuestao),
      blocos: Object.entries(blocosMap).map(([nome, dados]) => ({
        nome,
        acertos: dados.acertos,
        total: dados.total,
        porcentagem: Math.round((dados.acertos / dados.total) * 100),
      })),
    };
  }, [questions, answers, tempoTotalSegundos]);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const acertosPercent =
    metrics.totalQuestions > 0 ? metrics.totalAcertos / metrics.totalQuestions : 0;
  const errosPercent =
    metrics.totalQuestions > 0 ? metrics.totalErros / metrics.totalQuestions : 0;

  const strokeDashAcertos = acertosPercent * circumference;
  const strokeDashErros = errosPercent * circumference;
  const offsetErros = -strokeDashAcertos;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Simulado Finalizado!</h2>
            <p className="text-xs text-slate-500">
              Confira abaixo o seu desempenho detalhado nesta prova.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Gráfico de Pizza Corrigido */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200 fill-none"
                strokeWidth="10"
              />
              {metrics.totalErros > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-rose-500 fill-none transition-all duration-1000"
                  strokeWidth="10"
                  strokeDasharray={`${strokeDashErros} ${circumference}`}
                  strokeDashoffset={offsetErros}
                />
              )}
              {metrics.totalAcertos > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-emerald-500 fill-none transition-all duration-1000"
                  strokeWidth="10"
                  strokeDasharray={`${strokeDashAcertos} ${circumference}`}
                  strokeDashoffset={0}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-2xl font-black text-slate-900 font-mono leading-none">
                {metrics.taxaAcertoGeral}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                Aproveitamento
              </span>
            </div>
          </div>

          {/* Métricas Numéricas + Tempo Médio */}
          <div className="space-y-2.5 text-xs w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-slate-600">Acertos:</span>
              </div>
              <strong className="text-slate-900 font-bold">{metrics.totalAcertos}</strong>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="font-medium text-slate-600">Erros:</span>
              </div>
              <strong className="text-slate-900 font-bold">{metrics.totalErros}</strong>
            </div>

            {metrics.totalEmBranco > 0 && (
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-600">Sem resposta:</span>
                </div>
                <strong className="text-slate-900 font-bold">{metrics.totalEmBranco}</strong>
              </div>
            )}

            {/* Tempo Médio por Questão */}
            {tempoTotalSegundos > 0 && (
              <div className="flex items-center justify-between sm:justify-start gap-4 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-600">Tempo médio/q:</span>
                </div>
                <strong className="text-indigo-600 font-bold font-mono">
                  {metrics.tempoMedioFormatado}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Desempenho por Bloco */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Desempenho por Bloco</span>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {metrics.blocos.map((bloco) => (
              <div key={bloco.nome} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span className="truncate max-w-[200px]">{bloco.nome}</span>
                  <span className="font-mono text-slate-500">
                    {bloco.acertos}/{bloco.total} ({bloco.porcentagem}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${bloco.porcentagem}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};