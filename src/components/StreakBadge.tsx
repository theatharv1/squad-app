import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { getStreak } from "@/lib/engagement";

interface Props {
  size?: "sm" | "md";
  onClick?: () => void;
}

// Streak badge — Duolingo / Snapchat / BeReal pattern
// Pulses when at-risk, glows when active, dims when broken
export function StreakBadge({ size = "md", onClick }: Props) {
  const { current, isAtRisk } = getStreak();
  const isActive = current > 0;
  const isAtRiskActive = isAtRisk && current > 0;

  const dim = !isActive;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      className={`relative flex items-center gap-1.5 rounded-full font-mono font-bold ${
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
      } ${
        dim
          ? "bg-white/[0.04] border border-white/10 text-foreground/40"
          : isAtRiskActive
          ? "bg-warning/15 border border-warning/40 text-warning"
          : "bg-primary/15 border border-primary/40 text-primary"
      }`}
      style={!dim ? { boxShadow: isAtRiskActive ? "0 0 14px hsla(35, 100%, 55%, 0.4)" : "0 0 14px hsla(73, 100%, 50%, 0.3)" } : undefined}
    >
      <Flame
        size={size === "sm" ? 11 : 13}
        strokeWidth={2.5}
        className={isAtRiskActive ? "animate-pulse" : ""}
        fill={isActive && !isAtRiskActive ? "currentColor" : "none"}
      />
      <span className="num">{current}</span>
      {isAtRiskActive && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning animate-pulse" />
      )}
    </motion.button>
  );
}
