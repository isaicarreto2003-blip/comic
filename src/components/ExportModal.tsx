import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Layers,
  Printer,
  Globe,
  Instagram,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ComicPage } from '../types/comic';
import { exportPagesToPdf, exportSinglePagePdf } from '../utils/pdfExport';
import { renderPageToCanvas, downloadCanvas } from '../utils/canvasRenderer';
import {
  SOCIAL_PRESETS,
  SocialPlatformId,
  renderSocialExportCanvas,
} from '../utils/socialPresets';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: ComicPage[];
  currentPage: ComicPage;
  selectedPanelIndex: number | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pages,
  currentPage,
  selectedPanelIndex,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'highres' | 'social'>('pdf');

  // PDF options
  const [bookTitle, setBookTitle] = useState('Crónicas Bíblicas: Sombras y Juicio');
  const [authorName, setAuthorName] = useState('Estudio Gráfico Bíblico');
  const [includeCover, setIncludeCover] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStatus, setPdfStatus] = useState('');

  // High Res options
  const [exportScale, setExportScale] = useState<2 | 3>(2);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [isExportingImage, setIsExportingImage] = useState(false);

  // Social options
  const [selectedSocialId, setSelectedSocialId] = useState<SocialPlatformId>('instagram-square');
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [socialCopied, setSocialCopied] = useState(false);

  if (!isOpen) return null;

  // Trigger celebration confetti
  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#eab308', '#ffffff', '#000000'],
      });
    } catch (_) {}
  };

  // 1. Export Complete Comic Volume as PDF
  const handleExportFullPdf = async () => {
    setIsExportingPdf(true);
    setPdfProgress(5);
    setPdfStatus('Iniciando maquetación PDF...');
    try {
      await exportPagesToPdf(pages, {
        includeCover,
        bookTitle,
        authorName,
        scale: 2,
        onProgress: (p, text) => {
          setPdfProgress(p);
          setPdfStatus(text);
        },
      });
      fireCelebration();
    } catch (err) {
      console.error('PDF Export error:', err);
    } finally {
      setIsExportingPdf(false);
      setPdfProgress(0);
      setPdfStatus('');
    }
  };

  // 2. Export Single Page as PDF
  const handleExportSinglePdf = async () => {
    setIsExportingPdf(true);
    setPdfStatus('Exportando página a PDF...');
    try {
      await exportSinglePagePdf(currentPage, 2);
      fireCelebration();
    } catch (err) {
      console.error('Single PDF error:', err);
    } finally {
      setIsExportingPdf(false);
      setPdfStatus('');
    }
  };

  // 3. Export High-Res Image (PNG/JPG)
  const handleExportHighResPage = async () => {
    setIsExportingImage(true);
    try {
      const canvas = await renderPageToCanvas(currentPage, exportScale);
      const mime = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
      const cleanTitle = (currentPage.title || 'pagina_noir').toLowerCase().replace(/\s+/g, '_');
      const filename = `${cleanTitle}_${exportScale}x.${exportFormat}`;
      downloadCanvas(canvas, filename, mime);
      fireCelebration();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingImage(false);
    }
  };

  // 4. Download Social Media Preset Canvas
  const handleDownloadSocial = async () => {
    setIsGeneratingSocial(true);
    try {
      const canvas = await renderSocialExportCanvas(currentPage, selectedSocialId, authorName);
      const filename = `biblical_noir_${selectedSocialId}.png`;
      downloadCanvas(canvas, filename, 'image/png');
      fireCelebration();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  // 5. Native Share API or Clipboard Copy
  const handleShareSocial = async () => {
    setIsGeneratingSocial(true);
    try {
      const canvas = await renderSocialExportCanvas(currentPage, selectedSocialId, authorName);
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `${currentPage.title || 'comic'}.png`, {
            type: 'image/png',
          });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: currentPage.title,
              text: `«${currentPage.title}» - Novela Gráfica Bíblica Noir`,
              files: [file],
            });
            fireCelebration();
            setIsGeneratingSocial(false);
            return;
          }
        }

        // Fallback: Copy to clipboard
        if (navigator.clipboard && (window as any).ClipboardItem) {
          await navigator.clipboard.write([new (window as any).ClipboardItem({ 'image/png': blob })]);
          setSocialCopied(true);
          fireCelebration();
          setTimeout(() => setSocialCopied(false), 3000);
        } else {
          // Download directly
          downloadCanvas(canvas, `${selectedSocialId}.png`, 'image/png');
        }
        setIsGeneratingSocial(false);
      }, 'image/png');
    } catch (err) {
      console.error('Share failed:', err);
      setIsGeneratingSocial(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold text-white font-cinzel">
                EXPORTACIÓN & DISTRIBUCIÓN DIGITAL
              </h2>
              <p className="text-xs text-neutral-400">
                PDF multipágina de alta resolución, imágenes para imprenta y formatos para redes y comunidades.
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

        {/* Tab Navigator */}
        <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-900/60 p-1 text-xs">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`py-2.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'pdf' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Documento PDF (Tomo)</span>
          </button>

          <button
            onClick={() => setActiveTab('highres')}
            className={`py-2.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'highres' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Alta Resolución (Impresión)</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`py-2.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'social' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Redes & Comunidades</span>
          </button>
        </div>

        {/* Tab Content 1: PDF Export */}
        {activeTab === 'pdf' && (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Título del Tomo / Novela Gráfica:
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Crédito de Autor / Estudio Artístico:
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full p-2.5 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Options */}
            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCover}
                  onChange={(e) => setIncludeCover(e.target.checked)}
                  className="rounded border-neutral-700 text-rose-600 focus:ring-0 accent-rose-600"
                />
                <div>
                  <span className="font-semibold text-neutral-200">
                    Incluir Portada Editorial Monumental
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Genera una página frontal artística con títulos en Cinzel Decorative, versículo de apertura y sello editorial.
                  </p>
                </div>
              </label>
            </div>

            {/* Export Summary Box */}
            <div className="p-3.5 rounded bg-black/60 border border-neutral-800 flex items-center justify-between text-neutral-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                  <Layers className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    Tomo Completo ({pages.length} Páginas {includeCover ? '+ Portada' : ''})
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Formato A4 (210×297 mm) · Compresión Digital sin pérdida de fuentes
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono">
                Listo para Imprenta
              </span>
            </div>

            {/* Progress Bar when exporting */}
            {isExportingPdf && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>{pdfStatus}</span>
                  <span>{pdfProgress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 transition-all duration-300 rounded-full"
                    style={{ width: `${pdfProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportFullPdf}
                disabled={isExportingPdf}
                className="flex-1 py-3 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {isExportingPdf ? 'Compilando Tomo PDF...' : `Exportar Tomo Completo (${pages.length} Págs)`}
                </span>
              </button>

              <button
                onClick={handleExportSinglePdf}
                disabled={isExportingPdf}
                className="py-3 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Sólo Pág. {currentPage.pageNumber} en PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 2: High Resolution PNG/JPG */}
        {activeTab === 'highres' && (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto text-xs">
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Renderizado de Lienzo en Ultra Alta Definición
              </h3>
              <p className="text-neutral-400">
                Ideal para ampliaciones, pósteres de exhibición o galerías digitales donde se requiere la máxima nitidez en el sombreado y tramas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Scale options */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Resolución / Escala de Exportación:
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setExportScale(2)}
                    className={`w-full p-2.5 rounded border text-left flex items-center justify-between ${
                      exportScale === 2
                        ? 'border-rose-500 bg-rose-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">2X Ultra HD (2400 × 3200 px)</p>
                      <p className="text-[10px] text-neutral-400">Excelente para lectura digital y web</p>
                    </div>
                    {exportScale === 2 && <Check className="w-4 h-4 text-rose-400" />}
                  </button>

                  <button
                    onClick={() => setExportScale(3)}
                    className={`w-full p-2.5 rounded border text-left flex items-center justify-between ${
                      exportScale === 3
                        ? 'border-rose-500 bg-rose-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">3X Imprenta Master (3600 × 4800 px)</p>
                      <p className="text-[10px] text-neutral-400">Calidad editorial de 300 DPI nativa</p>
                    </div>
                    {exportScale === 3 && <Check className="w-4 h-4 text-rose-400" />}
                  </button>
                </div>
              </div>

              {/* Format options */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Formato de Imagen:
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setExportFormat('png')}
                    className={`w-full p-2.5 rounded border text-left flex items-center justify-between ${
                      exportFormat === 'png'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">PNG (Compresión sin pérdida)</p>
                      <p className="text-[10px] text-neutral-400">Conserva bordes y letras 100% nítidos</p>
                    </div>
                    {exportFormat === 'png' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => setExportFormat('jpeg')}
                    className={`w-full p-2.5 rounded border text-left flex items-center justify-between ${
                      exportFormat === 'jpeg'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">JPEG Calidad 95%</p>
                      <p className="text-[10px] text-neutral-400">Archivos ligeros para distribución rápida</p>
                    </div>
                    {exportFormat === 'jpeg' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportHighResPage}
              disabled={isExportingImage}
              className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExportingImage
                  ? 'Renderizando Lienzo en Alta Resolución...'
                  : `Descargar Pág. ${currentPage.pageNumber} (${exportScale}X ${exportFormat.toUpperCase()})`}
              </span>
            </button>
          </div>
        )}

        {/* Tab Content 3: Social Media & Art Communities */}
        {activeTab === 'social' && (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto text-xs">
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Plantillas Optimizadas para Redes & Portafolios de Arte
              </h3>
              <p className="text-neutral-400">
                Adapta la composición noir con márgenes protectores, créditos de autor y relaciones de aspecto nativas.
              </p>
            </div>

            {/* Social Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SOCIAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedSocialId(preset.id)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    selectedSocialId === preset.id
                      ? 'border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/40'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{preset.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-sky-400 border border-neutral-800">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">{preset.description}</p>
                  </div>

                  <div className="mt-2 text-[10px] text-neutral-500 font-mono">
                    Aspecto: {preset.aspectRatio} · {preset.category}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleDownloadSocial}
                disabled={isGeneratingSocial}
                className="flex-1 py-3 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Imagen Formateada</span>
              </button>

              <button
                onClick={handleShareSocial}
                disabled={isGeneratingSocial}
                className="py-3 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {socialCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">¡Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-sky-400" />
                    <span>Compartir Directamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <span>Distribución directa para creadores independientes y artistas de novela gráfica.</span>
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
