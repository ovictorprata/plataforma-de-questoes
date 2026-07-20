import React from 'react';
import { Filter, EyeOff } from 'lucide-react';
import { MultiSelectDropdown } from './MultiSelectDropdown';

export interface FilterBankSectionProps {
  jsonFilesList: string[];
  blocosDisponiveis: string[];
  anosDisponiveis: number[];
  
  // Estados temporários
  tempJsonFilter: string[];
  setTempJsonFilter: React.Dispatch<React.SetStateAction<string[]>>;
  tempBlocoFilter: string[];
  setTempBlocoFilter: React.Dispatch<React.SetStateAction<string[]>>;
  tempAnoFilter: number[];
  setTempAnoFilter: React.Dispatch<React.SetStateAction<number[]>>;
  tempExcludeResolved: boolean;
  setTempExcludeResolved: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Estados já aplicados
  appliedJsonFilter: string[];
  appliedBlocoFilter: string[];
  appliedAnoFilter: number[];
  appliedExcludeResolved: boolean;

  onApplyFilters: () => void;
}

export const FilterBankSection: React.FC<FilterBankSectionProps> = ({
  jsonFilesList,
  blocosDisponiveis,
  anosDisponiveis,
  tempJsonFilter,
  setTempJsonFilter,
  tempBlocoFilter,
  setTempBlocoFilter,
  tempAnoFilter,
  setTempAnoFilter,
  tempExcludeResolved,
  setTempExcludeResolved,
  appliedJsonFilter,
  appliedBlocoFilter,
  appliedAnoFilter,
  appliedExcludeResolved,
  onApplyFilters,
}) => {
  // Exibe o botão "Limpar todos" se houver QUALQUER filtro temporário ativo/marcado
  const hasActiveSelections =
    tempJsonFilter.length > 0 ||
    tempBlocoFilter.length > 0 ||
    tempAnoFilter.length > 0 ||
    tempExcludeResolved;

  // Comparador de arrays para identificar alterações pendentes
  const areArraysEqual = <T extends string | number>(a: T[], b: T[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  const hasPendingChanges =
    !areArraysEqual(tempJsonFilter, appliedJsonFilter) ||
    !areArraysEqual(tempBlocoFilter, appliedBlocoFilter) ||
    !areArraysEqual(tempAnoFilter, appliedAnoFilter) ||
    tempExcludeResolved !== appliedExcludeResolved;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
      {/* Cabeçalho do Filtro */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filtrar Banco de Questões</span>
        </div>

        {hasActiveSelections && (
          <button
            onClick={() => {
              setTempJsonFilter([]);
              setTempBlocoFilter([]);
              setTempAnoFilter([]);
              setTempExcludeResolved(false); // Reset do checkbox
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
          >
            Limpar todos
          </button>
        )}
      </div>

      {/* Grid MultiSelect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Origem / Simulado</label>
          <MultiSelectDropdown
            title="Todos os arquivos JSON"
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

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Bloco / Matéria</label>
          <MultiSelectDropdown
            title="Todas as matérias"
            options={blocosDisponiveis}
            selectedOptions={tempBlocoFilter}
            onToggle={(item) => {
              setTempBlocoFilter((prev) =>
                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
              );
            }}
            onClear={() => setTempBlocoFilter([])}
          />
        </div>

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

      {/* Rodapé do Filtro */}
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