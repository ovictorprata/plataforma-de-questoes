import React, { useState } from 'react';
import { Shuffle, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Question {
  id: string;
  bloco: string;
  enunciado: string;
  alternativas: Record<string, string>;
  gabarito: string;
  ano: number;
  imagem_antes: string | null;
  imagem_depois: string | null;
}

interface ExamSetupProps {
  questionsMasterList: Question[];
  onGenerate: (shuffledQuestions: Question[]) => void;
}

export const ExamSetup: React.FC<ExamSetupProps> = ({ questionsMasterList, onGenerate }) => {
  const [selectedBlocos, setSelectedBlocos] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(5);

  // Derive unique subjects from master data
  const uniqueBlocos = Array.from(new Set(questionsMasterList.map((q) => q.bloco)));

  const handleToggleBloco = (bloco: string) => {
    setSelectedBlocos((prev) =>
      prev.includes(bloco) ? prev.filter((b) => b !== bloco) : [...prev, bloco]
    );
  };

  const handleGenerate = () => {
    // 1. Filter by selected subjects (or pull all if none selected)
    const filtered = selectedBlocos.length > 0
      ? questionsMasterList.filter((q) => selectedBlocos.includes(q.bloco))
      : [...questionsMasterList];

    // 2. The Randomization Trap Guard: Clone and Shuffle natively via Fisher-Yates
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. Slice to selected quantity limit
    const finalSelection = shuffled.slice(0, Math.min(quantity, shuffled.length));
    onGenerate(finalSelection);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-xl border border-slate-100 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">Configurar Simulado</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Selecionar Disciplinas (Blocos)</label>
        <div className="flex flex-wrap gap-2">
          {uniqueBlocos.map((bloco) => {
            const isSelected = selectedBlocos.includes(bloco);
            return (
              <button
                key={bloco}
                onClick={() => handleToggleBloco(bloco)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {bloco}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Quantidade de Questões</label>
        <div className="flex gap-3">
          {[5, 10, 20, 50].map((num) => (
            <button
              key={num}
              onClick={() => setQuantity(num)}
              className={`flex-1 py-2 text-center rounded-lg border text-sm transition-all ${
                quantity === num
                  ? 'bg-slate-900 border-slate-900 text-white font-medium shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <Shuffle className="w-4 h-4" />
        Gerar Simulado
      </button>
    </motion.div>
  );
};