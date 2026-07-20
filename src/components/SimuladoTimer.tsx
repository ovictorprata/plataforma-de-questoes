import React, { useState, useEffect } from 'react';
import { Timer, Eye, EyeOff, AlertTriangle, RefreshCw } from 'lucide-react';

interface SimuladoTimerProps {
  totalQuestions: number;
  onResetSimulado?: () => void;
}

export const SimuladoTimer: React.FC<SimuladoTimerProps> = ({
  totalQuestions,
  onResetSimulado,
}) => {
  const totalSeconds = totalQuestions * 180;
  const [timeLeft, setTimeLeft] = useState<number>(totalSeconds);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  };

  const isWarning = timeLeft <= 300 && timeLeft > 0;
  const isFinished = timeLeft === 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
      {/* Informação do Cronômetro */}
      <div className="flex items-center gap-2.5">
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isFinished
              ? 'bg-rose-100 text-rose-600'
              : isWarning
              ? 'bg-amber-100 text-amber-600 animate-pulse'
              : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          {isWarning || isFinished ? (
            <AlertTriangle className="w-4.5 h-4.5" />
          ) : (
            <Timer className="w-4.5 h-4.5" />
          )}
        </div>

        <div>
          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
            Tempo Restante (3 min/questão)
          </span>

          {isVisible ? (
            <span
              className={`text-sm font-extrabold font-mono ${
                isFinished
                  ? 'text-rose-600'
                  : isWarning
                  ? 'text-amber-600'
                  : 'text-slate-800'
              }`}
            >
              {isFinished ? 'Tempo Esgotado!' : formatTime(timeLeft)}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400 italic">
              ••:•• (Oculto)
            </span>
          )}
        </div>
      </div>

      {/* Ações: Esconder/Mostrar + Novo Simulado */}
      <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors font-semibold text-[11px]"
          title={isVisible ? 'Esconder cronômetro' : 'Mostrar cronômetro'}
        >
          {isVisible ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              <span>Esconder</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mostrar</span>
            </>
          )}
        </button>

        {onResetSimulado && (
          <button
            type="button"
            onClick={onResetSimulado}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-[11px] font-bold px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Novo Simulado</span>
          </button>
        )}
      </div>
    </div>
  );
};