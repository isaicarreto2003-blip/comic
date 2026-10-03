import React, { useState } from 'react';
import { X, Check, Type, Sparkles } from 'lucide-react';
import { FONTS_CATALOG } from '../data/biblicalPresets';

interface TypographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFontToSelectedBalloon?: (fontFamily: string) => void;
}

export const TypographyModal: React.FC<TypographyModalProps> = ({
  isOpen,
  onClose,
  onApplyFontToSelectedBalloon,
}) => {
  const [testText, setTestText] = useState('¡EL SEÑOR DE LOS EJÉRCITOS HA HABLADO! NO TEMERÉ AL GIGANTE.');
  const [previewSize, setPreviewSize] = useState(24);
  const [selectedFontId, setSelectedFontId] = useState('cinzel');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Type className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white font-cinzel">
                BIBLIOTECA TIPOGRÁFICA NOIR
              </h2>
              <p className="text-xs text-neutral-400">
                Fuentes optimizadas para novela gráfica, rotulación de cómic y cartelas cinematográficas bíblicas.
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

        {/* Interactive Custom Test Bar */}
        <div className="px-6 py-3 bg-neutral-900/70 border-b border-neutral-800 flex flex-col sm:flex-row items-center gap-4 text-xs">
          <div className="flex-1 w-full">
            <label className="block text-[11px] text-neutral-400 mb-1">
              Texto de Prueba Interactivo:
            </label>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-2 rounded bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
              placeholder="Escribe aquí para probar todas las fuentes..."
            />
          </div>

          <div className="w-full sm:w-48">
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Tamaño de Muestra:</span>
              <span>{previewSize}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={44}
              value={previewSize}
              onChange={(e) => setPreviewSize(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
        </div>

        {/* Font Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {FONTS_CATALOG.map((font) => {
            const isSelected = selectedFontId === font.id;

            return (
              <div
                key={font.id}
                onClick={() => setSelectedFontId(font.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-neutral-900/80 ring-1 ring-amber-500/30'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{font.name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {font.category}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 mb-3">{font.description}</p>

                  <div className="mb-2">
                    <span className="text-[11px] font-semibold text-rose-400">
                      Recomendado para:{' '}
                    </span>
                    <span className="text-[11px] text-neutral-300">{font.bestFor}</span>
                  </div>
                </div>

                {/* Live Font Sample rendering */}
                <div className="mt-4 p-4 rounded-lg bg-black border border-neutral-800/80 overflow-hidden">
                  <div
                    style={{
                      fontFamily: font.fontFamily,
                      fontSize: `${previewSize}px`,
                      lineHeight: 1.25,
                    }}
                    className="text-white break-words"
                  >
                    {testText || font.sampleText}
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">
                    {font.fontFamily}
                  </span>
                  {onApplyFontToSelectedBalloon && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyFontToSelectedBalloon(font.fontFamily);
                        onClose();
                      }}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Aplicar al Globo</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <span>7 familias tipográficas cargadas y listas para exportación de alta fidelidad.</span>
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
