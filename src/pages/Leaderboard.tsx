import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLeaderboard } from "@/hooks/useUsers";
import { MobileFrame } from "@/components/layout/MobileFrame";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const podiumColors = [
  "ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]",
  "ring-gray-400 shadow-[0_0_12px_rgba(156,163,175,0.3)]",
  "ring-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.3)]",
];
const rankColors = ["text-yellow-400", "text-gray-400", "text-orange-400"];

const Leaderboard = () => {
  const [tab, setTab] = useState("topHosts");
  const navigate = useNavigate();
  const { data = [], isLoading } = useLeaderboard(tab);

  const statKey = tab === "topHosts" ? "poolsHosted" : "totalGames";
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-8">
        {/* Glass Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><ArrowLeft size={20} /></motion.button>
            <h1 className="font-heading text-lg font-bold">Leaderboard</h1>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 px-4 mt-4">
          {[{ id: "topHosts", label: "Top Hosts" }, { id: "mostActive", label: "Most Active" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pill flex-1 py-2 text-sm font-medium ${tab === t.id ? "pill-active" : "pill-inactive"}`}
            >{t.label}</button>
          ))}
        </div>

        {isLoading ? (
          <div className="px-4 mt-6 space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer rounded-2xl h-16" />)}</div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-4 px-4 mt-8 mb-6">
                {[1, 0, 2].map(idx => {
                  const u = top3[idx];
                  const sizes = idx === 0 ? "w-16 h-16" : "w-14 h-14";
                  return (
                    <motion.div key={u.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24, delay: idx * 0.1 }}
                      className="flex flex-col items-center cursor-pointer" onClick={() => navigate(`/profile/${u.id}`)}>
                      <span className={`text-lg font-bold gradient-text ${rankColors[idx]}`}>#{idx + 1}</span>
                      <img src={u.avatarUrl || ""} className={`${sizes} rounded-full mt-1 avatar-ring ring-2 ${podiumColors[idx]}`} />
                      <p className="text-xs font-medium mt-1 text-center">{u.name.split(" ")[0]}</p>
                      <p className="text-[10px] text-muted-foreground font-bold gradient-text">{u[statKey]}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Rest of Rankings */}
            <motion.div variants={container} initial="hidden" animate="show" className="px-4 space-y-2">
              {rest.map((u: any, i: number) => (
                <motion.div key={u.id} variants={item}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="card-premium flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => navigate(`/profile/${u.id}`)}>
                  <span className="text-sm font-bold text-muted-foreground w-6">#{i + 4}</span>
                  <img src={u.avatarUrl || ""} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">&#11088; {u.rating}</p>
                  </div>
                  <span className="text-sm font-bold gradient-text">{u[statKey]}</span>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </MobileFrame>
  );
};

export default Leaderboard;
