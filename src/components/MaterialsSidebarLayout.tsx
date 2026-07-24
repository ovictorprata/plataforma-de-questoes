import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { MaterialViewer } from './MaterialViewer';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Menu,
  X,
  GripVertical,
  BookOpen,
  Search,
} from 'lucide-react';
import type { Question } from '../types/question';

export interface TreeNode {
  name: string;
  isFolder: boolean;
  path: string;
  id?: string;
  loader?: () => Promise<string>;
  children?: Record<string, TreeNode>;
}

interface MaterialsSidebarLayoutProps {
  masterQuestions: Question[];
}

const cleanName = (str: string) =>
  str.replace(/^\d+[_]/, '').replace(/_/g, ' ');

interface TreeItemProps {
  node: TreeNode;
  activeId: string | null;
  onSelectFile: (id: string) => void;
  depth?: number;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  activeId,
  onSelectFile,
  depth = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!node.isFolder && node.id) {
    const isActive = activeId === node.id;
    return (
      <button
        type="button"
        onClick={() => onSelectFile(node.id!)}
        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left truncate ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        style={{ paddingLeft: `${Math.max(0.6, depth * 0.75)}rem` }}
      >
        <FileText
          className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
        />
        <span className="truncate capitalize font-['Inter',sans-serif]">
          {cleanName(node.name)}
        </span>
      </button>
    );
  }

  const childrenList = Object.values(node.children || {});

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors select-none"
        style={{ paddingLeft: `${Math.max(0.4, depth * 0.75)}rem` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Folder className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="truncate capitalize text-slate-800 font-['Inter',sans-serif]">
            {cleanName(node.name)}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="border-l border-slate-200/80 ml-2.5 space-y-0.5">
          {childrenList.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              activeId={activeId}
              onSelectFile={onSelectFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MaterialsSidebarLayout: React.FC<MaterialsSidebarLayoutProps> = ({
  masterQuestions,
}) => {
  const [materialContent, setMaterialContent] = useState<string>('');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] =
    useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 🎯 Estado para calcular a sobreposição com o Footer
  const [footerOverlap, setFooterOverlap] = useState<number>(0);

  // Largura da Sidebar Desktop
  const [sidebarWidth, setSidebarWidth] = useState<number>(280);
  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);

  // Largura do Conteúdo Escolhida pelo Usuário
  const [contentWidth, setContentWidth] = useState<number>(850);
  const [isResizingContent, setIsResizingContent] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 🎯 Monitora a posição do Footer para ajustar a altura da Sidebar Fixed dinamicamente
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (footerRect.top < windowHeight) {
        setFooterOverlap(windowHeight - footerRect.top);
      } else {
        setFooterOverlap(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monta a Árvore de Diretórios
  const { tree, flatFiles } = useMemo(() => {
    const modules = import.meta.glob<string>('../data/materiais/**/*.md', {
      query: '?raw',
      import: 'default',
    });

    const root: Record<string, TreeNode> = {};
    const filesMap: Record<
      string,
      {
        title: string;
        folderPath: string;
        path: string;
        loader: () => Promise<string>;
      }
    > = {};

    for (const rawPath in modules) {
      const relativePath = rawPath.replace('../data/materiais/', '');
      const parts = relativePath.split('/');

      let currentLevel = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;

        if (isFile) {
          const fileNameClean = part.replace('.md', '');
          const folderPathClean = parts.slice(0, -1).map(cleanName).join(' > ');

          currentLevel[part] = {
            name: fileNameClean,
            isFolder: false,
            path: rawPath,
            id: rawPath,
            loader: modules[rawPath],
          };
          filesMap[rawPath] = {
            title: cleanName(fileNameClean),
            folderPath: folderPathClean,
            path: rawPath,
            loader: modules[rawPath],
          };
        } else {
          if (!currentLevel[part]) {
            currentLevel[part] = {
              name: part,
              isFolder: true,
              path: parts.slice(0, i + 1).join('/'),
              children: {},
            };
          }
          currentLevel = currentLevel[part].children!;
        }
      }
    }

    return { tree: root, flatFiles: filesMap };
  }, []);

  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const lower = searchTerm.toLowerCase();

    return Object.entries(flatFiles).filter(
      ([_, file]) =>
        file.title.toLowerCase().includes(lower) ||
        file.folderPath.toLowerCase().includes(lower) ||
        file.path.toLowerCase().includes(lower)
    );
  }, [searchTerm, flatFiles]);

  const firstFileId = useMemo(() => {
    const keys = Object.keys(flatFiles);
    return keys.length > 0 ? keys[0] : null;
  }, [flatFiles]);

  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(
    () => firstFileId
  );

  const currentActiveId = activeMaterialId || firstFileId;

  useEffect(() => {
    if (!currentActiveId || !flatFiles[currentActiveId]) return;

    flatFiles[currentActiveId].loader().then((content) => {
      setMaterialContent(content);
    });
  }, [currentActiveId, flatFiles]);

  // 🎯 Arraste da Sidebar
  const handleSidebarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsResizingSidebar(true);
    },
    []
  );

  const handleSidebarPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isResizingSidebar) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 420) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizingSidebar]
  );

  const handleSidebarPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isResizingSidebar) {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setIsResizingSidebar(false);
      }
    },
    [isResizingSidebar]
  );

  // 🎯 Arraste da Largura do Conteúdo (Corrigido para capturar o movimento relativo da tela)
  const handleContentPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsResizingContent(true);
    },
    []
  );

  const handleContentPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isResizingContent) {
        const containerLeft =
          containerRef.current?.getBoundingClientRect().left || 0;
        const calculatedWidth = e.clientX - containerLeft - sidebarWidth - 40;
        const maxAllowedWidth = window.innerWidth - sidebarWidth - 60;

        if (calculatedWidth >= 400 && calculatedWidth <= maxAllowedWidth) {
          setContentWidth(calculatedWidth);
        } else if (calculatedWidth > maxAllowedWidth) {
          setContentWidth(maxAllowedWidth);
        }
      }
    },
    [isResizingContent, sidebarWidth]
  );

  const handleContentPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isResizingContent) {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setIsResizingContent(false);
      }
    },
    [isResizingContent]
  );

  const isAnyResizing = isResizingSidebar || isResizingContent;

  return (
    <div
      ref={containerRef}
      className={`min-h-[calc(100vh-3.5rem)] w-full relative ${
        isAnyResizing ? 'select-none cursor-col-resize' : ''
      }`}
    >
      {/* 📱 1. CABEÇALHO MOBILE */}
      <div className="md:hidden p-3 w-full border-b border-slate-200 bg-white sticky top-0 z-30">
        <button
          onClick={() => setIsSidebarOpenMobile(true)}
          className="w-full flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800"
        >
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate text-slate-900 font-['Inter',sans-serif]">
              {currentActiveId && flatFiles[currentActiveId]
                ? flatFiles[currentActiveId].title
                : 'Selecionar Aula'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-indigo-600 font-bold text-xs bg-indigo-100/60 px-2 py-1 rounded-lg shrink-0">
            <Menu className="w-3.5 h-3.5" />
            <span>Aulas</span>
          </div>
        </button>
      </div>

      {/* 📱 2. MODAL MOBILE */}
      {isSidebarOpenMobile && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsSidebarOpenMobile(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl h-[85vh] flex flex-col p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">
                  Índice do Material
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar matéria ou aula..."
                className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all font-['Inter',sans-serif]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredFiles ? (
                filteredFiles.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 font-['Inter',sans-serif]">
                    Nenhum material encontrado.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredFiles.map(([id, file]) => {
                      const isActive = currentActiveId === id;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setActiveMaterialId(id);
                            setIsSidebarOpenMobile(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl text-xs font-medium text-left truncate transition-all ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-700 bg-slate-50 border border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full truncate">
                            <FileText
                              className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                            />
                            <span className="truncate capitalize font-['Inter',sans-serif]">
                              {file.title}
                            </span>
                          </div>
                          {file.folderPath && (
                            <span
                              className={`text-[10px] pl-5 truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}
                            >
                              {file.folderPath}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                Object.values(tree).map((node) => (
                  <TreeItem
                    key={node.path}
                    node={node}
                    activeId={currentActiveId}
                    onSelectFile={(id) => {
                      setActiveMaterialId(id);
                      setIsSidebarOpenMobile(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🖥️ 3. MENU LATERAL DESKTOP (FIXO) */}
      <aside
        style={{
          width: `${sidebarWidth}px`,
          height: `calc(100vh - 3.5rem - ${footerOverlap}px)`,
        }}
        className="hidden md:block fixed top-14 left-0 overflow-y-auto overflow-x-hidden p-4 bg-slate-50/70 border-r border-slate-200/80 z-20 transition-[height] duration-75 ease-out"
      >
        <div className="px-1 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-['Inter',sans-serif]">
          Materiais de Estudo
        </div>

        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar matéria ou aula..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all font-['Inter',sans-serif] shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {Object.keys(tree).length === 0 ? (
          <p className="text-xs text-slate-400 p-2 font-['Inter',sans-serif]">
            Nenhum material carregado.
          </p>
        ) : filteredFiles ? (
          filteredFiles.length === 0 ? (
            <p className="text-xs text-slate-400 p-2 text-center font-['Inter',sans-serif]">
              Nenhum material encontrado.
            </p>
          ) : (
            <div className="space-y-1">
              <div className="px-1 text-[10px] font-semibold text-slate-400 mb-1 font-['Inter',sans-serif]">
                Resultados ({filteredFiles.length})
              </div>
              {filteredFiles.map(([id, file]) => {
                const isActive = currentActiveId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActiveMaterialId(id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex flex-col items-start px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left truncate ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full truncate">
                      <FileText
                        className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                      />
                      <span className="truncate capitalize font-['Inter',sans-serif]">
                        {file.title}
                      </span>
                    </div>
                    {file.folderPath && (
                      <span className="text-[10px] text-slate-400 pl-5 truncate font-normal">
                        {file.folderPath}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-1">
            {Object.values(tree).map((node) => (
              <TreeItem
                key={node.path}
                node={node}
                activeId={currentActiveId}
                onSelectFile={(id) => {
                  setActiveMaterialId(id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        )}

        {/* ALÇA DE ARRASTE DA SIDEBAR */}
        <div
          onPointerDown={handleSidebarPointerDown}
          onPointerMove={handleSidebarPointerMove}
          onPointerUp={handleSidebarPointerUp}
          title="Clique e arraste para redimensionar o menu lateral"
          className={`hidden md:flex absolute top-0 right-0 w-3 h-full cursor-col-resize items-center justify-center group z-30 ${
            isResizingSidebar ? 'bg-indigo-500/20' : 'hover:bg-indigo-500/10'
          }`}
        >
          <div
            className={`w-1 h-12 rounded-full transition-all flex items-center justify-center ${
              isResizingSidebar
                ? 'bg-indigo-600 h-20'
                : 'bg-slate-300 group-hover:bg-indigo-600'
            }`}
          >
            <GripVertical className="w-2.5 h-2.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </aside>

      {/* 🖥️ 4. ÁREA DE LEITURA (COM ALÇA DE LARGURA TOTALMENTE FUNCIONAL) */}
      <div
        className="relative py-6 px-4 sm:px-8 md:px-10 transition-[margin-left] w-full max-w-full box-border"
        style={{
          marginLeft:
            typeof window !== 'undefined' && window.innerWidth >= 768
              ? `${sidebarWidth}px`
              : 0,
          maxWidth:
            typeof window !== 'undefined' && window.innerWidth >= 768
              ? `calc(100% - ${sidebarWidth}px)`
              : '100%',
        }}
      >
        {/* Container do Conteúdo + Alça de Arraste na borda exata de contentWidth */}
        <div
          className="relative w-full max-w-full transition-[max-width]"
          style={{
            maxWidth:
              typeof window !== 'undefined' && window.innerWidth >= 768
                ? `${contentWidth}px`
                : '100%',
          }}
        >
          {/* Breadcrumbs de Leitura */}
          <div className="mb-6 pb-3 border-b border-slate-200/60 font-['Inter',sans-serif]">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 truncate">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">
                {currentActiveId && flatFiles[currentActiveId]?.folderPath
                  ? `${flatFiles[currentActiveId].folderPath} / ${flatFiles[currentActiveId].title}`
                  : 'Material de Estudo'}
              </span>
            </div>
          </div>

          <main className="w-full min-w-0 overflow-x-hidden">
            {materialContent ? (
              <MaterialViewer
                content={materialContent}
                masterQuestions={masterQuestions}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-['Inter',sans-serif]">
                Selecione um material no menu lateral para iniciar a leitura.
              </div>
            )}
          </main>

          {/* 🎯 ALÇA DE ARRASTE DA LARGURA DO CONTEÚDO (Posicionada exatamente na borda direita do bloco de texto) */}
          <div
            onPointerDown={handleContentPointerDown}
            onPointerMove={handleContentPointerMove}
            onPointerUp={handleContentPointerUp}
            title="Clique e arraste para redimensionar a largura da página de leitura"
            className={`hidden md:flex absolute top-0 -right-5 w-4 h-full cursor-col-resize items-center justify-center group z-20 ${
              isResizingContent ? 'bg-indigo-500/20' : 'hover:bg-indigo-500/10'
            }`}
          >
            <div
              className={`w-1 h-12 rounded-full transition-all flex items-center justify-center ${
                isResizingContent
                  ? 'bg-indigo-600 h-20'
                  : 'bg-slate-300 group-hover:bg-indigo-600'
              }`}
            >
              <GripVertical className="w-2.5 h-2.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
