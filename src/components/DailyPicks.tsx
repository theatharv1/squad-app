import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import type { Pool } from "@/types";
import { resolvePoolTheme } from "@/lib/poolThemes";

interface Props {
  pools: Pool[];
}

// "Tonight: 3 picks for you" — Hinge "Most Compatible" + Timeleft "tonight's table"
// pattern. Research playbook calls this "the single most important re-engagement
// lever" because (a) constraint forces choice (3 not 30), (b) personalization
// signals care, (c) refreshes daily so it's a habit hook.
//
// Algorithm: deterministic per-day so the same user sees the same picks all day
// (avoids the "I just looked at this 5 minutes ago" feeling), then refreshes
// at midnight. Picks span 3 categories so the user gets variety.

const PICK_LABELS = ["Closest fit", "Wildcard", "On the rise"] as const;

function dayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickThree(pools: Pool[], seed: string): Pool[] {
  if (pools.length === 0) return [];

  // Filter to upcoming pools with spots left.
  const now = Date.now();
  const open = pools.filter((p) => {
    const t = new Date(p.scheduledTime).getTime();
    return t > now - 1000 * 60 * 30 && p.spotsFilled < p.spotsTotal;
  });
  if (open.length === 0) return [];

  const h = hashStr(seed);

  // Pick 1: closest fit — earliest tonight, more than half-filled (social proof).
  const pick1 = [...open]
    .sort((a, b) => {
      const fillDiff = b.spotsFilled / b.spotsTotal - a.spotsFilled / a.spotsTotal;
      if (Math.abs(fillDiff) > 0.1) return fillDiff;
      return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
    })[0];

  // Pick 2: wildcard — different category from pick1, deterministic offset.
  const otherCats = open.filter((p) => p.category !== pick1?.category && p.id !== pick1?.id);
  const pick2 = otherCats[h % Math.max(1, otherCats.length)] || open[1] || pick1;

  // Pick 3: on the rise — latest joined of any remaining (proxy: high fill, not in 1 or 2).
  const remaining = open.filter((p) => p.id !== pick1?.id && p.id !== pick2?.id);
  const pick3 =
    [...remaining].sort((a, b) => b.spotsFilled - a.spotsFilled)[0] ||
    remaining[(h >> 3) % Math.max(1, remaining.length)] ||
    pick1;

  return [pick1, pick2, pick3].filter(Boolean) as Pool[];
}

export function DailyPicks({ pools }: Props) {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const picks = useMemo(
    () => pickThree(pools, dayKey() + ":" + refreshKey),
    [pools, refreshKey]
  );

  // Auto-clear at midnight so the next-day picks render fresh on first open.
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 30, 0);
    const ms = midnight.getTime() - now.getTime();
    const id = setTimeout(() => setRefreshKey((k) => k + 1), ms);
    return () => clearTimeout(id);
  }, []);

  if (picks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="px-5"
    >
      <div className="flex items-end justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center">
            <Sparkles size={11} className="text-cyan-300" strokeWidth={2.5} fill="currentColor" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-300">// Tonight</div>
            <div className="font-display font-bold text-xl mt-0.5">3 picks for you</div>
          </div>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-cyan-300/80 group"
        >
          <RefreshCw
            size={10}
            strokeWidth={2.5}
            className="group-active:rotate-180 transition-transform"
          />
          shuffle
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-2.5" key={refreshKey}>
          {picks.map((p, i) => {
            const theme = resolvePoolTheme(p);
            const label = PICK_LABELS[i] || "Pick";
            const time = new Date(p.scheduledTime);
            const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const left = p.spotsTotal - p.spotsFilled;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/pool/${p.id}`)}
                className="w-full text-left p-4 rounded-3xl relative overflow-hidden group"
                style={{
                  backgroundImage: theme.gradient,
                  border: `1px solid ${theme.accent}40`,
                  boxShadow: `0 0 0 1px ${theme.accent}1a, 0 18px 50px -16px ${theme.glow}`,
                }}
              >
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                  style={{ background: theme.accent + "33" }}
                />
                <div className="relative flex items-center gap-3">
                  <div
                    className="shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl"
                    style={{
                      borderColor: theme.accent + "50",
                      background: theme.accent + "1a",
                      color: theme.accent,
                    }}
                  >
                    {theme.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                      {label}
                    </div>
                    <h3
                      className="font-display font-bold text-base leading-tight truncate mt-0.5"
                      style={{ color: theme.foreground }}
                    >
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider mt-1" style={{ color: theme.foreground + "99" }}>
                      <span>{p.area}</span>
                      <span>·</span>
                      <span className="num">{timeStr}</span>
                      <span>·</span>
                      <span className="num">{left} left</span>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    strokeWidth={2.5}
                    className="shrink-0 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: theme.accent }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}
