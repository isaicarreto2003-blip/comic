import { ComicPage, SpeechBalloon, PageLayoutTemplate, NoirFilterType } from '../types/comic';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Compute panel rectangle geometries for a given page dimensions and template
export function calculatePanelRects(
  template: PageLayoutTemplate,
  width: number,
  height: number,
  gutter: number,
  margin = 32
): Rect[] {
  const contentW = width - margin * 2;
  const contentH = height - margin * 2;
  const startX = margin;
  const startY = margin;

  switch (template) {
    case 'splash-single':
      return [{ x: startX, y: startY, width: contentW, height: contentH }];

    case 'cinematic-widescreen': {
      const h = (contentH - gutter) / 2;
      return [
        { x: startX, y: startY, width: contentW, height: h },
        { x: startX, y: startY + h + gutter, width: contentW, height: h },
      ];
    }

    case 'triptych-heroic': {
      const h = (contentH - gutter * 2) / 3;
      return [
        { x: startX, y: startY, width: contentW, height: h },
        { x: startX, y: startY + h + gutter, width: contentW, height: h },
        { x: startX, y: startY + (h + gutter) * 2, width: contentW, height: h },
      ];
    }

    case 'classic-four': {
      const w = (contentW - gutter) / 2;
      const h = (contentH - gutter) / 2;
      return [
        { x: startX, y: startY, width: w, height: h },
        { x: startX + w + gutter, y: startY, width: w, height: h },
        { x: startX, y: startY + h + gutter, width: w, height: h },
        { x: startX + w + gutter, y: startY + h + gutter, width: w, height: h },
      ];
    }

    case 'action-five': {
      const topH = contentH * 0.52;
      const bottomH = contentH - topH - gutter;
      const bottomW = (contentW - gutter) / 2;
      return [
        { x: startX, y: startY, width: contentW, height: topH },
        { x: startX, y: startY + topH + gutter, width: bottomW, height: bottomH },
        { x: startX + bottomW + gutter, y: startY + topH + gutter, width: bottomW, height: bottomH },
      ];
    }

    case 'noir-six': {
      const w = (contentW - gutter) / 2;
      const h = (contentH - gutter * 2) / 3;
      return [
        { x: startX, y: startY, width: w, height: h },
        { x: startX + w + gutter, y: startY, width: w, height: h },
        { x: startX, y: startY + h + gutter, width: w, height: h },
        { x: startX + w + gutter, y: startY + h + gutter, width: w, height: h },
        { x: startX, y: startY + (h + gutter) * 2, width: w, height: h },
        { x: startX + w + gutter, y: startY + (h + gutter) * 2, width: w, height: h },
      ];
    }

    case 'epic-inset': {
      // 1 full background + 2 floating inset panels in lower third
      const insetW = contentW * 0.38;
      const insetH = contentH * 0.28;
      const insetY = startY + contentH - insetH - 24;
      return [
        { x: startX, y: startY, width: contentW, height: contentH },
        { x: startX + 24, y: insetY, width: insetW, height: insetH },
        { x: startX + contentW - insetW - 24, y: insetY, width: insetW, height: insetH },
      ];
    }

    default:
      return [{ x: startX, y: startY, width: contentW, height: contentH }];
  }
}

// Load an image as HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Create a dark procedural placeholder if image path fails
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 800, 600);
        ctx.strokeStyle = '#262626';
        ctx.strokeRect(10, 10, 780, 580);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('NOIR PANEL', 400, 300);
      }
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.src = canvas.toDataURL();
    };
    img.src = src;
  });
}

// Apply noir tonal filter to canvas context
export function applyNoirFilter(
  ctx: CanvasRenderingContext2D,
  filterType: NoirFilterType,
  intensity: number
) {
  const norm = intensity / 100;
  switch (filterType) {
    case 'classic-noir':
      ctx.filter = `grayscale(${100 * norm}%) contrast(${135 + 45 * norm}%) brightness(${90 - 15 * norm}%)`;
      break;
    case 'blood-accent':
      ctx.filter = `grayscale(${90 * norm}%) contrast(${140}%) brightness(${85}%) sepia(${15 * norm}%)`;
      break;
    case 'golden-divine':
      ctx.filter = `sepia(${50 * norm}%) contrast(${125}%) brightness(${95}%) saturate(${130 * norm}%)`;
      break;
    case 'parchment-sepia':
      ctx.filter = `sepia(${80 * norm}%) contrast(${115}%) brightness(${90}%)`;
      break;
    case 'emerald-shadow':
      ctx.filter = `grayscale(${85 * norm}%) contrast(${135}%) hue-rotate(90deg) brightness(${85}%)`;
      break;
    default:
      ctx.filter = 'none';
  }
}

// Draw a comic speech balloon on canvas
export function drawBalloonOnCanvas(
  ctx: CanvasRenderingContext2D,
  balloon: SpeechBalloon,
  pageW: number,
  pageH: number,
  scale = 1
) {
  const bx = (balloon.x / 100) * pageW;
  const by = (balloon.y / 100) * pageH;
  const bw = ((balloon.width || 38) / 100) * pageW;
  const scaledFontSize = balloon.fontSize * scale;

  ctx.save();
  ctx.font = `${balloon.isItalic ? 'italic ' : ''}${balloon.isBold ? 'bold ' : ''}${scaledFontSize}px ${balloon.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text wrap measurement
  const maxTextW = bw - 24 * scale;
  const words = balloon.text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testW = ctx.measureText(testLine).width;
    if (testW > maxTextW && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = scaledFontSize * 1.35;
  const totalTextH = lines.length * lineHeight;
  const bh = Math.max(totalTextH + 24 * scale, 48 * scale);

  ctx.translate(bx + bw / 2, by + bh / 2);
  if (balloon.rotation) {
    ctx.rotate((balloon.rotation * Math.PI) / 180);
  }
  ctx.translate(-(bx + bw / 2), -(by + bh / 2));

  // Style-specific balloon path
  ctx.lineWidth = (balloon.borderWidth || 2) * scale;
  ctx.fillStyle = balloon.backgroundColor || '#ffffff';
  ctx.strokeStyle = balloon.borderColor || '#000000';

  if (balloon.type === 'sfx') {
    // SFX: Freeform bold action sound effect with stroke and heavy drop shadow
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetX = 4 * scale;
    ctx.shadowOffsetY = 4 * scale;
    ctx.fillStyle = balloon.fontColor || '#e11d48';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6 * scale;
    const sfxText = balloon.isUppercase ? balloon.text.toUpperCase() : balloon.text;
    ctx.strokeText(sfxText, bx + bw / 2, by + bh / 2);
    ctx.fillText(sfxText, bx + bw / 2, by + bh / 2);
    ctx.restore();
    return;
  }

  // Draw shadow offset for comic pop
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetX = 3 * scale;
  ctx.shadowOffsetY = 3 * scale;

  ctx.beginPath();
  if (balloon.type === 'narration') {
    // Noir narration: sharp rectangle box
    ctx.rect(bx, by, bw, bh);
  } else if (balloon.type === 'shout') {
    // Spiked starburst explosion
    const points = 16;
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    const rx = bw / 2;
    const ry = bh / 2;
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? 1 : 0.78;
      const px = cx + Math.cos(angle) * rx * r;
      const py = cy + Math.sin(angle) * ry * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (balloon.type === 'whisper') {
    // Rounded rect with dashed border
    const radius = 16 * scale;
    ctx.roundRect(bx, by, bw, bh, radius);
    ctx.setLineDash([6 * scale, 4 * scale]);
  } else {
    // Standard speech bubble with rounded corners
    const radius = 18 * scale;
    ctx.roundRect(bx, by, bw, bh, radius);
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Draw tail if enabled and applicable
  if (balloon.tailDirection !== 'none' && balloon.type === 'speech') {
    ctx.beginPath();
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    const tw = 14 * scale;
    const th = 20 * scale;

    if (balloon.tailDirection === 'bottom') {
      ctx.moveTo(cx - tw, by + bh);
      ctx.lineTo(cx + tw, by + bh);
      ctx.lineTo(cx, by + bh + th);
    } else if (balloon.tailDirection === 'top') {
      ctx.moveTo(cx - tw, by);
      ctx.lineTo(cx + tw, by);
      ctx.lineTo(cx, by - th);
    } else if (balloon.tailDirection === 'left') {
      ctx.moveTo(bx, cy - tw);
      ctx.lineTo(bx, cy + tw);
      ctx.lineTo(bx - th, cy);
    } else if (balloon.tailDirection === 'right') {
      ctx.moveTo(bx + bw, cy - tw);
      ctx.lineTo(bx + bw, cy + tw);
      ctx.lineTo(bx + bw + th, cy);
    }
    ctx.closePath();
    ctx.fillStyle = balloon.backgroundColor || '#ffffff';
    ctx.fill();
    ctx.stroke();
  }

  // Draw lines of text
  ctx.fillStyle = balloon.fontColor || '#000000';
  const startY = by + (bh - totalTextH) / 2 + lineHeight / 2;

  lines.forEach((line, idx) => {
    const textToDraw = balloon.isUppercase ? line.toUpperCase() : line;
    ctx.fillText(textToDraw, bx + bw / 2, startY + idx * lineHeight);
  });

  ctx.restore();
}

// Master function: render full comic page onto high-resolution canvas
export async function renderPageToCanvas(
  page: ComicPage,
  scale = 2,
  options: { showWatermark?: boolean } = {}
): Promise<HTMLCanvasElement> {
  // Baseline canvas width & height (aspect ratio ~3:4 comic book / graphic novel standard)
  const baseW = 1200;
  const baseH = 1600;
  const width = baseW * scale;
  const height = baseH * scale;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // 1. Background (stark noir deep charcoal/black canvas)
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  // 2. Compute Panel Rectangles
  const margin = 40 * scale;
  const gutter = (page.gutterSize || 12) * scale;
  const rects = calculatePanelRects(page.template, width, height, gutter, margin);

  // 3. Render Each Panel
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    const panel = page.panels[i] || page.panels[0];

    ctx.save();

    // Clip to panel rect
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.width, r.height);
    ctx.clip();

    // Apply Noir Filter
    applyNoirFilter(ctx, page.noirFilter, page.filterIntensity ?? 85);

    // Draw Image (Cover fill)
    if (panel && panel.imageUrl) {
      try {
        const img = await loadImage(panel.imageUrl);
        const imgAspect = img.width / img.height;
        const panelAspect = r.width / r.height;

        let drawW: number;
        let drawH: number;
        let drawX: number;
        let drawY: number;

        if (imgAspect > panelAspect) {
          drawH = r.height;
          drawW = r.height * imgAspect;
          drawX = r.x - (drawW - r.width) / 2;
          drawY = r.y;
        } else {
          drawW = r.width;
          drawH = r.width / imgAspect;
          drawX = r.x;
          drawY = r.y - (drawH - r.height) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } catch (err) {
        console.warn('Failed to draw panel image:', err);
        ctx.fillStyle = '#171717';
        ctx.fillRect(r.x, r.y, r.width, r.height);
      }
    } else {
      ctx.fillStyle = '#171717';
      ctx.fillRect(r.x, r.y, r.width, r.height);
    }

    ctx.restore();

    // Subtle dark vignette inside panel for depth
    ctx.save();
    const grad = ctx.createRadialGradient(
      r.x + r.width / 2,
      r.y + r.height / 2,
      Math.min(r.width, r.height) * 0.35,
      r.x + r.width / 2,
      r.y + r.height / 2,
      Math.max(r.width, r.height) * 0.75
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(r.x, r.y, r.width, r.height);
    ctx.restore();

    // Inky comic border around panel
    ctx.save();
    ctx.strokeStyle = page.borderColor || '#000000';
    ctx.lineWidth = (page.borderWidth || 4) * scale;
    ctx.strokeRect(r.x, r.y, r.width, r.height);
    ctx.restore();
  }

  // 4. Render All Speech Balloons and Captions
  for (const balloon of page.balloons) {
    drawBalloonOnCanvas(ctx, balloon, width, height, scale);
  }

  // 5. Editorial Footer Bar with Page Number, Scripture Reference and Chapter
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = `600 ${11 * scale}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(
    `${page.chapter ? `${page.chapter} · ` : ''}${page.title || 'Novela Gráfica Bíblica'}`,
    margin,
    height - margin / 2.2
  );

  ctx.textAlign = 'right';
  ctx.fillText(
    `Pág. ${page.pageNumber || 1}  ${page.bibleVerse ? `· [${page.bibleVerse}]` : ''}`,
    width - margin,
    height - margin / 2.2
  );
  ctx.restore();

  return canvas;
}

// Download canvas as image file
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type = 'image/png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL(type, 0.95);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
