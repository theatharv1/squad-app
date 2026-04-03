import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity } from "@/lib/storage";
import { usePools } from "@/hooks/usePools";
import { useSearchUsers, useFollow, useUnfollow } from "@/hooks/useUsers";
import { useVenues } from "@/hooks/useVenues";
import { PoolCard } from "@/components/PoolCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

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

  if (search.length >= 2) {
    return (
      <MobileFrame>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-24">
          <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
            <div className="relative">
              <SearchIcon size={18} className="absolute left-3 top-3 text-muted-foreground" />
              <input value={search} onChange={e => { setSearch(e.target.value); setSelectedCategory(""); }}
                className="input-premium w-full pl-10 pr-4 py-3"
                placeholder="Search pools, venues..." autoFocus />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="px-4 mt-4 space-y-3">
            {searchResults.length > 0 ? searchResults.map(p => (
              <motion.div key={p.id} variants={item}><PoolCard pool={p} /></motion.div>
            )) : <p className="text-muted-foreground text-center py-8">No results found</p>}
          </motion.div>
          <BottomNav />
        </motion.div>
      </MobileFrame>
    );
  }

  if (selectedCategory) {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <MobileFrame>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-24">
          <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3 flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedCategory("")} className="text-muted-foreground">&larr;</motion.button>
            <h2 className="font-heading text-lg font-semibold">{cat?.emoji} {cat?.label}</h2>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="px-4 mt-4 space-y-3">
            {categoryPools.length > 0 ? categoryPools.map(p => (
              <motion.div key={p.id} variants={item}><PoolCard pool={p} /></motion.div>
            )) : <p className="text-muted-foreground text-center py-8">No {cat?.label} pools in {city}</p>}
          </motion.div>
          <BottomNav />
        </motion.div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-24">
        {/* Glass Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="relative">
            <SearchIcon size={18} className="absolute left-3 top-3 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-premium w-full pl-10 pr-4 py-3"
              placeholder="Search pools, venues..." />
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
        </div>

        {/* Trending */}
        {trendingPools.length > 0 && (
          <div className="px-4 mt-5">
            <h2 className="font-heading font-semibold mb-3">Trending</h2>
            <motion.div variants={container} initial="hidden" animate="show" className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {trendingPools.slice(0, 4).map(p => (
                <motion.div key={p.id} variants={item} className="min-w-[250px]"><PoolCard pool={p} variant="compact" /></motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Categories */}
        <div className="px-4 mt-5">
          <h2 className="font-heading font-semibold mb-3">Discover by Category</h2>
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <motion.button key={cat.id} variants={item}
                whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setSelectedCategory(cat.id)}
                className="card-premium p-3 text-center">
                <span className="text-2xl">{cat.emoji}</span>
                <p className="text-xs font-medium mt-1">{cat.label}</p>
                <p className="text-[10px] text-muted-foreground">{catCounts[cat.id] || 0} pools</p>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Explore Other Cities */}
        <div className="px-4 mt-5">
          <h2 className="font-heading font-semibold mb-3">Explore Other Cities</h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {CITIES.filter(c => c !== city).map(c => (
              <button key={c} className="card-premium px-4 py-3 text-sm font-medium shrink-0">{c}</button>
            ))}
          </div>
        </div>

        {/* Active Users */}
        {suggestedUsers.length > 0 && (
          <div className="px-4 mt-5">
            <h2 className="font-heading font-semibold mb-3">Active in {city}</h2>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {suggestedUsers.slice(0, 5).map((u: any) => (
                <motion.div key={u.id} variants={item} className="flex items-center gap-3">
                  <img src={u.avatarUrl || ""} className="w-10 h-10 rounded-full avatar-ring cursor-pointer" onClick={() => navigate(`/profile/${u.id}`)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">@{u.username} · {u.rating}</p>
                  </div>
                  <button onClick={() => handleFollow(u.id, u.isFollowing)}
                    className={u.isFollowing ? "btn-secondary px-3 py-1 rounded-full text-xs font-semibold" : "btn-primary px-3 py-1 rounded-full text-xs font-semibold"}
                  >{u.isFollowing ? "Following" : "Follow"}</button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Venues */}
        {venues.length > 0 && (
          <div className="px-4 mt-5 mb-4">
            <h2 className="font-heading font-semibold mb-3">Popular Venues</h2>
            <motion.div variants={container} initial="hidden" animate="show" className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {venues.map((v: any) => (
                <motion.div key={v.id} variants={item}
                  whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => navigate(`/venue/${v.id}`)}
                  className="card-premium p-3 min-w-[200px] cursor-pointer shrink-0">
                  <p className="font-medium text-sm">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.type} · {v.area}</p>
                  <p className="text-xs text-muted-foreground mt-1">&#11088; {v.rating} · {v.poolsThisWeek} pools</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        <BottomNav />
      </motion.div>
    </MobileFrame>
  );
};

export default Explore;
