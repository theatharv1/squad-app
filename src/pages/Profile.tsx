import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  MessageCircle,
  Star,
  MapPin,
  Trophy,
  Share2,
  Grid3x3,
  Zap,
  Camera,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useFollow, useUnfollow } from "@/hooks/useUsers";
import { usePools } from "@/hooks/usePools";
import { useUserReviews } from "@/hooks/useReviews";
import { useCreateConversation } from "@/hooks/useMessages";
import { PoolCard } from "@/components/PoolCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";
import {
  tierFor,
  getLifetimeXP,
  ACHIEVEMENTS,
  getEarnedAchievements,
} from "@/lib/tiers";
import { fallbackThemeForId } from "@/lib/poolThemes";

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------
const SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: SPRING },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: SPRING },
};

// ---------------------------------------------------------------------------
// Category emojis for highlight circles
// ---------------------------------------------------------------------------
const CAT_EMOJIS: Record<string, string> = {
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

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
type ProfileTab = "posts" | "pools" | "reviews";

// Gradient palette for placeholder photo grid cells
const GRID_GRADIENTS = [
  "linear-gradient(135deg, hsl(73,80%,35%), hsl(73,100%,25%))",
  "linear-gradient(135deg, hsl(200,70%,35%), hsl(220,80%,25%))",
  "linear-gradient(135deg, hsl(330,70%,40%), hsl(280,70%,28%))",
  "linear-gradient(135deg, hsl(28,65%,38%), hsl(15,50%,25%))",
  "linear-gradient(135deg, hsl(160,60%,30%), hsl(140,55%,20%))",
  "linear-gradient(135deg, hsl(48,80%,40%), hsl(35,70%,28%))",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const isMe = userId === "me" || userId === me?.id;
  const actualId = isMe ? me?.id : userId;

  const { data: profileUser, isLoading } = useUser(actualId);
  const { data: hostedPools = [] } = usePools(
    actualId ? { hostId: actualId, limit: "50" } : {},
  );
  const { data: reviews = [] } = useUserReviews(actualId);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();
  const createConv = useCreateConversation();
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const displayUser = isMe ? { ...me, ...profileUser } : profileUser;

  // ---------- Loading skeleton (compact) ----------
  if (isLoading || !displayUser)
    return (
      <MobileFrame>
        <div className="min-h-screen">
          <div className="sticky top-0 z-30 h-11 bg-background/80 backdrop-blur-xl" />
          <div className="px-4 pt-4">
            {/* Avatar + stats row skeleton */}
            <div className="flex items-center gap-4">
              <div className="w-[72px] h-[72px] rounded-full bg-white/[0.04] animate-pulse shrink-0" />
              <div className="flex-1 flex items-center justify-around">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="h-4 w-8 rounded bg-white/[0.04] animate-pulse" />
                    <div className="h-2.5 w-12 rounded bg-white/[0.04] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            {/* Name + bio skeleton */}
            <div className="mt-3 space-y-2">
              <div className="h-3.5 w-28 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-40 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
            </div>
            {/* Buttons skeleton */}
            <div className="flex gap-2 mt-3">
              <div className="flex-1 h-9 rounded-lg bg-white/[0.04] animate-pulse" />
              <div className="flex-1 h-9 rounded-lg bg-white/[0.04] animate-pulse" />
            </div>
          </div>
        </div>
      </MobileFrame>
    );

  // ---------- Handlers ----------
  const handleFollow = async () => {
    if (!actualId) return;
    if (displayUser.isFollowing) await unfollowMutation.mutateAsync(actualId);
    else await followMutation.mutateAsync(actualId);
  };

  const handleMessage = async () => {
    if (!actualId) return;
    const result = await createConv.mutateAsync(actualId);
    navigate(`/messages/${result.id}`);
  };

  // ---------- Tier ----------
  const karma = displayUser.karma || 0;
  const totalXP = isMe ? Math.max(karma, getLifetimeXP()) : karma;
  const myTier = tierFor(totalXP);
  const earnedAchievements = isMe ? getEarnedAchievements() : [];

  // ---------- Deduplicated highlight categories from hosted pools ----------
  const highlightCategories = Array.from(
    new Map(
      hostedPools.map((p: any) => [
        p.category,
        { id: p.id, category: p.category, emoji: CAT_EMOJIS[p.category] || p.emoji || "\uD83C\uDFAF" },
      ]),
    ).values(),
  );

  return (
    <MobileFrame>
      <div className="min-h-screen pb-24">
        {/* ==============================================================
            HEADER — 44px, compact
        ============================================================== */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-11 px-4">
            {isMe ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                    Player profile
                  </span>
                  <span className="text-foreground/20">|</span>
                  <span className="font-bold text-[15px]">
                    @{displayUser.username}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/settings")}
                  className="w-9 h-9 flex items-center justify-center rounded-full -mr-1"
                >
                  <Settings size={20} strokeWidth={1.8} />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(-1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full -ml-1"
                >
                  <ArrowLeft size={20} strokeWidth={1.8} />
                </motion.button>
                <span className="font-bold text-[15px] absolute left-1/2 -translate-x-1/2">
                  @{displayUser.username}
                </span>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/settings")}
                  className="w-9 h-9 flex items-center justify-center rounded-full -mr-1"
                >
                  <Settings size={20} strokeWidth={1.8} />
                </motion.button>
              </>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* ==============================================================
            AVATAR + STATS ROW — Instagram layout
        ============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="px-4 pt-4 flex items-center gap-5"
        >
          {/* Avatar — 72px with tier ring */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING, delay: 0.08 }}
            className="shrink-0"
          >
            <div
              className="w-[72px] h-[72px] rounded-full overflow-hidden border-2"
              style={{
                borderColor: myTier.id !== "sprout" ? myTier.glow : "hsla(0,0%,100%,0.12)",
                boxShadow: myTier.id !== "sprout" ? `0 0 14px ${myTier.glow}` : undefined,
              }}
            >
              {displayUser.avatarUrl ? (
                <img
                  src={displayUser.avatarUrl}
                  className="w-full h-full object-cover"
                  alt={displayUser.name}
                />
              ) : (
                <div className="w-full h-full bg-card flex items-center justify-center font-bold text-2xl text-foreground/60">
                  {displayUser.name?.[0]}
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex-1 flex items-center justify-around"
          >
            {[
              {
                value: displayUser.totalGames || hostedPools.length,
                label: "Games",
              },
              {
                value: displayUser.followersCount || 0,
                label: "Followers",
                link: `/followers/${actualId}`,
              },
              {
                value: displayUser.followingCount || 0,
                label: "Following",
                link: `/followers/${actualId}`,
              },
            ].map((stat) => (
              <motion.button
                key={stat.label}
                variants={fadeIn}
                whileTap={{ scale: 0.96 }}
                onClick={() => stat.link && navigate(stat.link)}
                className="flex flex-col items-center"
              >
                <span className="text-lg font-bold leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {stat.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* ==============================================================
            NAME + USERNAME + TIER PILL + BIO
        ============================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING, delay: 0.15 }}
          className="px-4 mt-3"
        >
          {/* Name */}
          <h2 className="text-[15px] font-bold leading-tight">
            {displayUser.name}
          </h2>

          {/* @username + city */}
          <p className="text-[13px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1.5">
            <span>@{displayUser.username}</span>
            {displayUser.city && (
              <>
                <span className="text-foreground/20">&middot;</span>
                <span className="inline-flex items-center gap-0.5">
                  <MapPin size={10} strokeWidth={2.2} />
                  {displayUser.city}
                </span>
              </>
            )}
          </p>

          {/* Tier pill — tiny inline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING, delay: 0.2 }}
            className="mt-1.5"
          >
            <button
              onClick={() => navigate("/leaderboard")}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold border border-white/10 ${myTier.color}`}
              style={{
                background: `${myTier.glow.replace(/[\d.]+\)$/, "0.12)")}`,
              }}
            >
              <span>{myTier.emoji}</span>
              {displayUser.city
                ? myTier.cityLabel(displayUser.city)
                : myTier.label}
            </button>
          </motion.div>

          {/* Bio — max 2 lines */}
          {displayUser.bio && (
            <p className="text-[13px] text-foreground/70 leading-snug mt-1.5 line-clamp-2">
              {displayUser.bio}
            </p>
          )}

          {/* Sports pills */}
          {displayUser.sportsPlayed && displayUser.sportsPlayed.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {displayUser.sportsPlayed.map((sport: string) => (
                <span
                  key={sport}
                  className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-foreground/70"
                >
                  {sport}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* ==============================================================
            ACTION BUTTONS — compact h-9
        ============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.25 }}
          className="px-4 mt-3"
        >
          {isMe ? (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/profile/me/edit")}
                className="flex-1 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] font-bold"
              >
                Edit profile
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="flex-1 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] font-bold flex items-center justify-center gap-1.5"
              >
                <Share2 size={13} strokeWidth={2.2} />
                Share
              </motion.button>
            </div>
          ) : (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleFollow}
                className={`flex-1 h-9 rounded-lg text-[13px] font-bold transition-all ${
                  displayUser.isFollowing
                    ? "bg-white/[0.05] border border-white/[0.08] text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
                style={
                  !displayUser.isFollowing
                    ? { boxShadow: "0 0 20px hsla(73, 100%, 50%, 0.35)" }
                    : undefined
                }
              >
                {displayUser.isFollowing ? "Following" : "Follow"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleMessage}
                className="flex-1 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] font-bold flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={13} strokeWidth={2.2} />
                Message
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* ==============================================================
            STORY HIGHLIGHTS — horizontal scroll of hosted pool categories
        ============================================================== */}
        {highlightCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING, delay: 0.3 }}
            className="mt-4"
          >
            <div className="flex overflow-x-auto gap-3 px-4 pb-1 scrollbar-hide">
              {highlightCategories.map((hl: any, i: number) => {
                const theme = fallbackThemeForId(hl.id);
                return (
                  <motion.button
                    key={hl.category}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...SPRING, delay: 0.32 + i * 0.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(`/pool/${hl.id}`)}
                    className="flex flex-col items-center gap-1 shrink-0"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                      style={{
                        borderColor: theme.accent,
                        background: theme.gradient,
                      }}
                    >
                      <span className="text-lg">{hl.emoji}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate max-w-[56px]">
                      {hl.category.slice(0, 4)}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==============================================================
            TROPHY CASE — horizontal scroll of small circles
        ============================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING, delay: 0.35 }}
          className="mt-4 px-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy size={12} strokeWidth={2.2} className="text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Trophy case
              </span>
            </div>
            {isMe && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span className="text-primary font-bold">
                  {earnedAchievements.length}
                </span>
                /{ACHIEVEMENTS.length}
              </span>
            )}
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex overflow-x-auto gap-2.5 pb-1 scrollbar-hide"
          >
            {ACHIEVEMENTS.map((a) => {
              const earned = earnedAchievements.includes(a.id);
              return (
                <motion.div
                  key={a.id}
                  variants={scaleIn}
                  className="flex flex-col items-center gap-1 shrink-0"
                  title={a.description}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                      earned
                        ? "bg-primary/15 border-primary/50"
                        : "bg-white/[0.03] border-white/[0.06]"
                    }`}
                    style={
                      earned
                        ? { boxShadow: "0 0 10px hsla(73,100%,50%,0.2)" }
                        : undefined
                    }
                  >
                    <span
                      className={`text-base leading-none ${
                        earned ? "" : "opacity-20 grayscale"
                      }`}
                    >
                      {a.emoji}
                    </span>
                  </div>
                  <span
                    className={`text-[8px] font-mono uppercase tracking-wider leading-tight text-center max-w-[44px] truncate ${
                      earned ? "text-foreground/70" : "text-foreground/25"
                    }`}
                  >
                    {a.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ==============================================================
            TAB BAR — Posts | Pools | Reviews (border-bottom style)
        ============================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING, delay: 0.4 }}
          className="mt-4 border-b border-white/[0.06]"
        >
          <div className="flex">
            {(
              [
                { key: "posts" as const, icon: Grid3x3, label: "Posts" },
                { key: "pools" as const, icon: Zap, label: "Pools" },
                { key: "reviews" as const, icon: Star, label: "Reviews" },
              ] as const
            ).map((tab) => (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 relative text-[12px] font-bold transition-colors ${
                  activeTab === tab.key
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <tab.icon size={14} strokeWidth={2} />
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="profile-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={SPRING}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ==============================================================
            TAB CONTENT
        ============================================================== */}
        <AnimatePresence mode="wait">
          {/* -------- Posts tab (placeholder grid) -------- */}
          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {hostedPools.length > 0 ? (
                <div className="grid grid-cols-3 gap-[1px]">
                  {hostedPools.slice(0, 9).map((pool: any, i: number) => {
                    const theme = fallbackThemeForId(pool.id);
                    return (
                      <motion.button
                        key={pool.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(`/pool/${pool.id}`)}
                        className="aspect-square relative flex items-center justify-center"
                        style={{ background: theme.gradient }}
                      >
                        <span className="text-2xl">{pool.emoji || CAT_EMOJIS[pool.category] || "\uD83C\uDFAF"}</span>
                        <span
                          className="absolute bottom-1 left-1 right-1 text-[8px] font-mono uppercase tracking-wider truncate text-center"
                          style={{ color: theme.foreground }}
                        >
                          {pool.title}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14">
                  <div className="grid grid-cols-3 gap-[1px] w-48 mb-4 rounded-lg overflow-hidden">
                    {GRID_GRADIENTS.map((g, i) => (
                      <div
                        key={i}
                        className="aspect-square flex items-center justify-center opacity-30"
                        style={{ background: g }}
                      >
                        <Camera size={14} strokeWidth={1.5} className="text-white/50" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] font-bold text-foreground/50">
                    Share your first moment
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isMe
                      ? "Post photos from your pools to build your profile."
                      : "No posts yet."}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* -------- Pools tab -------- */}
          {activeTab === "pools" && (
            <motion.div
              key="pools"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-4 pt-3 space-y-2"
            >
              {hostedPools.length > 0 ? (
                hostedPools.map((pool: any, i: number) => (
                  <motion.div
                    key={pool.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: i * 0.05 }}
                  >
                    <PoolCard pool={pool} variant="compact" index={i} />
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-14">
                  <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center mb-2">
                    <Zap
                      size={22}
                      strokeWidth={1.3}
                      className="text-muted-foreground/30"
                    />
                  </div>
                  <p className="text-[13px] font-bold text-foreground/50">
                    No pools hosted yet
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isMe
                      ? "Host your first pool to see it here."
                      : "This player hasn't hosted any pools."}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* -------- Reviews tab -------- */}
          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-4 pt-3 space-y-2"
            >
              {reviews.length > 0 ? (
                reviews.map((r: any, i: number) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: i * 0.05 }}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-card overflow-hidden shrink-0 border border-white/[0.06]">
                        {r.reviewerAvatar ? (
                          <img
                            src={r.reviewerAvatar}
                            className="w-full h-full object-cover"
                            alt={r.reviewerName}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-foreground/60">
                            {r.reviewerName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[12px]">
                            {r.reviewerName}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating }, (_, idx) => (
                              <Star
                                key={idx}
                                size={9}
                                className="text-primary fill-primary"
                              />
                            ))}
                          </div>
                        </div>
                        {r.text && (
                          <p className="text-[11px] text-foreground/60 leading-snug mt-0.5">
                            {r.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-14">
                  <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center mb-2">
                    <Star
                      size={22}
                      strokeWidth={1.3}
                      className="text-muted-foreground/30"
                    />
                  </div>
                  <p className="text-[13px] font-bold text-foreground/50">
                    No reviews yet
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Reviews from pool hosts will appear here.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {isMe && <BottomNav />}
      </div>
    </MobileFrame>
  );
};

export default Profile;
