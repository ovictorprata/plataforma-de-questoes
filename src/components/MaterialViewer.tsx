import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { QuestionCard } from './QuestionCard';
import type { Question } from '../types/question';

interface MaterialViewerProps {
  content: string;
  masterQuestions: Question[];
}

interface CustomComponentProps {
  children?: React.ReactNode;
}

interface CustomImgProps {
  src?: string;
  alt?: string;
}

interface DivComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-questao-id'?: string;
}

const EmbeddedFixationQuestion: React.FC<{
  questaoId: string;
  masterQuestions: Question[];
}> = React.memo(({ questaoId, masterQuestions }) => {
  const questionData = masterQuestions.find((q) => q.id.toLowerCase() === questaoId.toLowerCase());

  if (!questionData) {
    return (
      <div className="my-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono rounded-xl">
        ⚠️ Questão de fixação não encontrada: <strong>{questaoId}</strong>
      </div>
    );
  }

  return (
    <div className="my-6">
      <QuestionCard question={questionData} />
    </div>
  );
});

EmbeddedFixationQuestion.displayName = 'EmbeddedFixationQuestion';

export const MaterialViewer: React.FC<MaterialViewerProps> = ({
  content,
  masterQuestions,
}) => {
  // 🎯 Pré-processador do Markdown com suporte a <questao id="X" ate="Y" />
  const processedContent = useMemo(() => {
    let text = content;

    // 1. Expande tags com intervalo: <questao id="S-2026-1" ate="S-2026-10" />
    text = text.replace(
      /<questao\s+id=["']([^"']+)["']\s+ate=["']([^"']+)["']\s*\/?>/gi,
      (_, startId, endId) => {
        // Extrai prefixo e número inicial (ex: "S-2026-1" -> prefix "S-2026-", num 1)
        const matchStart = startId.match(/^(.*?)(\d+)$/);
        const matchEnd = endId.match(/^(.*?)(\d+)$/);

        if (!matchStart || !matchEnd) {
          return `<div data-questao-id="${startId}"></div>`;
        }

        const prefix = matchStart[1];
        const startNum = parseInt(matchStart[2], 10);
        const endNum = parseInt(matchEnd[2], 10);

        if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
          return `<div data-questao-id="${startId}"></div>`;
        }

        // Gera as divs sequenciais
        const generatedDivs: string[] = [];
        for (let i = startNum; i <= endNum; i++) {
          generatedDivs.push(`<div data-questao-id="${prefix}${i}"></div>`);
        }

        return generatedDivs.join('\n');
      }
    );

    // 2. Converte as tags simples restantes: <questao id="S-2026-1" />
    text = text.replace(
      /<questao\s+id=["']([^"']+)["']\s*\/?>/gi,
      '<div data-questao-id="$1"></div>'
    );

    // 3. Destaques visuais dos Alertas
    text = text.replace(
      /(🚨\s*ALTA INCIDÊNCIA:?)/g,
      '<mark class="bg-rose-100 text-slate-950 font-bold px-1.5 py-0.5 rounded border border-rose-200/60 inline-flex items-center gap-1 my-0.5">$1</mark>'
    );
    text = text.replace(
      /(⚠️\s*ATENÇÃO:?)/g,
      '<mark class="bg-amber-100 text-slate-950 font-bold px-1.5 py-0.5 rounded border border-amber-200/60 inline-flex items-center gap-1 my-0.5">$1</mark>'
    );
    text = text.replace(
      /(👣\s*PEGADINHA:?)/g,
      '<mark class="bg-purple-100 text-slate-950 font-bold px-1.5 py-0.5 rounded border border-purple-200/60 inline-flex items-center gap-1 my-0.5">$1</mark>'
    );

    return text;
  }, [content]);

  const markdownComponents: Components = useMemo(() => ({
    h1: ({ children }: CustomComponentProps) => (
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight border-b border-slate-200 pb-3 mb-6">
        {children}
      </h1>
    ),
    h2: ({ children }: CustomComponentProps) => (
      <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: CustomComponentProps) => (
      <h3 className="text-base font-bold text-indigo-600 uppercase tracking-wider mt-6 mb-3">
        {children}
      </h3>
    ),
    p: ({ children }: CustomComponentProps) => (
      <p className="text-base text-slate-700 leading-relaxed my-4 font-['Inter',sans-serif]">
        {children}
      </p>
    ),
    strong: ({ children }: CustomComponentProps) => (
      <strong className="font-bold text-slate-900 font-['Inter',sans-serif]">{children}</strong>
    ),
    ul: ({ children }: CustomComponentProps) => (
      <ul className="list-disc pl-6 space-y-2 text-base text-slate-700 my-4 font-['Inter',sans-serif]">
        {children}
      </ul>
    ),
    ol: ({ children }: CustomComponentProps) => (
      <ol className="list-decimal pl-6 space-y-2 text-base text-slate-700 my-4 font-['Inter',sans-serif]">
        {children}
      </ol>
    ),
    hr: () => <hr className="my-8 border-slate-200/80" />,
    img: ({ src, alt }: CustomImgProps) => (
      <div className="my-6 flex flex-col items-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-xl border border-slate-200 shadow-xs"
        />
        {alt && <span className="text-xs text-slate-400 mt-2 font-['Inter',sans-serif]">{alt}</span>}
      </div>
    ),
    div: ({ 'data-questao-id': questaoId, ...props }: DivComponentProps) => {
      if (questaoId) {
        return (
          <EmbeddedFixationQuestion
            key={questaoId}
            questaoId={questaoId}
            masterQuestions={masterQuestions}
          />
        );
      }

      return <div {...props} />;
    },
  }), [masterQuestions]);

  return (
    <div className="w-full font-['Inter',sans-serif]">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};