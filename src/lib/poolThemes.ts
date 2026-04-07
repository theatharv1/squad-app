// Pool color themes — Partiful pattern.
// Insight from research: Partiful's killer move is that every event is a
// "designed object" — the host picks a color theme and the entire page
// (cover, ticket, RSVP CTA) gets recolored. This makes pools feel curated
// instead of templated, and makes them shareable as visual artifacts.
//
// Back-compat: themes are encoded into the existing tags array as
// `theme:<id>` so the backend schema doesn't need to change.

export type ThemeId =
  | "chai-sepia"
  | "club-neon"
  | "pitch-green"
  | "sunset-orange"
  | "monsoon-blue"
  | "late-night-purple"
  | "festival-magenta"
  | "golden-hour";

export interface PoolTheme {
  id: ThemeId;
  label: string;          // human label for picker
  vibe: string;           // one-liner mood for picker subtitle
  // CSS gradient string used as background for hero / ticket card.
  gradient: string;
  // Solid accent color (HSL) for chips, borders, CTA glow.
  accent: string;
  // Glow used for box-shadow on CTAs.
  glow: string;
  // Foreground text token (for contrast against the gradient).
  foreground: string;
  // Tiny emoji thumbprint for the picker grid.
  emoji: string;
}

export const POOL_THEMES: PoolTheme[] = [
  {
    id: "chai-sepia",
    label: "Chai sepia",
    vibe: "warm · slow · gupshup",
    gradient:
      "linear-gradient(135deg, hsla(28,55%,18%,0.95) 0%, hsla(20,40%,12%,0.95) 50%, hsla(35,60%,22%,0.95) 100%)",
    accent: "hsl(32, 80%, 62%)",
    glow: "hsla(32, 80%, 62%, 0.45)",
    foreground: "hsl(38, 90%, 92%)",
    emoji: "☕",
  },
  {
    id: "club-neon",
    label: "Club neon",
    vibe: "loud · late · electric",
    gradient:
      "linear-gradient(135deg, hsla(285,80%,16%,0.95) 0%, hsla(330,70%,12%,0.95) 50%, hsla(180,80%,18%,0.95) 100%)",
    accent: "hsl(330, 95%, 65%)",
    glow: "hsla(330, 95%, 65%, 0.55)",
    foreground: "hsl(0, 0%, 98%)",
    emoji: "◈",
  },
  {
    id: "pitch-green",
    label: "Pitch green",
    vibe: "sport · grass · sunday",
    gradient:
      "linear-gradient(135deg, hsla(140,55%,14%,0.95) 0%, hsla(90,50%,18%,0.95) 50%, hsla(160,40%,12%,0.95) 100%)",
    accent: "hsl(73, 100%, 55%)",
    glow: "hsla(73, 100%, 55%, 0.5)",
    foreground: "hsl(80, 90%, 95%)",
    emoji: "⚽",
  },
  {
    id: "sunset-orange",
    label: "Sunset",
    vibe: "golden · soft · scenic",
    gradient:
      "linear-gradient(135deg, hsla(20,75%,18%,0.95) 0%, hsla(355,65%,16%,0.95) 50%, hsla(35,70%,22%,0.95) 100%)",
    accent: "hsl(18, 95%, 62%)",
    glow: "hsla(18, 95%, 62%, 0.5)",
    foreground: "hsl(30, 95%, 95%)",
    emoji: "◔",
  },
  {
    id: "monsoon-blue",
    label: "Monsoon",
    vibe: "rain · cosy · indoor",
    gradient:
      "linear-gradient(135deg, hsla(220,55%,14%,0.95) 0%, hsla(200,60%,16%,0.95) 50%, hsla(240,50%,18%,0.95) 100%)",
    accent: "hsl(200, 95%, 65%)",
    glow: "hsla(200, 95%, 65%, 0.5)",
    foreground: "hsl(200, 80%, 95%)",
    emoji: "☔",
  },
  {
    id: "late-night-purple",
    label: "Late night",
    vibe: "after dark · quiet · private",
    gradient:
      "linear-gradient(135deg, hsla(265,55%,12%,0.95) 0%, hsla(280,60%,8%,0.95) 50%, hsla(250,50%,16%,0.95) 100%)",
    accent: "hsl(280, 95%, 70%)",
    glow: "hsla(280, 95%, 70%, 0.5)",
    foreground: "hsl(280, 50%, 96%)",
    emoji: "☾",
  },
  {
    id: "festival-magenta",
    label: "Festival",
    vibe: "loud · costume · chaos",
    gradient:
      "linear-gradient(135deg, hsla(320,70%,18%,0.95) 0%, hsla(345,60%,14%,0.95) 50%, hsla(0,55%,16%,0.95) 100%)",
    accent: "hsl(330, 100%, 68%)",
    glow: "hsla(330, 100%, 68%, 0.55)",
    foreground: "hsl(330, 80%, 96%)",
    emoji: "✺",
  },
  {
    id: "golden-hour",
    label: "Golden hour",
    vibe: "sunlit · easy · brunch",
    gradient:
      "linear-gradient(135deg, hsla(45,65%,16%,0.95) 0%, hsla(35,55%,12%,0.95) 50%, hsla(50,60%,18%,0.95) 100%)",
    accent: "hsl(48, 100%, 62%)",
    glow: "hsla(48, 100%, 62%, 0.5)",
    foreground: "hsl(48, 80%, 95%)",
    emoji: "✦",
  },
];

const THEME_TAG_PREFIX = "theme:";

export function themeFor(id: ThemeId | string | undefined): PoolTheme | null {
  if (!id) return null;
  return POOL_THEMES.find((t) => t.id === id) || null;
}

// Read the theme from a pool's tags array. Returns null if no theme is set.
export function readThemeFromTags(tags?: string[]): PoolTheme | null {
  if (!tags || tags.length === 0) return null;
  const tag = tags.find((t) => t.startsWith(THEME_TAG_PREFIX));
  if (!tag) return null;
  const id = tag.substring(THEME_TAG_PREFIX.length) as ThemeId;
  return themeFor(id);
}

// Encode a theme into a tags array (replacing any existing theme tag).
export function writeThemeToTags(tags: string[], themeId: ThemeId): string[] {
  const filtered = tags.filter((t) => !t.startsWith(THEME_TAG_PREFIX));
  return [...filtered, `${THEME_TAG_PREFIX}${themeId}`];
}

// Deterministic fallback so themed pools that haven't been picked still
// look distinct — uses pool id hash to pick a theme so the same pool always
// renders with the same visual identity.
export function fallbackThemeForId(id: string): PoolTheme {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return POOL_THEMES[Math.abs(h) % POOL_THEMES.length];
}

// One-stop helper used by cards: explicit theme tag wins, otherwise
// deterministic fallback so the UI is never plain.
export function resolvePoolTheme(pool: { id: string; tags?: string[] }): PoolTheme {
  return readThemeFromTags(pool.tags) || fallbackThemeForId(pool.id);
}
