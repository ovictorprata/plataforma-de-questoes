import React from 'react';
import type { AnalyticsData } from '../hooks/useLocalAnalytics';
import { BarChart3, CheckCircle, XCircle, BookOpen } from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
}) => {
  const totalRespondidas = analytics.global.correct + analytics.global.wrong;
  const taxaAcerto =
    totalRespondidas > 0
      ? Math.round((analytics.global.correct / totalRespondidas) * 100)
      : 0;

  // Gerar dados dos últimos 7 dias dinamicamente
  const ultimos7Dias = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dataFormatada = d.toLocaleDateString('pt-BR');

      const registroDia = analytics.daily?.[dataFormatada] || {
        correct: 0,
        total: 0,
      };
      return {
        label: dataFormatada.substring(0, 5),
        total: registroDia.total,
        correct: registroDia.correct,
      };
    })
    .reverse();

  const maxQuestoesNumDia = Math.max(...ultimos7Dias.map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Resumo Global Adaptável para Telas Pequenas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              Feitas
            </p>
            <p className="text-lg font-bold text-slate-800">
              {totalRespondidas}
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              Acertos
            </p>
            <p className="text-lg font-bold text-emerald-600">
              {analytics.global.correct}
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              Erros
            </p>
            <p className="text-lg font-bold text-rose-600">
              {analytics.global.wrong}
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 font-bold text-xs w-8 h-8 flex items-center justify-center">
            %
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              Aproveitamento
            </p>
            <p className="text-lg font-bold text-slate-800">{taxaAcerto}%</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras com Correção de Renderização */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" /> Produtividade
          (Últimos 7 Dias)
        </h3>

        {/* Adicionado h-[180px] definitivo e itens alinhados via flex-col completo nas colunas */}
        <div className="flex items-end justify-between h-[180px] border-b border-slate-100 pb-1 px-1 gap-1">
          {ultimos7Dias.map((dia) => {
            const alturaTotalPercentual = (dia.total / maxQuestoesNumDia) * 100;
            const alturaAcertosPercentual =
              dia.total > 0 ? (dia.correct / dia.total) * 100 : 0;

            return (
              <div
                key={dia.label}
                className="flex flex-col items-center h-full justify-end flex-1 group relative"
              >
                {/* Tooltip Hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none z-10 whitespace-nowrap">
                  {dia.correct} acertos / {dia.total} feitas
                </div>

                {/* Container da Barra com altura garantida por flex-growth ou estilo numérico inline */}
                <div
                  className="w-full max-w-[32px] bg-slate-100 rounded-t-sm flex flex-col justify-end overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      dia.total > 0
                        ? `${Math.max(alturaTotalPercentual, 8)}%`
                        : '0%',
                  }}
                >
                  {dia.total > 0 && (
                    <div
                      className="bg-indigo-600 w-full"
                      style={{ height: `${alturaAcertosPercentual}%` }}
                    />
                  )}
                </div>

                <span className="text-[10px] md:text-xs font-semibold text-slate-400 mt-2 block shrink-0">
                  {dia.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center mt-4 text-[11px] font-medium">
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-3 h-3 bg-slate-200 rounded" /> Total Feitas
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-3 h-3 bg-indigo-600 rounded" /> Acertos
          </div>
        </div>
      </div>

      {/* Histórico por Bloco */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Desempenho por Bloco
        </h3>
        {/* Removidos: max-h-64 e overflow-y-auto */}
        <div className="space-y-3 pr-1">
          {Object.keys(analytics.subjects).length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              Nenhuma questão respondida ainda.
            </p>
          ) : (
            Object.entries(analytics.subjects).map(([subject, data]) => {
              const pct = Math.round((data.correct / data.total) * 100);
              return (
                <div key={subject} className="border-b border-slate-50 pb-2">
                  <div className="flex justify-between text-xs md:text-sm font-medium text-slate-700 mb-1">
                    <span className="truncate max-w-[180px] md:max-w-[240px]">
                      {subject}
                    </span>
                    <span>
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
