import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, IndianRupee } from "lucide-react";
import { CATEGORIES } from "@/constants";
import { useJoinPool, useLeavePool } from "@/hooks/usePools";
import type { Pool } from "@/types";
import { toast } from "sonner";

interface Props {
  pool: Pool;
  variant?: "compact" | "full";
}

export const PoolCard = ({ pool, variant = "full" }: Props) => {
  const navigate = useNavigate();
  const joinMutation = useJoinPool();
  const leaveMutation = useLeavePool();
  const category = CATEGORIES.find(c => c.id === pool.category);
  const spotsLeft = pool.spotsTotal - pool.spotsFilled;

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (pool.joined) {
        await leaveMutation.mutateAsync(pool.id);
        toast("Left pool");
      } else {
        await joinMutation.mutateAsync(pool.id);
        toast.success("Joined pool!");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const time = new Date(pool.scheduledTime);
  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = isToday(time) ? "Today" : isTomorrow(time) ? "Tomorrow" : time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/pool/${pool.id}`)}
        className="card-premium p-3.5 cursor-pointer group"
      >
        <div className="flex items-start gap-2.5">
          <div className="w-10 h-10 rounded-xl gradient-primary-subtle flex items-center justify-center text-lg shrink-0">
            {pool.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{pool.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{pool.area} · {timeStr}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-muted-foreground">{pool.spotsFilled}/{pool.spotsTotal} joined</span>
              {pool.isLive && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full live-glow" />Live
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/pool/${pool.id}`)}
      className="card-premium p-4 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl gradient-primary-subtle flex items-center justify-center text-xl shrink-0">
            {pool.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{pool.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">by {pool.host.name}</p>
          </div>
        </div>
        {pool.isLive && (
          <span className="flex items-center gap-1 text-xs text-green-400 shrink-0 bg-green-400/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full live-glow" />Live
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1"><MapPin size={12} className="text-primary/60" />{pool.area}</span>
        <span className="flex items-center gap-1"><Clock size={12} className="text-primary/60" />{timeStr} · {dateStr}</span>
        <span className="flex items-center gap-1"><Users size={12} className="text-primary/60" />{spotsLeft} left</span>
        {pool.costPerHead > 0 && <span className="flex items-center gap-1"><IndianRupee size={12} className="text-primary/60" />{pool.costPerHead}</span>}
      </div>
      <div className="flex items-center justify-between mt-3.5">
        <div className="flex gap-1.5">
          {pool.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] bg-secondary/60 px-2.5 py-0.5 rounded-full text-muted-foreground border border-border/30">{tag}</span>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleJoin}
          disabled={joinMutation.isPending || leaveMutation.isPending}
          className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
            pool.joined
              ? "btn-secondary"
              : "gradient-primary text-primary-foreground shadow-glow"
          }`}
        >
          {pool.joined ? "Joined" : "Join"}
        </motion.button>
      </div>
    </motion.div>
  );
};

function isToday(d: Date) { const t = new Date(); return d.toDateString() === t.toDateString(); }
function isTomorrow(d: Date) { const t = new Date(); t.setDate(t.getDate() + 1); return d.toDateString() === t.toDateString(); }
