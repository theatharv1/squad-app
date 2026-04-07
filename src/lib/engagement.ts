// Engagement engine — tracks streaks, daily check-ins, and addictive loops
// Inspired by: Duolingo (streaks), Snapchat (streaks), BeReal (daily prompt),
// Locket (widget), Partiful (vibes), Timeleft (weekly ritual), Hinge (prompts).
// All client-side for now — backend sync can come later.

const KEYS = {
  STREAK_COUNT: "squad_streak_count",
  STREAK_LAST: "squad_streak_last",
  STREAK_BEST: "squad_streak_best",
  CHECKIN_DATE: "squad_checkin_date",
  CHECKIN_VIBE: "squad_checkin_vibe",
  RITUAL_LAST: "squad_ritual_last",
  XP_TODAY: "squad_xp_today",
  XP_DATE: "squad_xp_date",
  LAST_OPEN: "squad_last_open",
  OPENED_TODAY: "squad_opened_today",
} as const;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ─── Streak ────────────────────────────────────────────────────────────
export function getStreak(): { current: number; best: number; lastDate: string | null; isAtRisk: boolean } {
  const current = parseInt(localStorage.getItem(KEYS.STREAK_COUNT) || "0", 10);
  const best = parseInt(localStorage.getItem(KEYS.STREAK_BEST) || "0", 10);
  const lastDate = localStorage.getItem(KEYS.STREAK_LAST);
  const isAtRisk = lastDate === yesterdayKey();
  return { current, best, lastDate, isAtRisk };
}

export function pingStreak(): { current: number; best: number; isNew: boolean } {
  const today = todayKey();
  const yesterday = yesterdayKey();
  const last = localStorage.getItem(KEYS.STREAK_LAST);
  let current = parseInt(localStorage.getItem(KEYS.STREAK_COUNT) || "0", 10);
  const best = parseInt(localStorage.getItem(KEYS.STREAK_BEST) || "0", 10);
  let isNew = false;

  if (last === today) {
    // already pinged today
  } else if (last === yesterday) {
    current += 1;
    isNew = true;
  } else {
    current = 1;
    isNew = true;
  }

  localStorage.setItem(KEYS.STREAK_COUNT, String(current));
  localStorage.setItem(KEYS.STREAK_LAST, today);
  if (current > best) {
    localStorage.setItem(KEYS.STREAK_BEST, String(current));
  }
  return { current, best: Math.max(best, current), isNew };
}

// ─── Daily check-in (BeReal-style) ─────────────────────────────────────
export type Vibe = "hyped" | "chill" | "social" | "wild" | "low" | "lit";

export const VIBES: { id: Vibe; label: string; color: string }[] = [
  { id: "hyped", label: "Hyped", color: "lime" },
  { id: "chill", label: "Chill", color: "cyan" },
  { id: "social", label: "Social", color: "magenta" },
  { id: "wild", label: "Wild", color: "lime" },
  { id: "low", label: "Low key", color: "cyan" },
  { id: "lit", label: "Lit", color: "magenta" },
];

export function getCheckin(): { date: string | null; vibe: Vibe | null; isToday: boolean } {
  const date = localStorage.getItem(KEYS.CHECKIN_DATE);
  const vibe = localStorage.getItem(KEYS.CHECKIN_VIBE) as Vibe | null;
  return { date, vibe, isToday: date === todayKey() };
}

export function setCheckin(vibe: Vibe) {
  localStorage.setItem(KEYS.CHECKIN_DATE, todayKey());
  localStorage.setItem(KEYS.CHECKIN_VIBE, vibe);
  pingStreak();
  addXP(10);
}

// ─── Weekly Ritual (Timeleft Wednesday-style) ──────────────────────────
export function isRitualDay(): boolean {
  return new Date().getDay() === 3; // Wednesday
}

export function hasJoinedRitual(): boolean {
  const last = localStorage.getItem(KEYS.RITUAL_LAST);
  if (!last) return false;
  const lastDate = new Date(last);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < 7;
}

export function joinRitual() {
  localStorage.setItem(KEYS.RITUAL_LAST, new Date().toISOString());
  addXP(50);
}

// ─── XP Today (daily progress bar) ─────────────────────────────────────
export function getXPToday(): number {
  const date = localStorage.getItem(KEYS.XP_DATE);
  if (date !== todayKey()) {
    localStorage.setItem(KEYS.XP_DATE, todayKey());
    localStorage.setItem(KEYS.XP_TODAY, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(KEYS.XP_TODAY) || "0", 10);
}

export function addXP(amount: number) {
  const current = getXPToday();
  localStorage.setItem(KEYS.XP_TODAY, String(current + amount));
  localStorage.setItem(KEYS.XP_DATE, todayKey());
}

export const DAILY_XP_GOAL = 100;

// ─── Open tracking (for "X opens today" + reactivation) ────────────────
export function trackOpen() {
  const today = todayKey();
  const lastDay = localStorage.getItem(KEYS.LAST_OPEN);
  if (lastDay !== today) {
    localStorage.setItem(KEYS.OPENED_TODAY, "1");
  } else {
    const opens = parseInt(localStorage.getItem(KEYS.OPENED_TODAY) || "0", 10);
    localStorage.setItem(KEYS.OPENED_TODAY, String(opens + 1));
  }
  localStorage.setItem(KEYS.LAST_OPEN, today);
}

export function getOpensToday(): number {
  return parseInt(localStorage.getItem(KEYS.OPENED_TODAY) || "0", 10);
}

// ─── Time-aware greeting ──────────────────────────────────────────────
export function getTimeContext(): { greeting: string; tabName: string; eyebrow: string } {
  const h = new Date().getHours();
  if (h < 6) return { greeting: "Up late", tabName: "Tonight", eyebrow: "// AFTER HOURS" };
  if (h < 12) return { greeting: "Morning", tabName: "Today", eyebrow: "// FRESH START" };
  if (h < 17) return { greeting: "Afternoon", tabName: "Today", eyebrow: "// MIDDAY" };
  if (h < 21) return { greeting: "Evening", tabName: "Tonight", eyebrow: "// GOLDEN HOUR" };
  return { greeting: "Tonight", tabName: "Tonight", eyebrow: "// PRIME TIME" };
}

// ─── Urgency labeling ─────────────────────────────────────────────────
export function getPoolUrgency(pool: { spotsTotal: number; spotsFilled: number; scheduledTime: string; isLive?: boolean }): {
  level: "live" | "critical" | "hot" | "warm" | "open" | null;
  label: string;
  color: string;
} | null {
  if (pool.isLive) return { level: "live", label: "LIVE NOW", color: "magenta" };

  const spotsLeft = pool.spotsTotal - pool.spotsFilled;
  const fillRatio = pool.spotsFilled / pool.spotsTotal;

  let timeUrgency = "";
  try {
    const t = new Date(pool.scheduledTime);
    const now = new Date();
    const hoursAway = (t.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursAway > 0 && hoursAway < 3) timeUrgency = "STARTING SOON";
    else if (hoursAway >= 3 && hoursAway < 12) timeUrgency = "TONIGHT";
    else if (hoursAway >= 12 && hoursAway < 24) timeUrgency = "TOMORROW";
  } catch {}

  if (spotsLeft === 0) return { level: "critical", label: "FULL", color: "magenta" };
  if (spotsLeft === 1) return { level: "critical", label: "1 SPOT LEFT", color: "magenta" };
  if (spotsLeft <= 2) return { level: "critical", label: `${spotsLeft} SPOTS LEFT`, color: "magenta" };
  if (fillRatio >= 0.75) return { level: "hot", label: "FILLING FAST", color: "lime" };
  if (timeUrgency === "STARTING SOON") return { level: "hot", label: timeUrgency, color: "lime" };
  if (timeUrgency === "TONIGHT") return { level: "warm", label: timeUrgency, color: "cyan" };
  if (timeUrgency === "TOMORROW") return { level: "warm", label: timeUrgency, color: "cyan" };
  return null;
}

// ─── Synthetic activity feed (until backend has it) ────────────────────
// In prod this would be a websocket / SSE feed. For now we generate
// realistic-looking activity from the visible pools so the UI feels alive.
export type ActivityEvent = {
  id: string;
  kind: "joined" | "hosted" | "filled" | "starting" | "tip";
  text: string;
  ts: number;
};

const NAMES = ["Yathu", "Priya", "Rahul", "Meera", "Karan", "Sneha", "Arjun", "Ishita", "Dev", "Tanya", "Aditya", "Vikram", "Nisha", "Sameer", "Rohan"];
const VERBS = ["just joined", "raised", "is hosting", "filled up"];

export function synthesizeActivity(pools: any[], count = 8): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const now = Date.now();
  const sample = pools.slice(0, count);
  sample.forEach((p, i) => {
    const minsAgo = (i + 1) * 3 + Math.floor(Math.random() * 4);
    const name = NAMES[i % NAMES.length];
    const verb = i % 3 === 0 ? "raised" : "just joined";
    events.push({
      id: `act-${p.id}-${i}`,
      kind: verb === "raised" ? "hosted" : "joined",
      text: `${name} ${verb} ${p.title}`,
      ts: now - minsAgo * 60_000,
    });
  });
  return events;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
