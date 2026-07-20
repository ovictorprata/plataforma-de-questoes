import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalQuestions: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalQuestions,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalQuestions / pageSize);

  if (totalPages <= 1) return null;

  // Lógica para gerar a lista de páginas com reticências (...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
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

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="mt-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      {/* Seletor de quantidade por página */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span>Questões por página:</span>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[5, 10, 20].map((size) => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                pageSize === size
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Números da Paginação */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Página Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-2 text-xs font-bold text-slate-400 select-none">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isSelected = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[36px] h-9 px-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Próxima Página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};