import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, IndianRupee, ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/constants";
import { useJoinPool, useLeavePool } from "@/hooks/usePools";
import type { Pool } from "@/types";
import { toast } from "sonner";

interface Props {
  pool: Pool;
  variant?: "compact" | "full" | "ticket";
  index?: number;
}

export const PoolCard = ({ pool, variant = "full", index = 0 }: Props) => {
  const navigate = useNavigate();
  const joinMutation = useJoinPool();
  const leaveMutation = useLeavePool();
  const category = CATEGORIES.find(c => c.id === pool.category);
  const spotsLeft = pool.spotsTotal - pool.spotsFilled;
  const fillPercent = Math.round((pool.spotsFilled / pool.spotsTotal) * 100);

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (pool.joined) {
        await leaveMutation.mutateAsync(pool.id);
        toast("Left pool");
      } else {
        await joinMutation.mutateAsync(pool.id);
        toast.success("Joined");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const time = new Date(pool.scheduledTime);
  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = isToday(time) ? "TODAY" : isTomorrow(time) ? "TMRW" : time.toLocaleDateString([], { month: "short", day: "numeric" }).toUpperCase();
  const dayNum = time.getDate();
  const monthStr = time.toLocaleDateString([], { month: "short" }).toUpperCase();

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/pool/${pool.id}`)}
        className="card-stage p-4 cursor-pointer relative group"
      >
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl gradient-stage border border-primary/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] font-mono text-primary tracking-wider">{monthStr}</span>
            <span className="text-xl font-display font-bold leading-none num">{dayNum}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-bold text-base leading-tight truncate">{pool.title}</h3>
              {pool.isLive && (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="pulse-dot" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">Live</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{pool.area} · {timeStr}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[11px] font-mono num text-foreground/80">{pool.spotsFilled}/{pool.spotsTotal}</span>
              <div className="flex-1 xp-bar h-1">
                <div className="xp-bar-fill" style={{ width: `${fillPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "ticket") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/pool/${pool.id}`)}
        className="relative cursor-pointer group"
      >
        <div className="card-ticket p-5 relative overflow-hidden">
          {/* spotlight gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <div className="relative">
            {/* header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">{category?.label || pool.category}</span>
                <h3 className="font-display text-2xl font-bold mt-1 leading-none">{pool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5">hosted by {pool.host.name}</p>
              </div>
              {pool.isLive && (
                <div className="tag tag-live">
                  <span className="pulse-dot" />
                  Live
                </div>
              )}
            </div>

            {/* dashed divider */}
            <div className="divider-dashed my-4" />

            {/* meta row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">When</div>
                <div className="font-display font-bold text-sm mt-1">{dateStr}</div>
                <div className="text-[11px] font-mono num text-foreground/70">{timeStr}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Where</div>
                <div className="font-display font-bold text-sm mt-1 truncate">{pool.area}</div>
                <div className="text-[11px] text-foreground/70 truncate">{pool.venue}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Cost</div>
                <div className="font-display font-bold text-sm mt-1 num">{pool.costPerHead > 0 ? `₹${pool.costPerHead}` : "Free"}</div>
                <div className="text-[11px] text-foreground/70">per head</div>
              </div>
            </div>

            {/* xp bar for spots */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Squad filling</span>
                <span className="text-[11px] font-mono num text-primary">{pool.spotsFilled}/{pool.spotsTotal}</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${fillPercent}%` }} />
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleJoin}
              disabled={joinMutation.isPending || leaveMutation.isPending}
              className={`w-full py-3 rounded-2xl font-display font-bold text-sm tracking-tight flex items-center justify-center gap-2 transition-all ${
                pool.joined
                  ? "bg-white/5 border border-white/10 text-foreground"
                  : "bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsla(73,100%,50%,0.5)]"
              }`}
            >
              {pool.joined ? "You're In" : "Reserve Spot"}
              {!pool.joined && <ArrowUpRight size={16} strokeWidth={2.5} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default "full" variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/pool/${pool.id}`)}
      className="card-stage p-5 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">{category?.label}</span>
              {pool.isLive && (
                <span className="flex items-center gap-1">
                  <span className="pulse-dot" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">Live</span>
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-xl leading-tight truncate">{pool.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">by {pool.host.name}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl gradient-stage border border-primary/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] font-mono text-primary tracking-wider">{monthStr}</span>
            <span className="text-xl font-display font-bold leading-none num">{dayNum}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono mt-3">
          <span className="flex items-center gap-1"><MapPin size={11} className="text-primary/80" />{pool.area}</span>
          <span className="flex items-center gap-1"><Clock size={11} className="text-primary/80" />{timeStr}</span>
          <span className="flex items-center gap-1"><Users size={11} className="text-primary/80" />{spotsLeft} left</span>
          {pool.costPerHead > 0 && <span className="flex items-center gap-1"><IndianRupee size={11} className="text-primary/80" />{pool.costPerHead}</span>}
        </div>

        <div className="mt-3.5">
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${fillPercent}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1.5">
            {pool.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-foreground/60">{tag}</span>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoin}
            disabled={joinMutation.isPending || leaveMutation.isPending}
            className={`px-5 py-2 rounded-full text-xs font-display font-bold tracking-tight flex items-center gap-1.5 transition-all ${
              pool.joined
                ? "bg-white/5 border border-white/10 text-foreground"
                : "bg-primary text-primary-foreground hover:shadow-[0_0_24px_hsla(73,100%,50%,0.5)]"
            }`}
          >
            {pool.joined ? "Joined" : "Join"}
            {!pool.joined && <ArrowUpRight size={12} strokeWidth={3} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

function isToday(d: Date) { const t = new Date(); return d.toDateString() === t.toDateString(); }
function isTomorrow(d: Date) { const t = new Date(); t.setDate(t.getDate() + 1); return d.toDateString() === t.toDateString(); }
