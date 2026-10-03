import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { PRESET_IMAGES } from '../data/biblicalPresets';

interface PanelImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  panelIndex: number;
  onSelectImage: (imageUrl: string, altText: string) => void;
}

export const PanelImageModal: React.FC<PanelImageModalProps> = ({
  isOpen,
  onClose,
  panelIndex,
  onSelectImage,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'ai'>('presets');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSelectImage(dataUrl, file.name);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle AI generation
  const handleGenerateAI = async () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch('/api/gemini/generate-panel-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt,
          aspectRatio: '4:3',
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        onSelectImage(data.imageUrl, customPrompt);
        onClose();
      } else {
        setGenerationError(data.error || 'No se pudo generar la imagen.');
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsGenerating(false);
    }
  };

  const presetList = [
    {
      title: 'David vs Goliat en el Valle de Ela',
      url: PRESET_IMAGES.davidGoliath,
      desc: 'Claroscuro intenso, silueta monumental y lluvia cortante.',
    },
    {
      title: 'Moisés y la partición del Mar Rojo',
      url: PRESET_IMAGES.mosesRedSea,
      desc: 'Tempestad noir, rayos y olas abismales de medianoche.',
    },
    {
      title: 'Sansón empujando las columnas del templo',
      url: PRESET_IMAGES.samsonTemple,
      desc: 'Tensión muscular, polvo de piedra y luz cenital.',
    },
    {
      title: 'El Jinete del Apocalipsis sobre las Ruinas',
      url: PRESET_IMAGES.apocalypseHorseman,
      desc: 'Juicio ominoso en patmos con trazos de tinta negra.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white font-cinzel">
              CAMBIAR ILUSTRACIÓN · VIÑETA #{panelIndex + 1}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-900/60 p-1 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-md font-semibold transition-colors ${
              activeTab === 'presets' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Galería Bíblica Noir
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2 rounded-md font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'ai' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Generar con IA</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-md font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Archivo</span>
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="p-6 overflow-y-auto grid grid-cols-2 gap-4 flex-1">
            {presetList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectImage(item.url, item.title);
                  onClose();
                }}
                className="group relative rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden cursor-pointer hover:border-amber-500 transition-all"
              >
                <div className="aspect-[4/3] bg-black overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 text-xs">
                  <h4 className="font-bold text-white font-cinzel text-xs truncate">{item.title}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: AI Generation */}
        {activeTab === 'ai' && (
          <div className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1.5">
                Describe la escena bíblica en estilo cómic noir:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600 resize-none"
                placeholder="Ej: King Solomon seated on an ivory throne in shadowy ancient Jerusalem hall, dramatic rim lighting, ink hatched graphic novel style..."
              />
            </div>

            {generationError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {generationError}
              </div>
            )}

            <button
              onClick={handleGenerateAI}
              disabled={isGenerating || !customPrompt.trim()}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generando Ilustración Noir con Gemini...' : 'Crear Ilustración Noir'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Upload */}
        {activeTab === 'upload' && (
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 text-neutral-400">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Cargar Imagen desde tu Dispositivo</h3>
            <p className="text-xs text-neutral-400 max-w-sm mb-4">
              Soporta archivos PNG, JPG o WebP. Se le aplicará automáticamente el filtro noir y claroscuro de la página.
            </p>
            <label className="cursor-pointer px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors">
              <span>Seleccionar Archivo...</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
