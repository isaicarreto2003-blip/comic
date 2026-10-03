import React from 'react';
import { Plus, Copy, Trash2, ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { ComicPage } from '../types/comic';

interface PageStripProps {
  pages: ComicPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (index: number, direction: 'left' | 'right') => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const PageStrip: React.FC<PageStripProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  isCollapsed,
  setIsCollapsed,
}) => {
  return (
    <div className="border-t border-neutral-800 bg-neutral-950/95 backdrop-blur shrink-0 transition-all">
      {/* Header strip toggle */}
      <div className="px-4 py-1.5 flex items-center justify-between border-b border-neutral-900 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-300">Tira de Páginas del Cómic</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-500">{pages.length} páginas en el tomo</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddPage}
            className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Página</span>
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
            title={isCollapsed ? 'Expandir tira de páginas' : 'Minimizar tira de páginas'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pages thumbnails carousel */}
      {!isCollapsed && (
        <div className="p-3 overflow-x-auto flex items-center gap-3 scrollbar-thin">
          {pages.map((page, idx) => {
            const isActive = idx === activePageIndex;
            const heroImage = page.panels[0]?.imageUrl || '';

            return (
              <div
                key={page.id}
                onClick={() => onSelectPage(idx)}
                className={`group relative flex-shrink-0 w-36 rounded-lg border cursor-pointer transition-all overflow-hidden ${
                  isActive
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-neutral-900'
                    : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                }`}
              >
                {/* Thumbnail Preview Aspect 3:4 */}
                <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden flex items-center justify-center">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={page.title}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-neutral-600 text-xs font-mono">Sin Imagen</div>
                  )}

                  {/* Panel layout template miniature watermark */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-neutral-400">
                    {page.template.replace('-', ' ')}
                  </div>

                  {/* Page number badge */}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-neutral-900/90 border border-neutral-700 rounded text-[10px] font-bold text-white">
                    #{page.pageNumber || idx + 1}
                  </div>

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {idx > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovePage(idx, 'left');
                        }}
                        className="p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                        title="Mover a la izquierda"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePage(idx);
                      }}
                      className="p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                      title="Duplicar página"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePage(idx);
                        }}
                        className="p-1 rounded bg-neutral-800 text-rose-400 hover:text-rose-300"
                        title="Eliminar página"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {idx < pages.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMovePage(idx, 'right');
                        }}
                        className="p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                        title="Mover a la derecha"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer label */}
                <div className="p-2 text-left">
                  <p className="text-xs font-semibold text-neutral-200 truncate">
                    {page.title || `Página ${idx + 1}`}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                    {page.bibleVerse || page.chapter || 'Bíblico Noir'}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Add Page Card */}
          <button
            onClick={onAddPage}
            className="flex-shrink-0 w-36 aspect-[3/4] rounded-lg border-2 border-dashed border-neutral-800 hover:border-neutral-600 bg-neutral-900/30 hover:bg-neutral-900/60 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Nueva Página</span>
          </button>
        </div>
      )}
    </div>
  );
};
