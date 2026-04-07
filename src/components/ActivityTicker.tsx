import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { synthesizeActivity, timeAgo, type ActivityEvent } from "@/lib/engagement";

interface Props {
  pools: any[];
}

// Activity ticker — Eventbrite / Resy / Airbnb "X just joined" pattern
// Rotates through recent events to make the app feel alive 24/7.
// Triggers FOMO + social proof simultaneously.
export function ActivityTicker({ pools }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!pools?.length) return;
    setEvents(synthesizeActivity(pools, 8));
  }, [pools]);

  useEffect(() => {
    if (events.length < 2) return;
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % events.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [events.length]);

  if (!events.length) return null;
  const event = events[index];

  return (
    <div className="card-stage px-4 py-3 flex items-center gap-3 overflow-hidden">
      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
        <Zap size={13} className="text-primary" strokeWidth={2.5} fill="currentColor" />
      </div>
      <div className="flex-1 min-w-0 relative h-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center"
          >
            <p className="text-xs truncate">
              <span className="text-foreground/90">{event.text}</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground shrink-0 num">
        {timeAgo(event.ts)}
      </span>
    </div>
  );
}
