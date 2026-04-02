import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { POOLS, CATEGORIES, USERS, CITIES, VENUES } from "@/data/mockData";
import { getCity, getFollowing, toggleFollow } from "@/lib/storage";
import PoolCard from "@/components/PoolCard";
import BottomNav from "@/components/layout/BottomNav";
import MobileFrame from "@/components/layout/MobileFrame";

export default function Explore() {
  const navigate = useNavigate();
  const city = getCity();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setRefresh] = useState(0);

  const following = getFollowing();
  const cityPools = POOLS.filter(p => p.city === city);
  const trendingPools = cityPools.sort((a, b) => b.spotsFilled - a.spotsFilled).slice(0, 4);
  const suggestedUsers = USERS.filter(u => u.city === city).slice(0, 5);

  const filteredByCategory = selectedCategory ? POOLS.filter(p => p.category === selectedCategory) : [];
  const searchResults = search.length > 1
    ? POOLS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.area.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <MobileFrame>
      <div className="pb-24">
        <div className="px-4 pt-4 pb-2">
          <h1 className="font-heading text-xl font-bold mb-3">Explore</h1>
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedCategory(null); }}
              placeholder="Search pools, people, places..."
              className="w-full bg-secondary rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {search.length > 1 ? (
          <section className="px-4 mt-2 flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">{searchResults.length} results</p>
            {searchResults.map(p => <PoolCard key={p.id} pool={p} />)}
            {searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm text-muted-foreground">No results found</p>
              </div>
            )}
          </section>
        ) : selectedCategory ? (
          <section className="px-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-base">
                {CATEGORIES.find(c => c.id === selectedCategory)?.emoji} {CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </h2>
              <button onClick={() => setSelectedCategory(null)} className="text-xs text-primary">Back</button>
            </div>
            <div className="flex flex-col gap-3">
              {filteredByCategory.length > 0 ? (
                filteredByCategory.map(p => <PoolCard key={p.id} pool={p} />)
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No pools in this category right now</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Trending */}
            <section className="px-4 mt-4">
              <h2 className="font-heading font-semibold text-base mb-3">Trending in {city}</h2>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                {trendingPools.map(p => <PoolCard key={p.id} pool={p} variant="compact" />)}
              </div>
            </section>

            {/* Categories */}
            <section className="px-4 mt-5">
              <h2 className="font-heading font-semibold text-base mb-3">Discover by Category</h2>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const count = POOLS.filter(p => p.category === cat.id).length;
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="bg-card rounded-2xl p-3 border border-border text-center"
                    >
                      <span className="text-2xl block">{cat.emoji}</span>
                      <p className="text-xs font-medium mt-1">{cat.label}</p>
                      <p className="text-[10px] text-muted-foreground">{count} pools</p>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* Other Cities */}
            <section className="px-4 mt-5">
              <h2 className="font-heading font-semibold text-base mb-3">Explore Other Cities</h2>
              <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                {CITIES.filter(c => c !== city).map(c => {
                  const count = POOLS.filter(p => p.city === c).length;
                  return (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.95 }}
                      className="min-w-[120px] bg-card rounded-2xl p-3 border border-border text-center shrink-0"
                    >
                      <p className="text-sm font-semibold">{c}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{count} pools</p>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* People */}
            <section className="px-4 mt-5">
              <h2 className="font-heading font-semibold text-base mb-3">Active in {city}</h2>
              <div className="flex flex-col gap-2.5">
                {suggestedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border">
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full cursor-pointer"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    />
                    <div className="flex-1 min-w-0" onClick={() => navigate(`/profile/${user.id}`)}>
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.username} · {user.rating} ★</p>
                      <div className="flex gap-1 mt-1">
                        {user.sportsPlayed.slice(0, 2).map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary">{s}</span>
                        ))}
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { toggleFollow(user.id); setRefresh(r => r + 1); }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        following.includes(user.id) ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {following.includes(user.id) ? "Following" : "Follow"}
                    </motion.button>
                  </div>
                ))}
              </div>
            </section>

            {/* Venues */}
            <section className="px-4 mt-5 mb-4">
              <h2 className="font-heading font-semibold text-base mb-3">Popular Venues</h2>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                {VENUES.filter(v => v.city === city).map(v => (
                  <motion.div
                    key={v.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/venue/${v.id}`)}
                    className="min-w-[180px] bg-card rounded-2xl p-3 border border-border cursor-pointer shrink-0"
                  >
                    <p className="text-sm font-semibold">{v.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{v.type} · {v.area}</p>
                    <p className="text-[10px] text-muted-foreground">{v.rating} ★ · {v.poolsThisWeek} pools this week</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
