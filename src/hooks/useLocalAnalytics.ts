import { useState, useCallback } from 'react';

const STORAGE_KEY = 'simulado_analytics_v3';

export interface SubjectStats {
  correct: number;
  total: number;
}

export interface AnalyticsData {
  correctAnswerIds: string[];
  wrongAnswerIds: string[];
  answeredQuestions: string[];
  daily: Record<string, { correct: number; total: number }>;
  subjects: Record<string, SubjectStats>;
  global: {
    correct: number;
    wrong: number;
  };
}

const getInitialAnalytics = (): AnalyticsData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const correct = Array.isArray(parsed.correctAnswerIds)
        ? parsed.correctAnswerIds
        : [];
      const wrong = Array.isArray(parsed.wrongAnswerIds)
        ? parsed.wrongAnswerIds
        : [];

      return {
        correctAnswerIds: correct,
        wrongAnswerIds: wrong,
        answeredQuestions: Array.from(new Set([...correct, ...wrong])),
        daily: parsed.daily || {},
        subjects: parsed.subjects || {},
        global: parsed.global || {
          correct: correct.length,
          wrong: wrong.length,
        },
      };
    }
  } catch (error) {
    console.error('Erro ao ler analytics do localStorage:', error);
  }

  return {
    correctAnswerIds: [],
    wrongAnswerIds: [],
    answeredQuestions: [],
    daily: {},
    subjects: {},
    global: { correct: 0, wrong: 0 },
  };
};

export const useLocalAnalytics = () => {
  const [analytics, setAnalytics] =
    useState<AnalyticsData>(getInitialAnalytics);

  const logAnswer = useCallback(
    (
      questionId: string,
      disciplina: string = 'Geral',
      isCorrect: boolean,
      isAnulada?: boolean
    ) => {
      if (isAnulada) return;

      const todayKey = new Date().toLocaleDateString('pt-BR');

      setAnalytics((prev) => {
        const wasCorrect = prev.correctAnswerIds.includes(questionId);
        const wasWrong = prev.wrongAnswerIds.includes(questionId);
        const isNewAnswer = !wasCorrect && !wasWrong;

        // 1. Atualiza os arrays de IDs limpos
        const cleanCorrect = prev.correctAnswerIds.filter(
          (id) => id !== questionId
        );
        const cleanWrong = prev.wrongAnswerIds.filter(
          (id) => id !== questionId
        );

        const newCorrectIds = isCorrect
          ? [...cleanCorrect, questionId]
          : cleanCorrect;
        const newWrongIds = !isCorrect
          ? [...cleanWrong, questionId]
          : cleanWrong;

        // 2. Calcula variação dos totais
        let correctDiff = 0;
        let wrongDiff = 0;

        if (isNewAnswer) {
          if (isCorrect) correctDiff = 1;
          else wrongDiff = 1;
        } else if (wasCorrect && !isCorrect) {
          // Mudou de acerto para erro
          correctDiff = -1;
          wrongDiff = 1;
        } else if (wasWrong && isCorrect) {
          // Mudou de erro para acerto
          correctDiff = 1;
          wrongDiff = -1;
        }

        // 3. Atualiza Globais
        const newGlobal = {
          correct: Math.max(0, prev.global.correct + correctDiff),
          wrong: Math.max(0, prev.global.wrong + wrongDiff),
        };

        // 4. Atualiza Matéria/Assunto
        const currentSub = prev.subjects[disciplina] || {
          correct: 0,
          total: 0,
        };
        const newSubject = {
          correct: Math.max(0, currentSub.correct + correctDiff),
          total: isNewAnswer ? currentSub.total + 1 : currentSub.total,
        };

        // 5. Atualiza Histórico Diário
        const currentDaily = prev.daily[todayKey] || { correct: 0, total: 0 };
        const newDaily = {
          correct: Math.max(0, currentDaily.correct + correctDiff),
          total: isNewAnswer ? currentDaily.total + 1 : currentDaily.total,
        };

        const nextState: AnalyticsData = {
          correctAnswerIds: newCorrectIds,
          wrongAnswerIds: newWrongIds,
          answeredQuestions: Array.from(
            new Set([...newCorrectIds, ...newWrongIds])
          ),
          global: newGlobal,
          subjects: {
            ...prev.subjects,
            [disciplina]: newSubject,
          },
          daily: {
            ...prev.daily,
            [todayKey]: newDaily,
          },
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch (err) {
          console.error('Erro ao salvar no localStorage:', err);
        }

        return nextState;
      });
    },
    []
  );

  const clearAnalytics = useCallback(() => {
    const empty: AnalyticsData = {
      correctAnswerIds: [],
      wrongAnswerIds: [],
      answeredQuestions: [],
      daily: {},
      subjects: {},
      global: { correct: 0, wrong: 0 },
    };
    setAnalytics(empty);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    analytics,
    logAnswer,
    clearAnalytics,
  };
};
