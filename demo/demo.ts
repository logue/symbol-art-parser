import SymbolArt from '../src';

import type LayerInterface from '@/interfaces/LayerInterface';
import type SymbolArtInterface from '@/interfaces/SymbolArtInterface';

const SYMBOL_ICON_SIZE = 64;

const sar = new SymbolArt();
const fileInput = document.getElementById('sarFile') as HTMLInputElement | null;
const baseUrl = import.meta.env.BASE_URL;

if (fileInput) {
  document.addEventListener('DOMContentLoaded', () => {
    fileInput.addEventListener('change', async event => {
      event.preventDefault();
      const output = document.getElementById('output');
      if (output) output.textContent = 'Loading...';

      const file = fileInput.files?.[0];
      if (!file) return;

      try {
        const result = await file.arrayBuffer();
        sar.data = result;

        const json: SymbolArtInterface = sar.json;
        if (output) {
          output.textContent = JSON.stringify(json, null, 2);
        }

        parseHandler(json);
      } catch (err) {
        console.error(err);
        if (output) output.textContent = String(err);
      }
    });
  });
}

/**
 * Parse JSON and Render
 * @param json - JSON parsed SymbolArt data
 * @see ../schema.json
 */
function parseHandler(json: SymbolArtInterface): void {
  const authorId = document.getElementById('authorId');
  const name = document.getElementById('name');
  const sound = document.getElementById('sound') as HTMLAudioElement | null;
  const layerCount = document.getElementById('layerCount');

  if (authorId) authorId.innerText = String(json.authorId);
  if (name) name.innerText = json.name;
  if (sound) {
    sound.src = `${baseUrl}sounds/${json.sound}.flac`;
  }
  if (layerCount) layerCount.innerText = String(json.layers.length);

  const tbody = document.querySelector('#layers > tbody');
  if (!tbody) return;

  const fragment = document.createDocumentFragment();

  let i = 0;
  json.layers.forEach((layer: LayerInterface) => {
    const rowIndex = i++;
    const row = document.createElement('tr');
    const no = document.createElement('th');
    no.textContent = String(rowIndex);
    no.scope = 'row';
    row.appendChild(no);

    const symbolTd = document.createElement('td');
    const symbol = layer.symbol - 1;
    const rgba = toRgba(layer);
    const canvas = document.createElement('canvas');
    canvas.id = `layer_${rowIndex}`;
    canvas.width = SYMBOL_ICON_SIZE;
    canvas.height = SYMBOL_ICON_SIZE;
    canvas.className = 'img-thumbnail';
    canvas.title = String(symbol);

    if (symbol < 720) {
      const monotoneCanvas = new MonotoneCanvas({
        canvas,
        fileSrc: `${baseUrl}symbols/${symbol}.webp`,
        width: SYMBOL_ICON_SIZE,
        height: SYMBOL_ICON_SIZE,
        color: rgba,
      });
      monotoneCanvas.render();
    } else {
      const img = new Image();
      img.src = `${baseUrl}symbols/${symbol}.webp`;
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        }
      };
    }

    const color = document.createElement('input');
    color.type = 'color';
    color.className = 'form-control form-control-color';
    color.value = toHexColor(layer);
    color.disabled = true;
    color.title = rgba;
    symbolTd.appendChild(canvas);
    symbolTd.appendChild(color);
    row.appendChild(symbolTd);

    const visibilityTd = document.createElement('td');
    const visibility = document.createElement('input');
    visibility.type = 'checkbox';
    visibility.disabled = true;
    visibility.className = 'form-check-input';
    visibility.checked = layer.isVisible;
    visibilityTd.appendChild(visibility);
    row.appendChild(visibilityTd);

    const positionTd = document.createElement('td');
    positionTd.textContent = JSON.stringify(layer.position, null, 2);
    row.appendChild(positionTd);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

/**
 * Convert layer color channels to CSS rgba string.
 * @param layer - Layer data
 */
function toRgba(layer: LayerInterface): string {
  return `rgba(${layer.r * 4},${layer.g * 4},${layer.b * 4},${layer.a / 7})`;
}

/**
 * Convert layer color channels to 6-digit hex color.
 * @param layer - Layer data
 */
function toHexColor(layer: LayerInterface): string {
  const r = (layer.r * 4).toString(16).padStart(2, '0');
  const g = (layer.g * 4).toString(16).padStart(2, '0');
  const b = (layer.b * 4).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Draw monochrome symbol image to canvas.
 */
class MonotoneCanvas {
  private static readonly preloadCache: Map<
    string,
    Promise<HTMLCanvasElement>
  > = new Map();

  private readonly canvas: HTMLCanvasElement;
  private readonly fileSrc: string;
  private readonly width: number;
  private readonly height: number;
  private readonly color: string;

  constructor(opts: {
    canvas: HTMLCanvasElement;
    fileSrc: string;
    width: number;
    height: number;
    color: string;
  }) {
    this.canvas = opts.canvas;
    this.fileSrc = opts.fileSrc;
    this.width = opts.width;
    this.height = opts.height;
    this.color = opts.color;
  }

  /** Render symbol with the configured color. */
  public render(): void {
    this.init();
  }

  /** Preload source image and draw result. */
  private init(): void {
    this.preloadCanvas().then(value => {
      this.draw(value);
    });
  }

  /**
   * Preload source symbol image as canvas.
   * Uses static cache to avoid duplicate network/decode work.
   */
  private preloadCanvas(): Promise<HTMLCanvasElement> {
    const cached = MonotoneCanvas.preloadCache.get(this.fileSrc);
    if (cached) {
      return cached;
    }

    const promise: Promise<HTMLCanvasElement> = new Promise(
      (resolve, reject) => {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = this.fileSrc;
        img.addEventListener(
          'load',
          () => {
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            if (ctx) {
              ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
            }
            resolve(canvas);
          },
          false
        );
        img.addEventListener('error', () => {
          MonotoneCanvas.preloadCache.delete(this.fileSrc);
          reject(new Error(`Failed to load symbol image: ${this.fileSrc}`));
        });
      }
    );

    MonotoneCanvas.preloadCache.set(this.fileSrc, promise);
    return promise;
  }

  /** Draw tinted canvas from preloaded source. */
  private draw(preloadCanvas: HTMLCanvasElement): void {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = this.width;
    canvas.height = this.height;

    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(preloadCanvas, 0, 0, canvas.width, canvas.height);
  }
}

(() => {
  'use strict';

  const getStoredTheme = () => localStorage.getItem('theme');
  const setStoredTheme = (theme: string) =>
    localStorage.setItem('theme', theme);

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }

    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const setTheme = (theme: string) => {
    if (
      theme === 'auto' &&
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.documentElement.dataset.bsTheme = 'dark';
    } else {
      document.documentElement.dataset.bsTheme = theme;
    }
  };

  setTheme(getPreferredTheme());

  const showActiveTheme = (theme: string, focus = false) => {
    const themeSwitcher = document.querySelector(
      '#bd-theme'
    ) as HTMLElement | null;

    if (!themeSwitcher) {
      return;
    }

    const themeSwitcherText = document.querySelector('#bd-theme-text');
    const activeThemeIcon = document.querySelector('.theme-icon-active use');
    const btnToActive = document.querySelector(
      `[data-bs-theme-value="${theme}"]`
    ) as HTMLElement | null;

    if (!themeSwitcherText || !activeThemeIcon || !btnToActive) {
      return;
    }

    const svgUse = btnToActive.querySelector('svg use');
    const svgOfActiveBtn = svgUse?.getAttribute('href');

    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.classList.remove('active');
      element.setAttribute('aria-pressed', 'false');
    });

    btnToActive.classList.add('active');
    btnToActive.setAttribute('aria-pressed', 'true');
    if (svgOfActiveBtn) {
      activeThemeIcon.setAttribute('href', svgOfActiveBtn);
    }

    const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`;
    themeSwitcher.setAttribute('aria-label', themeSwitcherLabel);

    if (focus) {
      themeSwitcher.focus();
    }
  };

  globalThis
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const storedTheme = getStoredTheme();
      if (storedTheme !== 'light' && storedTheme !== 'dark') {
        setTheme(getPreferredTheme());
      }
    });

  globalThis.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme());

    document.querySelectorAll('[data-bs-theme-value]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const theme = (toggle as HTMLElement).dataset.bsThemeValue ?? 'auto';
        setStoredTheme(theme);
        setTheme(theme);
        showActiveTheme(theme, true);
      });
    });
  });
})();
