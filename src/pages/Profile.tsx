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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useFollow, useUnfollow } from "@/hooks/useUsers";
import { usePools } from "@/hooks/usePools";
import { useUserReviews } from "@/hooks/useReviews";
import { useCreateConversation } from "@/hooks/useMessages";
import { PoolCard } from "@/components/PoolCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { TierBadge } from "@/components/TierBadge";
import {
  tierFor,
  getLifetimeXP,
  ACHIEVEMENTS,
  getEarnedAchievements,
} from "@/lib/tiers";

// ---------------------------------------------------------------------------
// Animation variants — spring physics for that premium feel
// ---------------------------------------------------------------------------
const SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };
const SPRING_BOUNCY = { type: "spring" as const, stiffness: 400, damping: 25 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: SPRING_BOUNCY,
  },
};

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------
type ProfileTab = "hosting" | "reviews";

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
  const [activeTab, setActiveTab] = useState<ProfileTab>("hosting");

  const displayUser = isMe ? { ...me, ...profileUser } : profileUser;

  // ---- Loading skeleton ----
  if (isLoading || !displayUser)
    return (
      <MobileFrame>
        <div className="min-h-screen">
          <div className="sticky top-0 z-30 h-11 bg-background/80 backdrop-blur-xl" />
          <div className="px-5 pt-6 space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
            <div className="h-12 rounded-2xl bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      </MobileFrame>
    );

  // ---- Handlers ----
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

  // ---- Tier ----
  const karma = displayUser.karma || 0;
  const totalXP = isMe ? Math.max(karma, getLifetimeXP()) : karma;
  const myTier = tierFor(totalXP);
  const earnedAchievements = isMe ? getEarnedAchievements() : [];

  return (
    <MobileFrame>
      <div className="min-h-screen pb-24">
        {/* ================================================================
            1. STICKY HEADER
        ================================================================ */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-11 px-4">
            {isMe ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                    Player profile
                  </span>
                  <span className="text-foreground/20">|</span>
                  <span className="font-display font-bold text-sm">
                    @{displayUser.username}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate("/settings")}
                  className="w-9 h-9 flex items-center justify-center rounded-full -mr-1"
                >
                  <Settings size={20} strokeWidth={1.8} />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate(-1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full -ml-1"
                >
                  <ArrowLeft size={20} strokeWidth={1.8} />
                </motion.button>
                <span className="font-display font-bold text-sm absolute left-1/2 -translate-x-1/2">
                  @{displayUser.username}
                </span>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate("/settings")}
                  className="w-9 h-9 flex items-center justify-center rounded-full -mr-1"
                >
                  <Settings size={20} strokeWidth={1.8} />
                </motion.button>
              </>
            )}
          </div>
          {/* Gradient line at bottom of header */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* ================================================================
            2. HERO CARD — Avatar + Identity + Tier + Bio
        ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.05 }}
          className="mx-4 mt-4 relative"
        >
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
            {/* Ambient glow blobs */}
            <div
              className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-60"
              style={{ background: `${myTier.glow.replace(/[\d.]+\)$/, "0.10)")}` }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
              style={{ background: "hsla(270, 80%, 60%, 0.10)" }}
            />

            <div className="relative flex flex-col items-center text-center">
              {/* Avatar with ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...SPRING_BOUNCY, delay: 0.1 }}
              >
                <div
                  className="w-20 h-20 rounded-full overflow-hidden"
                  style={
                    myTier.id !== "sprout"
                      ? {
                          boxShadow: `0 0 0 2.5px transparent, 0 0 0 3.5px ${myTier.glow}, 0 0 20px ${myTier.glow}`,
                          border: `2.5px solid ${myTier.glow}`,
                        }
                      : { border: "2.5px solid hsla(0,0%,100%,0.12)" }
                  }
                >
                  {displayUser.avatarUrl ? (
                    <img
                      src={displayUser.avatarUrl}
                      className="w-full h-full object-cover"
                      alt={displayUser.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-card flex items-center justify-center font-display font-bold text-3xl text-foreground/60">
                      {displayUser.name?.[0]}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Name */}
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.15 }}
                className="font-display font-bold text-lg mt-3 leading-tight"
              >
                {displayUser.name}
              </motion.h2>

              {/* Username */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...SPRING, delay: 0.18 }}
                className="text-[13px] text-muted-foreground leading-tight mt-0.5"
              >
                @{displayUser.username}
              </motion.p>

              {/* Tier badge with glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING_BOUNCY, delay: 0.22 }}
                className="mt-2"
              >
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border border-white/10 ${myTier.color}`}
                  style={{
                    background: `${myTier.glow.replace(/[\d.]+\)$/, "0.12)")}`,
                    boxShadow: `0 0 12px ${myTier.glow}`,
                  }}
                >
                  <span>{myTier.emoji}</span>
                  {displayUser.city
                    ? myTier.cityLabel(displayUser.city)
                    : myTier.label}
                </span>
              </motion.div>

              {/* City */}
              {displayUser.city && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...SPRING, delay: 0.25 }}
                  className="text-[12px] text-muted-foreground flex items-center gap-1 mt-2"
                >
                  <MapPin size={11} strokeWidth={2.2} />
                  {displayUser.city}
                </motion.p>
              )}

              {/* Bio */}
              {displayUser.bio && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...SPRING, delay: 0.28 }}
                  className="text-[13px] text-foreground/70 leading-relaxed mt-2 max-w-[280px]"
                >
                  {displayUser.bio}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ================================================================
            3. TIER BADGE (full identity card)
        ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.3 }}
          className="mx-4 mt-3"
        >
          <TierBadge
            xp={totalXP}
            city={displayUser.city}
            variant="full"
            onClick={() => navigate("/leaderboard")}
          />
        </motion.div>

        {/* ================================================================
            4. STAT GRID — 4 columns
        ================================================================ */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-2 mx-4 mt-4"
        >
          {[
            { value: displayUser.totalGames || hostedPools.length, label: "Games" },
            { value: displayUser.followersCount || 0, label: "Followers", link: `/followers/${actualId}` },
            { value: displayUser.followingCount || 0, label: "Following", link: `/followers/${actualId}` },
            { value: displayUser.rating || "0.0", label: "Rating" },
          ].map((stat) => (
            <motion.button
              key={stat.label}
              variants={fadeUp}
              whileTap={{ scale: 0.96 }}
              onClick={() => stat.link && navigate(stat.link)}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col items-center"
            >
              <span className="font-display font-bold text-xl num">
                {stat.value}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                {stat.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* ================================================================
            5. ACTION BUTTONS
        ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.38 }}
          className="mx-4 mt-4"
        >
          {isMe ? (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/profile/me/edit")}
                className="flex-1 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-[13px] font-display font-bold backdrop-blur-sm"
              >
                Edit profile
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="flex-1 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-[13px] font-display font-bold backdrop-blur-sm flex items-center justify-center gap-1.5"
              >
                <Share2 size={14} strokeWidth={2.2} />
                Share
              </motion.button>
            </div>
          ) : (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleFollow}
                className={`flex-1 py-3 rounded-2xl text-[13px] font-display font-bold transition-all ${
                  displayUser.isFollowing
                    ? "bg-white/[0.05] border border-white/[0.08] text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
                style={
                  !displayUser.isFollowing
                    ? { boxShadow: "0 0 24px hsla(73, 100%, 50%, 0.4)" }
                    : undefined
                }
              >
                {displayUser.isFollowing ? "Following" : "Follow"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleMessage}
                className="flex-1 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-[13px] font-display font-bold backdrop-blur-sm flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={14} strokeWidth={2.2} />
                Message
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* ================================================================
            6. TROPHY CASE
        ================================================================ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING, delay: 0.42 }}
          className="mx-4 mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={14} strokeWidth={2.2} className="text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                Trophy case
              </span>
            </div>
            {isMe && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span className="text-primary font-bold num">
                  {earnedAchievements.length}
                </span>
                {" / "}
                <span className="num">{ACHIEVEMENTS.length}</span>
              </span>
            )}
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-4 gap-2"
          >
            {ACHIEVEMENTS.map((a) => {
              const earned = earnedAchievements.includes(a.id);
              return (
                <motion.div
                  key={a.id}
                  variants={scaleIn}
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-center text-center px-1 transition-all ${
                    earned
                      ? "bg-primary/10 border-primary/40"
                      : "bg-white/[0.02] border-white/[0.05]"
                  }`}
                  style={
                    earned
                      ? { boxShadow: "0 0 16px hsla(73,100%,50%,0.2)" }
                      : undefined
                  }
                  title={a.description}
                >
                  <span
                    className={`text-2xl leading-none ${
                      earned ? "" : "opacity-20 grayscale"
                    }`}
                  >
                    {a.emoji}
                  </span>
                  <span
                    className={`text-[8px] font-mono uppercase tracking-wider mt-1.5 leading-tight ${
                      earned ? "text-foreground/80" : "text-foreground/25"
                    }`}
                  >
                    {a.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ================================================================
            7. SPORTS PLAYED — pill chips
        ================================================================ */}
        {displayUser.sportsPlayed && displayUser.sportsPlayed.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...SPRING, delay: 0.46 }}
            className="mx-4 mt-5"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
              Sports played
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {displayUser.sportsPlayed.map((sport: string, i: number) => (
                <motion.span
                  key={sport}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING, delay: 0.48 + i * 0.04 }}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-display font-medium text-foreground/80"
                >
                  {sport}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ================================================================
            8. TAB TOGGLE — Hosting / Reviews (pill style)
        ================================================================ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING, delay: 0.5 }}
          className="mx-4 mt-6"
        >
          <div className="flex rounded-full bg-white/[0.04] border border-white/[0.06] p-1">
            {(["hosting", "reviews"] as const).map((tab) => (
              <motion.button
                key={tab}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-full text-[12px] font-display font-bold capitalize transition-all relative ${
                  activeTab === tab
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="profile-tab-pill"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={SPRING}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ================================================================
            9. TAB CONTENT
        ================================================================ */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {/* -------- Hosting tab -------- */}
            {activeTab === "hosting" && (
              <motion.div
                key="hosting"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ ...SPRING }}
                className="px-4 space-y-3"
              >
                {hostedPools.length > 0 ? (
                  hostedPools.map((pool: any, i: number) => (
                    <motion.div
                      key={pool.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...SPRING, delay: i * 0.06 }}
                    >
                      <PoolCard pool={pool} variant="compact" index={i} />
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full border border-white/[0.08] flex items-center justify-center mb-3">
                      <Trophy
                        size={28}
                        strokeWidth={1.2}
                        className="text-muted-foreground/30"
                      />
                    </div>
                    <p className="text-sm font-display font-bold text-foreground/50">
                      No pools hosted yet
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">
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
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ ...SPRING }}
                className="px-4 space-y-2"
              >
                {reviews.length > 0 ? (
                  reviews.map((r: any, i: number) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...SPRING, delay: i * 0.06 }}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-card overflow-hidden shrink-0 border border-white/[0.06]">
                          {r.reviewerAvatar ? (
                            <img
                              src={r.reviewerAvatar}
                              className="w-full h-full object-cover"
                              alt={r.reviewerName}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs text-foreground/60">
                              {r.reviewerName?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-[13px]">
                              {r.reviewerName}
                            </span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: r.rating }, (_, idx) => (
                                <Star
                                  key={idx}
                                  size={10}
                                  className="text-primary fill-primary"
                                />
                              ))}
                            </div>
                          </div>
                          {r.text && (
                            <p className="text-[12px] text-foreground/65 leading-relaxed mt-1">
                              {r.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full border border-white/[0.08] flex items-center justify-center mb-3">
                      <Star
                        size={28}
                        strokeWidth={1.2}
                        className="text-muted-foreground/30"
                      />
                    </div>
                    <p className="text-sm font-display font-bold text-foreground/50">
                      No reviews yet
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      Reviews from pool hosts will appear here.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isMe && <BottomNav />}
      </div>
    </MobileFrame>
  );
};

export default Profile;
