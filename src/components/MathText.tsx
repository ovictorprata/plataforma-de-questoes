import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text?: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

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
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};