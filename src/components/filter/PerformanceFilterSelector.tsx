import React from 'react';
import { CheckCircle2, XCircle, Layers } from 'lucide-react';
import type { PerformanceFilter } from '../../hooks/useBankFilters';

interface Props {
  value: PerformanceFilter;
  onChange: (value: PerformanceFilter) => void;
}

export const PerformanceFilterSelector: React.FC<Props> = ({
  value,
  onChange,
}) => (
  <div className="space-y-1.5">
    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
      Meu Desempenho
    </span>
    <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 w-fit">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          value === 'all'
            ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Todas</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('correct')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          value === 'correct'
            ? 'bg-emerald-500 text-white shadow-2xs'
            : 'text-slate-600 hover:text-emerald-700'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Que acertei</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('wrong')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          value === 'wrong'
            ? 'bg-rose-500 text-white shadow-2xs'
            : 'text-slate-600 hover:text-rose-700'
        }`}
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Que errei</span>
      </button>
    </div>
  </div>
);
