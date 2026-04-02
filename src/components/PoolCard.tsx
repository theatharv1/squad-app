import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Users } from "lucide-react";
import type { Pool } from "@/data/mockData";
import { CATEGORIES } from "@/data/mockData";
import { getJoinedPools, toggleJoinPool } from "@/lib/storage";
import { useState } from "react";
import { toast } from "sonner";

interface PoolCardProps {
  pool: Pool;
  variant?: "compact" | "full";
  onJoinChange?: () => void;
}

export default function PoolCard({ pool, variant = "full", onJoinChange }: PoolCardProps) {
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(getJoinedPools().includes(pool.id));
  const [animating, setAnimating] = useState(false);
  const cat = CATEGORIES.find(c => c.id === pool.category);
  const spotsLeft = pool.spotsTotal - pool.spotsFilled - (isJoined ? 1 : 0);

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animating) return;
    setAnimating(true);
    const joined = toggleJoinPool(pool.id);
    setTimeout(() => {
      setIsJoined(joined);
      setAnimating(false);
      onJoinChange?.();
      if (joined) toast.success("You're in! Pool chat added to messages");
      else toast("Left the pool");
    }, 300);
  };

  if (variant === "compact") {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(`/pool/${pool.id}`)}
        className="min-w-[200px] bg-card rounded-2xl p-3.5 border border-border cursor-pointer flex flex-col gap-2"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{cat?.emoji}</span>
          <span className="text-xs text-muted-foreground">{cat?.label}</span>
          {pool.isLive && <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot ml-auto" />}
        </div>
        <p className="text-sm font-semibold leading-tight line-clamp-2">{pool.title}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{pool.time}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={12} />
          <span className="truncate">{pool.area}</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{pool.spotsFilled + (isJoined ? 1 : 0)}/{pool.spotsTotal}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleJoin}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
              isJoined ? "bg-success/20 text-success" : "bg-primary text-primary-foreground"
            }`}
          >
            {isJoined ? "Joined" : "Join"}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/pool/${pool.id}`)}
      className="bg-card rounded-2xl p-4 border border-border cursor-pointer"
    >
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
          {cat?.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm leading-tight line-clamp-2">{pool.title}</p>
            {pool.isLive && <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot mt-1.5 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <img src={pool.host.avatar} alt="" className="w-4 h-4 rounded-full" />
            <span className="text-xs text-muted-foreground">{pool.host.name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{pool.host.rating} ★</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin size={12} />{pool.area}</span>
            <span className="flex items-center gap-1"><Clock size={12} />{pool.time}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Users size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{pool.spotsFilled + (isJoined ? 1 : 0)}/{pool.spotsTotal}</span>
              </div>
              <span className="text-xs font-medium text-primary">
                {pool.costPerHead === 0 ? "Free" : `₹${pool.costPerHead}`}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleJoin}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                isJoined ? "bg-success/20 text-success" : "bg-primary text-primary-foreground"
              }`}
            >
              {animating ? "..." : isJoined ? "Joined ✓" : "Join"}
            </motion.button>
          </div>
          {pool.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {pool.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
