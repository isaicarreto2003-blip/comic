import React, { useState } from 'react';
import {
  Type,
  LayoutGrid,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Volume2,
  Trash2,
  Copy,
  Sliders,
  Palette,
  Wand2,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ComicPage,
  SpeechBalloon,
  BalloonType,
  TailDirection,
  PageLayoutTemplate,
  NoirFilterType,
} from '../types/comic';
import { FONTS_CATALOG, BIBLICAL_SCENES } from '../data/biblicalPresets';

interface InspectorSidebarProps {
  page: ComicPage;
  selectedBalloonId: string | null;
  selectedPanelIndex: number | null;
  onUpdatePage: (updated: ComicPage) => void;
  onSelectBalloon: (id: string | null) => void;
  onAddBalloon: (type: BalloonType) => void;
  onOpenPanelImageModal: (panelIndex: number) => void;
  activeTab: 'text' | 'layout' | 'ai';
  setActiveTab: (tab: 'text' | 'layout' | 'ai') => void;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  page,
  selectedBalloonId,
  selectedPanelIndex,
  onUpdatePage,
  onSelectBalloon,
  onAddBalloon,
  onOpenPanelImageModal,
  activeTab,
  setActiveTab,
}) => {
  const selectedBalloon = page.balloons.find((b) => b.id === selectedBalloonId) || null;

  // AI Script generation states
  const [aiSceneTitle, setAiSceneTitle] = useState(page.title || 'David frente a Goliat');
  const [aiCharacter, setAiCharacter] = useState('David');
  const [aiContext, setAiContext] = useState(page.scriptNotes || 'Valle de Ela, desafío del gigante');
  const [aiTone, setAiTone] = useState('Noir oscuro, sombras profundas, monólogo interior descarnado');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [aiScriptResult, setAiScriptResult] = useState<any>(null);

  // AI Image generation states
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiImageError, setAiImageError] = useState<string | null>(null);

  // Update a single balloon on the page
  const handleUpdateCurrentBalloon = (updates: Partial<SpeechBalloon>) => {
    if (!selectedBalloon) return;
    const newBalloons = page.balloons.map((b) =>
      b.id === selectedBalloon.id ? { ...b, ...updates } : b
    );
    onUpdatePage({ ...page, balloons: newBalloons });
  };

  // Delete current balloon
  const handleDeleteBalloon = () => {
    if (!selectedBalloon) return;
    const newBalloons = page.balloons.filter((b) => b.id !== selectedBalloon.id);
    onUpdatePage({ ...page, balloons: newBalloons });
    onSelectBalloon(null);
  };

  // Duplicate current balloon
  const handleDuplicateBalloon = () => {
    if (!selectedBalloon) return;
    const duplicated: SpeechBalloon = {
      ...selectedBalloon,
      id: `b-${Date.now()}`,
      x: Math.min(80, selectedBalloon.x + 5),
      y: Math.min(80, selectedBalloon.y + 5),
    };
    onUpdatePage({ ...page, balloons: [...page.balloons, duplicated] });
    onSelectBalloon(duplicated.id);
  };

  // Call server Gemini API for Script and Dialogues
  const handleGenerateScriptWithAI = async () => {
    setIsGeneratingScript(true);
    setAiScriptResult(null);
    try {
      const res = await fetch('/api/gemini/suggest-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneTitle: aiSceneTitle,
          characterName: aiCharacter,
          passageContext: aiContext,
          moodTone: aiTone,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiScriptResult(json.data);
        if (json.data.visualPrompt) {
          setAiImagePrompt(json.data.visualPrompt);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Call server Gemini API for Noir Panel Image
  const handleGenerateImageWithAI = async () => {
    if (!aiImagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setAiImageError(null);
    try {
      const res = await fetch('/api/gemini/generate-panel-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiImagePrompt,
          aspectRatio: '4:3',
          noirFilter: page.noirFilter,
        }),
      });
      const json = await res.json();
      if (json.success && json.imageUrl) {
        // Apply to selected panel or first panel
        const targetIndex = selectedPanelIndex ?? 0;
        const newPanels = [...page.panels];
        newPanels[targetIndex] = {
          ...(newPanels[targetIndex] || {}),
          id: `panel-${Date.now()}`,
          imageUrl: json.imageUrl,
          altText: aiImagePrompt,
          promptDescription: aiImagePrompt,
        };
        onUpdatePage({ ...page, panels: newPanels });
      } else {
        setAiImageError(json.error || 'No se pudo generar la viñeta con el modelo actual.');
      }
    } catch (err: any) {
      setAiImageError(err.message || 'Error de conexión con el servidor Gemini.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Quick insert balloon helper from AI result
  const insertGeneratedBalloon = (text: string, type: BalloonType, fontFamily: string) => {
    const newBalloon: SpeechBalloon = {
      id: `b-${Date.now()}`,
      type,
      text,
      x: type === 'narration' ? 10 : 30,
      y: type === 'narration' ? 10 : 45,
      width: type === 'narration' ? 48 : 42,
      fontFamily,
      fontSize: type === 'sfx' ? 32 : 14,
      fontColor: type === 'narration' ? '#000000' : type === 'shout' ? '#ffffff' : type === 'sfx' ? '#e11d48' : '#000000',
      backgroundColor: type === 'narration' ? '#faf5e4' : type === 'shout' ? '#000000' : type === 'sfx' ? 'transparent' : '#ffffff',
      borderColor: type === 'sfx' ? 'transparent' : '#000000',
      borderWidth: type === 'sfx' ? 0 : 2,
      tailDirection: type === 'narration' || type === 'sfx' ? 'none' : 'bottom',
      isBold: true,
      isUppercase: type === 'narration' || type === 'sfx',
    };
    onUpdatePage({ ...page, balloons: [...page.balloons, newBalloon] });
    onSelectBalloon(newBalloon.id);
  };

  return (
    <aside className="w-80 lg:w-96 border-l border-neutral-800 bg-neutral-950 flex flex-col shrink-0 select-none overflow-hidden">
      {/* 3-Tab Navigator */}
      <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-900/60 p-1 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('text')}
          className={`py-2 px-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'text'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Globos & Texto</span>
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`py-2 px-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'layout'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Viñetas & Noir</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`py-2 px-2 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'ai'
              ? 'bg-neutral-800 text-amber-300 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Director IA</span>
        </button>
      </div>

      {/* Tab 1: Speech Balloons & Text Inspector */}
      {activeTab === 'text' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin text-xs">
          {selectedBalloon ? (
            <div className="space-y-4">
              {/* Header with quick delete/duplicate */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">
                  Globo Seleccionado
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDuplicateBalloon}
                    className="p-1.5 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white"
                    title="Duplicar globo"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteBalloon}
                    className="p-1.5 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 text-rose-400 hover:text-rose-300"
                    title="Eliminar globo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Balloon Type Selector */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                  Tipo de Globo / Elemento
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { type: 'speech', label: 'Diálogo', icon: MessageSquare },
                      { type: 'narration', label: 'Cartela Noir', icon: BookOpen },
                      { type: 'shout', label: 'Grito', icon: AlertCircle },
                      { type: 'sfx', label: 'SFX Acción', icon: Volume2 },
                      { type: 'whisper', label: 'Susurro', icon: Sliders },
                      { type: 'thought', label: 'Pensamiento', icon: Wand2 },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleUpdateCurrentBalloon({ type: item.type })}
                      className={`p-2 rounded border text-center font-medium transition-colors ${
                        selectedBalloon.type === item.type
                          ? 'border-rose-500 bg-rose-500/10 text-white'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Contenido del Texto ({selectedBalloon.text.length} caracteres)
                </label>
                <textarea
                  value={selectedBalloon.text}
                  onChange={(e) => handleUpdateCurrentBalloon({ text: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 focus:border-neutral-600 focus:outline-none text-white text-xs resize-none"
                  placeholder="Escribe el diálogo o la narración noir..."
                />
              </div>

              {/* Typography Font Picker */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Familia Tipográfica
                </label>
                <select
                  value={selectedBalloon.fontFamily}
                  onChange={(e) => handleUpdateCurrentBalloon({ fontFamily: e.target.value })}
                  className="w-full p-2 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                >
                  {FONTS_CATALOG.map((font) => (
                    <option key={font.id} value={font.fontFamily}>
                      {font.name} · {font.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size & Styling */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Tamaño Fuente</span>
                    <span>{selectedBalloon.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={48}
                    value={selectedBalloon.fontSize}
                    onChange={(e) =>
                      handleUpdateCurrentBalloon({ fontSize: Number(e.target.value) })
                    }
                    className="w-full accent-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Estilo de Texto
                  </label>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        handleUpdateCurrentBalloon({ isBold: !selectedBalloon.isBold })
                      }
                      className={`flex-1 py-1 rounded border font-bold ${
                        selectedBalloon.isBold
                          ? 'border-rose-500 bg-rose-500/20 text-white'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      B
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateCurrentBalloon({ isItalic: !selectedBalloon.isItalic })
                      }
                      className={`flex-1 py-1 rounded border italic ${
                        selectedBalloon.isItalic
                          ? 'border-rose-500 bg-rose-500/20 text-white'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      I
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateCurrentBalloon({ isUppercase: !selectedBalloon.isUppercase })
                      }
                      className={`flex-1 py-1 rounded border uppercase text-[10px] ${
                        selectedBalloon.isUppercase
                          ? 'border-rose-500 bg-rose-500/20 text-white'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      AA
                    </button>
                  </div>
                </div>
              </div>

              {/* Background Preset Colors */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                  Color de Fondo
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#ffffff', label: 'Blanco' },
                    { color: '#faf5e4', label: 'Pergamino' },
                    { color: '#000000', label: 'Noir' },
                    { color: '#e11d48', label: 'Carmesí' },
                    { color: '#eab308', label: 'Oro' },
                    { color: 'transparent', label: 'Transparente' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleUpdateCurrentBalloon({ backgroundColor: preset.color })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        selectedBalloon.backgroundColor === preset.color
                          ? 'border-rose-500 ring-2 ring-rose-500/40'
                          : 'border-neutral-700'
                      }`}
                      style={{
                        backgroundColor: preset.color === 'transparent' ? '#171717' : preset.color,
                      }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              {/* Tail Direction */}
              {selectedBalloon.type === 'speech' && (
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                    Orientación de la Cola hacia el Personaje
                  </label>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {(['bottom', 'top', 'left', 'right', 'none'] as TailDirection[]).map((dir) => (
                      <button
                        key={dir}
                        onClick={() => handleUpdateCurrentBalloon({ tailDirection: dir })}
                        className={`py-1.5 rounded border text-[10px] uppercase font-semibold ${
                          selectedBalloon.tailDirection === dir
                            ? 'border-rose-500 bg-rose-500/20 text-white'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {dir === 'none' ? 'Sin Cola' : dir}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SFX Tilt / Rotation */}
              {selectedBalloon.type === 'sfx' && (
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Inclinación Dinámica</span>
                    <span>{selectedBalloon.rotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={selectedBalloon.rotation || 0}
                    onChange={(e) =>
                      handleUpdateCurrentBalloon({ rotation: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              )}
            </div>
          ) : (
            /* No balloon selected: Guide & Quick Add Buttons */
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-200">Ningún globo seleccionado</h4>
                <p className="text-neutral-400 mt-1">
                  Haz clic sobre un globo o diálogo en el lienzo para editarlo, o añade uno nuevo:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onAddBalloon('narration')}
                  className="p-2.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left"
                >
                  <p className="font-semibold text-neutral-200">+ Cartela Noir</p>
                  <p className="text-[10px] text-neutral-400">Monólogo interior</p>
                </button>

                <button
                  onClick={() => onAddBalloon('speech')}
                  className="p-2.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left"
                >
                  <p className="font-semibold text-neutral-200">+ Globo Diálogo</p>
                  <p className="text-[10px] text-neutral-400">Voz de personaje</p>
                </button>

                <button
                  onClick={() => onAddBalloon('shout')}
                  className="p-2.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left"
                >
                  <p className="font-semibold text-neutral-200">+ Grito Explosivo</p>
                  <p className="text-[10px] text-neutral-400">Voz divina o rugido</p>
                </button>

                <button
                  onClick={() => onAddBalloon('sfx')}
                  className="p-2.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left"
                >
                  <p className="font-semibold text-neutral-200">+ SFX Onomatopeya</p>
                  <p className="text-[10px] text-neutral-400">Impacto y acción</p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Layout, Noir Grading & Panels */}
      {activeTab === 'layout' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin text-xs">
          {/* Page Metadata */}
          <div className="space-y-2">
            <span className="font-semibold text-neutral-200 block">Metadatos de la Página</span>
            <input
              type="text"
              value={page.title}
              onChange={(e) => onUpdatePage({ ...page, title: e.target.value })}
              className="w-full p-2 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
              placeholder="Título de la página o escena"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={page.chapter}
                onChange={(e) => onUpdatePage({ ...page, chapter: e.target.value })}
                className="p-2 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                placeholder="Capítulo (ej: 1 Samuel 17)"
              />
              <input
                type="text"
                value={page.bibleVerse}
                onChange={(e) => onUpdatePage({ ...page, bibleVerse: e.target.value })}
                className="p-2 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                placeholder="Versículo clave"
              />
            </div>
          </div>

          {/* Page Layout Templates */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-2">
              Plantilla de Viñetas (Diseño Épico)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'splash-single', name: 'Splash Page Única', desc: '1 viñeta monumental' },
                  { id: 'cinematic-widescreen', name: 'Cinemático Widescreen', desc: '2 viñetas panorámicas' },
                  { id: 'triptych-heroic', name: 'Tríptico Heroico', desc: '3 viñetas cinematográficas' },
                  { id: 'classic-four', name: 'Cuadrícula Clásica (2x2)', desc: '4 viñetas simétricas' },
                  { id: 'action-five', name: 'Acción Dinámica', desc: '1 grande + 2 inferiores' },
                  { id: 'noir-six', name: 'Misterio Noir (3x2)', desc: '6 viñetas de ritmo denso' },
                  { id: 'epic-inset', name: 'Fondo con Insets', desc: '1 fondo + 2 flotantes' },
                ] as { id: PageLayoutTemplate; name: string; desc: string }[]
              ).map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => onUpdatePage({ ...page, template: tmpl.id })}
                  className={`p-2 rounded border text-left transition-colors ${
                    page.template === tmpl.id
                      ? 'border-rose-500 bg-rose-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <p className="font-semibold text-neutral-200 truncate">{tmpl.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{tmpl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Noir Filter & Tonal Grading */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-2">
              Estilo Visual Noir & Claroscuro
            </label>
            <div className="space-y-1.5">
              {(
                [
                  { id: 'classic-noir', name: 'Claroscuro Stark B&W', desc: 'Negros profundos y luces cortantes estilo Sin City' },
                  { id: 'blood-accent', name: 'Acento Rojo Sangre', desc: 'Monocromo con dramatismo carmesí para batallas' },
                  { id: 'golden-divine', name: 'Claroscuro Divino Dorado', desc: 'Destellos áureos de gloria y presencia sagrada' },
                  { id: 'parchment-sepia', name: 'Pergamino Bíblico Sepia', desc: 'Tono antiguo milenario de códice desgastado' },
                  { id: 'emerald-shadow', name: 'Sombra Esmeralda Apocalíptica', desc: 'Tinte profético de juicio y misterio' },
                ] as { id: NoirFilterType; name: string; desc: string }[]
              ).map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onUpdatePage({ ...page, noirFilter: filter.id })}
                  className={`w-full p-2 rounded border text-left flex items-start justify-between transition-colors ${
                    page.noirFilter === filter.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-neutral-200">{filter.name}</p>
                    <p className="text-[10px] text-neutral-400">{filter.desc}</p>
                  </div>
                  {page.noirFilter === filter.id && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Intensity Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Intensidad del Claroscuro Noir</span>
              <span>{page.filterIntensity ?? 85}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              value={page.filterIntensity ?? 85}
              onChange={(e) =>
                onUpdatePage({ ...page, filterIntensity: Number(e.target.value) })
              }
              className="w-full accent-rose-500"
            />
          </div>

          {/* Gutter and Borders */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>Callejuela (Gutter)</span>
                <span>{page.gutterSize || 12}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={page.gutterSize || 12}
                onChange={(e) =>
                  onUpdatePage({ ...page, gutterSize: Number(e.target.value) })
                }
                className="w-full accent-neutral-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>Borde de Tinta</span>
                <span>{page.borderWidth || 4}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={page.borderWidth || 4}
                onChange={(e) =>
                  onUpdatePage({ ...page, borderWidth: Number(e.target.value) })
                }
                className="w-full accent-neutral-400"
              />
            </div>
          </div>

          {/* Panel Selection Action */}
          <div className="pt-2 border-t border-neutral-900">
            <button
              onClick={() => onOpenPanelImageModal(selectedPanelIndex ?? 0)}
              className="w-full py-2 px-3 rounded bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-white font-medium flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>
                {selectedPanelIndex !== null
                  ? `Cambiar Arte de Viñeta #${selectedPanelIndex + 1}`
                  : 'Reemplazar Ilustración de Viñeta'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Gemini AI Director & Scripting */}
      {activeTab === 'ai' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin text-xs">
          {/* Script Generator Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-neutral-200">
                Guionista & Director Noir IA
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Título de la Escena Bíblica
              </label>
              <input
                type="text"
                value={aiSceneTitle}
                onChange={(e) => setAiSceneTitle(e.target.value)}
                className="w-full p-2 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                placeholder="Ej: Moisés y la zarza ardiente en la noche"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Personaje / Narrador
              </label>
              <input
                type="text"
                value={aiCharacter}
                onChange={(e) => setAiCharacter(e.target.value)}
                className="w-full p-2 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                placeholder="Ej: David, Moisés, Elías, Sansón"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Contexto / Tono Dramático
              </label>
              <textarea
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                rows={2}
                className="w-full p-2 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none resize-none"
                placeholder="Describe la atmósfera, lluvia, sombras, miedo o confrontación..."
              />
            </div>

            <button
              onClick={handleGenerateScriptWithAI}
              disabled={isGeneratingScript}
              className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGeneratingScript ? 'Generando Guión Noir...' : 'Generar Guión & Diálogos'}</span>
            </button>
          </div>

          {/* AI Result Cards */}
          {aiScriptResult && (
            <div className="space-y-3 pt-3 border-t border-neutral-800">
              <span className="font-semibold text-amber-300 block">
                Resultados del Director IA:
              </span>

              {/* Narrator Caption */}
              {aiScriptResult.captionNarration && (
                <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span className="font-mono">Cartela Noir (Monólogo)</span>
                    <button
                      onClick={() =>
                        insertGeneratedBalloon(
                          aiScriptResult.captionNarration,
                          'narration',
                          "'Special Elite', monospace"
                        )
                      }
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      + Insertar
                    </button>
                  </div>
                  <p className="font-typewriter text-neutral-200 italic text-[11px]">
                    «{aiScriptResult.captionNarration}»
                  </p>
                </div>
              )}

              {/* Main Dialogue */}
              {aiScriptResult.characterDialogue && (
                <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span className="font-mono">Diálogo de {aiCharacter}</span>
                    <button
                      onClick={() =>
                        insertGeneratedBalloon(
                          aiScriptResult.characterDialogue,
                          'speech',
                          "'Comic Neue', cursive, sans-serif"
                        )
                      }
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      + Insertar
                    </button>
                  </div>
                  <p className="text-neutral-200 text-[11px] font-semibold">
                    "{aiScriptResult.characterDialogue}"
                  </p>
                </div>
              )}

              {/* Adversary Retort */}
              {aiScriptResult.adversaryDialogue && (
                <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span className="font-mono">Réplica / Grito de Adversario</span>
                    <button
                      onClick={() =>
                        insertGeneratedBalloon(
                          aiScriptResult.adversaryDialogue,
                          'shout',
                          "'Bangers', cursive"
                        )
                      }
                      className="text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      + Insertar Grito
                    </button>
                  </div>
                  <p className="text-rose-300 text-[11px] font-bold">
                    ¡{aiScriptResult.adversaryDialogue}!
                  </p>
                </div>
              )}

              {/* Action SFX */}
              {aiScriptResult.soundEffect && (
                <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 block">
                      Onomatopeya de Impacto
                    </span>
                    <span className="font-bangers text-rose-500 text-lg">
                      {aiScriptResult.soundEffect}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      insertGeneratedBalloon(aiScriptResult.soundEffect, 'sfx', "'Bangers', cursive")
                    }
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    + Insertar SFX
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Image Generation Section */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-rose-400" />
              <span className="font-semibold text-neutral-200">
                Generador de Viñetas Noir con IA
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Prompt para Ilustración Bíblica (Claroscuro)
              </label>
              <textarea
                value={aiImagePrompt}
                onChange={(e) => setAiImagePrompt(e.target.value)}
                rows={3}
                className="w-full p-2 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none resize-none"
                placeholder="Ej: Daniel standing calmly in a shadowy den of snarling lions with shafts of moonlight and deep inky shadows..."
              />
            </div>

            {aiImageError && (
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                {aiImageError}
              </div>
            )}

            <button
              onClick={handleGenerateImageWithAI}
              disabled={isGeneratingImage || !aiImagePrompt.trim()}
              className="w-full py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isGeneratingImage
                  ? 'Ilustrando Viñeta con Gemini...'
                  : selectedPanelIndex !== null
                  ? `Generar Viñeta #${selectedPanelIndex + 1}`
                  : 'Generar Viñeta'}
              </span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
