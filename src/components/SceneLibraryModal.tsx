import React from 'react';
import { X, Sparkles, BookOpen, Plus } from 'lucide-react';
import { BIBLICAL_SCENES } from '../data/biblicalPresets';
import { BiblicalScenePreset } from '../types/comic';

interface SceneLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSceneAsNewPage: (scene: BiblicalScenePreset) => void;
  onReplaceCurrentPanelImage?: (imageUrl: string, promptDesc: string) => void;
}

export const SceneLibraryModal: React.FC<SceneLibraryModalProps> = ({
  isOpen,
  onClose,
  onLoadSceneAsNewPage,
  onReplaceCurrentPanelImage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white font-cinzel">
                GALERÍA DE ESCENAS & ARTE BÍBLICO NOIR
              </h2>
              <p className="text-xs text-neutral-400">
                Selecciona pasajes épicos con ilustraciones maestras en claroscuro, diálogos y narrativas preconfiguradas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scene Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {BIBLICAL_SCENES.map((scene) => (
            <div
              key={scene.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              {/* Artwork preview */}
              <div className="relative aspect-[16/9] bg-black overflow-hidden group">
                <img
                  src={scene.defaultImage}
                  alt={scene.title}
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-neutral-700 text-[10px] font-mono text-amber-300">
                  {scene.passage}
                </div>
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-base font-bold text-white font-cinzel">{scene.title}</h3>
                  <p className="text-xs text-rose-400 font-medium">{scene.character}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <p className="text-neutral-300 leading-relaxed">{scene.summary}</p>

                  <div className="mt-2.5 p-2 rounded bg-black/60 border border-neutral-800 font-typewriter italic text-neutral-400 text-[11px]">
                    «{scene.narrationPrompt}»
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Plantilla: {scene.template}
                  </span>

                  <div className="flex items-center gap-2">
                    {onReplaceCurrentPanelImage && (
                      <button
                        onClick={() => {
                          onReplaceCurrentPanelImage(scene.defaultImage, scene.title);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                        title="Usar arte en la viñeta actual"
                      >
                        En Viñeta
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLoadSceneAsNewPage(scene);
                        onClose();
                      }}
                      className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva Página</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <span>También puedes generar tus propias viñetas personalizadas con el Director IA.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
