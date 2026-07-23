import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
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
  // 🎯 Pré-processador do Markdown com suporte a <questao id="X" ate="Y" /> e Alertas
  const processedContent = useMemo(() => {
    let text = content;

    // 1. Expande tags com intervalo: <questao id="S-2026-1" ate="S-2026-10" />
    text = text.replace(
      /<questao\s+id=["']([^"']+)["']\s+ate=["']([^"']+)["']\s*\/?>/gi,
      (_, startId, endId) => {
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
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight border-b border-slate-200 pb-3 mt-12 mb-8">
        {children}
      </h1>
    ),

    // 🎯 H2: Títulos de Seção (Aumentado de mt-12 para mt-16 = 64px)
    h2: ({ children }: CustomComponentProps) => (
      <h2 className="text-xl font-bold text-slate-800 mt-16 mb-6 pt-2">
        {children}
      </h2>
    ),

    // 🎯 H3: Subtítulos (Aumentado de mt-8 para mt-12 = 48px)
    h3: ({ children }: CustomComponentProps) => (
      <h3 className="text-base font-bold text-indigo-600 uppercase tracking-wider mt-12 mb-4">
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
    img: ({ src, alt, style, width, ...props }: CustomImgProps & React.ImgHTMLAttributes<HTMLImageElement>) => {
      const [cleanSrc, widthQuery] = (src || '').split('#w=');
      
      const finalStyle: React.CSSProperties = {
        ...(style || {}),
        width: widthQuery || style?.width || (width ? `${width}px` : undefined) || 'auto',
        maxWidth: '100%',
      };

      return (
        <figure className="my-6 flex flex-col items-center justify-center">
          <img
            src={cleanSrc}
            alt={alt || ''}
            style={finalStyle}
            className="h-auto rounded-xl border border-slate-200/80 shadow-2xs"
            {...props}
          />
          {alt && (
            <figcaption className="mt-2.5 text-center text-xs italic text-slate-500 font-['Inter',sans-serif]">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },
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

    // 🎯 ESTILIZAÇÃO PREMIUM DE TABELAS (RESPONSIVA E COM DESIGN SYSTEM)
    table: ({ children }: CustomComponentProps) => (
      <div className="my-6 w-full overflow-hidden overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs bg-white">
        <table className="w-full border-collapse text-left text-xs font-['Inter',sans-serif]">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: CustomComponentProps) => (
      <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
        {children}
      </thead>
    ),
    tbody: ({ children }: CustomComponentProps) => (
      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
        {children}
      </tbody>
    ),
    tr: ({ children }: CustomComponentProps) => (
      <tr className="hover:bg-slate-50/70 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: CustomComponentProps) => (
      <th className="px-5 py-3.5 font-extrabold text-slate-800">
        {children}
      </th>
    ),
    td: ({ children }: CustomComponentProps) => (
      <td className="px-5 py-3.5 leading-relaxed text-slate-700 align-middle">
        {children}
      </td>
    ),
  }), [masterQuestions]);

  return (
    <div className="w-full font-['Inter',sans-serif]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};