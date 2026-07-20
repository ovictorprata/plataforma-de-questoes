import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface MultiSelectDropdownProps<T extends string | number> {
  title: string;
  options: T[];
  selectedOptions: T[];
  onToggle: (option: T) => void;
  onClear: () => void;
}

export const MultiSelectDropdown = <T extends string | number>({
  title,
  options,
  selectedOptions,
  onToggle,
  onClear,
}: MultiSelectDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botão Gatilho */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all ${
          selectedOptions.length > 0
            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
        }`}
      >
        <span className="truncate">
          {selectedOptions.length === 0
            ? title
            : `${selectedOptions.length} selecionado(s)`}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selectedOptions.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="p-0.5 hover:bg-indigo-200/60 rounded-full text-indigo-600 transition-colors"
              title="Limpar seleção"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Menu Dropdown de Opções */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 max-h-60 overflow-y-auto space-y-0.5">
          {options.length === 0 ? (
            <div className="p-2 text-center text-xs text-slate-400">Nenhuma opção disponível</div>
          ) : (
            options.map((option) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <div
                  key={String(option)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(option);
                  }}
                  className={`flex items-start justify-between gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors select-none ${
                    isSelected ? 'bg-indigo-50 text-indigo-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {/* Texto completo com quebra de linha suave se necessário */}
                  <span className="whitespace-normal break-words leading-relaxed flex-1">
                    {option}
                  </span>

                  {/* Caixinha do Checkbox (com shrink-0 para não esmagar no texto) */}
                  <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};