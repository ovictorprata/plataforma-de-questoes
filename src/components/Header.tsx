import React, { useState } from 'react';
import { BookOpen, HelpCircle, Layers, BarChart3, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'banco' | 'simulado' | 'analytics';
  onNavigate: (aba: 'banco' | 'simulado' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelectTab = (aba: 'banco' | 'simulado' | 'analytics') => {
    onNavigate(aba);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-3xl w-full mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Simulado Pro</h1>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <nav className="hidden md:flex gap-6 text-xs font-medium h-full items-center">
            <button
              onClick={() => handleSelectTab('banco')}
              className={`h-full flex items-center gap-1.5 border-b-2 transition-all px-1 ${
                activeTab === 'banco' 
                  ? 'border-indigo-600 text-indigo-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" /> Home (Banco)
            </button>
            <button
              onClick={() => handleSelectTab('simulado')}
              className={`h-full flex items-center gap-1.5 border-b-2 transition-all px-1 ${
                activeTab === 'simulado' 
                  ? 'border-indigo-600 text-indigo-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Simulado
            </button>
            <button
              onClick={() => handleSelectTab('analytics')}
              className={`h-full flex items-center gap-1.5 border-b-2 transition-all px-1 ${
                activeTab === 'analytics' 
                  ? 'border-indigo-600 text-indigo-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Meu Desempenho
            </button>
          </nav>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-2 space-y-1 shadow-inner">
          <button
            onClick={() => handleSelectTab('banco')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'banco' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Home (Banco)
          </button>
          <button
            onClick={() => handleSelectTab('simulado')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'simulado' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" /> Simulado
          </button>
          <button
            onClick={() => handleSelectTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Meu Desempenho
          </button>
        </div>
      )}
    </header>
  );
};