import React from 'react';
import { Code2, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-100/80 border-t border-slate-200 py-3.5 px-4 sm:px-8 font-['Inter',sans-serif] mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
        {/* Créditos com texto mais escuro para passar acessibilidade/WCAG */}
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <Code2 className="w-4 h-4 text-violet-600 shrink-0" />
          <span>Desenvolvido por</span>
          <strong className="text-slate-900 font-bold hover:text-violet-700 transition-colors">
            Victor Prata
          </strong>
        </div>

        {/* Ícone de Contato com mais contraste */}
        <div className="relative group">
          <a
            href="mailto:victorsousaprata@gmail.com"
            aria-label="Enviar e-mail para o desenvolvedor"
            className="p-2 rounded-lg text-slate-500 hover:text-violet-700 hover:bg-white hover:shadow-sm border border-slate-200/80 transition-all flex items-center justify-center"
          >
            <Mail className="w-4 h-4" />
          </a>

          {/* Tooltip */}
          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg pointer-events-none">
            victorsousaprata@gmail.com
          </div>
        </div>
      </div>
    </footer>
  );
};
