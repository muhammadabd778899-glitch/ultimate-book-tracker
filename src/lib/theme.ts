export const DEFAULT_ACCENT = '#E65A45';

export type ThemeMode = 'dark' | 'light' | 'system';

function hexToRgb(hex: string): [number, number, number] | null {
  const value = hex.replace('#', '').trim();
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function shade(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map((c) => Math.max(0, Math.min(255, Math.round(c * factor))));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function resolveTheme(theme?: string | null): 'dark' | 'light' {
  if (theme === 'light') return 'light';
  if (theme === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}

export function applyTheme(theme?: string | null, accentColor?: string | null): void {
  const root = document.documentElement;
  const resolved = resolveTheme(theme);
  root.classList.toggle('light', resolved === 'light');

  const accent = accentColor && hexToRgb(accentColor) ? accentColor : DEFAULT_ACCENT;
  const rgb = hexToRgb(accent);
  if (rgb) {
    root.style.setProperty('--c-accent', rgb.join(' '));
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-accent-deep', shade(accent, 0.82));
  }

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'light' ? '#FAF9F6' : '#101014');
}
