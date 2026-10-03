import React from 'react';
import { Download, Sparkles, BookOpen, Type, Images, ShoppingBag, Globe, Share2 } from 'lucide-react';

interface HeaderProps {
  activeView: 'editor' | 'organizer' | 'store';
  setActiveView: (view: 'editor' | 'organizer' | 'store') => void;
  onOpenTypographyModal: () => void;
  onOpenSceneModal: () => void;
  onOpenExportModal: () => void;
  onQuickGenerateAI: () => void;
  onOpenCartDrawer: () => void;
  onOpenMerchantCenterModal: () => void;
  cartCount: number;
  totalPages: number;
  currentPageNumber: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenTypographyModal,
  onOpenSceneModal,
  onOpenExportModal,
  onQuickGenerateAI,
  onOpenCartDrawer,
  onOpenMerchantCenterModal,
  cartCount,
  totalPages,
  currentPageNumber,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Zone 1: Wordmark & Page status */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('editor')}
          className="text-left font-cinzel text-lg font-black tracking-wider text-white hover:text-amber-400 transition-colors"
        >
          BIBLICAL NOIR
        </button>
        <span className="text-neutral-500 text-xs font-medium">·</span>
        {activeView === 'store' ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Tienda &amp; Ventas
          </span>
        ) : (
          <span className="text-xs font-medium text-neutral-400">
            Pág. {currentPageNumber} de {totalPages}
          </span>
        )}
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800 text-xs">
        <button
          onClick={() => setActiveView('editor')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeView === 'editor'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lienzo de Viñetas</span>
        </button>

        <button
          onClick={() => setActiveView('organizer')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeView === 'organizer'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Images className="w-3.5 h-3.5" />
          <span>Organizador</span>
        </button>

        <button
          onClick={() => setActiveView('store')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeView === 'store'
              ? 'bg-amber-600 text-white shadow-sm font-bold'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Tienda &amp; Ventas</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-black/40 text-amber-200 border border-amber-400/30">
            Google / Shopify
          </span>
        </button>

        <button
          onClick={onOpenTypographyModal}
          className="px-3 py-1.5 rounded-md font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <Type className="w-3.5 h-3.5" />
          <span>Tipografías</span>
        </button>

        <button
          onClick={onOpenSceneModal}
          className="px-3 py-1.5 rounded-md font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Escenas</span>
        </button>
      </nav>

      {/* Zone 3: Actions & Shopping Cart */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMerchantCenterModal}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 text-neutral-300 text-xs transition-colors"
          title="Ver Feeds de Google Merchant Center y Google Shopping"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Google Shopping</span>
        </button>

        <button
          onClick={onOpenCartDrawer}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold transition-colors"
          title="Ver Bolsa de Compra"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Bolsa</span>
          {cartCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-black rounded-full ml-0.5">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={onQuickGenerateAI}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-semibold transition-colors"
          title="Director IA para viñetas y diálogos bíblicos"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Director IA</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar PDF</span>
        </button>
      </div>
    </header>
  );
};
