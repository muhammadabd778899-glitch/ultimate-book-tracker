import { Book } from '@/db';

// ---------------------------------------------------------------------------
// Fallback cover generation (SVG, original artwork, no remote assets)
// ---------------------------------------------------------------------------

const GENRE_PALETTES: Record<string, { primary: string; secondary: string; accent: string }> = {
  fantasy: { primary: '#6366f1', secondary: '#4f46e5', accent: '#a78bfa' },
  'science-fiction': { primary: '#0891b2', secondary: '#0369a1', accent: '#22d3ee' },
  mystery: { primary: '#4b5563', secondary: '#374151', accent: '#cbd5e1' },
  thriller: { primary: '#7f1d1d', secondary: '#450a0a', accent: '#fca5a5' },
  romance: { primary: '#be185d', secondary: '#881337', accent: '#fbcfe8' },
  'historical-fiction': { primary: '#92400e', secondary: '#78350f', accent: '#fcd34d' },
  'self-help': { primary: '#047857', secondary: '#065f46', accent: '#86efac' },
  business: { primary: '#1d4ed8', secondary: '#1e40af', accent: '#bfdbfe' },
  psychology: { primary: '#7c3aed', secondary: '#6b21a8', accent: '#e9d5ff' },
  biography: { primary: '#1e293b', secondary: '#0f172a', accent: '#cbd5e1' },
  'personal-development': { primary: '#059669', secondary: '#047857', accent: '#bbf7d0' },
  classics: { primary: '#475569', secondary: '#334155', accent: '#94a3b8' },
  nonfiction: { primary: '#0f172a', secondary: '#020617', accent: '#e2e8f0' },
  poetry: { primary: '#db2777', secondary: '#be185d', accent: '#fbcfe8' },
  comics: { primary: '#ea580c', secondary: '#c2410c', accent: '#fdba74' },
  'graphic-novels': { primary: '#c026d3', secondary: '#a21caf', accent: '#f0abfc' },
  default: { primary: '#6b7280', secondary: '#4b5563', accent: '#9ca3af' },
};

function paletteFor(genre?: string | null) {
  const key = (genre || 'default').toLowerCase();
  return GENRE_PALETTES[key] ?? GENRE_PALETTES.default;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function generateFallbackCover({
  title,
  author,
  genre,
  width = 400,
  height = 600,
}: {
  title: string;
  author?: string | null;
  genre?: string | null;
  width?: number;
  height?: number;
}): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Defensive: if canvas 2d context isn't available (e.g. server-side), return a simple SVG.
  if (!ctx) {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const p = paletteFor(genre);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='${p.primary}'/%3E%3Ctext x='50%25' y='50%25' font-family='Georgia, serif' font-weight='bold' font-size='24' fill='%23F7F5F2' text-anchor='middle' dominant-baseline='middle'%3E${esc(title)}%3C/text%3E%3C/svg%3E`;
  }

  const p = paletteFor(genre);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, p.primary);
  grad.addColorStop(0.55, p.secondary);
  grad.addColorStop(1, p.primary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle geometric accents
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 6; i++) {
    const x = (width * i) / 6;
    const y = (height * (i % 3)) / 3;
    ctx.beginPath();
    ctx.arc(x, y, width * 0.12 + i * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Border frame
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Title (serif editorial)
  ctx.fillStyle = '#F7F5F2';
  ctx.font = `bold ${width * 0.07}px 'Georgia', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleLines = wrapText(ctx, title, width * 0.82);
  const titleSize = width * 0.07;
  const titleStartY = height * 0.5 - (titleLines.length * titleSize * 1.25) / 2;
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], width / 2, titleStartY + i * titleSize * 1.25);
  }

  // Accent rule
  ctx.fillStyle = p.accent;
  ctx.fillRect(width / 2 - width * 0.08, height * 0.72, width * 0.16, 4);

  // Author
  if (author) {
    ctx.fillStyle = 'rgba(247,245,242,0.75)';
    ctx.font = `${width * 0.045}px 'Georgia', serif`;
    const authorLines = wrapText(ctx, `by ${author}`, width * 0.82);
    const authorSize = width * 0.045;
    for (let i = 0; i < authorLines.length; i++) {
      ctx.fillText(authorLines[i], width / 2, height * 0.8 + i * authorSize * 1.3);
    }
  }

  // Genre tag
  if (genre) {
    ctx.fillStyle = p.accent;
    ctx.fillStyle = '#101014';
    const g = genre.charAt(0).toUpperCase() + genre.slice(1);
    ctx.font = `${width * 0.04}px sans-serif`;
    const gw = ctx.measureText(g).width + 24;
    const gh = width * 0.07;
    ctx.fillRect(width / 2 - gw / 2, height * 0.9, gw, gh);
    ctx.fillStyle = '#F7F5F2';
    ctx.fillText(g, width / 2, height * 0.9 + gh / 2 + width * 0.015);
  }

  return canvas.toDataURL('image/png');
}

export function initialsAvatar(name?: string | null, seed = 0): string {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d')!;
  const colors = ['#E65A45', '#6366f1', '#0891b2', '#be185d', '#047857', '#92400e', '#7c3aed', '#ea580c'];
  const color = colors[seed % colors.length];
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 120, 120);
  ctx.fillStyle = '#F7F5F2';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = (name || '?')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  ctx.fillText(initials, 60, 60);
  return canvas.toDataURL('image/png');
}

// ---------------------------------------------------------------------------
// Cover data URL helpers
// ---------------------------------------------------------------------------

export function dataUrlToBlob(dataUrl: string): { type: string; data: Uint8Array } {
  const comma = dataUrl.indexOf(',');
  const mime = dataUrl.slice(5, comma);
  const b64 = dataUrl.slice(comma + 1);
  const bin = atob(b64);
  const data = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
  return { type: mime, data };
}

export function imageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
