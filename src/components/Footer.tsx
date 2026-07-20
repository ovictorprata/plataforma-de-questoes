import React from 'react';
import { Mail, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
      <div className="max-w-3xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span>
            Desenvolvido por <strong className="text-white">Victor Prata</strong>
          </span>
        </div>

        <a
          href="mailto:victorsousaprata@gmail.com"
          className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60"
        >
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>victorsousaprata@gmail.com</span>
        </a>
      </div>
    </footer>
  );
};