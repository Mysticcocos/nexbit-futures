export type ThemeId =
  | "teal"
  | "crimson"
  | "emerald"
  | "electric"
  | "violet"
  | "amber"
  | "custom";

export type Palette = {
  bg: string;
  card: string;
  chip: string;
  fg: string;
  muted: string;
  accent: string;
  accentFg: string;
  positive: string;
  negative: string;
  border: string;
};

export const THEMES: Record<Exclude<ThemeId, "custom">, { name: string; group: string; palette: Palette }> = {
  teal: {
    name: "Teal",
    group: "Default",
    palette: {
      bg: "#0B0E14",
      card: "#161A23",
      chip: "#1A1F2B",
      fg: "#FFFFFF",
      muted: "#8B93A7",
      accent: "#00D4AA",
      accentFg: "#04140F",
      positive: "#00E5B0",
      negative: "#EF4444",
      border: "rgba(255,255,255,0.06)",
    },
  },
  crimson: {
    name: "Crimson",
    group: "Red",
    palette: {
      bg: "#0E0A0C",
      card: "#1C1216",
      chip: "#24161B",
      fg: "#FFFFFF",
      muted: "#A78A93",
      accent: "#F43F5E",
      accentFg: "#FFFFFF",
      positive: "#FB7185",
      negative: "#FB7185",
      border: "rgba(255,255,255,0.07)",
    },
  },
  emerald: {
    name: "Emerald",
    group: "Green",
    palette: {
      bg: "#07110C",
      card: "#102018",
      chip: "#15261C",
      fg: "#F4FFF8",
      muted: "#8AA396",
      accent: "#22C55E",
      accentFg: "#04140A",
      positive: "#4ADE80",
      negative: "#F43F5E",
      border: "rgba(255,255,255,0.07)",
    },
  },
  electric: {
    name: "Electric",
    group: "Blue",
    palette: {
      bg: "#070B14",
      card: "#10182A",
      chip: "#152036",
      fg: "#F4F7FF",
      muted: "#8B97B3",
      accent: "#3B82F6",
      accentFg: "#FFFFFF",
      positive: "#38BDF8",
      negative: "#F43F5E",
      border: "rgba(255,255,255,0.07)",
    },
  },
  violet: {
    name: "Violet",
    group: "Purple",
    palette: {
      bg: "#0C0A14",
      card: "#181326",
      chip: "#1F1830",
      fg: "#F7F4FF",
      muted: "#9B93B0",
      accent: "#A78BFA",
      accentFg: "#120B24",
      positive: "#C4B5FD",
      negative: "#F43F5E",
      border: "rgba(255,255,255,0.07)",
    },
  },
  amber: {
    name: "Amber",
    group: "Gold",
    palette: {
      bg: "#100E08",
      card: "#1C1810",
      chip: "#241E14",
      fg: "#FFF8EA",
      muted: "#A89A7A",
      accent: "#F5C542",
      accentFg: "#1A1406",
      positive: "#F5C542",
      negative: "#F43F5E",
      border: "rgba(255,255,255,0.08)",
    },
  },
};

export const DEFAULT_CUSTOM: Palette = { ...THEMES.teal.palette };

export function applyUserChrome(p: Palette, appearance: "dark" | "light") {
  if (appearance === "light") {
    applyPalette({
      ...p,
      bg: "#f5f6f8",
      card: "#ffffff",
      chip: "#eef0f3",
      fg: "#1e2329",
      muted: "#707a8a",
      border: "rgba(0,0,0,0.08)",
      positive: "#2ebd85",
      negative: "#f6465d",
      accentFg: "#04140f",
    });
    return;
  }
  applyPalette({
    ...p,
    positive: "#2ebd85",
    negative: "#f6465d",
  });
}

export function applyPalette(p: Palette) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--nx-bg", p.bg);
  root.style.setProperty("--nx-card", p.card);
  root.style.setProperty("--nx-chip", p.chip);
  root.style.setProperty("--nx-fg", p.fg);
  root.style.setProperty("--nx-muted", p.muted);
  root.style.setProperty("--nx-accent", p.accent);
  root.style.setProperty("--nx-accent-fg", p.accentFg);
  root.style.setProperty("--nx-positive", p.positive);
  root.style.setProperty("--nx-negative", p.negative);
  root.style.setProperty("--nx-border", p.border);
  root.style.setProperty("--nx-accent-soft", hexToRgba(p.accent, 0.14));
  root.style.setProperty("--nx-accent-glow", hexToRgba(p.accent, 0.28));
  root.style.setProperty("--nx-shadow", `0 10px 28px ${hexToRgba(p.accent, 0.16)}`);
  root.style.setProperty("--nx-shadow-lg", `0 22px 60px ${hexToRgba(p.accent, 0.24)}`);
  root.style.setProperty("--nx-shadow-inset", `inset 0 0 0 1px ${hexToRgba(p.accent, 0.22)}`);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", p.bg);
}

export function resolvePalette(themeId: ThemeId, custom?: Palette | null): Palette {
  if (themeId === "custom") return custom ?? DEFAULT_CUSTOM;
  return THEMES[themeId].palette;
}

const THEME_CACHE_KEY = "nexbit-public-theme";

export function cachePublicTheme(snap: { themeId: ThemeId; palette: Palette; allowUserTheme?: boolean }) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(snap));
  } catch {
    /* quota */
  }
}

export function readCachedTheme(): { themeId: ThemeId; palette: Palette; allowUserTheme: boolean } | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { themeId?: ThemeId; palette?: Palette };
    if (!parsed.themeId || !parsed.palette?.accent) return null;
    return { themeId: parsed.themeId, palette: parsed.palette, allowUserTheme: false };
  } catch {
    return null;
  }
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const n = Number.parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
