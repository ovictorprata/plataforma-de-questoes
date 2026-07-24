import React from 'react';
import type { Question } from '../../types/question';

interface QuestionHeaderProps {
  question: Question;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({ question }) => {
  return (
    <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-400 gap-2 mb-4">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-indigo-600 font-bold">
          {question.taxonomia?.disciplina || 'Geral'}
        </span>
        {question.taxonomia?.bloco && <span>• {question.taxonomia.bloco}</span>}
        {question.taxonomia?.topico && (
          <span>• {question.taxonomia.topico}</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {question.banca && (
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
            {question.banca}
          </span>
        )}
        {question.orgao && (
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
            {question.orgao}
          </span>
        )}
        {question.ano && <span>{question.ano}</span>}
      </div>
    </div>
  );
};
