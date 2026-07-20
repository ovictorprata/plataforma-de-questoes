import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface MultiSelectDropdownProps<T extends string | number> {
  title: string;
  options: T[];
  selectedOptions: T[];
  onToggle: (option: T) => void;
  onClear: () => void;
  searchable?: boolean;
}

export function MultiSelectDropdown<T extends string | number>({
  title,
  options,
  selectedOptions,
  onToggle,
  onClear,
  searchable = true,
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Suspenso (Ajustado para expansão por extenso no Desktop) */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 min-w-full w-max max-w-[90vw] sm:max-w-md md:max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-72 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100">
          
          {/* Campo de Busca */}
          {searchable && (
            <div className="relative flex items-center shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                type="text"
                placeholder="Pesquisar..."
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

          {/* Lista de Opções Sem Reticências */}
          <div className="overflow-y-auto max-h-52 space-y-1 pr-1">
            {filteredOptions.length === 0 ? (
              <p className="text-[11px] text-slate-400 p-2 text-center">Nenhum resultado</p>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <label
                    key={option.toString()}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs select-none transition-colors"
                  >
                    {/* Checkbox à esquerda */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(option)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 shrink-0"
                    />
                    {/* Nome por Extenso (Sem truncate) */}
                    <span className={`whitespace-normal leading-normal ${isSelected ? 'font-bold text-indigo-950' : 'text-slate-700'}`}>
                      {option}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}