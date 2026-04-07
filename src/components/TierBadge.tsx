import { motion } from "framer-motion";
import { tierProgress, type Tier } from "@/lib/tiers";

interface Props {
  xp: number;
  city?: string;
  variant?: "compact" | "full";
  onClick?: () => void;
}

// City-scoped identity badge — Strava clubs + Duolingo Streak Society pattern.
// Tier names like "Bhopal Insider" feel rare and are shareable to IG/Snap.
// This is the viral hook the playbook calls out as the #1 identity layer.
export function TierBadge({ xp, city, variant = "full", onClick }: Props) {
  const { current, next, percent, xpToNext } = tierProgress(xp);
  const label = city ? current.cityLabel(city) : current.label;
  const isLegend = current.id === "legend";

  if (variant === "compact") {
    return (
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-white/10"
        style={{ boxShadow: `0 0 14px ${current.glow}` }}
      >
        <span className={`text-[11px] font-display font-bold ${isLegend ? "text-gradient-cyan-magenta" : current.color}`}>
          {current.emoji}
        </span>
        <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isLegend ? "text-gradient-cyan-magenta" : current.color}`}>
          {label}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card-stage w-full p-5 text-left relative overflow-hidden"
    >
      {/* Tier glow */}
      <div
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-[80px] pointer-events-none"
        style={{ background: current.glow }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">// Your tier</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-2xl ${isLegend ? "text-gradient-cyan-magenta" : current.color}`}>
                {current.emoji}
              </span>
              <h3 className={`font-display font-bold text-2xl leading-none ${isLegend ? "text-gradient-cyan-magenta" : current.color}`}>
                {label}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">XP</div>
            <div className="font-display font-bold text-xl num">{xp.toLocaleString()}</div>
          </div>
        </div>

        {next ? (
          <>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              <span>{xpToNext.toLocaleString()} XP to {city ? next.cityLabel(city) : next.label}</span>
              <span className="num text-foreground/70">{percent}%</span>
            </div>
            <div className="xp-bar h-2">
              <motion.div
                className="xp-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </>
        ) : (
          <div className="text-[10px] font-mono uppercase tracking-wider text-primary mt-2">
            // Max tier · you run this city
          </div>
        )}
      </div>
    </motion.button>
  );
}
