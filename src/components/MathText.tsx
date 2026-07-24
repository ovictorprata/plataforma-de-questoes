import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text?: string;
  className?: string;
  variant?: 'enunciado' | 'alternativa' | 'default';
}

export const MathText: React.FC<MathTextProps> = ({
  text,
  className = '',
  variant = 'default',
}) => {
  if (!text) return null;

  // 🎯 Define os estilos aplicados APENAS quando o texto tiver a marcação de negrito (**texto**)
  const getBoldStyle = () => {
    if (variant === 'enunciado') {
      return 'font-bold text-slate-900 underline decoration-[var(--color-secondary-subtle)] decoration-2 underline-offset-2';
    }
    return 'font-bold text-slate-900';
  };

  const renderFormattedText = (rawText: string) => {
    const boldParts = rawText.split(/(\*\*.*?\*\*)/g);

    return boldParts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className={getBoldStyle()}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      // O texto comum permanece na fonte normal (sem font-bold global)
      return <span key={index}>{part}</span>;
    });
  };

  const parts = text.split(/(\\\([^\\]+\\\)|\\\[[^\\]+\\\])/g);

  return (
    <span className={`font-normal text-slate-800 ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const math = part.slice(2, -2);
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
          );
        }

        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const math = part.slice(2, -2);
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
          );
        }

        return (
          <React.Fragment key={index}>
            {renderFormattedText(part)}
          </React.Fragment>
        );
      })}
    </span>
  );
};
