import { useState, useEffect } from 'react';
import { ExamSetup } from './components/ExamSetup';
import type { Question } from './components/ExamSetup';
import { QuestionCard } from './components/QuestionCard';
import { Pagination } from './components/Pagination';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { useLocalAnalytics } from './hooks/useLocalAnalytics';
import { BookOpen, HelpCircle, Layers, BarChart3, Filter, EyeOff, Menu, X } from 'lucide-react';

interface QuestionWithSource extends Question {
  origemJson: string;
}

export const App: React.FC = () => {
  const { analytics, logAnswer } = useLocalAnalytics();
  
  const [activeTab, setActiveTab] = useState<'banco' | 'simulado' | 'analytics'>('banco');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  const [masterQuestions, setMasterQuestions] = useState<QuestionWithSource[]>([]);
  const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);
  const [jsonFilesList, setJsonFilesList] = useState<string[]>([]);
  
  // 1. Estados temporários para a interface
  const [tempJsonFilter, setTempJsonFilter] = useState<string>('todos');
  const [tempBlocoFilter, setTempBlocoFilter] = useState<string>('todos');
  const [tempAnoFilter, setTempAnoFilter] = useState<string>('todos');
  const [tempExcludeResolved, setTempExcludeResolved] = useState<boolean>(false);

  // 2. Estados reais que aplicam a filtragem
  const [appliedJsonFilter, setAppliedJsonFilter] = useState<string>('todos');
  const [appliedBlocoFilter, setAppliedBlocoFilter] = useState<string>('todos');
  const [appliedAnoFilter, setAppliedAnoFilter] = useState<string>('todos');
  const [appliedExcludeResolved, setAppliedExcludeResolved] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Carregamento dinâmico automático via Vite
  useEffect(() => {
    async function carregarTodasAsQuestoes() {
      try {
        const modulos = import.meta.glob('./data/*.json');
        const todasAsPromessas: Promise<any>[] = [];
        const nomesArquivos: string[] = [];

        for (const caminho in modulos) {
          const nomeLimpo = caminho.split('/').pop()?.replace('.json', '') || caminho;
          nomesArquivos.push(nomeLimpo);
          todasAsPromessas.push(modulos[caminho]().then(mod => ({ mod, nomeLimpo })));
        }

        setJsonFilesList(nomesArquivos);
        const resultados = await Promise.all(todasAsPromessas);
        
        const todasQuestoes: QuestionWithSource[] = resultados.flatMap(({ mod, nomeLimpo }) => 
          (mod.default as Question[]).map(q => ({ ...q, origemJson: nomeLimpo }))
        );
        
        setMasterQuestions(todasQuestoes);
      } catch (error) {
        console.error("Erro ao carregar dados dinamicamente:", error);
      }
    }
    carregarTodasAsQuestoes();
  }, []);

  // Monitor de Filtros Aplicados
  useEffect(() => {
    setCurrentPage(1);

    if (activeTab === 'banco') {
      let filtradas = [...masterQuestions];

      if (appliedJsonFilter !== 'todos') {
        filtradas = filtradas.filter(q => q.origemJson === appliedJsonFilter);
      }
      if (appliedBlocoFilter !== 'todos') {
        filtradas = filtradas.filter(q => q.bloco === appliedBlocoFilter);
      }
      if (appliedAnoFilter !== 'todos') {
        filtradas = filtradas.filter(q => q.ano.toString() === appliedAnoFilter);
      }
      if (appliedExcludeResolved) {
        filtradas = filtradas.filter(q => {
          const idComposto = `${q.origemJson}-${q.id}`;
          return !analytics.answeredQuestions.includes(idComposto);
        });
      }

      setDisplayQuestions(filtradas);
    } else if (activeTab === 'simulado') {
      setDisplayQuestions([]);
    }
  }, [activeTab, masterQuestions, appliedJsonFilter, appliedBlocoFilter, appliedAnoFilter, appliedExcludeResolved]);

  const blocosDisponiveis = Array.from(new Set(masterQuestions.map(q => q.bloco)));
  const anosDisponiveis = Array.from(new Set(masterQuestions.map(q => q.ano))).sort((a, b) => b - a);

  // Função para transferir os dados temporários para o estado real
  const handleApplyFilters = () => {
    setAppliedJsonFilter(tempJsonFilter);
    setAppliedBlocoFilter(tempBlocoFilter);
    setAppliedAnoFilter(tempAnoFilter);
    setAppliedExcludeResolved(tempExcludeResolved);
  };

  const handleSimuladoGeneration = (generatedQuestions: Question[]) => {
    setDisplayQuestions(generatedQuestions);
    setCurrentPage(1); 
  };

  const navegarPara = (aba: 'banco' | 'simulado' | 'analytics') => {
    setActiveTab(aba);
    setIsMenuOpen(false);
  };

  const indexLastQuestion = currentPage * pageSize;
  const indexFirstQuestion = indexLastQuestion - pageSize;
  const currentQuestionsBatchSlice = displayQuestions.slice(indexFirstQuestion, indexLastQuestion);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased overflow-x-hidden">
      
      {/* Header Responsivo com Suporte a Mobile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">Simulado Pro</h1>
            </div>
            
            {/* Botão Hambúrguer Mobile */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Abas Horizontais Desktop */}
            <nav className="hidden md:flex gap-4 text-sm font-medium h-full items-end">
              <button
                onClick={() => navegarPara('banco')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all h-full ${
                  activeTab === 'banco' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" /> Home (Banco)
              </button>
              <button
                onClick={() => navegarPara('simulado')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all h-full ${
                  activeTab === 'simulado' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" /> Simulado
              </button>
              <button
                onClick={() => navegarPara('analytics')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all h-full ${
                  activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Meu Desempenho
              </button>
            </nav>
          </div>
        </div>

        {/* Menu Expandido Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1 shadow-inner">
            <button
              onClick={() => navegarPara('banco')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'banco' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4" /> Home (Banco)
            </button>
            <button
              onClick={() => navegarPara('simulado')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'simulado' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" /> Simulado
            </button>
            <button
              onClick={() => navegarPara('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Meu Desempenho
            </button>
          </div>
        )}
      </header>

      {/* Grid Principal do App */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 md:px-4 py-6 pb-24">
        
        {activeTab === 'banco' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Filtrar Banco de Questões</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Origem / Simulado</label>
                  <select 
                    value={tempJsonFilter}
                    onChange={(e) => setTempJsonFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-indigo-500"
                  >
                    <option value="todos">Todos os arquivos JSON</option>
                    {jsonFilesList.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Bloco / Matéria</label>
                  <select 
                    value={tempBlocoFilter}
                    onChange={(e) => setTempBlocoFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-indigo-500"
                  >
                    <option value="todos">Todas as matérias</option>
                    {blocosDisponiveis.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ano</label>
                  <select 
                    value={tempAnoFilter}
                    onChange={(e) => setTempAnoFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:border-indigo-500"
                  >
                    <option value="todos">Todos os anos</option>
                    {anosDisponiveis.map(ano => (
                      <option key={ano} value={ano}>{ano}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox e Botão de Aplicar Alinhados de Forma Responsiva */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none hover:text-slate-800">
                  <input 
                    type="checkbox"
                    checked={tempExcludeResolved}
                    onChange={(e) => setTempExcludeResolved(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <div className="flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Excluir questões já resolvidas do banco</span>
                  </div>
                </label>

                <button
                  onClick={handleApplyFilters}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm shrink-0 self-end sm:self-auto"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>

            {/* Listagem de questões filtradas */}
            <div className="space-y-4">
              {currentQuestionsBatchSlice.map((question) => {
                const idComposto = `${(question as any).origemJson || 'q'}-${question.id}`;
                return (
                  <QuestionCard
                    key={idComposto}
                    question={question}
                    onAnswerLogged={(isCorrect) => logAnswer(idComposto, question.bloco, isCorrect)}
                  />
                );
              })}
              {displayQuestions.length === 0 && (
                <p className="text-center text-slate-400 py-12 text-sm">Nenhuma questão corresponde aos filtros selecionados.</p>
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
                const idComposto = `${(question as any).origemJson || 'q'}-${question.id}`;
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
    </div>
  );
};