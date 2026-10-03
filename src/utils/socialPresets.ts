import { ComicPage } from '../types/comic';
import { renderPageToCanvas } from './canvasRenderer';

export type SocialPlatformId = 
  | 'instagram-square' 
  | 'instagram-story' 
  | 'artstation' 
  | 'twitter-strip' 
  | 'webtoon';

export interface SocialPreset {
  id: SocialPlatformId;
  name: string;
  category: 'Redes Sociales' | 'Comunidades de Arte' | 'Lectores Web';
  dimensions: { width: number; height: number };
  aspectRatio: string;
  description: string;
  badge: string;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  {
    id: 'instagram-square',
    name: 'Instagram Post Cuadrado',
    category: 'Redes Sociales',
    dimensions: { width: 1200, height: 1200 },
    aspectRatio: '1:1',
    description: 'Encuadre balanceado de alta fidelidad optimizado para el feed de Instagram y carruseles.',
    badge: '1200 × 1200 px',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Stories & TikTok',
    category: 'Redes Sociales',
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: '9:16',
    description: 'Póster cinematográfico vertical a pantalla completa con sombras degradadas y viñeta superior.',
    badge: '1080 × 1920 px',
  },
  {
    id: 'artstation',
    name: 'ArtStation & Behance Showcase',
    category: 'Comunidades de Arte',
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
    description: 'Presentación widescreen para portafolios de arte conceptual, con créditos de artista y sello noir.',
    badge: '1920 × 1080 px',
  },
  {
    id: 'twitter-strip',
    name: 'Twitter / X Strip Showcase',
    category: 'Redes Sociales',
    dimensions: { width: 1600, height: 900 },
    aspectRatio: '16:9',
    description: 'Proporción óptima para previsualización sin cortes en el timeline de X/Twitter.',
    badge: '1600 × 900 px',
  },
  {
    id: 'webtoon',
    name: 'Webtoon / Tapas Scroll',
    category: 'Lectores Web',
    dimensions: { width: 800, height: 1280 },
    aspectRatio: '5:8',
    description: 'Estandarizado para tiras cómicas digitales de lectura vertical fluida en móviles.',
    badge: '800 × 1280 px',
  },
];

// Render a customized canvas formatted specifically for the chosen social/community platform
export async function renderSocialExportCanvas(
  page: ComicPage,
  presetId: SocialPlatformId,
  artistName = 'Artista Gráfico'
): Promise<HTMLCanvasElement> {
  const preset = SOCIAL_PRESETS.find((p) => p.id === presetId) || SOCIAL_PRESETS[0];
  const { width, height } = preset.dimensions;

  // First render the source comic page at 2x
  const sourceCanvas = await renderPageToCanvas(page, 2);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Fill dark stark noir background
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, width, height);

  // Subtle halftone pattern on outer edges
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let x = 0; x < width; x += 16) {
    for (let y = 0; y < height; y += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (presetId === 'instagram-square') {
    // Center the comic page with balanced side borders
    const targetH = height * 0.90;
    const targetW = targetH * (sourceCanvas.width / sourceCanvas.height);
    const targetX = (width - targetW) / 2;
    const targetY = (height - targetH) / 2;

    // Outer shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 24;
    ctx.drawImage(sourceCanvas, targetX, targetY, targetW, targetH);
    ctx.shadowColor = 'transparent';

    // Top watermark header
    ctx.font = "600 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#737373';
    ctx.textAlign = 'center';
    ctx.fillText(`${page.title.toUpperCase()} · BIBLICAL NOIR NOVEL`, width / 2, 34);

    // Bottom author credit
    ctx.font = "500 12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#a3a3a3';
    ctx.fillText(`ARTE POR ${artistName.toUpperCase()} · PÁG. ${page.pageNumber}`, width / 2, height - 26);
  } else if (presetId === 'instagram-story') {
    // 9:16 vertical poster: Header area, main comic in middle, bottom CTA
    const targetW = width * 0.92;
    const targetH = targetW * (sourceCanvas.height / sourceCanvas.width);
    const targetX = (width - targetW) / 2;
    const targetY = (height - targetH) / 2 + 20;

    ctx.drawImage(sourceCanvas, targetX, targetY, targetW, targetH);

    // Header dramatic banner
    ctx.textAlign = 'center';
    ctx.font = "900 32px 'Cinzel Decorative', serif";
    ctx.fillStyle = '#ffffff';
    ctx.fillText(page.title.toUpperCase(), width / 2, 100);

    ctx.font = "700 14px 'Bebas Neue', sans-serif";
    ctx.fillStyle = '#e11d48';
    ctx.fillText(`[ ${page.chapter || 'PASAJES BÍBLICOS'} ] · NOVELA GRÁFICA`, width / 2, 130);

    // Footer swipe up / tag
    ctx.font = "500 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#737373';
    ctx.fillText('Desliza para leer el tomo completo · Formato PDF disponible', width / 2, height - 50);
  } else if (presetId === 'artstation') {
    // 16:9 ArtStation Showcase: Left comic page mockup + Right cinematic project sheet
    const comicW = height * 0.88 * (sourceCanvas.width / sourceCanvas.height);
    const comicH = height * 0.88;
    const comicX = 60;
    const comicY = (height - comicH) / 2;

    // Shadow & page
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 30;
    ctx.drawImage(sourceCanvas, comicX, comicY, comicW, comicH);
    ctx.shadowColor = 'transparent';

    // Right side editorial metadata
    const metaX = comicX + comicW + 80;
    const metaW = width - metaX - 60;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#e11d48';
    ctx.font = "700 15px 'Bebas Neue', sans-serif";
    ctx.fillText('BIBLICAL NOIR GRAPHIC NOVEL PROJECT', metaX, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = "900 44px 'Cinzel', serif";
    ctx.fillText(page.title, metaX, 280);

    ctx.fillStyle = '#a3a3a3';
    ctx.font = "400 16px 'Special Elite', monospace";
    ctx.fillText(`«${page.scriptNotes || 'Estudio de claroscuro y dramatismo bíblico'}»`, metaX, 340, metaW);

    ctx.fillStyle = '#e5e5e5';
    ctx.font = "600 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`REFERENCIA: ${page.bibleVerse || page.chapter}`, metaX, 420);
    ctx.fillText(`ESTILO: Frank Miller Noir Chiaroscuro`, metaX, 450);
    ctx.fillText(`ARTISTA: ${artistName}`, metaX, 480);
    ctx.fillText(`FORMATO: Impresión CMYK & Digital 300 DPI`, metaX, 510);

    // Decorative divider line
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(metaX, 550);
    ctx.lineTo(metaX + metaW, 550);
    ctx.stroke();

    ctx.font = "500 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#525252';
    ctx.fillText('Publicado en ArtStation / Behance Visual Arts Showcase', metaX, 590);
  } else {
    // Generic center fit
    const targetH = height * 0.92;
    const targetW = targetH * (sourceCanvas.width / sourceCanvas.height);
    const targetX = (width - targetW) / 2;
    const targetY = (height - targetH) / 2;
    ctx.drawImage(sourceCanvas, targetX, targetY, targetW, targetH);
  }

  return canvas;
}
