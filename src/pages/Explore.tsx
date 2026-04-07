import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon, ArrowLeft, Star, MapPin } from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity } from "@/lib/storage";
import { usePools } from "@/hooks/usePools";
import { useSearchUsers, useFollow, useUnfollow } from "@/hooks/useUsers";
import { useVenues } from "@/hooks/useVenues";
import { PoolCard } from "@/components/PoolCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";

const Explore = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const city = getCity();

  const { data: searchResults = [] } = usePools(search.length >= 2 ? { search, city } : {});
  const { data: categoryPools = [] } = usePools(selectedCategory ? { city, category: selectedCategory } : {});
  const { data: trendingPools = [] } = usePools({ city, limit: "4" });
  const { data: allPools = [] } = usePools({ city });
  const { data: suggestedUsers = [] } = useSearchUsers({ city, limit: "5" });
  const { data: venues = [] } = useVenues(city);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (isFollowing) await unfollowMutation.mutateAsync(userId);
    else await followMutation.mutateAsync(userId);
  };

  const catCounts: Record<string, number> = {};
  allPools.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });

  // SEARCH STATE
  if (search.length >= 2) {
    return (
      <MobileFrame>
        <div className="min-h-screen pb-28">
          <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="relative">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" strokeWidth={2.5} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedCategory(""); }}
                className="input-stage pl-12 py-3.5"
                placeholder="Search pools, venues, hosts..."
                autoFocus
              />
            </div>
          </div>
          <div className="px-5 mt-5 space-y-3">
            {searchResults.length > 0 ? searchResults.map((p, i) => (
              <PoolCard key={p.id} pool={p} index={i} />
            )) : (
              <div className="text-center py-16">
                <div className="text-display-lg text-gradient-cyan-magenta">404</div>
                <p className="text-sm text-muted-foreground mt-2 font-mono uppercase tracking-wider">no matches found</p>
              </div>
            )}
          </div>
          <BottomNav />
        </div>
      </MobileFrame>
    );
  }

  // CATEGORY VIEW
  if (selectedCategory) {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <MobileFrame>
        <div className="min-h-screen pb-28">
          <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedCategory("")}
                className="w-10 h-10 rounded-full glass flex items-center justify-center"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </motion.button>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Category</div>
                <h2 className="font-display text-2xl font-bold">{cat?.label}</h2>
              </div>
            </div>
          </div>
          <div className="px-5 mt-5 space-y-3">
            {categoryPools.length > 0 ? categoryPools.map((p, i) => (
              <PoolCard key={p.id} pool={p} index={i} />
            )) : (
              <div className="text-center py-16">
                <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">no {cat?.label} pools in {city}</p>
              </div>
            )}
          </div>
          <BottomNav />
        </div>
      </MobileFrame>
    );
  }

  // MAIN EXPLORE
  return (
    <MobileFrame>
      <div className="min-h-screen pb-28">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" strokeWidth={2.5} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-stage pl-12 py-3.5"
              placeholder="Search pools, venues, hosts..."
            />
          </div>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-5 pt-6"
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Discover</div>
          <h1 className="text-display mt-2">
            Find your <br />
            <span className="text-gradient-cyan-magenta">next move</span>
          </h1>
        </motion.div>

        {/* Trending */}
        {trendingPools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-7"
          >
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display font-bold text-xl">Trending now</h2>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">most filling fast</p>
              </div>
            </div>
            <div className="overflow-x-auto px-5 snap-x-mandatory scrollbar-hide">
              <div className="flex gap-3 pb-2">
                {trendingPools.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="snap-start min-w-[300px]">
                    <PoolCard pool={p} variant="ticket" index={i} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Categories grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-5 mt-7"
        >
          <h2 className="font-display font-bold text-xl mb-3">Browse by vibe</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategory(cat.id)}
                className="bento-item text-left relative overflow-hidden h-24"
              >
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{(catCounts[cat.id] || 0)} pools</div>
                <div className="font-display font-bold text-lg leading-tight mt-1">{cat.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Other cities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-7"
        >
          <div className="px-5 flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-xl">Other scenes</h2>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">across India</p>
          </div>
          <div className="overflow-x-auto px-5 scrollbar-hide">
            <div className="flex gap-2 pb-1">
              {CITIES.filter(c => c !== city).map(c => (
                <button
                  key={c}
                  className="shrink-0 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-sm font-mono uppercase tracking-wider text-foreground/80 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Active hosts */}
        {suggestedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-5 mt-7"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display font-bold text-xl">Active in {city}</h2>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">top hosts right now</p>
              </div>
            </div>
            <div className="space-y-2">
              {suggestedUsers.slice(0, 5).map((u: any, i: number) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="card-stage p-3 flex items-center gap-3"
                >
                  <button onClick={() => navigate(`/profile/${u.id}`)} className="avatar-ring shrink-0">
                    <div className="w-11 h-11 rounded-full bg-card overflow-hidden">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-bold">{u.name?.[0]}</div>
                      )}
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm truncate">{u.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">@{u.username} · <span className="text-primary num">{u.rating}</span></p>
                  </div>
                  <button
                    onClick={() => handleFollow(u.id, u.isFollowing)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                      u.isFollowing
                        ? "bg-white/[0.04] border border-white/10 text-foreground/70"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {u.isFollowing ? "Following" : "Follow"}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Venues */}
        {venues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-7 mb-4"
          >
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display font-bold text-xl">Iconic spots</h2>
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">popular venues in {city}</p>
              </div>
            </div>
            <div className="overflow-x-auto px-5 snap-x-mandatory scrollbar-hide">
              <div className="flex gap-3 pb-2">
                {venues.map((v: any) => (
                  <motion.button
                    key={v.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/venue/${v.id}`)}
                    className="snap-start card-stage p-4 min-w-[240px] text-left"
                  >
                    <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-primary mb-1">{v.type}</div>
                    <p className="font-display font-bold text-base leading-tight">{v.name}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                      <MapPin size={11} className="text-foreground/60" />
                      {v.area}
                    </div>
                    <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-primary fill-primary" />
                        <span className="text-[11px] font-mono num text-foreground/80">{v.rating}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{v.poolsThisWeek} pools</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <BottomNav />
      </div>
    </MobileFrame>
  );
};

export default Explore;
