import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { isRitualDay, hasJoinedRitual, joinRitual } from "@/lib/engagement";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Weekly Ritual — Timeleft Wednesday-dinner pattern.
// Creates a recurring social anchor: every Wednesday, a curated dinner.
// Highly addictive — same time every week, FOMO-driven, low effort.
export function WeeklyRitual() {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(hasJoinedRitual());
  const today = isRitualDay();

  // Always visible (Tuesday-Wednesday window) but emphasized on the day
  const day = new Date().getDay();
  if (day < 2 || day > 3) return null; // only Tuesday-Wednesday

  function handleJoin() {
    joinRitual();
    setJoined(true);
    setTimeout(() => navigate("/explore"), 600);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden card-stage p-5"
    >
      {/* Spotlight glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
            <Calendar size={11} className="text-primary" strokeWidth={2.5} />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
            // {today ? "Tonight" : "Wednesday"} · Weekly Ritual
          </div>
        </div>

        <h3 className="font-display font-bold text-2xl mt-3 leading-tight">
          Dinner with <span className="text-gradient-cyan-magenta">5 strangers</span>
        </h3>

        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Same time, every Wednesday. We pick the spot, we pick the crew. You just show up.
        </p>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex -space-x-2">
            {[
              "bg-primary/30",
              "bg-pink-500/30",
              "bg-cyan-400/30",
              "bg-yellow-400/30",
            ].map((c, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full border-2 border-background ${c}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/60">
            <span className="text-primary num">137</span> joined this week
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleJoin}
          disabled={joined}
          className="mt-5 w-full px-5 py-3 rounded-full bg-primary text-primary-foreground text-[11px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          style={!joined ? { boxShadow: "0 0 24px hsla(73, 100%, 50%, 0.4)" } : undefined}
        >
          {joined ? "You're in — see you Wednesday" : "Reserve my seat"}
          {!joined && <ArrowRight size={13} strokeWidth={3} />}
        </motion.button>
      </div>
    </motion.div>
  );
}
