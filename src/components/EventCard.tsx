import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { resolvePoolTheme } from "@/lib/poolThemes";
import type { Pool } from "@/types";

function formatEventTime(iso: string): { dateLabel: string; timeLabel: string } {
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  let dateLabel: string;
  if (d.toDateString() === now.toDateString()) {
    dateLabel = "Today";
  } else if (d.toDateString() === tomorrow.toDateString()) {
    dateLabel = "Tomorrow";
  } else {
    dateLabel = d.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  const timeLabel = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { dateLabel, timeLabel };
}

export function EventCard({ pool }: { pool: Pool }) {
  const navigate = useNavigate();
  const theme = resolvePoolTheme(pool);
  const { dateLabel, timeLabel } = formatEventTime(pool.scheduledTime);

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/pool/${pool.id}`)}
      className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] cursor-pointer active:bg-white/[0.04] transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative shrink-0">
        <div
          className="w-[88px] h-[88px] rounded-xl flex items-center justify-center"
          style={{ backgroundImage: theme.gradient }}
        >
          <span
            className="text-3xl leading-none select-none"
            style={{ color: theme.foreground }}
          >
            {pool.emoji || pool.category.charAt(0).toUpperCase()}
          </span>
        </div>

        {pool.joined && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-[1px] rounded-full bg-emerald-500 text-[9px] font-semibold text-white tracking-wide uppercase leading-tight whitespace-nowrap">
            Going
          </span>
        )}
      </div>

      {/* Info stack */}
      <div className="flex-1 min-w-0 py-0.5">
        {/* Line 1: host */}
        <p className="text-xs text-muted-foreground truncate">
          {pool.host.name}
        </p>

        {/* Line 2: title */}
        <h3 className="font-display font-bold text-[15px] leading-snug mt-0.5 truncate text-foreground">
          {pool.title}
        </h3>

        {/* Line 3: date + time */}
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
          <Clock size={12} strokeWidth={2} className="shrink-0 opacity-60" />
          <span className="truncate">
            {dateLabel}, {timeLabel}
          </span>
        </p>

        {/* Line 4: venue / area */}
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin size={12} strokeWidth={2} className="shrink-0 opacity-60" />
          <span className="truncate">
            {pool.venue || pool.area}
          </span>
        </p>
      </div>
    </motion.div>
  );
}
