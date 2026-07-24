import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalQuestions: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  mode?: 'full' | 'pageSizeOnly' | 'navigationOnly';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalQuestions,
  pageSize,
  onPageChange,
  onPageSizeChange,
  mode = 'full',
}) => {
  const totalPages = Math.ceil(totalQuestions / pageSize);

  if (totalPages <= 0) return null;

  // Função auxiliar para mudar página e rolar suavemente para o topo
  const handlePageSelect = (newPage: number) => {
    onPageChange(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // 1. Apenas o Seletor de Quantidade (SEM CONTAINER DE CARD PRÓPRIO)
  if (mode === 'pageSizeOnly') {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span className="font-medium">Questões por página:</span>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {[5, 10, 20].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onPageSizeChange(size)}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                pageSize === size
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Apenas a Navegação de Páginas (Rodapé)
  if (mode === 'navigationOnly') {
    return (
      <div className="flex items-center justify-center gap-1.5 pt-4">
        {/* Botão Anterior */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => handlePageSelect(currentPage - 1)}
          className="p-2 rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números das Páginas com Truncamento */}
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 text-slate-400 text-xs font-bold"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageSelect(page as number)}
              className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isCurrent
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Botão Próximo */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => handlePageSelect(currentPage + 1)}
          className="p-2 rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
};
