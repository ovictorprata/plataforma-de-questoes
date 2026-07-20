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

  // Define as classes de estilo para o negrito de acordo com a variante
  const getBoldStyle = () => {
    if (variant === 'enunciado') {
      // Preto com sublinhado/risco sutil no enunciado
      return 'font-extrabold text-black dark:text-white underline decoration-indigo-400 decoration-2 underline-offset-2';
    }
    // Apenas negrito para alternativas (e default)
    return 'font-extrabold text-black dark:text-white';
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
      return <span key={index}>{part}</span>;
    });
  };

  const parts = text.split(/(\\\([^\\]+\\\)|\\\[[^\\]+\\\])/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const math = part.slice(2, -2);
          const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        }

        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const math = part.slice(2, -2);
          const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        }

        return <React.Fragment key={index}>{renderFormattedText(part)}</React.Fragment>;
      })}
    </span>
  );
};