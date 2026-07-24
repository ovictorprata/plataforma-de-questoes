import React, { useMemo } from 'react';
import { Filter } from 'lucide-react';
import { MultiSelectDropdown, type GroupedOption } from './MultiSelectDropdown';
import { PerformanceFilterSelector } from './filter/PerformanceFilterSelector';
import { ExclusionCheckboxes } from './filter/ExclusionCheckboxes';
import type { PerformanceFilter } from '../hooks/useBankFilters';

export interface FilterBankSectionProps {
  jsonFilesList: string[];
  disciplinasDisponiveis: string[];
  questoesMapeamento: { disciplina: string; bloco?: string | null }[];
  anosDisponiveis: number[];

  tempJsonFilter: string[];
  setTempJsonFilter: React.Dispatch<React.SetStateAction<string[]>>;
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
  onClearAllFilters: () => void;

  totalQuestions: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export const FilterBankSection: React.FC<FilterBankSectionProps> = (props) => {
  const disciplinasOrdenadas = useMemo(() => {
    return [...props.disciplinasDisponiveis].sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );
  }, [props.disciplinasDisponiveis]);

  const blocosAgrupados = useMemo<GroupedOption<string>[]>(() => {
    const mapaGrupos: Record<string, string[]> = {};
    props.questoesMapeamento.forEach((q) => {
      if (!q.bloco) return;
      if (
        props.tempDisciplinaFilter.length > 0 &&
        !props.tempDisciplinaFilter.includes(q.disciplina)
      )
        return;
      if (!mapaGrupos[q.disciplina]) mapaGrupos[q.disciplina] = [];
      if (!mapaGrupos[q.disciplina].includes(q.bloco))
        mapaGrupos[q.disciplina].push(q.bloco);
    });

    return Object.entries(mapaGrupos).map(([disciplina, blocos]) => ({
      group: disciplina,
      items: blocos.sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      ),
    }));
  }, [props.questoesMapeamento, props.tempDisciplinaFilter]);

  const hasActiveSelections =
    props.tempJsonFilter.length > 0 ||
    props.tempDisciplinaFilter.length > 0 ||
    props.tempBlocoFilter.length > 0 ||
    props.tempAnoFilter.length > 0 ||
    props.tempExcludeResolved ||
    props.tempExcludeCancelled ||
    props.tempPerformanceFilter !== 'all';

  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 font-['Inter',sans-serif]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Filtrar Banco de Questões
          </h3>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-100/80">
            {props.totalQuestions}{' '}
            {props.totalQuestions === 1 ? 'questão' : 'questões'}
          </span>
        </div>

        {hasActiveSelections && (
          <button
            type="button"
            onClick={props.onClearAllFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Prova
          </label>
          <MultiSelectDropdown
            title="Prova/Simulados"
            options={props.jsonFilesList}
            selectedOptions={props.tempJsonFilter}
            onToggle={(item) =>
              props.setTempJsonFilter((prev) =>
                prev.includes(String(item))
                  ? prev.filter((i) => i !== String(item))
                  : [...prev, String(item)]
              )
            }
            onClear={() => props.setTempJsonFilter([])}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Disciplina
          </label>
          <MultiSelectDropdown
            title="Todas as disciplinas"
            options={disciplinasOrdenadas}
            selectedOptions={props.tempDisciplinaFilter}
            onToggle={(item) => {
              props.setTempDisciplinaFilter((prev) =>
                prev.includes(String(item))
                  ? prev.filter((i) => i !== String(item))
                  : [...prev, String(item)]
              );
              props.setTempBlocoFilter([]);
            }}
            onClear={() => {
              props.setTempDisciplinaFilter([]);
              props.setTempBlocoFilter([]);
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
            selectedOptions={props.tempBlocoFilter}
            onToggle={(item) =>
              props.setTempBlocoFilter((prev) =>
                prev.includes(String(item))
                  ? prev.filter((i) => i !== String(item))
                  : [...prev, String(item)]
              )
            }
            onClear={() => props.setTempBlocoFilter([])}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Ano
          </label>
          <MultiSelectDropdown
            title="Todos os anos"
            options={props.anosDisponiveis}
            selectedOptions={props.tempAnoFilter}
            onToggle={(item) =>
              props.setTempAnoFilter((prev) =>
                prev.includes(Number(item))
                  ? prev.filter((i) => i !== Number(item))
                  : [...prev, Number(item)]
              )
            }
            onClear={() => props.setTempAnoFilter([])}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PerformanceFilterSelector
          value={props.tempPerformanceFilter}
          onChange={props.setTempPerformanceFilter}
        />

        <ExclusionCheckboxes
          excludeResolved={props.tempExcludeResolved}
          onToggleResolved={props.setTempExcludeResolved}
          excludeCancelled={props.tempExcludeCancelled}
          onToggleCancelled={props.setTempExcludeCancelled}
        />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="font-semibold text-slate-600">Por página:</span>
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {[10, 20, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => props.onPageSizeChange(size)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  props.pageSize === size
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={props.onApplyFilters}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};
