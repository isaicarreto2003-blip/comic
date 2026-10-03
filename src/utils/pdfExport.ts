import { jsPDF } from 'jspdf';
import { ComicPage } from '../types/comic';
import { renderPageToCanvas } from './canvasRenderer';

export interface PdfExportOptions {
  includeCover?: boolean;
  bookTitle?: string;
  authorName?: string;
  scale?: number;
  onProgress?: (progress: number, statusText: string) => void;
}

export async function exportPagesToPdf(
  pages: ComicPage[],
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    includeCover = true,
    bookTitle = 'CRÓNICAS BÍBLICAS NOIR',
    authorName = 'Biblical Noir Comic Studio',
    scale = 2,
    onProgress,
  } = options;

  // Standard Graphic Novel Page size in mm (portrait): 210 x 297 mm (A4)
  const pdfW = 210;
  const pdfH = 297;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfW, pdfH],
    compress: true,
  });

  const totalSteps = (includeCover ? 1 : 0) + pages.length;
  let currentStep = 0;

  // 1. Optional Editorial Cover Page
  if (includeCover) {
    onProgress?.(10, 'Generando portada monumental...');
    // Create dark dramatic cover canvas
    const coverCanvas = document.createElement('canvas');
    coverCanvas.width = 1200 * scale;
    coverCanvas.height = 1600 * scale;
    const ctx = coverCanvas.getContext('2d');
    if (ctx) {
      // Deep pitch black background with ink vignette
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, coverCanvas.width, coverCanvas.height);

      // Distressed halftone borders
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6 * scale;
      ctx.strokeRect(30 * scale, 30 * scale, coverCanvas.width - 60 * scale, coverCanvas.height - 60 * scale);
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(40 * scale, 40 * scale, coverCanvas.width - 80 * scale, coverCanvas.height - 80 * scale);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = `900 ${46 * scale}px 'Cinzel Decorative', serif`;
      ctx.fillText(bookTitle.toUpperCase(), coverCanvas.width / 2, 380 * scale);

      // Subtitle
      ctx.font = `700 ${18 * scale}px 'Bebas Neue', sans-serif`;
      ctx.fillStyle = '#e11d48'; // Blood accent
      ctx.fillText('NOVELA GRÁFICA CINEMATOGRÁFICA · SOMBREADO NOIR', coverCanvas.width / 2, 440 * scale);

      // Center decorative seal or verse
      ctx.font = `italic 400 ${16 * scale}px 'Special Elite', monospace`;
      ctx.fillStyle = '#a3a3a3';
      ctx.fillText('«La luz en las tinieblas resplandece, y las tinieblas no prevalecieron contra ella»', coverCanvas.width / 2, 820 * scale);
      ctx.fillText('— Juan 1:5', coverCanvas.width / 2, 870 * scale);

      // Author / Studio footer
      ctx.font = `600 ${14 * scale}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#737373';
      ctx.fillText(`EDICIÓN DIGITAL DE ALTA RESOLUCIÓN · ${authorName.toUpperCase()}`, coverCanvas.width / 2, 1460 * scale);
      ctx.fillText(`${pages.length} PÁGINAS ILUSTRADAS`, coverCanvas.width / 2, 1500 * scale);
    }

    const coverData = coverCanvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(coverData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
    currentStep++;
  }

  // 2. Render each Comic Page
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const percent = Math.round(((currentStep + 1) / totalSteps) * 100);
    onProgress?.(percent, `Procesando Página ${page.pageNumber || i + 1} de ${pages.length}...`);

    if (includeCover || i > 0) {
      doc.addPage([pdfW, pdfH], 'portrait');
    }

    const pageCanvas = await renderPageToCanvas(page, scale);
    const pageData = pageCanvas.toDataURL('image/jpeg', 0.92);
    doc.addImage(pageData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');

    currentStep++;
  }

  onProgress?.(100, 'Compilando documento PDF final...');
  doc.save(`${bookTitle.toLowerCase().replace(/\s+/g, '_')}_vol1.pdf`);
}

// Export a single page as high-res PDF
export async function exportSinglePagePdf(page: ComicPage, scale = 2): Promise<void> {
  const pdfW = 210;
  const pdfH = 297;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfW, pdfH],
    compress: true,
  });

  const pageCanvas = await renderPageToCanvas(page, scale);
  const pageData = pageCanvas.toDataURL('image/jpeg', 0.95);
  doc.addImage(pageData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');

  const cleanTitle = (page.title || `pagina_${page.pageNumber}`).toLowerCase().replace(/\s+/g, '_');
  doc.save(`${cleanTitle}_noir.pdf`);
}
