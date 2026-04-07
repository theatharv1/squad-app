import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, MessageCircle, Star, MapPin, Trophy, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useFollow, useUnfollow } from "@/hooks/useUsers";
import { usePools } from "@/hooks/usePools";
import { useUserReviews } from "@/hooks/useReviews";
import { useCreateConversation } from "@/hooks/useMessages";
import { PoolCard } from "@/components/PoolCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const isMe = userId === "me" || userId === me?.id;
  const actualId = isMe ? me?.id : userId;

  const { data: profileUser, isLoading } = useUser(actualId);
  const { data: hostedPools = [] } = usePools(actualId ? { hostId: actualId, limit: "4" } : {});
  const { data: reviews = [] } = useUserReviews(actualId);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();
  const createConv = useCreateConversation();
  const [activeTab, setActiveTab] = useState("hosting");

  const displayUser = isMe ? { ...me, ...profileUser } : profileUser;

  if (isLoading || !displayUser) return (
    <MobileFrame>
      <div className="min-h-screen p-5 space-y-4">
        <div className="card-stage h-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" style={{ animation: "shimmer 2s infinite" }} />
        </div>
        <div className="card-stage h-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" style={{ animation: "shimmer 2s infinite" }} />
        </div>
      </div>
    </MobileFrame>
  );

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

  // Calculate tier based on karma
  const karma = displayUser.karma || 0;
  let tier = "BRONZE";
  let tierClass = "tier-bronze";
  let nextTier = "SILVER";
  let nextThreshold = 500;
  let prevThreshold = 0;
  if (karma >= 5000) { tier = "DIAMOND"; tierClass = "tier-diamond"; nextTier = "MAX"; nextThreshold = 5000; prevThreshold = 5000; }
  else if (karma >= 2000) { tier = "PLATINUM"; tierClass = "tier-platinum"; nextTier = "DIAMOND"; nextThreshold = 5000; prevThreshold = 2000; }
  else if (karma >= 1000) { tier = "GOLD"; tierClass = "tier-gold"; nextTier = "PLATINUM"; nextThreshold = 2000; prevThreshold = 1000; }
  else if (karma >= 500) { tier = "SILVER"; tierClass = "tier-silver"; nextTier = "GOLD"; nextThreshold = 1000; prevThreshold = 500; }
  const tierProgress = nextThreshold > prevThreshold ? Math.round(((karma - prevThreshold) / (nextThreshold - prevThreshold)) * 100) : 100;

  return (
    <MobileFrame>
      <div className="min-h-screen pb-28">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between">
            {!isMe ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full glass flex items-center justify-center"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </motion.button>
            ) : (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Player profile</div>
                <h1 className="font-display font-bold text-xl mt-0.5">@{displayUser.username}</h1>
              </div>
            )}
            {isMe && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate("/settings")}
                className="w-10 h-10 rounded-full glass flex items-center justify-center"
              >
                <Settings size={18} strokeWidth={2.2} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-5 pt-6"
        >
          <div className="card-stage p-5 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

            <div className="relative flex items-start gap-4">
              <div className="avatar-ring shrink-0">
                <div className="w-20 h-20 rounded-full bg-card overflow-hidden">
                  {displayUser.avatarUrl ? (
                    <img src={displayUser.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display font-bold text-3xl">{displayUser.name?.[0]}</div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-2xl truncate">{displayUser.name}</h2>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground">@{displayUser.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`tag tag-lime ${tierClass}`}>
                    <Trophy size={10} strokeWidth={3} />
                    {tier}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                    <MapPin size={10} />
                    {displayUser.city}
                  </div>
                </div>
              </div>
            </div>

            {displayUser.bio && (
              <p className="text-sm text-foreground/80 mt-4 leading-relaxed">{displayUser.bio}</p>
            )}

            {/* XP / tier bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap size={11} className="text-primary" strokeWidth={3} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">{karma} XP</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">→ {nextTier}</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${tierProgress}%` }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stat grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-5 mt-3"
        >
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Games", value: displayUser.totalGames || 0 },
              { label: "Followers", value: displayUser.followersCount || 0, link: `/followers/${actualId}` },
              { label: "Following", value: displayUser.followingCount || 0, link: `/followers/${actualId}` },
              { label: "Rating", value: displayUser.rating || "0.0" },
            ].map((s, i) => (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                onClick={() => s.link && navigate(s.link)}
                className="card-stage p-3 text-center"
              >
                <div className="font-display font-bold text-xl num leading-none">{s.value}</div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-5 mt-4 flex gap-2"
        >
          {isMe ? (
            <button
              onClick={() => navigate("/profile/me/edit")}
              className="flex-1 py-3 rounded-2xl bg-white/[0.04] border border-white/10 font-display font-bold text-sm"
            >
              Edit profile
            </button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleFollow}
                className={`flex-1 py-3 rounded-2xl font-display font-bold text-sm transition-all ${
                  displayUser.isFollowing
                    ? "bg-white/[0.04] border border-white/10 text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
                style={!displayUser.isFollowing ? { boxShadow: "0 0 24px hsla(73, 100%, 50%, 0.4)" } : undefined}
              >
                {displayUser.isFollowing ? "Following" : "Follow"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleMessage}
                className="px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 font-display font-bold text-sm flex items-center gap-1.5"
              >
                <MessageCircle size={14} strokeWidth={2.5} />
                Message
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Achievements / badges */}
        {displayUser.badges && displayUser.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6"
          >
            <div className="px-5 mb-3">
              <h3 className="font-display font-bold text-base">Achievements</h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">unlocked badges</p>
            </div>
            <div className="overflow-x-auto px-5 scrollbar-hide">
              <div className="flex gap-2 pb-1">
                {displayUser.badges.map((b: any, i: number) => (
                  <div key={i} className="card-stage px-4 py-2.5 shrink-0 flex items-center gap-2">
                    <Trophy size={14} className="text-primary" strokeWidth={2.5} />
                    <span className="font-display font-bold text-xs whitespace-nowrap">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Sports */}
        {displayUser.sportsPlayed && displayUser.sportsPlayed.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-5 mt-5"
          >
            <h3 className="font-display font-bold text-base mb-2">Plays</h3>
            <div className="flex flex-wrap gap-2">
              {displayUser.sportsPlayed.map((s: string) => (
                <span key={s} className="px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/10 text-foreground/70">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="px-5 mt-7"
        >
          <div className="flex gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
            {["hosting", "reviews"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60"
                }`}
              >
                {tab === "hosting" ? "Hosting" : "Reviews"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        <div className="px-5 mt-4 space-y-3">
          {activeTab === "hosting" && (
            hostedPools.length > 0 ? hostedPools.map((p, i) => (
              <PoolCard key={p.id} pool={p} index={i} />
            )) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">no hosted pools yet</p>
              </div>
            )
          )}
          {activeTab === "reviews" && (
            reviews.length > 0 ? reviews.map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-stage p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="avatar-ring">
                    <div className="w-10 h-10 rounded-full bg-card overflow-hidden">
                      {r.reviewerAvatar ? (
                        <img src={r.reviewerAvatar} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs">{r.reviewerName?.[0]}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm">{r.reviewerName}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: r.rating }, (_, i) => (
                        <Star key={i} size={10} className="text-primary fill-primary" />
                      ))}
                    </div>
                  </div>
                </div>
                {r.text && <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{r.text}</p>}
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">no reviews yet</p>
              </div>
            )
          )}
        </div>

        {isMe && <BottomNav />}
      </div>
    </MobileFrame>
  );
};

export default Profile;
