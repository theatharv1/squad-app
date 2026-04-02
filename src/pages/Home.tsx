import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ChevronDown, Plus } from "lucide-react";
import { POOLS, CATEGORIES, CURRENT_USER, USERS, CITIES } from "@/data/mockData";
import { getCity, setCity, getJoinedPools, getFollowing, getCreatedPools } from "@/lib/storage";
import PoolCard from "@/components/PoolCard";
import BottomNav from "@/components/layout/BottomNav";
import MobileFrame from "@/components/layout/MobileFrame";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Home() {
  const navigate = useNavigate();
  const [city, setCityState] = useState(getCity());
  const [filter, setFilter] = useState("all");
  const [, setRefresh] = useState(0);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const following = getFollowing();

  const allPools = [...getCreatedPools(), ...POOLS];
  const cityPools = allPools.filter(p => p.city === city);
  const filteredPools = filter === "all" ? cityPools : cityPools.filter(p => p.category === filter);
  const tonightPools = cityPools.filter(p => p.date === "Today").sort((a, b) => (a.spotsTotal - a.spotsFilled) - (b.spotsTotal - b.spotsFilled));
  const followingPools = allPools.filter(p => following.includes(p.host.id)).slice(0, 3);
  const trendingPools = cityPools.sort((a, b) => b.spotsFilled - a.spotsFilled).slice(0, 5);

  const handleCityChange = (c: string) => {
    setCity(c);
    setCityState(c);
    setCitySheetOpen(false);
  };

  const triggerRefresh = useCallback(() => setRefresh(r => r + 1), []);

  return (
    <MobileFrame>
      <div className="pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 pt-3 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-xl font-bold text-primary">SQUAD</h1>
              <Sheet open={citySheetOpen} onOpenChange={setCitySheetOpen}>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
                    <span className="text-xs font-medium">{city}</span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-card rounded-t-3xl max-w-[430px] mx-auto">
                  <SheetHeader>
                    <SheetTitle className="font-heading">Select City</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-2 gap-2 mt-4 pb-4">
                    {CITIES.map(c => (
                      <button
                        key={c}
                        onClick={() => handleCityChange(c)}
                        className={`py-3 px-4 rounded-xl text-sm font-medium border transition-colors ${
                          city === c ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/notifications")} className="relative">
                <Bell size={20} className="text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
              </button>
              <button onClick={() => navigate("/profile/me")}>
                <img src={CURRENT_USER.avatar} alt="" className="w-7 h-7 rounded-full border border-border" />
              </button>
            </div>
          </div>
        </div>

        {/* Happening Tonight */}
        {tonightPools.length > 0 && (
          <section className="px-4 mt-4">
            <h2 className="font-heading font-semibold text-base mb-3">Happening Tonight</h2>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {tonightPools.slice(0, 5).map(pool => (
                <PoolCard key={pool.id} pool={pool} variant="compact" onJoinChange={triggerRefresh} />
              ))}
            </div>
          </section>
        )}

        {/* Category Filters */}
        <div className="px-4 mt-5">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setFilter("all")}
              className={`shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  filter === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* All Pools */}
        <section className="px-4 mt-4 flex flex-col gap-3">
          {filteredPools.length > 0 ? (
            filteredPools.map(pool => (
              <PoolCard key={pool.id} pool={pool} onJoinChange={triggerRefresh} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🏜</p>
              <p className="text-sm font-medium mb-1">No pools here yet</p>
              <p className="text-xs text-muted-foreground mb-4">Be the first to raise one in {city}!</p>
              <button onClick={() => navigate("/create")} className="text-xs font-semibold text-primary">
                Create a Pool
              </button>
            </div>
          )}
        </section>

        {/* Following Activity */}
        {followingPools.length > 0 && (
          <section className="px-4 mt-6">
            <h2 className="font-heading font-semibold text-base mb-3">People you follow are up to</h2>
            <div className="flex flex-col gap-3">
              {followingPools.map(pool => (
                <div key={pool.id}>
                  <p className="text-xs text-muted-foreground mb-1.5">{pool.host.name} is hosting</p>
                  <PoolCard pool={pool} onJoinChange={triggerRefresh} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending */}
        {trendingPools.length > 0 && (
          <section className="px-4 mt-6 mb-4">
            <h2 className="font-heading font-semibold text-base mb-3">Popular in {city}</h2>
            <div className="flex flex-col gap-3">
              {trendingPools.slice(0, 3).map(pool => (
                <PoolCard key={pool.id} pool={pool} onJoinChange={triggerRefresh} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/create")}
        className="fixed bottom-20 right-4 max-w-[430px] z-40 bg-primary text-primary-foreground rounded-full px-4 py-2.5 flex items-center gap-1.5 shadow-lg"
        style={{ right: "max(1rem, calc(50% - 215px + 1rem))" }}
      >
        <Plus size={18} />
        <span className="text-xs font-semibold">Raise a Pool</span>
      </button>

      <BottomNav />
    </MobileFrame>
  );
}
