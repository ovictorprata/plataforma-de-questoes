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

export interface QuestionWithSource extends Question {
  origemJson: string;
}

interface JsonModule {
  default: Question[];
}

export const App: React.FC = () => {
  const { analytics, logAnswer } = useLocalAnalytics();
  
  const [activeTab, setActiveTab] = useState<'banco' | 'simulado' | 'analytics'>('banco');
  
  const [masterQuestions, setMasterQuestions] = useState<QuestionWithSource[]>([]);
  const [simuladoQuestions, setSimuladoQuestions] = useState<Question[]>([]);
  const [jsonFilesList, setJsonFilesList] = useState<string[]>([]);
  
  const [simuladoAnswers, setSimuladoAnswers] = useState<Record<string, string>>({});
  const [isSimuladoSubmitted, setIsSimuladoSubmitted] = useState<boolean>(false);
  const [simuladoStartTime, setSimuladoStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const [tempJsonFilter, setTempJsonFilter] = useState<string[]>([]);
  const [tempDisciplinaFilter, setTempDisciplinaFilter] = useState<string[]>([]);
  const [tempBlocoFilter, setTempBlocoFilter] = useState<string[]>([]);
  const [tempAnoFilter, setTempAnoFilter] = useState<number[]>([]);
  const [tempExcludeResolved, setTempExcludeResolved] = useState<boolean>(false);

  const [appliedJsonFilter, setAppliedJsonFilter] = useState<string[]>([]);
  const [appliedDisciplinaFilter, setAppliedDisciplinaFilter] = useState<string[]>([]);
  const [appliedBlocoFilter, setAppliedBlocoFilter] = useState<string[]>([]);
  const [appliedAnoFilter, setAppliedAnoFilter] = useState<number[]>([]);
  const [appliedExcludeResolved, setAppliedExcludeResolved] = useState<boolean>(false);
  
  const [snapshotAnsweredQuestions, setSnapshotAnsweredQuestions] = useState<string[]>([]);

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

  const disciplinasDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        masterQuestions.map((q) => q.taxonomia?.disciplina || 'Geral')
      )
    );
  }, [masterQuestions]);

  const questoesMapeamento = useMemo(() => {
    return masterQuestions.map((q) => ({
      disciplina: q.taxonomia?.disciplina || 'Geral',
      bloco: q.taxonomia?.bloco,
    }));
  }, [masterQuestions]);

  const anosDisponiveis = useMemo(() => {
    return Array.from(new Set(masterQuestions.map((q) => q.ano))).sort((a, b) => b - a);
  }, [masterQuestions]);

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
          const idComposto = `${q.origemJson}-${q.id}`;
          return !snapshotAnsweredQuestions.includes(idComposto);
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

  const handleSelectSimuladoAnswer = (idComposto: string, letra: string) => {
    setSimuladoAnswers((prev) => ({
      ...prev,
      [idComposto]: letra,
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
      const idComposto = `${(q as QuestionWithSource).origemJson || 'q'}-${q.id}`;
      const resposta = simuladoAnswers[idComposto];
      if (resposta) {
        logAnswer(idComposto, q.taxonomia?.disciplina || 'Geral', resposta === q.gabarito);
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (aba: 'banco' | 'simulado' | 'analytics') => {
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-3 md:px-4 py-6 pb-12">
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
              totalQuestions={displayQuestions.length}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />

            {/* Lista de Questões Paginadas */}
            <div className="space-y-4">
              {currentQuestionsBatchSlice.map((question) => {
                const idComposto = `${(question as QuestionWithSource).origemJson || 'q'}-${question.id}`;
                return (
                  <QuestionCard
                    key={idComposto}
                    question={question}
                    onAnswerLogged={(isCorrect) =>
                      logAnswer(idComposto, question.taxonomia?.disciplina || 'Geral', isCorrect)
                    }
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

            {/* Navegação da Paginação (Apenas no Banco de Questões) */}
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

        {/* ABA SIMULADO (Exibe todas as questões sem paginação) */}
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

              {/* 🎯 Lista Completa do Simulado (Mostra TODAS as questões de uma vez) */}
              <div className="space-y-4">
                {displayQuestions.map((question) => {
                  const idComposto = `${(question as QuestionWithSource).origemJson || 'q'}-${question.id}`;
                  return (
                    <QuestionCard
                      key={idComposto}
                      question={question}
                      isSimulado={true}
                      isSubmitted={isSimuladoSubmitted}
                      selectedAnswer={simuladoAnswers[idComposto] || null}
                      onSelectAnswer={(letra) => handleSelectSimuladoAnswer(idComposto, letra)}
                    />
                  );
                })}
              </div>

              {/* Card de Finalização do Simulado */}
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
      </main>

      <Footer />
    </div>
  );
};