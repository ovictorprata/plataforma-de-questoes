import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBankSection } from './components/FilterBankSection';
import { ExamSetup } from './components/ExamSetup';
import { QuestionCard } from './components/QuestionCard';
import { Pagination } from './components/Pagination';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Footer } from './components/Footer';
import { SimuladoTimer } from './components/SimuladoTimer';
import { SimuladoResultSummary } from './components/SimuladoResultSummary';
import { useLocalAnalytics } from './hooks/useLocalAnalytics';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import type { Question } from './types/question';
import { MaterialsSidebarLayout } from './components/MaterialsSidebarLayout';
export interface QuestionWithSource extends Question {
  origemJson: string;
}

interface JsonModule {
  default: Question[];
}

const LOCAL_STORAGE_FILTERS_KEY = 'simulado_app_applied_filters_v1';

interface SavedFilters {
  jsonFilter: string[];
  disciplinaFilter: string[];
  blocoFilter: string[];
  anoFilter: number[];
  excludeResolved: boolean;
}

const getSavedFilters = (): SavedFilters => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_FILTERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Erro ao carregar filtros salvos do localStorage:", error);
  }
  return {
    jsonFilter: [],
    disciplinaFilter: [],
    blocoFilter: [],
    anoFilter: [],
    excludeResolved: false,
  };
};

export const App: React.FC = () => {
  const { analytics, logAnswer } = useLocalAnalytics();
  
  const [activeTab, setActiveTab] = useState<'banco' | 'simulado' | 'analytics' | 'materiais'>('banco');
  
  const [masterQuestions, setMasterQuestions] = useState<QuestionWithSource[]>([]);
  const [simuladoQuestions, setSimuladoQuestions] = useState<Question[]>([]);
  const [jsonFilesList, setJsonFilesList] = useState<string[]>([]);
  
  const [simuladoAnswers, setSimuladoAnswers] = useState<Record<string, string>>({});
  const [isSimuladoSubmitted, setIsSimuladoSubmitted] = useState<boolean>(false);
  const [simuladoStartTime, setSimuladoStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const [tempJsonFilter, setTempJsonFilter] = useState<string[]>(() => getSavedFilters().jsonFilter);
  const [tempDisciplinaFilter, setTempDisciplinaFilter] = useState<string[]>(() => getSavedFilters().disciplinaFilter);
  const [tempBlocoFilter, setTempBlocoFilter] = useState<string[]>(() => getSavedFilters().blocoFilter);
  const [tempAnoFilter, setTempAnoFilter] = useState<number[]>(() => getSavedFilters().anoFilter);
  const [tempExcludeResolved, setTempExcludeResolved] = useState<boolean>(() => getSavedFilters().excludeResolved);

  const [appliedJsonFilter, setAppliedJsonFilter] = useState<string[]>(() => getSavedFilters().jsonFilter);
  const [appliedDisciplinaFilter, setAppliedDisciplinaFilter] = useState<string[]>(() => getSavedFilters().disciplinaFilter);
  const [appliedBlocoFilter, setAppliedBlocoFilter] = useState<string[]>(() => getSavedFilters().blocoFilter);
  const [appliedAnoFilter, setAppliedAnoFilter] = useState<number[]>(() => getSavedFilters().anoFilter);
  const [appliedExcludeResolved, setAppliedExcludeResolved] = useState<boolean>(() => getSavedFilters().excludeResolved);
  
  const [snapshotAnsweredQuestions, setSnapshotAnsweredQuestions] = useState<string[]>(() => {
    return analytics.answeredQuestions || [];
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    async function carregarTodasAsQuestoes() {
      try {
        const modulos = import.meta.glob<JsonModule>('./data/questoes/*.json');
        const todasAsPromessas: Promise<{ mod: JsonModule; nomeLimpo: string }>[] = [];
        const nomesArquivos: string[] = [];

        for (const caminho in modulos) {
          const nomeLimpo = caminho.split('/').pop()?.replace('.json', '') || caminho;
          nomesArquivos.push(nomeLimpo);
          todasAsPromessas.push(
            modulos[caminho]().then((mod) => ({ mod, nomeLimpo }))
          );
        }

        setJsonFilesList(nomesArquivos);
        const resultados = await Promise.all(todasAsPromessas);
        
        const todasQuestoes: QuestionWithSource[] = resultados.flatMap(({ mod, nomeLimpo }) => 
          mod.default.map((q) => ({ ...q, origemJson: nomeLimpo }))
        );
        
        setMasterQuestions(todasQuestoes);
      } catch (error) {
        console.error("Erro ao carregar dados dinamicamente:", error);
      }
    }
    carregarTodasAsQuestoes();
  }, []);

  const masterQuestionsFilteredByJson = useMemo(() => {
    if (tempJsonFilter.length === 0) {
      return masterQuestions;
    }
    return masterQuestions.filter((q) => tempJsonFilter.includes(q.origemJson));
  }, [masterQuestions, tempJsonFilter]);

  const disciplinasDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        masterQuestionsFilteredByJson.map((q) => q.taxonomia?.disciplina || 'Geral')
      )
    );
  }, [masterQuestionsFilteredByJson]);

  const questoesMapeamento = useMemo(() => {
    return masterQuestionsFilteredByJson.map((q) => ({
      disciplina: q.taxonomia?.disciplina || 'Geral',
      bloco: q.taxonomia?.bloco,
    }));
  }, [masterQuestionsFilteredByJson]);

  const anosDisponiveis = useMemo(() => {
    return Array.from(
      new Set(masterQuestionsFilteredByJson.map((q) => q.ano))
    ).sort((a, b) => b - a);
  }, [masterQuestionsFilteredByJson]);

  const handleToggleJsonFilter = (item: string) => {
    const nextJsonFilter = tempJsonFilter.includes(item)
      ? tempJsonFilter.filter((i) => i !== item)
      : [...tempJsonFilter, item];

    setTempJsonFilter(nextJsonFilter);

    if (nextJsonFilter.length > 0) {
      const novasQuestoes = masterQuestions.filter((q) => nextJsonFilter.includes(q.origemJson));
      
      const validDisciplinas = new Set(novasQuestoes.map((q) => q.taxonomia?.disciplina || 'Geral'));
      const validBlocos = new Set(novasQuestoes.map((q) => q.taxonomia?.bloco).filter(Boolean));
      const validAnos = new Set(novasQuestoes.map((q) => q.ano));

      setTempDisciplinaFilter((prev) => prev.filter((d) => validDisciplinas.has(d)));
      setTempBlocoFilter((prev) => prev.filter((b) => validBlocos.has(b)));
      setTempAnoFilter((prev) => prev.filter((a) => validAnos.has(a as number)));
    }
  };

  const handleClearJsonFilter = () => {
    setTempJsonFilter([]);
  };

  const displayQuestions = useMemo(() => {
    if (activeTab === 'simulado') {
      return simuladoQuestions;
    }

    if (activeTab === 'banco') {
      let filtradas = [...masterQuestions];

      if (appliedJsonFilter.length > 0) {
        filtradas = filtradas.filter((q) => appliedJsonFilter.includes(q.origemJson));
      }
      if (appliedDisciplinaFilter.length > 0) {
        filtradas = filtradas.filter((q) =>
          appliedDisciplinaFilter.includes(q.taxonomia?.disciplina || '')
        );
      }
      if (appliedBlocoFilter.length > 0) {
        filtradas = filtradas.filter((q) =>
          appliedBlocoFilter.includes(q.taxonomia?.bloco || '')
        );
      }
      if (appliedAnoFilter.length > 0) {
        filtradas = filtradas.filter((q) => appliedAnoFilter.includes(q.ano));
      }
      if (appliedExcludeResolved) {
        filtradas = filtradas.filter((q) => {
          return !snapshotAnsweredQuestions.includes(q.id);
        });
      }

      return filtradas;
    }

    return [];
  }, [
    activeTab,
    masterQuestions,
    simuladoQuestions,
    appliedJsonFilter,
    appliedDisciplinaFilter,
    appliedBlocoFilter,
    appliedAnoFilter,
    appliedExcludeResolved,
    snapshotAnsweredQuestions,
  ]);

  const handleApplyFilters = () => {
    setAppliedJsonFilter(tempJsonFilter);
    setAppliedDisciplinaFilter(tempDisciplinaFilter);
    setAppliedBlocoFilter(tempBlocoFilter);
    setAppliedAnoFilter(tempAnoFilter);
    setAppliedExcludeResolved(tempExcludeResolved);
    
    setSnapshotAnsweredQuestions(analytics.answeredQuestions);
    setCurrentPage(1);

    const filtersToSave: SavedFilters = {
      jsonFilter: tempJsonFilter,
      disciplinaFilter: tempDisciplinaFilter,
      blocoFilter: tempBlocoFilter,
      anoFilter: tempAnoFilter,
      excludeResolved: tempExcludeResolved,
    };

    localStorage.setItem(LOCAL_STORAGE_FILTERS_KEY, JSON.stringify(filtersToSave));
  };

  const handleClearAllFilters = () => {
    setTempJsonFilter([]);
    setTempDisciplinaFilter([]);
    setTempBlocoFilter([]);
    setTempAnoFilter([]);
    setTempExcludeResolved(false);

    setAppliedJsonFilter([]);
    setAppliedDisciplinaFilter([]);
    setAppliedBlocoFilter([]);
    setAppliedAnoFilter([]);
    setAppliedExcludeResolved(false);

    setSnapshotAnsweredQuestions([]);

    localStorage.removeItem(LOCAL_STORAGE_FILTERS_KEY);
    setCurrentPage(1);
  };

  const handleSimuladoGeneration = (generatedQuestions: Question[]) => {
    setSimuladoQuestions(generatedQuestions);
    setSimuladoAnswers({});
    setIsSimuladoSubmitted(false);
    setSimuladoStartTime(Date.now());
    setElapsedSeconds(0);
    setCurrentPage(1); 
  };

  const handleResetSimulado = () => {
    setSimuladoQuestions([]);
    setSimuladoAnswers({});
    setIsSimuladoSubmitted(false);
    setSimuladoStartTime(null);
    setElapsedSeconds(0);
    setCurrentPage(1);
  };

  const handleSelectSimuladoAnswer = (questionId: string, letra: string) => {
    setSimuladoAnswers((prev) => ({
      ...prev,
      [questionId]: letra,
    }));
  };

  const handleFinishSimulado = () => {
    const total = simuladoQuestions.length;
    const respondidas = Object.keys(simuladoAnswers).length;

    if (respondidas < total) {
      const confirma = window.confirm(
        `Você respondeu ${respondidas} de ${total} questões. Deseja realmente finalizar o simulado e ver seu resultado?`
      );
      if (!confirma) return;
    }

    if (simuladoStartTime) {
      const segundosDecorridos = Math.max(1, Math.round((Date.now() - simuladoStartTime) / 1000));
      setElapsedSeconds(segundosDecorridos);
    }

    setIsSimuladoSubmitted(true);

    simuladoQuestions.forEach((q) => {
      const resposta = simuladoAnswers[q.id];
      if (resposta) {
        logAnswer(q.id, q.taxonomia?.disciplina || 'Geral', resposta === q.gabarito);
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (aba: 'banco' | 'simulado' | 'analytics' | 'materiais') => {
    setActiveTab(aba);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const indexLastQuestion = currentPage * pageSize;
  const indexFirstQuestion = indexLastQuestion - pageSize;
  const currentQuestionsBatchSlice = displayQuestions.slice(indexFirstQuestion, indexLastQuestion);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased overflow-x-hidden">
      <Header activeTab={activeTab} onNavigate={handleNavigate} />

      <main
        className={`flex-1 w-full pb-12 ${
          activeTab === 'materiais'
            ? 'px-0 max-w-full'
            : 'max-w-3xl mx-auto px-3 md:px-4 py-6'
        }`}
      >
        {/* ABA BANCO DE QUESTÕES */}
        {activeTab === 'banco' && (
          <div className="space-y-4">
            <FilterBankSection
              jsonFilesList={jsonFilesList}
              disciplinasDisponiveis={disciplinasDisponiveis}
              questoesMapeamento={questoesMapeamento}
              anosDisponiveis={anosDisponiveis}
              tempJsonFilter={tempJsonFilter}
              setTempJsonFilter={setTempJsonFilter}
              onToggleJsonFilter={handleToggleJsonFilter}
              onClearJsonFilter={handleClearJsonFilter}
              tempDisciplinaFilter={tempDisciplinaFilter}
              setTempDisciplinaFilter={setTempDisciplinaFilter}
              tempBlocoFilter={tempBlocoFilter}
              setTempBlocoFilter={setTempBlocoFilter}
              tempAnoFilter={tempAnoFilter}
              setTempAnoFilter={setTempAnoFilter}
              tempExcludeResolved={tempExcludeResolved}
              setTempExcludeResolved={setTempExcludeResolved}
              appliedJsonFilter={appliedJsonFilter}
              appliedDisciplinaFilter={appliedDisciplinaFilter}
              appliedBlocoFilter={appliedBlocoFilter}
              appliedAnoFilter={appliedAnoFilter}
              appliedExcludeResolved={appliedExcludeResolved}
              onApplyFilters={handleApplyFilters}
              onClearAllFilters={handleClearAllFilters}
              totalQuestions={displayQuestions.length}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />

            <div className="space-y-4">
              {currentQuestionsBatchSlice.map((question) => {
                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onAnswerLogged={(isCorrect, isAnulada, questionId, bloco) => {
                      logAnswer(
                        questionId || question.id,
                        bloco || question.taxonomia?.bloco || 'Geral',
                        isCorrect,
                        isAnulada
                      );
                    }}
                  />
                );
              })}
              
              {displayQuestions.length === 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-2 shadow-sm">
                  <p className="text-slate-700 font-semibold text-sm">
                    Nenhuma questão encontrada
                  </p>
                  <p className="text-xs text-slate-400">
                    Tente ajustar ou limpar os filtros para encontrar mais questões.
                  </p>
                </div>
              )}
            </div>

            {displayQuestions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalQuestions={displayQuestions.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={setPageSize}
                mode="navigationOnly"
              />
            )}
          </div>
        )}

        {/* ABA SIMULADO */}
        {activeTab === 'simulado' && (
          displayQuestions.length === 0 ? (
            <ExamSetup 
              questionsMasterList={masterQuestions} 
              onGenerate={handleSimuladoGeneration} 
            />
          ) : (
            <div className="space-y-4">
              {!isSimuladoSubmitted && (
                <SimuladoTimer
                  key={simuladoQuestions.length}
                  totalQuestions={simuladoQuestions.length}
                  onResetSimulado={handleResetSimulado}
                />
              )}

              {isSimuladoSubmitted && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetSimulado}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Gerar novo simulado</span>
                  </button>
                </div>
              )}

              {isSimuladoSubmitted && (
                <SimuladoResultSummary
                  questions={simuladoQuestions}
                  answers={simuladoAnswers}
                  tempoTotalSegundos={elapsedSeconds}
                />
              )}

              <div className="space-y-4">
                {displayQuestions.map((question) => {
                  return (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      isSimulado={true}
                      isSubmitted={isSimuladoSubmitted}
                      selectedAnswer={simuladoAnswers[question.id] || null}
                      onSelectAnswer={(letra) => handleSelectSimuladoAnswer(question.id, letra)}
                    />
                  );
                })}
              </div>

              {!isSimuladoSubmitted && (
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                  <span className="text-xs text-slate-500 font-medium">
                    Progresso: <strong className="text-slate-800">{Object.keys(simuladoAnswers).length}</strong> de <strong className="text-slate-800">{simuladoQuestions.length}</strong> questões respondidas
                  </span>

                  <button
                    type="button"
                    onClick={handleFinishSimulado}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalizar e Ver Resultado</span>
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* ABA ANALYTICS */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard analytics={analytics} />
        )}

        {/* 📚 ABA MATERIAIS */}
        {activeTab === 'materiais' && (
          <MaterialsSidebarLayout
            masterQuestions={masterQuestions}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};