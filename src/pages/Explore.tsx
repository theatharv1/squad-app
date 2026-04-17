import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Search as SearchIcon,
  ArrowLeft,
  Star,
  MapPin,
  TrendingUp,
  Users,
  ChevronRight,
} from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity } from "@/lib/storage";
import { usePools } from "@/hooks/usePools";
import { useSearchUsers, useFollow, useUnfollow } from "@/hooks/useUsers";
import { useVenues } from "@/hooks/useVenues";
import { EventCard } from "@/components/EventCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";
import type { Pool, Venue, User } from "@/types";

/* ── Animation presets ─────────────────────────────────────────── */
const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 30 },
  },
};

const slideIn = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 30 },
  },
};

/* ── Category emoji map ────────────────────────────────────────── */
const CATEGORY_EMOJIS: Record<string, string> = {
  football: "\u26BD",
  badminton: "\uD83C\uDFF8",
  cricket: "\uD83C\uDFCF",
  basketball: "\uD83C\uDFC0",
  tennis: "\uD83C\uDFBE",
  travel: "\u2708\uFE0F",
  party: "\uD83C\uDFB6",
  running: "\uD83C\uDFC3",
  cycling: "\uD83D\uDEB4",
  hiking: "\uD83C\uDFD4\uFE0F",
  gaming: "\uD83C\uDFAE",
};

/* ── Trending card with parallax ───────────────────────────────── */
function TrendingCard({ pool, index }: { pool: Pool; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({
    container: ref.current?.parentElement?.parentElement
      ? { current: ref.current.parentElement.parentElement as HTMLElement }
      : undefined,
  });
  const parallaxY = useTransform(scrollXProgress, [0, 1], [2, -2]);

  return (
    <motion.div
      ref={ref}
      variants={slideIn}
      style={{ y: parallaxY }}
      whileTap={{ scale: 0.96 }}
      className="shrink-0 w-[280px]"
    >
      <EventCard pool={pool} />
    </motion.div>
  );
}

/* ── Venue card ────────────────────────────────────────────────── */
function VenueCard({ venue }: { venue: Venue }) {
  const navigate = useNavigate();
  return (
    <motion.button
      variants={slideIn}
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate(`/venue/${venue.id}`)}
      className="shrink-0 w-[200px] bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-left"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <span className="text-[11px] font-mono num text-foreground/80">
          {venue.rating}
        </span>
        <span className="text-[9px] text-muted-foreground">
          ({venue.reviewCount})
        </span>
      </div>
      <h4 className="font-display font-bold text-sm leading-tight truncate text-foreground">
        {venue.name}
      </h4>
      <p className="text-[10px] text-muted-foreground mt-1 truncate flex items-center gap-1">
        <MapPin size={9} className="shrink-0 opacity-60" />
        {venue.area}
      </p>
      <div className="flex items-center gap-1 mt-2">
        <Users size={9} className="text-primary/70" />
        <span className="text-[9px] font-mono uppercase tracking-wider text-primary/70">
          {venue.poolsThisWeek} pools this week
        </span>
      </div>
    </motion.button>
  );
}

/* ── Host card with spring entrance ────────────────────────────── */
function HostCard({
  user,
  onFollow,
}: {
  user: User;
  onFollow: (id: string, isFollowing: boolean) => void;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={fadeUp}
      whileTap={{ scale: 0.96 }}
      className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl"
    >
      <button
        onClick={() => navigate(`/profile/${user.id}`)}
        className="shrink-0"
      >
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 p-[1.5px]">
          <div className="w-full h-full rounded-full bg-card overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="w-full h-full object-cover"
                alt={user.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display font-bold text-sm">
                {user.name?.[0]}
              </div>
            )}
          </div>
        </div>
      </button>

      <button
        onClick={() => navigate(`/profile/${user.id}`)}
        className="flex-1 min-w-0 text-left"
      >
        <p className="font-display font-bold text-[13px] leading-tight truncate">
          {user.name}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
          @{user.username}
        </p>
      </button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={spring}
        onClick={(e) => {
          e.stopPropagation();
          onFollow(user.id, !!user.isFollowing);
        }}
        className={`px-3.5 py-1.5 rounded-full text-[11px] font-display font-bold transition-all ${
          user.isFollowing
            ? "bg-white/[0.06] border border-white/[0.08] text-foreground/70"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {user.isFollowing ? "Following" : "Follow"}
      </motion.button>
    </motion.div>
  );
}

/* ── Main Explore page ─────────────────────────────────────────── */
const Explore = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const city = getCity();

  /* Data hooks */
  const { data: searchResults = [] } = usePools(
    search.length >= 2 ? { search, city } : {}
  );
  const { data: categoryPools = [] } = usePools(
    selectedCategory ? { city, category: selectedCategory } : {}
  );
  const { data: allPools = [] } = usePools({ city });
  const { data: suggestedUsers = [] } = useSearchUsers({ city, limit: "10" });
  const { data: venues = [] } = useVenues(city);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (isFollowing) await unfollowMutation.mutateAsync(userId);
    else await followMutation.mutateAsync(userId);
  };

  /* Trending: top 8 pools by fill rate */
  const trending = [...allPools]
    .sort(
      (a, b) =>
        b.spotsFilled / (b.spotsTotal || 1) -
        a.spotsFilled / (a.spotsTotal || 1)
    )
    .slice(0, 8);

  /* Pool counts per category */
  const categoryCounts: Record<string, number> = {};
  allPools.forEach((p: Pool) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  /* ── Search results view ─────────────────────────────────────── */
  if (search.length >= 2) {
    return (
      <MobileFrame>
        <div className="min-h-screen pb-24">
          {/* Header */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-4 pt-4 pb-3">
            <div className="relative">
              <SearchIcon
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary"
                strokeWidth={2.5}
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedCategory("");
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                placeholder="Search pools, venues, hosts..."
                autoFocus
              />
            </div>
            <div className="h-[1px] mt-3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring}
              className="px-4 mt-3 space-y-2"
            >
              {searchResults.length > 0 ? (
                searchResults.map((p: Pool) => (
                  <motion.div key={p.id} variants={fadeUp}>
                    <EventCard pool={p} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20">
                  <SearchIcon
                    size={40}
                    className="mx-auto opacity-20 mb-3"
                  />
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    No results for "{search}"
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <BottomNav />
        </div>
      </MobileFrame>
    );
  }

  /* ── Category detail view ────────────────────────────────────── */
  if (selectedCategory) {
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);
    const emoji = CATEGORY_EMOJIS[selectedCategory] || "";

    return (
      <MobileFrame>
        <div className="min-h-screen pb-24">
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={spring}
                onClick={() => setSelectedCategory("")}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center"
              >
                <ArrowLeft size={16} strokeWidth={2.5} />
              </motion.button>
              <span className="text-xl">{emoji}</span>
              <h2 className="font-display text-lg font-bold">{cat?.label}</h2>
            </div>
            <div className="h-[1px] mt-3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring}
              className="px-4 mt-3 space-y-2"
            >
              {categoryPools.length > 0 ? (
                categoryPools.map((p: Pool) => (
                  <motion.div key={p.id} variants={fadeUp}>
                    <EventCard pool={p} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-4xl mb-3 opacity-30">{emoji}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    No {cat?.label} pools in {city}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <BottomNav />
        </div>
      </MobileFrame>
    );
  }

  /* ── Main creative Explore page ──────────────────────────────── */
  return (
    <MobileFrame>
      <div className="min-h-screen pb-24">
        {/* ── Sticky search header ──────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-4 pt-4 pb-3">
          <div className="relative">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary"
              strokeWidth={2.5}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Search pools, venues, hosts..."
            />
          </div>
          {/* Gradient accent line */}
          <div className="h-[1px] mt-3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="px-4 pt-5 pb-2"
        >
          <h1 className="font-display font-bold text-[22px] leading-tight">
            Find your next{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              move
            </span>
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1.5">
            {city} &middot; pools, people & venues
          </p>
        </motion.div>

        {/* ── Section 1: Trending Now ───────────────────────────── */}
        {trending.length > 0 && (
          <motion.section
            initial="hidden"
            animate="show"
            variants={stagger}
            className="mt-5"
          >
            <motion.div
              variants={fadeUp}
              className="px-4 flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                <h3 className="font-display font-bold text-base">
                  Trending now
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {trending.length} hot
              </span>
            </motion.div>

            <div className="overflow-x-auto px-4 scrollbar-hide">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="flex gap-3 pb-2"
              >
                {trending.map((pool: Pool, i: number) => (
                  <TrendingCard key={pool.id} pool={pool} index={i} />
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* ── Section 2: Browse by Vibe ─────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="mt-7 px-4"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between mb-3"
          >
            <h3 className="font-display font-bold text-base">
              Browse by vibe
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {CATEGORIES.length} vibes
            </span>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-2 gap-2.5"
          >
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.id}
                variants={fadeUp}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedCategory(cat.id)}
                className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 text-left transition-all hover:border-primary/20 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.15)] group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl leading-none">
                    {CATEGORY_EMOJIS[cat.id] || cat.label[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-[13px] leading-tight truncate group-hover:text-primary transition-colors">
                      {cat.label}
                    </p>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                      {categoryCounts[cat.id] || 0} pools
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-hover:text-primary/60 transition-colors"
                />
              </motion.button>
            ))}
          </motion.div>
        </motion.section>

        {/* ── Section 3: Other Scenes (cities) ──────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="mt-7"
        >
          <motion.div
            variants={fadeUp}
            className="px-4 flex items-center justify-between mb-3"
          >
            <h3 className="font-display font-bold text-base">Other scenes</h3>
          </motion.div>

          <div className="overflow-x-auto px-4 scrollbar-hide">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex gap-2 pb-1"
            >
              {CITIES.filter((c) => c !== city).map((c) => (
                <motion.button
                  key={c}
                  variants={slideIn}
                  whileTap={{ scale: 0.96 }}
                  className="shrink-0 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-foreground/70 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {c}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ── Section 4: Active in {city} (hosts) ───────────────── */}
        {suggestedUsers.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="mt-7 px-4"
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                <h3 className="font-display font-bold text-base">
                  Active in {city}
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                top hosts
              </span>
            </motion.div>

            <motion.div variants={stagger} className="space-y-2">
              {suggestedUsers.slice(0, 6).map((u: User) => (
                <HostCard key={u.id} user={u} onFollow={handleFollow} />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* ── Section 5: Iconic Spots (venues) ─────────────────── */}
        {venues.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="mt-7"
          >
            <motion.div
              variants={fadeUp}
              className="px-4 flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <h3 className="font-display font-bold text-base">
                  Iconic spots
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {venues.length} venues
              </span>
            </motion.div>

            <div className="overflow-x-auto px-4 scrollbar-hide">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="flex gap-3 pb-2"
              >
                {venues.map((v: Venue) => (
                  <VenueCard key={v.id} venue={v} />
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* ── Empty state ───────────────────────────────────────── */}
        {allPools.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="text-center py-24 px-6"
          >
            <p className="text-4xl mb-2 opacity-30">
              <SearchIcon size={40} className="mx-auto" />
            </p>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
              No pools in {city} yet
            </p>
          </motion.div>
        )}

        {/* Spacer for last section before BottomNav */}
        <div className="h-4" />

        <BottomNav />
      </div>
    </MobileFrame>
  );
};

export default Explore;
