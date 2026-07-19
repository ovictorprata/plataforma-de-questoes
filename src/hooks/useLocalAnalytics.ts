import { useState, useEffect } from 'react';

export interface AnalyticsData {
  daily: { [date: string]: { correct: number; total: number } };
  subjects: { [bloco: string]: { correct: number; total: number } };
  global: { correct: number; wrong: number };
  answeredQuestions: string[]; // Salva os IDs únicos das questões já feitas
}

export const useLocalAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    const saved = localStorage.getItem('exam_platform_analytics');
    const defaultData = { daily: {}, subjects: {}, global: { correct: 0, wrong: 0 }, answeredQuestions: [] };
    
    if (!saved) return defaultData;
    
    try {
      const parsed = JSON.parse(saved);
      return {
        daily: parsed.daily || {},
        subjects: parsed.subjects || {},
        global: parsed.global || { correct: 0, wrong: 0 },
        answeredQuestions: parsed.answeredQuestions || []
      };
    } catch {
      return defaultData;
    }
  });

  useEffect(() => {
    localStorage.setItem('exam_platform_analytics', JSON.stringify(analytics));
  }, [analytics]);

  const logAnswer = (questionId: string, bloco: string, isCorrect: boolean) => {
    const today = new Date().toLocaleDateString('pt-BR'); // Força estritamente DD/MM/AAAA

    setAnalytics((prev) => {
      const currentDaily = prev.daily?.[today] || { correct: 0, total: 0 };
      const currentSubject = prev.subjects?.[bloco] || { correct: 0, total: 0 };
      const currentGlobal = prev.global || { correct: 0, wrong: 0 };
      
      // Evita duplicar o ID caso o usuário responda a mesma questão mais de uma vez
      const updatedAnswers = prev.answeredQuestions.includes(questionId)
        ? prev.answeredQuestions
        : [...prev.answeredQuestions, questionId];

      return {
        daily: {
          ...prev.daily,
          [today]: {
            correct: currentDaily.correct + (isCorrect ? 1 : 0),
            total: currentDaily.total + 1,
          },
        },
        subjects: {
          ...prev.subjects,
          [bloco]: {
            correct: currentSubject.correct + (isCorrect ? 1 : 0),
            total: currentSubject.total + 1,
          },
        },
        global: {
          correct: currentGlobal.correct + (isCorrect ? 1 : 0),
          wrong: currentGlobal.wrong + (isCorrect ? 0 : 1),
        },
        answeredQuestions: updatedAnswers
      };
    });
  };

  return { analytics, logAnswer };
};