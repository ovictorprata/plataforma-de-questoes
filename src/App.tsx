import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBankSection } from './components/FilterBankSection';
import { ExamSetup } from './components/ExamSetup';
import { QuestionCard } from './components/QuestionCard';
import { Pagination } from './components/Pagination';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Footer } from './components/Footer';
import { useLocalAnalytics } from './hooks/useLocalAnalytics';
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
  
  // Estados temporários dos Filtros
  const [tempJsonFilter, setTempJsonFilter] = useState<string[]>([]);
  const [tempDisciplinaFilter, setTempDisciplinaFilter] = useState<string[]>([]);
  const [tempBlocoFilter, setTempBlocoFilter] = useState<string[]>([]);
  const [tempAnoFilter, setTempAnoFilter] = useState<number[]>([]);
  const [tempExcludeResolved, setTempExcludeResolved] = useState<boolean>(false);

  // Estados aplicados dos Filtros
  const [appliedJsonFilter, setAppliedJsonFilter] = useState<string[]>([]);
  const [appliedDisciplinaFilter, setAppliedDisciplinaFilter] = useState<string[]>([]);
  const [appliedBlocoFilter, setAppliedBlocoFilter] = useState<string[]>([]);
  const [appliedAnoFilter, setAppliedAnoFilter] = useState<number[]>([]);
  const [appliedExcludeResolved, setAppliedExcludeResolved] = useState<boolean>(false);
  
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

  // Extrai a lista de todas as disciplinas únicas
  const disciplinasDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        masterQuestions.map((q) => q.taxonomia?.disciplina || 'Geral')
      )
    );
  }, [masterQuestions]);

  // Mapeamento que associa cada questão à sua disciplina e bloco
  const questoesMapeamento = useMemo(() => {
    return masterQuestions.map((q) => ({
      disciplina: q.taxonomia?.disciplina || 'Geral',
      bloco: q.taxonomia?.bloco,
    }));
  }, [masterQuestions]);

  // Extrai os anos disponíveis
  const anosDisponiveis = useMemo(() => {
    return Array.from(new Set(masterQuestions.map((q) => q.ano))).sort((a, b) => b - a);
  }, [masterQuestions]);

  // Aplica a lógica de filtragem nas questões
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-3 md:px-4 py-6 pb-12">
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
            />

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
                    onAnswerLogged={(isCorrect) =>
                      logAnswer(idComposto, question.taxonomia?.disciplina || 'Geral', isCorrect)
                    }
                  />
                );
              })}
            </div>
          )
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard analytics={analytics} />
        )}

        {/* Paginação */}
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
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
};