import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Flame } from "lucide-react";
import type { Pool } from "@/types";

interface Props {
  pools: Pool[];
}

// Bottom-of-screen rotating social proof — Eventbrite/Resy/Strava pattern.
// Fires every 7-15 sec (variable interval, NOT fixed — playbook insight).
// onTap routes to the pool. This is the highest-leverage social proof surface.

const NAMES = ["Aarav", "Priya", "Rahul", "Meera", "Karan", "Sneha", "Arjun", "Ishita", "Dev", "Tanya", "Aditya", "Vikram", "Nisha", "Sameer", "Rohan", "Kavya", "Aman", "Riya"];
const HOODS = ["Bandstand", "MG Road", "Connaught Place", "Indiranagar", "Koregaon Park"];

type TickerEvent = {
  id: string;
  poolId: string;
  text: string;
  kind: "joined" | "filled" | "viewing" | "hosted";
};

function buildEvents(pools: Pool[]): TickerEvent[] {
  if (!pools.length) return [];
  const events: TickerEvent[] = [];
  const sample = pools.slice(0, 8);
  sample.forEach((p, i) => {
    const name = NAMES[(i * 3 + p.id.length) % NAMES.length];
    const kindRand = (i + p.id.length) % 4;
    if (kindRand === 0) {
      events.push({
        id: `${p.id}-j-${i}`,
        poolId: p.id,
        text: `${name} just joined ${p.title}`,
        kind: "joined",
      });
    } else if (kindRand === 1) {
      const left = Math.max(1, p.spotsTotal - p.spotsFilled);
      events.push({
        id: `${p.id}-f-${i}`,
        poolId: p.id,
        text: `Only ${left} ${left === 1 ? "spot" : "spots"} left in ${p.title}`,
        kind: "filled",
      });
    } else if (kindRand === 2) {
      const watchers = 4 + (p.id.length % 9);
      events.push({
        id: `${p.id}-v-${i}`,
        poolId: p.id,
        text: `${watchers} people viewing ${p.title} right now`,
        kind: "viewing",
      });
    } else {
      const hood = HOODS[i % HOODS.length];
      events.push({
        id: `${p.id}-h-${i}`,
        poolId: p.id,
        text: `New pool in ${hood}: ${p.title}`,
        kind: "hosted",
      });
    }
  });
  return events;
}

const ICONS: Record<TickerEvent["kind"], typeof Sparkles> = {
  joined: Users,
  filled: Flame,
  viewing: Sparkles,
  hosted: Sparkles,
};

const COLORS: Record<TickerEvent["kind"], string> = {
  joined: "text-primary",
  filled: "text-pink-400",
  viewing: "text-cyan-300",
  hosted: "text-primary",
};

export function JoinTicker({ pools }: Props) {
  const navigate = useNavigate();
  const events = useMemo(() => buildEvents(pools), [pools]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Variable interval — playbook says NEVER fixed because the brain learns the pattern.
  useEffect(() => {
    if (!events.length || dismissed) return;
    let cancelled = false;
    const cycle = () => {
      if (cancelled) return;
      setVisible(true);
      const showFor = 4200 + Math.floor(Math.random() * 1800); // 4.2-6 sec visible
      setTimeout(() => {
        if (cancelled) return;
        setVisible(false);
        const wait = 3500 + Math.floor(Math.random() * 4500); // 3.5-8 sec hidden
        setTimeout(() => {
          if (cancelled) return;
          setIdx((i) => (i + 1) % events.length);
          cycle();
        }, wait);
      }, showFor);
    };
    // Wait a bit after page mount before first toast (don't blast on landing)
    const initial = setTimeout(cycle, 2500);
    return () => {
      cancelled = true;
      clearTimeout(initial);
    };
  }, [events, dismissed]);

  if (!events.length || dismissed) return null;
  const ev = events[idx];
  const Icon = ICONS[ev.kind];

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-40">
      <AnimatePresence>
        {visible && (
          <motion.button
            key={ev.id}
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={() => navigate(`/pool/${ev.poolId}`)}
            className="pointer-events-auto w-full glass-strong border border-white/10 rounded-full px-4 py-2.5 flex items-center gap-2.5 text-left"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.45)" }}
          >
            <div className={`w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0`}>
              <Icon size={13} className={COLORS[ev.kind]} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0 text-[11px] font-mono text-foreground/90 truncate">
              {ev.text}
            </div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-foreground/40 shrink-0">tap</div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
