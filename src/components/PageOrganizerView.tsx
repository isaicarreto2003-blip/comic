import React from 'react';
import { Plus, Copy, Trash2, ArrowLeft, ArrowRight, Edit3, BookOpen, Layers } from 'lucide-react';
import { ComicPage } from '../types/comic';

interface PageOrganizerViewProps {
  pages: ComicPage[];
  onSelectPageAndOpenEditor: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (index: number, direction: 'left' | 'right') => void;
  onUpdatePageNotes: (index: number, title: string, chapter: string, scriptNotes: string) => void;
}

export const PageOrganizerView: React.FC<PageOrganizerViewProps> = ({
  pages,
  onSelectPageAndOpenEditor,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  onUpdatePageNotes,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#070707] select-none">
      {/* Top Banner with Stats */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="text-xl font-black text-white font-cinzel tracking-wide">
              ORGANIZADOR DE PÁGINAS & GUION BÍBLICO
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Gestiona el flujo narrativo, reordena los capítulos de tu novela gráfica y supervisa las notas de dirección.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
              <span className="text-neutral-500 mr-1.5">Tomo:</span>
              <span className="font-bold text-white">{pages.length} Páginas</span>
            </div>

            <button
              onClick={onAddPage}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Nueva Página</span>
            </button>
          </div>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {pages.map((page, idx) => {
            const heroImage = page.panels[0]?.imageUrl || '';

            return (
              <div
                key={page.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                {/* Page Thumbnail with actions */}
                <div className="relative aspect-[3/4] bg-black overflow-hidden group cursor-pointer"
                  onClick={() => onSelectPageAndOpenEditor(idx)}
                >
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={page.title}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-xs">
                      Sin Ilustración
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-black/90 border border-neutral-700 font-bold text-xs text-white">
                      Pág. #{page.pageNumber || idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-400 border border-neutral-800">
                      {page.template}
                    </span>
                  </div>

                  {/* Hover open overlay */}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Edit3 className="w-4 h-4" />
                      <span>Editar en Lienzo</span>
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {page.balloons.length} globos de diálogo
                    </span>
                  </div>
                </div>

                {/* Page details and notes */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) =>
                          onUpdatePageNotes(
                            idx,
                            e.target.value,
                            page.chapter,
                            page.scriptNotes || ''
                          )
                        }
                        className="font-bold text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-neutral-500 focus:outline-none text-xs w-full mr-2"
                        placeholder="Título de la página..."
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                      <span>{page.chapter || 'Sin capítulo'}</span>
                      <span>·</span>
                      <span className="text-amber-400">{page.bibleVerse || 'Sin versículo'}</span>
                    </div>

                    <textarea
                      value={page.scriptNotes || ''}
                      onChange={(e) =>
                        onUpdatePageNotes(
                          idx,
                          page.title,
                          page.chapter,
                          e.target.value
                        )
                      }
                      rows={2}
                      className="w-full p-2 rounded bg-neutral-950/80 border border-neutral-800 text-neutral-300 text-[11px] focus:outline-none focus:border-neutral-700 resize-none font-typewriter"
                      placeholder="Notas de dirección o guion para esta página..."
                    />
                  </div>

                  {/* Action row */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          onClick={() => onMovePage(idx, 'left')}
                          className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                          title="Mover página antes"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < pages.length - 1 && (
                        <button
                          onClick={() => onMovePage(idx, 'right')}
                          className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                          title="Mover página después"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onDuplicatePage(idx)}
                        className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                        title="Duplicar página"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {pages.length > 1 && (
                        <button
                          onClick={() => onDeletePage(idx)}
                          className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-rose-400 hover:text-rose-300"
                          title="Eliminar página"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onSelectPageAndOpenEditor(idx)}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors"
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
