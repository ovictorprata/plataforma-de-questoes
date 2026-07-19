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

  if (totalPages <= 1) {
    return (
      <div className="sticky bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-800 px-6 py-3 flex justify-end items-center gap-3 shadow-lg z-40">
        <span className="text-xs font-semibold text-slate-400">Exibir:</span>
        <div className="flex bg-slate-800 rounded-lg p-0.5">
          {([1, 5, 10] as const).map((size) => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                pageSize === size ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg z-40 backdrop-blur-md bg-opacity-95">
      {/* Left controls area: Page Size Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400">Questões por página:</span>
        <div className="flex bg-slate-800 rounded-lg p-0.5">
          {([1, 5, 10] as const).map((size) => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                pageSize === size ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Middle status marker text info */}
      <span className="text-xs text-slate-400 font-medium">
        Página <strong className="text-white font-semibold">{currentPage}</strong> de {totalPages}
      </span>

      {/* Right controls area: Action Arrow Navigation Steps */}
      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};