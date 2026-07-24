import React from 'react';
import { EyeOff, Ban } from 'lucide-react';

interface Props {
  excludeResolved: boolean;
  onToggleResolved: (val: boolean) => void;
  excludeCancelled: boolean;
  onToggleCancelled: (val: boolean) => void;
}

export const ExclusionCheckboxes: React.FC<Props> = ({
  excludeResolved,
  onToggleResolved,
  excludeCancelled,
  onToggleCancelled,
}) => (
  <div className="space-y-1.5">
    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
      Excluir questões
    </span>
    <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200/50">
      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none hover:text-slate-900 transition-colors">
        <input
          type="checkbox"
          checked={excludeResolved}
          onChange={(e) => onToggleResolved(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
        />
        <div className="flex items-center gap-1.5">
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          <span>Já resolvidas</span>
        </div>
      </label>

      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none hover:text-slate-900 transition-colors">
        <input
          type="checkbox"
          checked={excludeCancelled}
          onChange={(e) => onToggleCancelled(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
        />
        <div className="flex items-center gap-1.5">
          <Ban className="w-3.5 h-3.5 text-amber-500" />
          <span>Anuladas</span>
        </div>
      </label>
    </div>
  </div>
);
