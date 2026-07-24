import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import type { Question } from '../types/question';

export interface ExamSetupProps {
  questionsMasterList: Question[];
  onGenerate: (shuffledQuestions: Question[]) => void;
}

export const ExamSetup: React.FC<ExamSetupProps> = ({
  questionsMasterList,
  onGenerate,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('todos');
  const [questionCount, setQuestionCount] = useState<number>(10);

  const disciplinasDisponiveis = Array.from(
    new Set(
      questionsMasterList.map(
        (q) => q.taxonomia?.disciplina || q.taxonomia?.bloco || 'Geral'
      )
    )
  );

  const handleStartExam = () => {
    let pool = [...questionsMasterList];

    if (selectedSubject !== 'todos') {
      pool = pool.filter(
        (q) =>
          q.taxonomia?.disciplina === selectedSubject ||
          q.taxonomia?.bloco === selectedSubject
      );
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selectedBatch = shuffled.slice(0, questionCount);

    onGenerate(selectedBatch);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 max-w-xl mx-auto my-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Configurar Novo Simulado
          </h2>
          <p className="text-xs text-slate-500">
            Escolha a matéria e a quantidade de questões para praticar
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Filtrar por Disciplina / Matéria
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600 transition-all"
          >
            <option value="todos">
              Todas as Disciplinas ({questionsMasterList.length} questões
              disponíveis)
            </option>
            {disciplinasDisponiveis.map((disciplina) => {
              const totalNaMateria = questionsMasterList.filter(
                (q) =>
                  q.taxonomia?.disciplina === disciplina ||
                  q.taxonomia?.bloco === disciplina
              ).length;
              return (
                <option key={disciplina} value={disciplina}>
                  {disciplina} ({totalNaMateria} questões)
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Quantidade de Questões
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 20, 30].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  questionCount === num
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                {num} Qs
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleStartExam}
        disabled={questionsMasterList.length === 0}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm mt-2"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Gerar Simulado Agora</span>
      </button>
    </div>
  );
};
