import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ChevronDown, Plus } from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity, setCity as saveCity } from "@/lib/storage";
import { usePools } from "@/hooks/usePools";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { PoolCard } from "@/components/PoolCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

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

  const handleCityChange = (c: string) => { setLocalCity(c); saveCity(c); setCitySheetOpen(false); };
  const popularPools = [...allPools].sort((a, b) => b.spotsFilled - a.spotsFilled).slice(0, 3);

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24">
        {/* Premium Glass Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold tracking-tight gradient-text">SQUAD</h1>
            <div className="flex items-center gap-2.5">
              <Sheet open={citySheetOpen} onOpenChange={setCitySheetOpen}>
                <SheetTrigger asChild>
                  <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1 glass px-3 py-1.5 rounded-full text-sm font-medium">
                    {city} <ChevronDown size={14} className="text-muted-foreground" />
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="bottom" className="glass-strong rounded-t-3xl border-t border-border/30">
                  <SheetHeader><SheetTitle>Select City</SheetTitle></SheetHeader>
                  <div className="grid grid-cols-2 gap-2.5 mt-4 pb-6">
                    {CITIES.map(c => (
                      <motion.button key={c} whileTap={{ scale: 0.97 }} onClick={() => handleCityChange(c)}
                        className={`py-3 rounded-2xl text-sm font-medium transition-all ${city === c ? "gradient-primary text-primary-foreground shadow-glow" : "glass"}`}
                      >{c}</motion.button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/notifications")} className="relative p-2 glass rounded-full">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 gradient-primary text-[9px] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold shadow-glow">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/profile/me")} className="w-8 h-8 rounded-full overflow-hidden avatar-ring">
                <img src={user?.avatarUrl || ""} alt="" className="w-full h-full object-cover" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Tonight Section */}
        {todayPools.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="px-4 mt-5">
            <h2 className="font-heading font-semibold text-lg mb-3">Happening Tonight</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {todayPools.slice(0, 5).map((pool, i) => (
                <motion.div key={pool.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="min-w-[280px]">
                  <PoolCard pool={pool} variant="compact" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 px-4 mt-5 overflow-x-auto scrollbar-hide pb-1">
          <button onClick={() => setFilter("all")} className={`pill whitespace-nowrap ${filter === "all" ? "pill-active" : "pill-inactive"}`}>All</button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)}
              className={`pill whitespace-nowrap ${filter === cat.id ? "pill-active" : "pill-inactive"}`}
            >{cat.emoji} {cat.label}</button>
          ))}
        </div>

        {/* All Pools */}
        <div className="px-4 mt-5">
          <h2 className="font-heading font-semibold text-lg mb-3">All Pools</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-36 shimmer rounded-2xl" />)}
            </div>
          ) : allPools.length > 0 ? (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {allPools.map(pool => (
                <motion.div key={pool.id} variants={item}>
                  <PoolCard pool={pool} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="text-4xl mb-3">🌙</div>
              <p className="text-muted-foreground">No pools in {city} right now.</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to raise one!</p>
            </motion.div>
          )}
        </div>

        {/* Popular */}
        {popularPools.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="px-4 mt-6 mb-4">
            <h2 className="font-heading font-semibold text-lg mb-3">Popular in {city}</h2>
            <div className="space-y-3">
              {popularPools.map(pool => <PoolCard key={pool.id} pool={pool} variant="compact" />)}
            </div>
          </motion.div>
        )}

        {/* FAB */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/create")}
          className="fixed bottom-24 right-6 gradient-primary text-primary-foreground rounded-full px-5 py-3.5 shadow-glow flex items-center gap-2 font-bold z-20"
        >
          <Plus size={18} /> Raise a Pool
        </motion.button>

        <BottomNav />
      </motion.div>
    </MobileFrame>
  );
};

export default Home;
