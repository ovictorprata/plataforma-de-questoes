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
import { useBankFilters } from './hooks/useBankFilters';
import type { Question } from './types/question';
import { MaterialsSidebarLayout } from './components/MaterialsSidebarLayout';

export interface QuestionWithSource extends Question {
  origemJson: string;
}

interface JsonModule {
  default: Question[];
}

export const App: React.FC = () => {
  const { analytics, logAnswer } = useLocalAnalytics();
  const [activeTab, setActiveTab] = useState<
    'banco' | 'simulado' | 'analytics' | 'materiais'
  >('banco');
  const [masterQuestions, setMasterQuestions] = useState<QuestionWithSource[]>(
    []
  );
  const [simuladoQuestions, setSimuladoQuestions] = useState<Question[]>([]);
  const [jsonFilesList, setJsonFilesList] = useState<string[]>([]);
  const [simuladoAnswers, setSimuladoAnswers] = useState<
    Record<string, string>
  >({});
  const [isSimuladoSubmitted, setIsSimuladoSubmitted] =
    useState<boolean>(false);
  const [simuladoStartTime, setSimuladoStartTime] = useState<number | null>(
    null
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // 🎯 Custom Hook de Filtros
  const bankFilters = useBankFilters(masterQuestions, analytics);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    async function carregarTodasAsQuestoes() {
      try {
        const modulos = import.meta.glob<JsonModule>('./data/questoes/*.json');
        const todasAsPromessas: Promise<{
          mod: JsonModule;
          nomeLimpo: string;
        }>[] = [];
        const nomesArquivos: string[] = [];

        for (const caminho in modulos) {
          const nomeLimpo =
            caminho.split('/').pop()?.replace('.json', '') || caminho;
          nomesArquivos.push(nomeLimpo);
          todasAsPromessas.push(
            modulos[caminho]().then((mod) => ({ mod, nomeLimpo }))
          );
        }

        setJsonFilesList(nomesArquivos);
        const resultados = await Promise.all(todasAsPromessas);
        const todasQuestoes: QuestionWithSource[] = resultados.flatMap(
          ({ mod, nomeLimpo }) =>
            mod.default.map((q) => ({ ...q, origemJson: nomeLimpo }))
        );

        setMasterQuestions(todasQuestoes);
      } catch (error) {
        console.error('Erro ao carregar dados dinamicamente:', error);
      }
    }
    carregarTodasAsQuestoes();
  }, []);

  const disciplinasDisponiveis = useMemo(() => {
    return Array.from(
      new Set(masterQuestions.map((q) => q.taxonomia?.disciplina || 'Geral'))
    );
  }, [masterQuestions]);

  const questoesMapeamento = useMemo(() => {
    return masterQuestions.map((q) => ({
      disciplina: q.taxonomia?.disciplina || 'Geral',
      bloco: q.taxonomia?.bloco,
    }));
  }, [masterQuestions]);

  const anosDisponiveis = useMemo(() => {
    return Array.from(new Set(masterQuestions.map((q) => q.ano))).sort(
      (a, b) => b - a
    );
  }, [masterQuestions]);

  const displayQuestions =
    activeTab === 'simulado'
      ? simuladoQuestions
      : bankFilters.filteredQuestions;

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

  const handleFinishSimulado = () => {
    if (simuladoStartTime) {
      setElapsedSeconds(
        Math.max(1, Math.round((Date.now() - simuladoStartTime) / 1000))
      );
    }
    setIsSimuladoSubmitted(true);
    simuladoQuestions.forEach((q) => {
      const resposta = simuladoAnswers[q.id];
      if (resposta) {
        logAnswer(
          q.id,
          q.taxonomia?.bloco || q.taxonomia?.disciplina || 'Geral',
          resposta === q.gabarito
        );
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentQuestionsSlice = displayQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased overflow-x-hidden">
      <Header
        activeTab={activeTab}
        onNavigate={(aba) => {
          setActiveTab(aba);
          setCurrentPage(1);
        }}
      />

      <main
        className={`flex-1 w-full pb-12 ${activeTab === 'materiais' ? 'px-0 max-w-full' : 'max-w-3xl mx-auto px-3 md:px-4 py-6'}`}
      >
        {activeTab === 'banco' && (
          <div className="space-y-4">
            <FilterBankSection
              jsonFilesList={jsonFilesList}
              disciplinasDisponiveis={disciplinasDisponiveis}
              questoesMapeamento={questoesMapeamento}
              anosDisponiveis={anosDisponiveis}
              {...bankFilters}
              onApplyFilters={() => {
                bankFilters.applyFilters();
                setCurrentPage(1);
              }}
              onClearAllFilters={() => {
                bankFilters.clearAllFilters();
                setCurrentPage(1);
              }}
              totalQuestions={displayQuestions.length}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />

            <div className="space-y-4">
              {currentQuestionsSlice.map((question) => (
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
              ))}

              {displayQuestions.length === 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-2 shadow-sm">
                  <p className="text-slate-700 font-semibold text-sm">
                    Nenhuma questão encontrada
                  </p>
                  <p className="text-xs text-slate-400">
                    Tente ajustar os filtros.
                  </p>
                </div>
              )}
            </div>

            {displayQuestions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalQuestions={displayQuestions.length}
                pageSize={pageSize}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPageSizeChange={setPageSize}
                mode="navigationOnly"
              />
            )}
          </div>
        )}

        {activeTab === 'simulado' &&
          (displayQuestions.length === 0 ? (
            <ExamSetup
              questionsMasterList={masterQuestions}
              onGenerate={handleSimuladoGeneration}
            />
          ) : (
            <div className="space-y-4">
              {!isSimuladoSubmitted && (
                <SimuladoTimer
                  totalQuestions={simuladoQuestions.length}
                  onResetSimulado={handleResetSimulado}
                />
              )}
              {isSimuladoSubmitted && (
                <SimuladoResultSummary
                  questions={simuladoQuestions}
                  answers={simuladoAnswers}
                  tempoTotalSegundos={elapsedSeconds}
                />
              )}
              <div className="space-y-4">
                {displayQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isSimulado={true}
                    isSubmitted={isSimuladoSubmitted}
                    selectedAnswer={simuladoAnswers[q.id] || null}
                    onSelectAnswer={(letra) =>
                      setSimuladoAnswers((prev) => ({ ...prev, [q.id]: letra }))
                    }
                  />
                ))}
              </div>
              {!isSimuladoSubmitted && (
                <button
                  type="button"
                  onClick={handleFinishSimulado}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition-all"
                >
                  Finalizar e Ver Resultado
                </button>
              )}
            </div>
          ))}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard analytics={analytics} />
        )}
        {activeTab === 'materiais' && (
          <MaterialsSidebarLayout masterQuestions={masterQuestions} />
        )}
      </main>

      <Footer />
    </div>
  );
};
