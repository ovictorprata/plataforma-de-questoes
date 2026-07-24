import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Layers, BarChart3, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      path: '/banco',
      label: 'Banco de Questões',
      icon: Layers,
      isActive:
        currentPath === '/banco' || currentPath === '/' || currentPath === '',
    },
    {
      path: '/simulado',
      label: 'Simulado',
      icon: BookOpen,
      isActive: currentPath.startsWith('/simulado'),
    },
    {
      path: '/dashboard',
      label: 'Analytics',
      icon: BarChart3,
      isActive: currentPath.startsWith('/dashboard'),
    },
    {
      path: '/materiais',
      label: 'Materiais',
      icon: FileText,
      isActive: currentPath.startsWith('/materiais'),
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* LOGO DA PLATAFORMA */}
          <Link to="/banco" className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight">
              Simulado<span className="text-indigo-600">Pro</span>
            </span>
          </Link>

          {/* MENU DE NAVEGAÇÃO DE ROTAS */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    item.isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-100/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${item.isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                  />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
