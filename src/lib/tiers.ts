// City-scoped identity tiers — Strava clubs + Duolingo Streak Society pattern.
// Critical insight from research: global leaderboards/tiers feel unwinnable.
// Scope tiers to the city so "Bhopal Insider" feels rare and aspirational.
// Achievement = shareable to IG/Snap → viral loop.

export type TierId = "sprout" | "local" | "regular" | "insider" | "curator" | "legend";

export interface Tier {
  id: TierId;
  label: string;          // generic label
  cityLabel: (city: string) => string; // city-flavored title
  min: number;            // XP threshold
  max: number;            // upper bound (next tier's min, or Infinity)
  color: string;          // tailwind/hsl token
  glow: string;           // box-shadow color
  emoji: string;          // visual cue
}

// Tiers tuned for IRL frequency: a regular meeter (1-2 pools/week) hits Insider in ~6-8 weeks.
export const TIERS: Tier[] = [
  {
    id: "sprout",
    label: "Sprout",
    cityLabel: (c) => `${c} Sprout`,
    min: 0,
    max: 100,
    color: "text-foreground/60",
    glow: "hsla(0, 0%, 100%, 0.1)",
    emoji: "·",
  },
  {
    id: "local",
    label: "Local",
    cityLabel: (c) => `${c} Local`,
    min: 100,
    max: 500,
    color: "text-cyan-300",
    glow: "hsla(180, 80%, 60%, 0.4)",
    emoji: "○",
  },
  {
    id: "regular",
    label: "Regular",
    cityLabel: (c) => `${c} Regular`,
    min: 500,
    max: 2000,
    color: "text-primary",
    glow: "hsla(73, 100%, 50%, 0.5)",
    emoji: "◆",
  },
  {
    id: "insider",
    label: "Insider",
    cityLabel: (c) => `${c} Insider`,
    min: 2000,
    max: 5000,
    color: "text-pink-400",
    glow: "hsla(330, 90%, 65%, 0.55)",
    emoji: "✦",
  },
  {
    id: "curator",
    label: "Curator",
    cityLabel: (c) => `${c} Curator`,
    min: 5000,
    max: 10000,
    color: "text-yellow-300",
    glow: "hsla(48, 100%, 65%, 0.6)",
    emoji: "★",
  },
  {
    id: "legend",
    label: "Legend",
    cityLabel: (c) => `${c} Legend`,
    min: 10000,
    max: Infinity,
    color: "text-gradient-cyan-magenta",
    glow: "hsla(290, 90%, 65%, 0.7)",
    emoji: "✺",
  },
];

export function tierFor(xp: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export function nextTier(xp: number): Tier | null {
  const cur = tierFor(xp);
  const idx = TIERS.findIndex((t) => t.id === cur.id);
  if (idx === TIERS.length - 1) return null;
  return TIERS[idx + 1];
}

export function tierProgress(xp: number): { current: Tier; next: Tier | null; percent: number; xpToNext: number } {
  const current = tierFor(xp);
  const next = nextTier(xp);
  if (!next) return { current, next: null, percent: 100, xpToNext: 0 };
  const span = next.min - current.min;
  const filled = xp - current.min;
  const percent = Math.max(0, Math.min(100, Math.round((filled / span) * 100)));
  return { current, next, percent, xpToNext: next.min - xp };
}

// Lifetime XP tracker — distinct from daily XP which resets at midnight.
const KEY_LIFETIME_XP = "squad_lifetime_xp";

export function getLifetimeXP(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(KEY_LIFETIME_XP) || "0", 10);
}

export function addLifetimeXP(amount: number): { xp: number; tieredUp: boolean; newTier: Tier | null } {
  const before = getLifetimeXP();
  const after = before + amount;
  const beforeTier = tierFor(before);
  const afterTier = tierFor(after);
  if (typeof window !== "undefined") localStorage.setItem(KEY_LIFETIME_XP, String(after));
  const tieredUp = beforeTier.id !== afterTier.id;
  return { xp: after, tieredUp, newTier: tieredUp ? afterTier : null };
}

// Achievements — shareable to IG/Snap/WhatsApp. The viral loop hook.
export interface Achievement {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_pool", label: "First Pool", description: "Joined your first pool", emoji: "✦" },
  { id: "first_host", label: "First Host", description: "Hosted your first pool", emoji: "★" },
  { id: "friend_maker", label: "Friend Maker", description: "Brought 3 friends to one pool", emoji: "◈" },
  { id: "vibe_curator", label: "Vibe Curator", description: "Hosted 5 pools rated 4+", emoji: "✺" },
  { id: "city_local", label: "City Local", description: "Pools in 3 neighborhoods", emoji: "◯" },
  { id: "late_legend", label: "Late Night Legend", description: "5 pools after 10pm", emoji: "☾" },
  { id: "chai_champion", label: "Chai Champion", description: "10 chai meets", emoji: "☕" },
  { id: "weekly_lock", label: "Weekly Lock-In", description: "4 weeks of weekly ritual", emoji: "↻" },
];

const KEY_ACHIEVEMENTS = "squad_achievements";

export function getEarnedAchievements(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY_ACHIEVEMENTS) || "[]");
  } catch {
    return [];
  }
}

export function earnAchievement(id: string): boolean {
  const earned = getEarnedAchievements();
  if (earned.includes(id)) return false;
  earned.push(id);
  if (typeof window !== "undefined") localStorage.setItem(KEY_ACHIEVEMENTS, JSON.stringify(earned));
  return true;
}
