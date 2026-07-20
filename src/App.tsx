import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBankSection } from './components/FilterBankSection';
import { ExamSetup } from './components/ExamSetup';
import type { Question } from './components/ExamSetup';
import { QuestionCard } from './components/QuestionCard';
import { Pagination } from './components/Pagination';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { useLocalAnalytics } from './hooks/useLocalAnalytics';

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
  
  // Estados temporários dos Filtros
  const [tempJsonFilter, setTempJsonFilter] = useState<string[]>([]);
  const [tempBlocoFilter, setTempBlocoFilter] = useState<string[]>([]);
  const [tempAnoFilter, setTempAnoFilter] = useState<number[]>([]);
  const [tempExcludeResolved, setTempExcludeResolved] = useState<boolean>(false);

  // Estados aplicados
  const [appliedJsonFilter, setAppliedJsonFilter] = useState<string[]>([]);
  const [appliedBlocoFilter, setAppliedBlocoFilter] = useState<string[]>([]);
  const [appliedAnoFilter, setAppliedAnoFilter] = useState<number[]>([]);
  const [appliedExcludeResolved, setAppliedExcludeResolved] = useState<boolean>(false);
  
  // NOVO: Guarda a lista de resolvidas CONGELADA no momento do clique em "Aplicar Filtros"
  const [snapshotAnsweredQuestions, setSnapshotAnsweredQuestions] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  useEffect(() => {
    async function carregarTodasAsQuestoes() {
      try {
        const modulos = import.meta.glob<JsonModule>('./data/*.json');
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

  // O filtro usa snapshotAnsweredQuestions em vez de analytics.answeredQuestions
  const displayQuestions = useMemo(() => {
    if (activeTab === 'simulado') {
      return simuladoQuestions;
    }

    if (activeTab === 'banco') {
      let filtradas = [...masterQuestions];

      if (appliedJsonFilter.length > 0) {
        filtradas = filtradas.filter((q) => appliedJsonFilter.includes(q.origemJson));
      }
      if (appliedBlocoFilter.length > 0) {
        filtradas = filtradas.filter((q) => appliedBlocoFilter.includes(q.bloco));
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
    appliedBlocoFilter,
    appliedAnoFilter,
    appliedExcludeResolved,
    snapshotAnsweredQuestions, // <-- Só recalcula quando a snapshot muda!
  ]);

  const blocosDisponiveis = Array.from(new Set(masterQuestions.map((q) => q.bloco)));
  const anosDisponiveis = Array.from(new Set(masterQuestions.map((q) => q.ano))).sort((a, b) => b - a);

  // Aqui nós salvamos a foto das questões resolvidas do exato momento do clique
  const handleApplyFilters = () => {
    setAppliedJsonFilter(tempJsonFilter);
    setAppliedBlocoFilter(tempBlocoFilter);
    setAppliedAnoFilter(tempAnoFilter);
    setAppliedExcludeResolved(tempExcludeResolved);
    setSnapshotAnsweredQuestions(analytics.answeredQuestions); // <-- Tira o "snapshot" das resolvidas
    setCurrentPage(1);
  };

  const handleSimuladoGeneration = (generatedQuestions: Question[]) => {
    setSimuladoQuestions(generatedQuestions);
    setCurrentPage(1); 
  };

  const handleNavigate = (aba: 'banco' | 'simulado' | 'analytics') => {
    setActiveTab(aba);
    setCurrentPage(1);
  };

  const indexLastQuestion = currentPage * pageSize;
  const indexFirstQuestion = indexLastQuestion - pageSize;
  const currentQuestionsBatchSlice = displayQuestions.slice(indexFirstQuestion, indexLastQuestion);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased overflow-x-hidden">
      <Header activeTab={activeTab} onNavigate={handleNavigate} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-3 md:px-4 py-6 pb-24">
        {activeTab === 'banco' && (
          <div className="space-y-4">
            <FilterBankSection
              jsonFilesList={jsonFilesList}
              blocosDisponiveis={blocosDisponiveis}
              anosDisponiveis={anosDisponiveis}
              tempJsonFilter={tempJsonFilter}
              setTempJsonFilter={setTempJsonFilter}
              tempBlocoFilter={tempBlocoFilter}
              setTempBlocoFilter={setTempBlocoFilter}
              tempAnoFilter={tempAnoFilter}
              setTempAnoFilter={setTempAnoFilter}
              tempExcludeResolved={tempExcludeResolved}
              setTempExcludeResolved={setTempExcludeResolved}
              
              /* Novas props para comparação de estado pendente */
              appliedJsonFilter={appliedJsonFilter}
              appliedBlocoFilter={appliedBlocoFilter}
              appliedAnoFilter={appliedAnoFilter}
              appliedExcludeResolved={appliedExcludeResolved}

              onApplyFilters={handleApplyFilters}
            />

            <div className="space-y-4">
              {currentQuestionsBatchSlice.map((question) => {
                const idComposto = `${(question as QuestionWithSource).origemJson || 'q'}-${question.id}`;
                return (
                  <QuestionCard
                    key={idComposto}
                    question={question}
                    onAnswerLogged={(isCorrect) => logAnswer(idComposto, question.bloco, isCorrect)}
                  />
                );
              })}
              {displayQuestions.length === 0 && (
                <p className="text-center text-slate-400 py-12 text-sm">
                  Nenhuma questão corresponde aos filtros selecionados.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'simulado' && (
          displayQuestions.length === 0 ? (
            <ExamSetup 
              questionsMasterList={masterQuestions} 
              onGenerate={handleSimuladoGeneration} 
            />
          ) : (
            <div className="space-y-4">
              {currentQuestionsBatchSlice.map((question) => {
                const idComposto = `${(question as QuestionWithSource).origemJson || 'q'}-${question.id}`;
                return (
                  <QuestionCard
                    key={idComposto}
                    question={question}
                    onAnswerLogged={(isCorrect) => logAnswer(idComposto, question.bloco, isCorrect)}
                  />
                );
              })}
            </div>
          )
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard analytics={analytics} />
        )}
      </main>

      {activeTab !== 'analytics' && displayQuestions.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalQuestions={displayQuestions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1); 
          }}
        />
      )}
    </div>
  );
};