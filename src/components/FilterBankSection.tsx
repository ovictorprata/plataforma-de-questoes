import React, { useMemo } from 'react';
import { Filter, EyeOff } from 'lucide-react';
import { MultiSelectDropdown } from './MultiSelectDropdown';

export interface FilterBankSectionProps {
  jsonFilesList: string[];
  disciplinasDisponiveis: string[];
  // Mapeamento para filtrar os blocos conforme a disciplina selecionada
  questoesMapeamento: {
    disciplina: string;
    bloco?: string | null;
  }[];
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

  appliedJsonFilter: string[];
  appliedDisciplinaFilter: string[];
  appliedBlocoFilter: string[];
  appliedAnoFilter: number[];
  appliedExcludeResolved: boolean;

  onApplyFilters: () => void;
}

export const FilterBankSection: React.FC<FilterBankSectionProps> = ({
  jsonFilesList,
  disciplinasDisponiveis,
  questoesMapeamento,
  anosDisponiveis,
  tempJsonFilter,
  setTempJsonFilter,
  tempDisciplinaFilter,
  setTempDisciplinaFilter,
  tempBlocoFilter,
  setTempBlocoFilter,
  tempAnoFilter,
  setTempAnoFilter,
  tempExcludeResolved,
  setTempExcludeResolved,
  appliedJsonFilter,
  appliedDisciplinaFilter,
  appliedBlocoFilter,
  appliedAnoFilter,
  appliedExcludeResolved,
  onApplyFilters,
}) => {
  // Filtra os blocos dinamicamente baseados na(s) disciplina(s) selecionada(s) no filtro temporário
  const blocosFiltrados = useMemo(() => {
    let dataset = questoesMapeamento;
    
    if (tempDisciplinaFilter.length > 0) {
      dataset = dataset.filter((q) => tempDisciplinaFilter.includes(q.disciplina));
    }

    return Array.from(
      new Set(dataset.map((q) => q.bloco).filter(Boolean) as string[])
    );
  }, [questoesMapeamento, tempDisciplinaFilter]);

  const hasActiveSelections =
    tempJsonFilter.length > 0 ||
    tempDisciplinaFilter.length > 0 ||
    tempBlocoFilter.length > 0 ||
    tempAnoFilter.length > 0 ||
    tempExcludeResolved;

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
    tempExcludeResolved !== appliedExcludeResolved;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filtrar Banco de Questões</span>
        </div>

        {hasActiveSelections && (
          <button
            onClick={() => {
              setTempJsonFilter([]);
              setTempDisciplinaFilter([]);
              setTempBlocoFilter([]);
              setTempAnoFilter([]);
              setTempExcludeResolved(false);
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
          >
            Limpar todos
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Origem / Simulado */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Origem / Simulado</label>
          <MultiSelectDropdown
            title="Todos os JSONs"
            options={jsonFilesList}
            selectedOptions={tempJsonFilter}
            onToggle={(item) => {
              setTempJsonFilter((prev) =>
                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
              );
            }}
            onClear={() => setTempJsonFilter([])}
          />
        </div>

        {/* 2. Disciplina (NOVO) */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Disciplina</label>
          <MultiSelectDropdown
            title="Todas as disciplinas"
            options={disciplinasDisponiveis}
            selectedOptions={tempDisciplinaFilter}
            onToggle={(item) => {
              setTempDisciplinaFilter((prev) => {
                const updated = prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item];
                // Limpa blocos que não pertencem mais à seleção de disciplina
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

        {/* 3. Bloco / Matéria (Dinâmico) */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Bloco / Assunto</label>
          <MultiSelectDropdown
            title="Todos os blocos"
            options={blocosFiltrados}
            selectedOptions={tempBlocoFilter}
            onToggle={(item) => {
              setTempBlocoFilter((prev) =>
                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
              );
            }}
            onClear={() => setTempBlocoFilter([])}
          />
        </div>

        {/* 4. Ano */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Ano</label>
          <MultiSelectDropdown
            title="Todos os anos"
            options={anosDisponiveis}
            selectedOptions={tempAnoFilter}
            onToggle={(item) => {
              setTempAnoFilter((prev) =>
                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
              );
            }}
            onClear={() => setTempAnoFilter([])}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[42px]">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none hover:text-slate-800">
          <input
            type="checkbox"
            checked={tempExcludeResolved}
            onChange={(e) => setTempExcludeResolved(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
          />
          <div className="flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span>Excluir questões já resolvidas do banco</span>
          </div>
        </label>

        {hasPendingChanges && (
          <button
            onClick={onApplyFilters}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm shrink-0 self-end sm:self-auto animate-in fade-in duration-200"
          >
            Aplicar Filtros
          </button>
        )}
      </div>
    </div>
  );
};