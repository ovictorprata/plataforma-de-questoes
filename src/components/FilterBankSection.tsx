import React, { useMemo } from 'react';
import { Filter, EyeOff } from 'lucide-react';
import { MultiSelectDropdown, type GroupedOption } from './MultiSelectDropdown';

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

  // Props de UX (Opção 1)
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
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      {/* 1. CABEÇALHO DO CARD (Título + Badge de Total de Questões Encontradas) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm">Filtrar Banco de Questões</h3>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-100/80">
            {totalQuestions} {totalQuestions === 1 ? 'questão' : 'questões'}
          </span>
        </div>

        {hasActiveSelections && (
          <button
            type="button"
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

      {/* 2. CAMPOS DE FILTRO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Origem / Simulado
          </label>
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

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Disciplina
          </label>
          <MultiSelectDropdown
            title="Todas as disciplinas"
            options={disciplinasOrdenadas}
            selectedOptions={tempDisciplinaFilter}
            onToggle={(item) => {
              setTempDisciplinaFilter((prev) => {
                const updated = prev.includes(item)
                  ? prev.filter((i) => i !== item)
                  : [...prev, item];
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
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Bloco / Assunto
          </label>
          <MultiSelectDropdown
            title="Todos os blocos"
            options={blocosAgrupados}
            selectedOptions={tempBlocoFilter}
            onToggle={(item) => {
              const itemStr = item as string;
              setTempBlocoFilter((prev) =>
                prev.includes(itemStr)
                  ? prev.filter((i) => i !== itemStr)
                  : [...prev, itemStr]
              );
            }}
            onToggleGroup={(groupItems, shouldSelectAll) => {
              const itemsStr = groupItems as string[];
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
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Ano
          </label>
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

      {/* 3. RODAPÉ DO CARD (Checkbox + Botão Aplicar + Seletor de Questões por página) */}
      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 min-h-[42px]">
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

        <div className="flex items-center justify-between md:justify-end gap-4">
          {/* Seletor Integrado no Rodapé do Filtro */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Questões por página:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[10, 20, 50].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    pageSize === size
                      ? 'bg-indigo-600 text-white shadow-xs'
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs animate-in fade-in duration-200"
            >
              Aplicar Filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
};