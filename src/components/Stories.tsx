import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import type { Pool } from "@/types";

interface Props {
  pools: Pool[];
}

export function Stories({ pools }: Props) {
  const navigate = useNavigate();
  const liveOrUpcoming = pools.filter(p => p.isLive || new Date(p.scheduledTime) > new Date()).slice(0, 12);

  return (
    <div className="overflow-x-auto -mx-5 px-5 snap-x-mandatory scrollbar-hide">
      <div className="flex gap-3 pb-2">
        {/* Your story / create */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/create")}
          className="snap-start shrink-0 flex flex-col items-center gap-1.5 w-[68px]"
        >
          <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/[0.02]">
            <Plus size={22} className="text-primary" strokeWidth={3} />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate w-full text-center">Host</span>
        </motion.button>

        {liveOrUpcoming.map((pool, i) => {
          const initials = pool.host.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
          const isLive = pool.isLive;
          return (
            <motion.button
              key={pool.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/pool/${pool.id}`)}
              className="snap-start shrink-0 flex flex-col items-center gap-1.5 w-[68px]"
            >
              <div className={isLive ? "avatar-ring avatar-ring-live" : "avatar-ring"}>
                <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center overflow-hidden">
                  {pool.host.avatar ? (
                    <img src={pool.host.avatar} alt={pool.host.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-base">{initials}</span>
                  )}
                </div>
                {isLive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full bg-red-500 border-2 border-background">
                    <span className="text-[8px] font-mono uppercase font-bold text-white tracking-wider">Live</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider truncate w-full text-center text-foreground/80">
                {pool.host.name.split(" ")[0]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
