import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ChevronDown, Search, TrendingUp, Zap } from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity, setCity as saveCity } from "@/lib/storage";
import { usePools } from "@/hooks/usePools";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { PoolCard } from "@/components/PoolCard";
import { Stories } from "@/components/Stories";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { StreakBadge } from "@/components/StreakBadge";
import { ActivityTicker } from "@/components/ActivityTicker";
import { TonightVibe } from "@/components/TonightVibe";
import { WeeklyRitual } from "@/components/WeeklyRitual";
import { JoinTicker } from "@/components/JoinTicker";
import { EndingTonight } from "@/components/EndingTonight";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { trackOpen, getTimeContext, getXPToday, DAILY_XP_GOAL } from "@/lib/engagement";

const Home = () => {
  const { user } = useAuth();
  const [city, setLocalCity] = useState(getCity());
  const [filter, setFilter] = useState("all");
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const navigate = useNavigate();

  const { data: allPools = [], isLoading } = usePools({ city, ...(filter !== "all" ? { category: filter } : {}) });
  const { data: todayPools = [] } = usePools({ city, date: "today" });
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount || 0;

  useEffect(() => { trackOpen(); }, []);

  const handleCityChange = (c: string) => { setLocalCity(c); saveCity(c); setCitySheetOpen(false); };
  const livePools = allPools.filter(p => p.isLive);

  const ctx = useMemo(() => getTimeContext(), []);
  const xpToday = getXPToday();
  const xpPercent = Math.min(100, Math.round((xpToday / DAILY_XP_GOAL) * 100));

  // Wildcard pool — variable reward (TikTok/Hinge "Most Compatible" pattern).
  // Pick a different category from user's normal flow, deterministic per day.
  const wildcardPool = useMemo(() => {
    if (!allPools.length) return null;
    const dayKey = new Date().getDate();
    const off = allPools.find((p, i) => i % 5 === dayKey % 5 && p.category !== filter);
    return off || null;
  }, [allPools, filter]);

  return (
    <MobileFrame>
      <div className="min-h-screen pb-28">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between">
            <Sheet open={citySheetOpen} onOpenChange={setCitySheetOpen}>
              <SheetTrigger asChild>
                <motion.button whileTap={{ scale: 0.96 }} className="flex items-center gap-1.5 group">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Your scene</div>
                    <div className="flex items-center gap-1 font-display font-bold text-xl mt-0.5">
                      {city}
                      <ChevronDown size={16} className="text-primary mt-0.5 group-hover:translate-y-0.5 transition-transform" strokeWidth={3} />
                    </div>
                  </div>
                </motion.button>
              </SheetTrigger>
              <SheetContent side="bottom" className="glass-strong border-t border-white/10 rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl text-left">Pick your city</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-2.5 mt-5 pb-6">
                  {CITIES.map(c => (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCityChange(c)}
                      className={`py-4 rounded-2xl font-display font-bold transition-all ${
                        city === c
                          ? "bg-primary text-primary-foreground shadow-[0_0_24px_hsla(73,100%,50%,0.4)]"
                          : "bg-white/[0.04] border border-white/10 text-foreground"
                      }`}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <StreakBadge size="sm" onClick={() => navigate("/profile/me")} />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate("/explore")}
                className="w-10 h-10 rounded-full glass flex items-center justify-center"
              >
                <Search size={18} className="text-foreground" strokeWidth={2.2} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate("/notifications")}
                className="w-10 h-10 rounded-full glass flex items-center justify-center relative"
              >
                <Bell size={18} className="text-foreground" strokeWidth={2.2} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-secondary border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-[8px] font-mono font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  </motion.span>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate("/profile/me")}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-card flex items-center justify-center font-display font-bold text-sm">
                    {user?.name?.[0] || "?"}
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Greeting hero — time-aware */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pt-6"
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">{ctx.eyebrow} · {user?.name?.split(" ")[0] || "player"}</div>
          <h1 className="text-display-lg mt-2">
            {ctx.greeting}, what's the <span className="text-gradient-cyan-magenta">move</span>
          </h1>
          {/* Daily XP progress — Duolingo daily goal pattern */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 xp-bar h-1.5">
              <motion.div
                className="xp-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/60 num">
              {xpToday}/{DAILY_XP_GOAL} XP
            </span>
          </div>
        </motion.div>

        {/* Activity ticker — live social proof */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="px-5 mt-5"
        >
          <ActivityTicker pools={allPools} />
        </motion.div>

        {/* Stories */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="px-5 mt-5"
        >
          <Stories pools={allPools} />
        </motion.div>

        {/* Tonight Vibe — daily check-in (BeReal pattern) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          className="px-5 mt-4"
        >
          <TonightVibe />
        </motion.div>

        {/* Weekly Ritual (Tue-Wed only) — Timeleft pattern */}
        <div className="px-5 mt-4">
          <WeeklyRitual />
        </div>

        {/* Bento — live now + trending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17, duration: 0.5 }}
          className="px-5 mt-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setFilter("all")} className="bento-item text-left">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={14} className="text-primary" strokeWidth={3} />
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-primary">Live now</span>
              </div>
              <div className="text-display font-bold num">{livePools.length}</div>
              <div className="text-[11px] text-muted-foreground mt-1">happening right this second</div>
            </button>
            <button onClick={() => navigate("/leaderboard")} className="bento-item text-left">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={14} className="text-secondary" strokeWidth={3} />
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-secondary">Trending</span>
              </div>
              <div className="text-display font-bold num">{allPools.length}</div>
              <div className="text-[11px] text-muted-foreground mt-1">pools in {city} today</div>
            </button>
          </div>
        </motion.div>

        {/* Categories filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="px-5 flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base">Vibe</h2>
          </div>
          <div className="overflow-x-auto px-5 scrollbar-hide">
            <div className="flex gap-2 pb-1">
              <button
                onClick={() => setFilter("all")}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/[0.04] border border-white/10 text-foreground/70"
                }`}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                    filter === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/[0.04] border border-white/10 text-foreground/70"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Ending tonight rail — highest converting surface (Resy/Dice pattern) */}
        <div className="mt-7">
          <EndingTonight pools={allPools} city={city} />
        </div>

        {/* Tonight section */}
        {todayPools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-7"
          >
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display font-bold text-xl">{ctx.tabName}'s setlist</h2>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">happening today</p>
              </div>
              <button onClick={() => navigate("/explore")} className="text-[11px] font-mono uppercase tracking-wider text-primary">
                See all
              </button>
            </div>
            <div className="overflow-x-auto px-5 snap-x-mandatory scrollbar-hide">
              <div className="flex gap-3 pb-2">
                {todayPools.slice(0, 6).map((pool, i) => (
                  <div key={pool.id} className="snap-start min-w-[300px]">
                    <PoolCard pool={pool} variant="ticket" index={i} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Wildcard — variable reward */}
        {wildcardPool && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-7 px-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-400">// Wildcard pick</div>
              <div className="h-px flex-1 bg-gradient-to-r from-pink-500/30 via-pink-500/10 to-transparent" />
            </div>
            <PoolCard pool={wildcardPool} variant="ticket" index={0} />
          </motion.div>
        )}

        {/* All pools */}
        <div className="mt-7 px-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-bold text-xl">The full lineup</h2>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">browse everything</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-stage p-5 relative overflow-hidden">
                  <div className="h-4 w-32 bg-white/[0.06] rounded-full" />
                  <div className="h-6 w-48 bg-white/[0.06] rounded-full mt-2" />
                  <div className="h-3 w-24 bg-white/[0.06] rounded-full mt-3" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" style={{ animation: "shimmer 2s infinite" }} />
                </div>
              ))}
            </div>
          ) : allPools.length > 0 ? (
            <div className="space-y-3">
              {allPools.map((pool, i) => (
                <PoolCard key={pool.id} pool={pool} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-stage py-12 text-center"
            >
              <div className="font-display text-display-lg text-gradient-cyan-magenta">404</div>
              <p className="text-sm text-muted-foreground mt-2">No pools in {city} right now</p>
              <button
                onClick={() => navigate("/create")}
                className="mt-4 btn-lime text-sm"
              >
                Be the first
              </button>
            </motion.div>
          )}
        </div>

        <BottomNav />

        {/* Live join ticker — Eventbrite/Resy social proof toast */}
        <JoinTicker pools={allPools} />
      </div>
    </MobileFrame>
  );
};

export default Home;
