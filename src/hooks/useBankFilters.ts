import { useState, useMemo } from 'react';
import type { Question } from '../types/question';
import type { AnalyticsData } from './useLocalAnalytics';

export interface QuestionWithSource extends Question {
  origemJson: string;
}

export type PerformanceFilter = 'all' | 'wrong' | 'correct';

interface SavedFilters {
  jsonFilter: string[];
  disciplinaFilter: string[];
  blocoFilter: string[];
  anoFilter: number[];
  excludeResolved: boolean;
  excludeCancelled: boolean;
  performanceFilter?: PerformanceFilter;
}

const LOCAL_STORAGE_FILTERS_KEY = 'simulado_app_applied_filters_v1';

const getSavedFilters = (): SavedFilters => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_FILTERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error('Erro ao carregar filtros salvos:', error);
  }
  return {
    jsonFilter: [],
    disciplinaFilter: [],
    blocoFilter: [],
    anoFilter: [],
    excludeResolved: false,
    excludeCancelled: false,
    performanceFilter: 'all',
  };
};

export const useBankFilters = (
  masterQuestions: QuestionWithSource[],
  analytics: AnalyticsData
) => {
  const initial = getSavedFilters();

  // Estados Temporários
  const [tempJsonFilter, setTempJsonFilter] = useState<string[]>(
    initial.jsonFilter
  );
  const [tempDisciplinaFilter, setTempDisciplinaFilter] = useState<string[]>(
    initial.disciplinaFilter
  );
  const [tempBlocoFilter, setTempBlocoFilter] = useState<string[]>(
    initial.blocoFilter
  );
  const [tempAnoFilter, setTempAnoFilter] = useState<number[]>(
    initial.anoFilter
  );
  const [tempExcludeResolved, setTempExcludeResolved] = useState<boolean>(
    initial.excludeResolved
  );
  const [tempExcludeCancelled, setTempExcludeCancelled] = useState<boolean>(
    initial.excludeCancelled
  );
  const [tempPerformanceFilter, setTempPerformanceFilter] =
    useState<PerformanceFilter>(initial.performanceFilter || 'all');

  // Estados Aplicados
  const [appliedJsonFilter, setAppliedJsonFilter] = useState<string[]>(
    initial.jsonFilter
  );
  const [appliedDisciplinaFilter, setAppliedDisciplinaFilter] = useState<
    string[]
  >(initial.disciplinaFilter);
  const [appliedBlocoFilter, setAppliedBlocoFilter] = useState<string[]>(
    initial.blocoFilter
  );
  const [appliedAnoFilter, setAppliedAnoFilter] = useState<number[]>(
    initial.anoFilter
  );
  const [appliedExcludeResolved, setAppliedExcludeResolved] = useState<boolean>(
    initial.excludeResolved
  );
  const [appliedExcludeCancelled, setAppliedExcludeCancelled] =
    useState<boolean>(initial.excludeCancelled);
  const [appliedPerformanceFilter, setAppliedPerformanceFilter] =
    useState<PerformanceFilter>(initial.performanceFilter || 'all');

  const [snapshotAnsweredQuestions, setSnapshotAnsweredQuestions] = useState<
    string[]
  >(() => analytics.answeredQuestions || []);

  const applyFilters = () => {
    setAppliedJsonFilter(tempJsonFilter);
    setAppliedDisciplinaFilter(tempDisciplinaFilter);
    setAppliedBlocoFilter(tempBlocoFilter);
    setAppliedAnoFilter(tempAnoFilter);
    setAppliedExcludeResolved(tempExcludeResolved);
    setAppliedExcludeCancelled(tempExcludeCancelled);
    setAppliedPerformanceFilter(tempPerformanceFilter);
    setSnapshotAnsweredQuestions(analytics.answeredQuestions);

    const filtersToSave: SavedFilters = {
      jsonFilter: tempJsonFilter,
      disciplinaFilter: tempDisciplinaFilter,
      blocoFilter: tempBlocoFilter,
      anoFilter: tempAnoFilter,
      excludeResolved: tempExcludeResolved,
      excludeCancelled: tempExcludeCancelled,
      performanceFilter: tempPerformanceFilter,
    };

    localStorage.setItem(
      LOCAL_STORAGE_FILTERS_KEY,
      JSON.stringify(filtersToSave)
    );
  };

  const clearAllFilters = () => {
    setTempJsonFilter([]);
    setTempDisciplinaFilter([]);
    setTempBlocoFilter([]);
    setTempAnoFilter([]);
    setTempExcludeResolved(false);
    setTempExcludeCancelled(false);
    setTempPerformanceFilter('all');

    setAppliedJsonFilter([]);
    setAppliedDisciplinaFilter([]);
    setAppliedBlocoFilter([]);
    setAppliedAnoFilter([]);
    setAppliedExcludeResolved(false);
    setAppliedExcludeCancelled(false);
    setAppliedPerformanceFilter('all');

    setSnapshotAnsweredQuestions([]);
    localStorage.removeItem(LOCAL_STORAGE_FILTERS_KEY);
  };

  // Processamento do array filtrado
  const filteredQuestions = useMemo(() => {
    let result = [...masterQuestions];

    if (appliedJsonFilter.length > 0) {
      result = result.filter((q) => appliedJsonFilter.includes(q.origemJson));
    }
    if (appliedDisciplinaFilter.length > 0) {
      result = result.filter((q) =>
        appliedDisciplinaFilter.includes(q.taxonomia?.disciplina || '')
      );
    }
    if (appliedBlocoFilter.length > 0) {
      result = result.filter((q) =>
        appliedBlocoFilter.includes(q.taxonomia?.bloco || '')
      );
    }
    if (appliedAnoFilter.length > 0) {
      result = result.filter((q) => appliedAnoFilter.includes(q.ano));
    }

    if (appliedExcludeResolved) {
      result = result.filter((q) => !snapshotAnsweredQuestions.includes(q.id));
    }

    if (appliedExcludeCancelled) {
      result = result.filter((q) => q.gabarito !== 'N');
    }

    if (appliedPerformanceFilter === 'correct') {
      const setCorrect = new Set(analytics.correctAnswerIds);
      result = result.filter((q) => setCorrect.has(q.id));
    } else if (appliedPerformanceFilter === 'wrong') {
      const setWrong = new Set(analytics.wrongAnswerIds);
      result = result.filter((q) => setWrong.has(q.id));
    }

    return result;
  }, [
    masterQuestions,
    appliedJsonFilter,
    appliedDisciplinaFilter,
    appliedBlocoFilter,
    appliedAnoFilter,
    appliedExcludeResolved,
    appliedExcludeCancelled,
    appliedPerformanceFilter,
    snapshotAnsweredQuestions,
    analytics.correctAnswerIds,
    analytics.wrongAnswerIds,
  ]);

  return {
    tempJsonFilter,
    setTempJsonFilter,
    tempDisciplinaFilter,
    setTempDisciplinaFilter,
    tempBlocoFilter,
    setTempBlocoFilter,
    tempAnoFilter,
    setTempAnoFilter,
    tempExcludeResolved,
    setTempExcludeResolved,
    tempExcludeCancelled,
    setTempExcludeCancelled,
    tempPerformanceFilter,
    setTempPerformanceFilter,
    appliedJsonFilter,
    appliedDisciplinaFilter,
    appliedBlocoFilter,
    appliedAnoFilter,
    appliedExcludeResolved,
    appliedExcludeCancelled,
    appliedPerformanceFilter,
    applyFilters,
    clearAllFilters,
    filteredQuestions,
  };
};
