import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star } from "lucide-react";
import { useLeaderboard } from "@/hooks/useUsers";
import { MobileFrame } from "@/components/layout/MobileFrame";

const tierClasses = ["tier-gold", "tier-silver", "tier-bronze"];

const Leaderboard = () => {
  const [tab, setTab] = useState("topHosts");
  const navigate = useNavigate();
  const { data = [], isLoading } = useLeaderboard(tab);

  const statKey = tab === "topHosts" ? "poolsHosted" : "totalGames";
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <MobileFrame>
      <div className="min-h-screen pb-12">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </motion.button>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Hall of fame</div>
              <h1 className="font-display font-bold text-xl mt-0.5">Leaderboard</h1>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 mt-5"
        >
          <div className="flex gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
            {[
              { id: "topHosts", label: "Top hosts" },
              { id: "mostActive", label: "Most active" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="px-5 mt-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card-stage h-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" style={{ animation: "shimmer 2s infinite" }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 mt-8"
              >
                <div className="flex items-end justify-center gap-4">
                  {[1, 0, 2].map((idx, displayIdx) => {
                    const u = top3[idx];
                    const isFirst = idx === 0;
                    const sizes = isFirst ? "w-20 h-20" : "w-16 h-16";
                    const heightClass = isFirst ? "h-32" : displayIdx === 0 ? "h-24" : "h-20";
                    return (
                      <motion.button
                        key={u.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + displayIdx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => navigate(`/profile/${u.id}`)}
                        className="flex flex-col items-center"
                      >
                        <div className={`avatar-ring ${isFirst ? "avatar-ring-live" : ""}`}>
                          <div className={`${sizes} rounded-full bg-card overflow-hidden`}>
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl">{u.name?.[0]}</div>
                            )}
                          </div>
                        </div>
                        <p className="font-display font-bold text-sm mt-2 text-center">{u.name.split(" ")[0]}</p>
                        <div className={`flex items-center gap-1 ${tierClasses[idx]}`}>
                          <Trophy size={11} strokeWidth={3} />
                          <span className="text-[11px] font-mono num font-bold">{u[statKey]}</span>
                        </div>
                        <div className={`${heightClass} w-full mt-3 rounded-t-2xl bg-gradient-to-b from-white/[0.06] to-transparent border-t border-x border-white/10 flex items-start justify-center pt-2`}>
                          <span className={`font-display font-bold text-2xl num ${tierClasses[idx]}`}>{idx + 1}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Rest */}
            <div className="px-5 mt-6 space-y-2">
              {rest.map((u: any, i: number) => (
                <motion.button
                  key={u.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/profile/${u.id}`)}
                  className="card-stage w-full p-3 flex items-center gap-3 text-left"
                >
                  <span className="font-display font-bold text-base num text-muted-foreground w-7 text-center">{i + 4}</span>
                  <div className="avatar-ring shrink-0">
                    <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs">{u.name?.[0]}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm truncate">{u.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="text-primary fill-primary" />
                      <span className="text-[11px] font-mono num text-muted-foreground">{u.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-base num text-primary">{u[statKey]}</div>
                    <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{tab === "topHosts" ? "hosted" : "games"}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </MobileFrame>
  );
};

export default Leaderboard;
