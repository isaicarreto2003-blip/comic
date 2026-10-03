import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, MessageSquare, AlertCircle, Sparkles, Volume2 } from 'lucide-react';
import { ComicPage, SpeechBalloon, BalloonType } from '../types/comic';
import { calculatePanelRects } from '../utils/canvasRenderer';

interface ComicCanvasProps {
  page: ComicPage;
  selectedBalloonId: string | null;
  selectedPanelIndex: number | null;
  onSelectBalloon: (id: string | null) => void;
  onSelectPanel: (index: number | null) => void;
  onUpdateBalloon: (updated: SpeechBalloon) => void;
  onAddBalloon: (type: BalloonType) => void;
  onOpenPanelImageModal: (panelIndex: number) => void;
}

export const ComicCanvas: React.FC<ComicCanvasProps> = ({
  page,
  selectedBalloonId,
  selectedPanelIndex,
  onSelectBalloon,
  onSelectPanel,
  onUpdateBalloon,
  onAddBalloon,
  onOpenPanelImageModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [showHalftone, setShowHalftone] = useState(false);
  const [draggingBalloonId, setDraggingBalloonId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Baseline page dimensions (3:4 aspect ratio)
  const baseW = 680;
  const baseH = 907;

  // Compute panel geometries for CSS styling
  const rects = calculatePanelRects(
    page.template,
    baseW,
    baseH,
    page.gutterSize || 10,
    24 // margin
  );

  // Dragging logic
  const handleBalloonPointerDown = (e: React.PointerEvent, balloon: SpeechBalloon) => {
    e.stopPropagation();
    onSelectBalloon(balloon.id);
    onSelectPanel(null);

    const pageEl = pageRef.current;
    if (!pageEl) return;

    const pageRect = pageEl.getBoundingClientRect();
    const balloonCurrentPxX = (balloon.x / 100) * pageRect.width;
    const balloonCurrentPxY = (balloon.y / 100) * pageRect.height;

    setDraggingBalloonId(balloon.id);
    setDragOffset({
      x: e.clientX - pageRect.left - balloonCurrentPxX,
      y: e.clientY - pageRect.top - balloonCurrentPxY,
    });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingBalloonId || !pageRef.current) return;

    const pageRect = pageRef.current.getBoundingClientRect();
    const currentBalloon = page.balloons.find((b) => b.id === draggingBalloonId);
    if (!currentBalloon) return;

    const rawX = e.clientX - pageRect.left - dragOffset.x;
    const rawY = e.clientY - pageRect.top - dragOffset.y;

    const newPercentX = Math.max(2, Math.min(85, (rawX / pageRect.width) * 100));
    const newPercentY = Math.max(2, Math.min(90, (rawY / pageRect.height) * 100));

    onUpdateBalloon({
      ...currentBalloon,
      x: Math.round(newPercentX * 10) / 10,
      y: Math.round(newPercentY * 10) / 10,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingBalloonId) {
      setDraggingBalloonId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Filter CSS class or inline style
  const getFilterStyle = () => {
    const intensity = (page.filterIntensity ?? 85) / 100;
    switch (page.noirFilter) {
      case 'classic-noir':
        return `grayscale(${100 * intensity}%) contrast(${135 + 40 * intensity}%) brightness(${92 - 12 * intensity}%)`;
      case 'blood-accent':
        return `grayscale(${90 * intensity}%) contrast(140%) brightness(88%) sepia(${15 * intensity}%)`;
      case 'golden-divine':
        return `sepia(${50 * intensity}%) contrast(125%) brightness(95%) saturate(${130 * intensity}%)`;
      case 'parchment-sepia':
        return `sepia(${80 * intensity}%) contrast(115%) brightness(90%)`;
      case 'emerald-shadow':
        return `grayscale(${85 * intensity}%) contrast(135%) hue-rotate(90deg) brightness(85%)`;
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-auto bg-[#070707] select-none"
      onClick={() => {
        onSelectBalloon(null);
        onSelectPanel(null);
      }}
    >
      {/* Floating Canvas Top Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-800 backdrop-blur px-3 py-1.5 rounded-full shadow-lg">
        {/* Zoom controls */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.max(0.5, z - 0.15));
          }}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          title="Reducir zoom"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono text-neutral-300 w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(1.8, z + 0.15));
          }}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          title="Aumentar zoom"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom(1);
          }}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          title="Ajustar 100%"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-3.5 bg-neutral-700 mx-1" />

        {/* Screentone texture */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowHalftone(!showHalftone);
          }}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
            showHalftone
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Alternar textura de semitono cómic noir"
        >
          Trama Halftone
        </button>

        <span className="w-px h-3.5 bg-neutral-700 mx-1" />

        {/* Quick Add Balloons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBalloon('narration');
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
          title="Añadir cartela de narración noir"
        >
          <span>+ Cartela</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBalloon('speech');
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
          title="Añadir globo de diálogo"
        >
          <MessageSquare className="w-3 h-3" />
          <span>+ Diálogo</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBalloon('shout');
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
          title="Añadir grito o estallido"
        >
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span>+ Grito</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBalloon('sfx');
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
          title="Añadir onomatopeya de acción"
        >
          <Volume2 className="w-3 h-3 text-amber-400" />
          <span>+ SFX</span>
        </button>
      </div>

      {/* Main Comic Page Workspace */}
      <div
        className="transition-transform duration-100 ease-out origin-center my-auto"
        style={{ transform: `scale(${zoom})` }}
      >
        <div
          ref={pageRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative bg-black rounded shadow-2xl overflow-hidden border border-neutral-800"
          style={{
            width: `${baseW}px`,
            height: `${baseH}px`,
          }}
        >
          {/* Halftone Texture Overlay */}
          {showHalftone && (
            <div className="absolute inset-0 pointer-events-none z-10 noir-halftone opacity-40 mix-blend-overlay" />
          )}

          {/* Render Panels */}
          {rects.map((r, i) => {
            const panel = page.panels[i] || page.panels[0];
            const isSelected = selectedPanelIndex === i;

            return (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPanel(i);
                  onSelectBalloon(null);
                }}
                className={`absolute overflow-hidden cursor-pointer group transition-all ${
                  isSelected
                    ? 'ring-2 ring-rose-500 z-10'
                    : 'hover:ring-1 hover:ring-neutral-500'
                }`}
                style={{
                  left: `${r.x}px`,
                  top: `${r.y}px`,
                  width: `${r.width}px`,
                  height: `${r.height}px`,
                  border: `${page.borderWidth || 3}px solid ${page.borderColor || '#000000'}`,
                }}
              >
                {/* Panel Image with Noir Filter */}
                {panel?.imageUrl ? (
                  <img
                    src={panel.imageUrl}
                    alt={panel.altText || `Viñeta ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ filter: getFilterStyle() }}
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center p-4 text-center">
                    <Sparkles className="w-6 h-6 text-neutral-600 mb-2" />
                    <span className="text-xs text-neutral-500 font-mono">
                      Viñeta {i + 1} Vacía
                    </span>
                  </div>
                )}

                {/* Inner Dramatic Vignette */}
                <div className="absolute inset-0 pointer-events-none noir-vignette opacity-50" />

                {/* Panel hover quick action */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPanelImageModal(i);
                    }}
                    className="px-2 py-1 bg-black/80 hover:bg-black text-white text-[10px] font-semibold rounded border border-neutral-700 shadow flex items-center gap-1 backdrop-blur"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Cambiar Arte</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Render Speech Balloons */}
          {page.balloons.map((balloon) => {
            const isSelected = selectedBalloonId === balloon.id;

            return (
              <div
                key={balloon.id}
                onPointerDown={(e) => handleBalloonPointerDown(e, balloon)}
                className={`absolute cursor-move select-none transition-shadow z-20 ${
                  isSelected ? 'ring-2 ring-amber-400 rounded-lg shadow-xl' : 'hover:scale-[1.01]'
                }`}
                style={{
                  left: `${balloon.x}%`,
                  top: `${balloon.y}%`,
                  width: `${balloon.width || 42}%`,
                  transform: balloon.rotation ? `rotate(${balloon.rotation}deg)` : undefined,
                }}
              >
                {/* Visual balloon container */}
                {balloon.type === 'sfx' ? (
                  // Freeform Sound Effect
                  <div
                    className="p-1 font-bangers text-center tracking-wider"
                    style={{
                      fontFamily: balloon.fontFamily,
                      fontSize: `${balloon.fontSize * 1.3}px`,
                      color: balloon.fontColor || '#e11d48',
                      textShadow: '3px 3px 0 #000000, -2px -2px 0 #000000, 2px -2px 0 #000000, -2px 2px 0 #000000',
                    }}
                  >
                    {balloon.isUppercase ? balloon.text.toUpperCase() : balloon.text}
                  </div>
                ) : balloon.type === 'narration' ? (
                  // Noir rectangular narration box
                  <div
                    className="p-2.5 comic-border text-left leading-snug"
                    style={{
                      backgroundColor: balloon.backgroundColor || '#faf5e4',
                      border: `${balloon.borderWidth || 2}px solid ${balloon.borderColor || '#000000'}`,
                      color: balloon.fontColor || '#000000',
                      fontFamily: balloon.fontFamily,
                      fontSize: `${balloon.fontSize}px`,
                      fontWeight: balloon.isBold ? 700 : 400,
                      fontStyle: balloon.isItalic ? 'italic' : 'normal',
                    }}
                  >
                    {balloon.isUppercase ? balloon.text.toUpperCase() : balloon.text}
                  </div>
                ) : balloon.type === 'shout' ? (
                  // Jagged shout explosion
                  <div
                    className="relative p-3.5 text-center leading-snug"
                    style={{
                      backgroundColor: balloon.backgroundColor || '#000000',
                      border: `${balloon.borderWidth || 2}px solid ${balloon.borderColor || '#ffffff'}`,
                      clipPath:
                        'polygon(0% 20%, 15% 15%, 20% 0%, 40% 12%, 60% 0%, 75% 15%, 100% 10%, 92% 35%, 100% 60%, 88% 75%, 95% 100%, 70% 88%, 50% 100%, 30% 88%, 10% 100%, 12% 70%, 0% 50%, 10% 35%)',
                      color: balloon.fontColor || '#ffffff',
                      fontFamily: balloon.fontFamily,
                      fontSize: `${balloon.fontSize}px`,
                      fontWeight: balloon.isBold ? 700 : 400,
                      fontStyle: balloon.isItalic ? 'italic' : 'normal',
                    }}
                  >
                    {balloon.isUppercase ? balloon.text.toUpperCase() : balloon.text}
                  </div>
                ) : (
                  // Standard Speech Bubble with tail
                  <div
                    className="relative p-3 rounded-2xl shadow-lg text-center leading-snug"
                    style={{
                      backgroundColor: balloon.backgroundColor || '#ffffff',
                      border: `${balloon.borderWidth || 2}px solid ${balloon.borderColor || '#000000'}`,
                      color: balloon.fontColor || '#000000',
                      fontFamily: balloon.fontFamily,
                      fontSize: `${balloon.fontSize}px`,
                      fontWeight: balloon.isBold ? 700 : 400,
                      fontStyle: balloon.isItalic ? 'italic' : 'normal',
                    }}
                  >
                    {balloon.isUppercase ? balloon.text.toUpperCase() : balloon.text}

                    {/* Tail CSS representation */}
                    {balloon.tailDirection === 'bottom' && (
                      <div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent"
                        style={{
                          borderTop: `12px solid ${balloon.backgroundColor || '#ffffff'}`,
                        }}
                      />
                    )}
                    {balloon.tailDirection === 'top' && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent"
                        style={{
                          borderBottom: `12px solid ${balloon.backgroundColor || '#ffffff'}`,
                        }}
                      />
                    )}
                    {balloon.tailDirection === 'left' && (
                      <div
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent"
                        style={{
                          borderRight: `12px solid ${balloon.backgroundColor || '#ffffff'}`,
                        }}
                      />
                    )}
                    {balloon.tailDirection === 'right' && (
                      <div
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent"
                        style={{
                          borderLeft: `12px solid ${balloon.backgroundColor || '#ffffff'}`,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Editorial Strip */}
          <div className="absolute bottom-2 inset-x-6 flex items-center justify-between text-[10px] text-neutral-400 font-mono pointer-events-none">
            <span>
              {page.chapter ? `${page.chapter} · ` : ''}
              {page.title}
            </span>
            <span>
              Pág. {page.pageNumber || 1} {page.bibleVerse ? `· [${page.bibleVerse}]` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
