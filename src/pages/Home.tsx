import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Plus,
  Activity,
  ChevronRight,
} from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity, setCity as saveCity } from "@/lib/storage";
import { usePools } from "@/hooks/usePools";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { Stories } from "@/components/Stories";
import { EventCard } from "@/components/EventCard";
import { MapView } from "@/components/MapView";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { JoinTicker } from "@/components/JoinTicker";
import { TravelerToggle } from "@/components/TravelerToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { trackOpen, getTimeContext } from "@/lib/engagement";

// Activity category icons — emoji-based for now, matching each CATEGORIES entry.
const CATEGORY_EMOJIS: Record<string, string> = {
  football: "⚽",
  badminton: "🏸",
  cricket: "🏏",
  basketball: "🏀",
  tennis: "🎾",
  travel: "✈️",
  party: "🎶",
  running: "🏃",
  cycling: "🚴",
  hiking: "🏔️",
  gaming: "🎮",
};

const Home = () => {
  const { user } = useAuth();
  const [city, setLocalCity] = useState(getCity());
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const navigate = useNavigate();

  const { data: allPools = [], isLoading } = usePools({ city });
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount || 0;

  useEffect(() => { trackOpen(); }, []);

  const handleCityChange = (c: string) => {
    setLocalCity(c);
    saveCity(c);
    setCitySheetOpen(false);
  };

  const ctx = useMemo(() => getTimeContext(), []);

  // Separate events into upcoming (sorted by time)
  const upcomingPools = useMemo(() => {
    const now = Date.now();
    return [...allPools]
      .filter((p) => new Date(p.scheduledTime).getTime() > now - 1000 * 60 * 30)
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }, [allPools]);

  return (
    <MobileFrame>
      <div className="min-h-screen pb-24">
        {/* ─── Header: Profile + Greeting + Location + Actions ─── */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            {/* Profile pic */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate("/profile/me")}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/60 shrink-0"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-card flex items-center justify-center font-display font-bold text-sm">
                  {user?.name?.[0] || "?"}
                </div>
              )}
            </motion.button>

            {/* Greeting + Location */}
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[15px] leading-tight truncate">
                {ctx.greeting}, {user?.name?.split(" ")[0] || "there"}
              </div>

              <Sheet open={citySheetOpen} onOpenChange={setCitySheetOpen}>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-0.5 mt-0.5 group">
                    <span className="text-[11px] text-muted-foreground truncate">
                      {city}
                    </span>
                    <ChevronDown
                      size={12}
                      className="text-muted-foreground shrink-0 group-hover:translate-y-0.5 transition-transform"
                    />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-background border-t border-white/10 rounded-t-3xl">
                  <SheetHeader>
                    <SheetTitle className="font-display text-2xl text-left">Pick your city</SheetTitle>
                  </SheetHeader>
                  <TravelerToggle city={city} />
                  <div className="grid grid-cols-2 gap-2.5 pb-6">
                    {CITIES.map((c) => (
                      <motion.button
                        key={c}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleCityChange(c)}
                        className={`py-3.5 rounded-2xl font-display font-bold text-sm transition-all ${
                          city === c
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/[0.04] border border-white/10 text-foreground"
                        }`}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Action icons — permanent like Luma */}
            <div className="flex items-center gap-1.5">
              {/* Create pool */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => navigate("/create")}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center"
              >
                <Plus size={18} className="text-foreground" strokeWidth={2} />
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => navigate("/notifications")}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center relative"
              >
                <Bell size={16} className="text-foreground" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-background flex items-center justify-center">
                    <span className="text-[7px] font-mono font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </span>
                )}
              </motion.button>

              {/* Activity */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => navigate("/explore")}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center"
              >
                <Activity size={16} className="text-foreground" strokeWidth={2} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ─── Stories row ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 400, damping: 30 }}
          className="px-4 mt-2"
        >
          <Stories pools={allPools} />
        </motion.div>

        {/* ─── Events section (Luma-style) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 30 }}
          className="mt-3"
        >
          <div className="px-4 flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-base">Events</h2>
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-0.5 text-[11px] text-muted-foreground"
            >
              All Events
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="px-4 space-y-1">
            {isLoading ? (
              // Shimmer loaders
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-white/[0.04]"
                >
                  <div className="w-[88px] h-[88px] rounded-xl bg-white/[0.04] animate-pulse" />
                  <div className="flex-1 py-1 space-y-2">
                    <div className="h-3 w-20 bg-white/[0.04] rounded-full animate-pulse" />
                    <div className="h-4 w-40 bg-white/[0.06] rounded-full animate-pulse" />
                    <div className="h-3 w-32 bg-white/[0.04] rounded-full animate-pulse" />
                  </div>
                </div>
              ))
            ) : upcomingPools.length > 0 ? (
              <>
                {upcomingPools.slice(0, 2).map((pool) => (
                  <EventCard key={pool.id} pool={pool} />
                ))}
                {upcomingPools.length > 2 && (
                  <button
                    onClick={() => navigate("/explore")}
                    className="w-full py-2 text-center text-[11px] font-mono uppercase tracking-wider text-primary"
                  >
                    View {upcomingPools.length - 2} more
                  </button>
                )}
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No events in {city} yet</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/create")}
                  className="mt-3 px-6 py-2 rounded-full bg-primary text-primary-foreground text-xs font-display font-bold"
                >
                  Be the first
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── Activity categories (horizontal rail with icons) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 30 }}
          className="mt-3"
        >
          <div className="px-4 flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-base">Activity</h2>
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-0.5 text-[11px] text-muted-foreground"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto px-4 scrollbar-hide">
            <div className="flex gap-2.5 pb-1">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.03 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => navigate(`/explore?category=${cat.id}`)}
                  className="shrink-0 flex flex-col items-center gap-1 w-14"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl">
                    {CATEGORY_EMOJIS[cat.id] || "•"}
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground truncate w-full text-center">
                    {cat.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Map section (MIGO Maps style) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 30 }}
          className="mt-3 px-4"
        >
          <MapView pools={allPools} city={city} />
        </motion.div>

        {/* ─── 3 Activities happening now (compact preview cards) ─── */}
        {allPools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 400, damping: 30 }}
            className="mt-3 px-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-base">Happening now</h2>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-0.5 text-[11px] text-muted-foreground"
              >
                See all
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {allPools.slice(0, 3).map((pool) => {
                const spotsLeft = pool.spotsTotal - pool.spotsFilled;
                return (
                  <motion.button
                    key={pool.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/pool/${pool.id}`)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-lg shrink-0">
                      {CATEGORY_EMOJIS[pool.category] || "•"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm truncate">{pool.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {pool.area} · {spotsLeft} spots left
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        <BottomNav />
        <JoinTicker pools={allPools} />
      </div>
    </MobileFrame>
  );
};

export default Home;
