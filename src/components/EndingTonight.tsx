import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Flame, ArrowRight, Clock } from "lucide-react";
import type { Pool } from "@/types";

interface Props {
  pools: Pool[];
  city: string;
}

// "Tonight in [city]" rail — playbook section 4 highest-converting surface.
// Indian Gen Z lives last-minute → tonight rail beats next-week rail 5x.
// Per-pool live countdown (real, not fake — EU bans fake countdowns).
function pickTonightPools(pools: Pool[]): Pool[] {
  const now = Date.now();
  const sixHours = 1000 * 60 * 60 * 6;
  return pools
    .filter((p) => {
      const t = new Date(p.scheduledTime).getTime();
      return t > now && t - now < sixHours && p.spotsFilled < p.spotsTotal;
    })
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 5);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "STARTING NOW";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins.toString().padStart(2, "0")}m`;
}

export function EndingTonight({ pools, city }: Props) {
  const navigate = useNavigate();
  const tonight = useMemo(() => pickTonightPools(pools), [pools]);
  const [tick, setTick] = useState(0);

  // Re-render every 30s so the countdowns stay live (real, not fake).
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  if (!tonight.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="px-5 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-pink-500/15 border border-pink-500/40 flex items-center justify-center">
            <Flame size={11} className="text-pink-400" strokeWidth={2.5} fill="currentColor" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-400">// Tonight in {city}</div>
            <div className="font-display font-bold text-xl mt-0.5">Last call</div>
          </div>
        </div>
        <button onClick={() => navigate("/explore")} className="text-[10px] font-mono uppercase tracking-wider text-pink-400">
          See all
        </button>
      </div>
      <div className="overflow-x-auto px-5 scrollbar-hide snap-x snap-mandatory">
        <div className="flex gap-3 pb-2">
          {tonight.map((p, i) => {
            const start = new Date(p.scheduledTime).getTime();
            const remaining = start - Date.now();
            const left = p.spotsTotal - p.spotsFilled;
            const isCritical = left <= 2;
            return (
              <motion.button
                key={`${p.id}-${tick}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/pool/${p.id}`)}
                className="snap-start min-w-[220px] text-left card-stage p-4 relative overflow-hidden group"
                style={{ boxShadow: "0 0 24px hsla(330, 90%, 65%, 0.12)" }}
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-pink-400" strokeWidth={2.5} />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 num font-bold">
                      {formatCountdown(remaining)}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base mt-1.5 leading-tight line-clamp-2">{p.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">{p.area}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider">
                      <span className={`num font-bold ${isCritical ? "text-pink-400" : "text-primary"}`}>
                        {left} {left === 1 ? "spot" : "spots"}
                      </span>
                      <span className="text-foreground/40"> left</span>
                    </div>
                    <ArrowRight size={13} className="text-pink-400 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
