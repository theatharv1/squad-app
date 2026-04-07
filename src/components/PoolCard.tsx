import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, IndianRupee, ArrowUpRight, Eye, Flame } from "lucide-react";
import { CATEGORIES } from "@/constants";
import { useJoinPool, useLeavePool } from "@/hooks/usePools";
import { getPoolUrgency, addXP } from "@/lib/engagement";
import { earnAchievement } from "@/lib/tiers";
import type { Pool } from "@/types";
import { toast } from "sonner";

interface Props {
  pool: Pool;
  variant?: "compact" | "full" | "ticket";
  index?: number;
}

// Deterministic synthetic helpers (until backend has real data) — these
// produce consistent values for the same pool so the UI feels stable.
function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function viewersNow(pool: Pool): number {
  const seed = hashSeed(pool.id);
  const base = 2 + (seed % 9);
  return pool.isLive ? base + 4 : base;
}
function mutualsCount(pool: Pool): number {
  const seed = hashSeed(pool.id + "mut");
  return seed % 4; // 0-3
}

function MutualAvatars({ count }: { count: number }) {
  if (count === 0) return null;
  const colors = [
    "bg-gradient-to-br from-primary/60 to-primary/30",
    "bg-gradient-to-br from-pink-500/60 to-pink-500/30",
    "bg-gradient-to-br from-cyan-400/60 to-cyan-400/30",
  ];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border border-background ${colors[i % colors.length]}`}
          />
        ))}
      </div>
      <span className="text-[9px] font-mono uppercase tracking-wider text-foreground/70">
        {count === 1 ? "1 friend going" : `${count} friends going`}
      </span>
    </div>
  );
}

function UrgencyChip({ pool }: { pool: Pool }) {
  const u = getPoolUrgency(pool);
  if (!u) return null;
  const styles = {
    magenta: "bg-pink-500/15 border-pink-500/40 text-pink-400",
    lime: "bg-primary/15 border-primary/40 text-primary",
    cyan: "bg-cyan-400/15 border-cyan-400/40 text-cyan-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-wider font-bold ${
        styles[u.color as keyof typeof styles]
      } ${u.level === "live" ? "animate-pulse" : ""}`}
    >
      {u.level === "live" && <span className="pulse-dot" />}
      {u.level === "hot" && <Flame size={9} strokeWidth={3} fill="currentColor" />}
      {u.label}
    </span>
  );
}

function ViewersNow({ pool }: { pool: Pool }) {
  const n = viewersNow(pool);
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-cyan-300/80">
      <Eye size={9} strokeWidth={2.5} />
      <span className="num">{n}</span> viewing
    </span>
  );
}

// Host credibility — Hinge "trusted host" + Posh "verified curator" pattern.
// Synthesized pool-count from host id seed until backend surfaces it.
function hostedCount(hostId: string): number {
  const seed = hashSeed(hostId + "host");
  return 3 + (seed % 18); // 3-20
}
function HostCredibility({ pool }: { pool: Pool }) {
  const hosted = hostedCount(pool.host.id);
  const rating = parseFloat(pool.host.rating || "4.6");
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-foreground/60">
      <span className="num text-foreground/80">{hosted}</span> hosted
      <span className="text-foreground/30">·</span>
      <span className="num text-primary">{rating.toFixed(1)}</span>
      <span>vibe</span>
    </span>
  );
}

export const PoolCard = ({ pool, variant = "full", index = 0 }: Props) => {
  const navigate = useNavigate();
  const joinMutation = useJoinPool();
  const leaveMutation = useLeavePool();
  const category = CATEGORIES.find(c => c.id === pool.category);
  const spotsLeft = pool.spotsTotal - pool.spotsFilled;
  const fillPercent = Math.round((pool.spotsFilled / pool.spotsTotal) * 100);
  const mutuals = mutualsCount(pool);

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (pool.joined) {
        await leaveMutation.mutateAsync(pool.id);
        toast("Left pool");
      } else {
        await joinMutation.mutateAsync(pool.id);
        addXP(10);
        const firstPool = earnAchievement("first_pool");
        toast.success(firstPool ? "Joined · First Pool unlocked · +10 XP" : "Joined · +10 XP");
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
              <UrgencyChip pool={pool} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{pool.area} · {timeStr}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[11px] font-mono num text-foreground/80">{pool.spotsFilled}/{pool.spotsTotal}</span>
              <div className="flex-1 xp-bar h-1">
                <div className="xp-bar-fill" style={{ width: `${fillPercent}%` }} />
              </div>
            </div>
            {(mutuals > 0 || pool.isLive) && (
              <div className="flex items-center gap-3 mt-2">
                <MutualAvatars count={mutuals} />
                {pool.isLive && <ViewersNow pool={pool} />}
              </div>
            )}
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">{category?.label || pool.category}</span>
                  <UrgencyChip pool={pool} />
                </div>
                <h3 className="font-display text-2xl font-bold mt-1 leading-none">{pool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5">hosted by {pool.host.name}</p>
                <div className="mt-1.5">
                  <HostCredibility pool={pool} />
                </div>
              </div>
            </div>

            <div className="divider-dashed my-4" />

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

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Squad filling</span>
                <span className="text-[11px] font-mono num text-primary">{pool.spotsFilled}/{pool.spotsTotal}</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${fillPercent}%` }} />
              </div>
            </div>

            {(mutuals > 0 || true) && (
              <div className="flex items-center justify-between mb-4">
                <MutualAvatars count={mutuals} />
                <ViewersNow pool={pool} />
              </div>
            )}

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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">{category?.label}</span>
              <UrgencyChip pool={pool} />
            </div>
            <h3 className="font-display font-bold text-xl leading-tight truncate">{pool.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">by {pool.host.name}</p>
            <div className="mt-1">
              <HostCredibility pool={pool} />
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl gradient-stage border border-primary/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] font-mono text-primary tracking-wider">{monthStr}</span>
            <span className="text-xl font-display font-bold leading-none num">{dayNum}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono mt-3 flex-wrap">
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

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <MutualAvatars count={mutuals} />
            {mutuals === 0 && <ViewersNow pool={pool} />}
          </div>
          {mutuals > 0 && <ViewersNow pool={pool} />}
        </div>

        <div className="flex items-center justify-between mt-3.5">
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
