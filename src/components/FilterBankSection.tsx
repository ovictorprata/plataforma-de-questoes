import React, { useMemo } from 'react';
import {
  Filter,
  EyeOff,
  CheckCircle2,
  XCircle,
  Layers,
  Ban,
} from 'lucide-react';
import { MultiSelectDropdown, type GroupedOption } from './MultiSelectDropdown';
import type { PerformanceFilter } from '../App';

export interface FilterBankSectionProps {
  jsonFilesList: string[];
  disciplinasDisponiveis: string[];
  questoesMapeamento: {
    disciplina: string;
    bloco?: string | null;
  }[];
  anosDisponiveis: number[];

  tempJsonFilter: string[];
  setTempJsonFilter: React.Dispatch<React.SetStateAction<string[]>>;
  onToggleJsonFilter?: (item: string) => void;
  onClearJsonFilter?: () => void;

  tempDisciplinaFilter: string[];
  setTempDisciplinaFilter: React.Dispatch<React.SetStateAction<string[]>>;
  tempBlocoFilter: string[];
  setTempBlocoFilter: React.Dispatch<React.SetStateAction<string[]>>;
  tempAnoFilter: number[];
  setTempAnoFilter: React.Dispatch<React.SetStateAction<number[]>>;

  tempExcludeResolved: boolean;
  setTempExcludeResolved: React.Dispatch<React.SetStateAction<boolean>>;
  tempExcludeCancelled: boolean;
  setTempExcludeCancelled: React.Dispatch<React.SetStateAction<boolean>>;

  tempPerformanceFilter: PerformanceFilter;
  setTempPerformanceFilter: React.Dispatch<
    React.SetStateAction<PerformanceFilter>
  >;

  appliedJsonFilter: string[];
  appliedDisciplinaFilter: string[];
  appliedBlocoFilter: string[];
  appliedAnoFilter: number[];
  appliedExcludeResolved: boolean;
  appliedExcludeCancelled: boolean;
  appliedPerformanceFilter: PerformanceFilter;

  onApplyFilters: () => void;
  onClearAllFilters?: () => void;

  totalQuestions: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export const FilterBankSection: React.FC<FilterBankSectionProps> = ({
  jsonFilesList,
  disciplinasDisponiveis,
  questoesMapeamento,
  anosDisponiveis,
  tempJsonFilter,
  setTempJsonFilter,
  onToggleJsonFilter,
  onClearJsonFilter,
  tempDisciplinaFilter,
  setTempDisciplinaFilter,
  tempBlocoFilter,
  setTempBlocoFilter,
  tempAnoFilter,
  setTempAnoFilter,
  tempExcludeResolved,
  setTempExcludeResolved,
  tempExcludeCancelled,
  setTempExcludeCancelled,
  tempPerformanceFilter,
  setTempPerformanceFilter,
  appliedJsonFilter,
  appliedDisciplinaFilter,
  appliedBlocoFilter,
  appliedAnoFilter,
  appliedExcludeResolved,
  appliedExcludeCancelled,
  appliedPerformanceFilter,
  onApplyFilters,
  onClearAllFilters,
  totalQuestions,
  pageSize,
  onPageSizeChange,
}) => {
  const disciplinasOrdenadas = useMemo(() => {
    return [...disciplinasDisponiveis].sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );
  }, [disciplinasDisponiveis]);

  const blocosAgrupados = useMemo<GroupedOption<string>[]>(() => {
    const mapaGrupos: Record<string, string[]> = {};

    questoesMapeamento.forEach((q) => {
      if (!q.bloco) return;

      if (
        tempDisciplinaFilter.length > 0 &&
        !tempDisciplinaFilter.includes(q.disciplina)
      ) {
        return;
      }

      if (!mapaGrupos[q.disciplina]) {
        mapaGrupos[q.disciplina] = [];
      }

      if (!mapaGrupos[q.disciplina].includes(q.bloco)) {
        mapaGrupos[q.disciplina].push(q.bloco);
      }
    });

    return Object.entries(mapaGrupos).map(([disciplina, blocos]) => ({
      group: disciplina,
      items: blocos.sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      ),
    }));
  }, [questoesMapeamento, tempDisciplinaFilter]);

  const hasActiveSelections =
    tempJsonFilter.length > 0 ||
    tempDisciplinaFilter.length > 0 ||
    tempBlocoFilter.length > 0 ||
    tempAnoFilter.length > 0 ||
    tempExcludeResolved ||
    tempExcludeCancelled ||
    tempPerformanceFilter !== 'all';

  const areArraysEqual = <T extends string | number>(a: T[], b: T[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  const hasPendingChanges =
    !areArraysEqual(tempJsonFilter, appliedJsonFilter) ||
    !areArraysEqual(tempDisciplinaFilter, appliedDisciplinaFilter) ||
    !areArraysEqual(tempBlocoFilter, appliedBlocoFilter) ||
    !areArraysEqual(tempAnoFilter, appliedAnoFilter) ||
    tempExcludeResolved !== appliedExcludeResolved ||
    tempExcludeCancelled !== appliedExcludeCancelled ||
    tempPerformanceFilter !== appliedPerformanceFilter;

  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 font-['Inter',sans-serif]">
      {/* 1. CABEÇALHO DO CARD */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">
            Filtrar Banco de Questões
          </h3>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-100/80">
            {totalQuestions} {totalQuestions === 1 ? 'questão' : 'questões'}
          </span>
        </div>

        {hasActiveSelections && (
          <button
            type="button"
            onClick={() => {
              if (onClearAllFilters) {
                onClearAllFilters();
              } else {
                if (onClearJsonFilter) onClearJsonFilter();
                setTempJsonFilter([]);
                setTempDisciplinaFilter([]);
                setTempBlocoFilter([]);
                setTempAnoFilter([]);
                setTempExcludeResolved(false);
                setTempExcludeCancelled(false);
                setTempPerformanceFilter('all');
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold transition-colors select-none"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* 2. DROPDOWNS DE MULTI-SELEÇÃO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Prova
          </label>
          <MultiSelectDropdown
            title="Prova/Simulados"
            options={jsonFilesList}
            selectedOptions={tempJsonFilter}
            onToggle={(item) => {
              if (onToggleJsonFilter) {
                onToggleJsonFilter(String(item));
              } else {
                setTempJsonFilter((prev) =>
                  prev.includes(String(item))
                    ? prev.filter((i) => i !== String(item))
                    : [...prev, String(item)]
                );
              }
            }}
            onClear={() => {
              if (onClearJsonFilter) {
                onClearJsonFilter();
              } else {
                setTempJsonFilter([]);
              }
            }}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Disciplina
          </label>
          <MultiSelectDropdown
            title="Todas as disciplinas"
            options={disciplinasOrdenadas}
            selectedOptions={tempDisciplinaFilter}
            onToggle={(item) => {
              setTempDisciplinaFilter((prev) => {
                const updated = prev.includes(String(item))
                  ? prev.filter((i) => i !== String(item))
                  : [...prev, String(item)];
                setTempBlocoFilter([]);
                return updated;
              });
            }}
            onClear={() => {
              setTempDisciplinaFilter([]);
              setTempBlocoFilter([]);
            }}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Bloco / Assunto
          </label>
          <MultiSelectDropdown
            title="Todos os blocos"
            options={blocosAgrupados}
            selectedOptions={tempBlocoFilter}
            onToggle={(item) => {
              const itemStr = String(item);
              setTempBlocoFilter((prev) =>
                prev.includes(itemStr)
                  ? prev.filter((i) => i !== itemStr)
                  : [...prev, itemStr]
              );
            }}
            onToggleGroup={(groupItems, shouldSelectAll) => {
              const itemsStr = groupItems.map(String);
              setTempBlocoFilter((prev) => {
                if (shouldSelectAll) {
                  return Array.from(new Set([...prev, ...itemsStr]));
                } else {
                  return prev.filter((i) => !itemsStr.includes(i));
                }
              });
            }}
            onClear={() => setTempBlocoFilter([])}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Ano
          </label>
          <MultiSelectDropdown
            title="Todos os anos"
            options={anosDisponiveis}
            selectedOptions={tempAnoFilter}
            onToggle={(item) => {
              const itemNum = Number(item);
              setTempAnoFilter((prev) =>
                prev.includes(itemNum)
                  ? prev.filter((i) => i !== itemNum)
                  : [...prev, itemNum]
              );
            }}
            onClear={() => setTempAnoFilter([])}
          />
        </div>
      </div>

      {/* 3. DESEMPENHO E EXCLUSÕES ORGANIZADOS */}
      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
        {/* FILTRO DE DESEMPENHO COM RÓTULO DE HIERARQUIA */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Meu Desempenho
          </span>
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 w-fit">
            <button
              type="button"
              onClick={() => setTempPerformanceFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tempPerformanceFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todas</span>
            </button>

            <button
              type="button"
              onClick={() => setTempPerformanceFilter('correct')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tempPerformanceFilter === 'correct'
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Que acertei</span>
            </button>

            <button
              type="button"
              onClick={() => setTempPerformanceFilter('wrong')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tempPerformanceFilter === 'wrong'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Que errei</span>
            </button>
          </div>
        </div>

        {/* GRUPO DE CHECKBOXES DE EXCLUSÃO */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Excluir questões
          </span>
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200/50">
            {/* Checkbox: Já resolvidas */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none hover:text-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={tempExcludeResolved}
                onChange={(e) => setTempExcludeResolved(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <div className="flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Já resolvidas</span>
              </div>
            </label>

            {/* Checkbox: Anuladas */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none hover:text-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={tempExcludeCancelled}
                onChange={(e) => setTempExcludeCancelled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <div className="flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-amber-500" />
                <span>Anuladas</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 4. RODAPÉ DE PAGINAÇÃO E BOTAO APLICAR */}
      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 min-h-[42px]">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="font-semibold text-slate-600">Por página:</span>
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {[10, 20, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  pageSize === size
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {hasPendingChanges && (
          <button
            type="button"
            onClick={onApplyFilters}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 animate-in fade-in duration-150"
          >
            Aplicar Filtros
          </button>
        )}
      </div>
    </div>
  );
};
