import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface GroupedOption<T extends string | number> {
  group: string;
  items: T[];
}

interface MultiSelectDropdownProps<T extends string | number> {
  title: string;
  options: T[] | GroupedOption<T>[];
  selectedOptions: T[];
  onToggle: (option: T) => void;
  onToggleGroup?: (groupItems: T[], shouldSelectAll: boolean) => void;
  onClear: () => void;
  searchable?: boolean;
}

export function MultiSelectDropdown<T extends string | number>({
  title,
  options,
  selectedOptions,
  onToggle,
  onToggleGroup,
  onClear,
  searchable = true,
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isGrouped = useMemo(() => {
    return options.length > 0 && typeof options[0] === 'object' && 'group' in options[0];
  }, [options]);

  const processedGroups = useMemo(() => {
    const term = searchTerm.toLowerCase();

    if (isGrouped) {
      const groupedList = options as GroupedOption<T>[];

      const sortedGroups = [...groupedList].sort((a, b) =>
        a.group.localeCompare(b.group, 'pt-BR', { sensitivity: 'base' })
      );

      return sortedGroups
        .map((g) => {
          const groupMatches = g.group.toLowerCase().includes(term);

          // Se o nome do Grupo/Disciplina bate na busca, exibe TODOS os itens dele.
          // Se não bate, filtra pelos nomes dos itens.
          const filteredItems = groupMatches
            ? g.items
            : g.items.filter((item) => {
                if (item === undefined || item === null) return false;
                return item.toString().toLowerCase().includes(term);
              });

          return {
            group: g.group,
            items: filteredItems,
          };
        })
        .filter((g) => g.items.length > 0);
    } else {
      const flatList = options as T[];
      const filtered = flatList.filter((opt) => {
        if (opt === undefined || opt === null) return false;
        return opt.toString().toLowerCase().includes(term);
      });

      return [{ group: '', items: filtered }];
    }
  }, [options, isGrouped, searchTerm]);

  const hasResults = processedGroups.some((g) => g.items.length > 0);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botão Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600 transition-all flex items-center justify-between gap-2"
      >
        <span className="truncate">
          {selectedOptions.length === 0
            ? title
            : `${selectedOptions.length} selecionado(s)`}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menu Suspenso */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 min-w-full w-max max-w-[90vw] sm:w-80 md:w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-80 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100">
          {/* Campo de Busca */}
          {searchable && (
            <div className="relative flex items-center shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                type="text"
                placeholder="Pesquisar por disciplina ou bloco..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-600"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Opção de Limpar Seleção */}
          {selectedOptions.length > 0 && (
            <div className="flex justify-end shrink-0 px-1 border-b border-slate-100 pb-1">
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800"
              >
                Limpar seleção
              </button>
            </div>
          )}

          {/* Lista de Opções */}
          <div className="overflow-y-auto max-h-60 space-y-3 pr-1">
            {!hasResults ? (
              <p className="text-[11px] text-slate-400 p-2 text-center">
                Nenhum resultado
              </p>
            ) : (
              processedGroups.map((groupObj, idx) => {
                // Checa quantos itens do grupo estão selecionados
                const allGroupItemsSelected =
                  groupObj.items.length > 0 &&
                  groupObj.items.every((item) => selectedOptions.includes(item));

                return (
                  <div key={groupObj.group || idx} className="space-y-1">
                    {/* Cabeçalho do Grupo com Checkbox da Disciplina */}
                    {groupObj.group && (
                      <div className="flex items-center justify-between px-2 pt-1 border-b border-slate-100 pb-1 sticky top-0 bg-white z-10">
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                          {groupObj.group}
                        </span>

                        {onToggleGroup && (
                          <button
                            type="button"
                            onClick={() =>
                              onToggleGroup(groupObj.items, !allGroupItemsSelected)
                            }
                            className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase"
                          >
                            {allGroupItemsSelected ? 'Desmarcar todos' : 'Marcar todos'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Itens do Grupo */}
                    {groupObj.items.map((option) => {
                      const isSelected = selectedOptions.includes(option);
                      return (
                        <label
                          key={String(option)}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs select-none transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggle(option)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 shrink-0"
                          />
                          <span
                            className={`whitespace-normal leading-normal ${
                              isSelected
                                ? 'font-bold text-indigo-950'
                                : 'text-slate-700'
                            }`}
                          >
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}