import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, MessageCircle, Star, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useFollow, useUnfollow } from "@/hooks/useUsers";
import { usePools } from "@/hooks/usePools";
import { useUserReviews } from "@/hooks/useReviews";
import { useCreateConversation } from "@/hooks/useMessages";
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
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="flex justify-center"><div className="shimmer rounded-full w-20 h-20" /></div>
        <div className="shimmer rounded-2xl h-6 w-40 mx-auto" />
        <div className="shimmer rounded-2xl h-4 w-32 mx-auto" />
        <div className="grid grid-cols-4 gap-2 px-6 mt-4">
          {[1,2,3,4].map(i => <div key={i} className="shimmer rounded-2xl h-14" />)}
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

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            {!isMe && <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><ArrowLeft size={20} /></motion.button>}
            <h1 className="font-heading text-lg font-bold">{isMe ? "Profile" : ""}</h1>
            {isMe && <button onClick={() => navigate("/settings")}><Settings size={20} /></button>}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
        </div>

        {/* Avatar & Info */}
        <div className="flex flex-col items-center mt-4">
          <img src={displayUser.avatarUrl || ""} className="w-20 h-20 rounded-full object-cover avatar-ring shadow-glow" />
          <h2 className="font-heading text-xl font-bold mt-3">{displayUser.name}</h2>
          <p className="text-sm text-muted-foreground">@{displayUser.username}</p>
          {displayUser.bio && <p className="text-sm text-center mt-1 px-8 text-muted-foreground">{displayUser.bio}</p>}
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin size={12} />{displayUser.city}</p>
        </div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-2 px-6 mt-4">
          {[
            { label: "Games", value: displayUser.totalGames },
            { label: "Followers", value: displayUser.followersCount, link: `/followers/${actualId}` },
            { label: "Following", value: displayUser.followingCount, link: `/followers/${actualId}` },
            { label: "Rating", value: displayUser.rating },
          ].map(s => (
            <motion.button key={s.label} variants={item}
              onClick={() => s.link && navigate(s.link)}
              className="card-premium text-center p-2">
              <p className="font-bold text-lg gradient-text">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 px-6 mt-4">
          {isMe ? (
            <button onClick={() => navigate("/profile/me/edit")} className="btn-secondary flex-1 py-2.5 rounded-xl text-sm font-semibold">Edit Profile</button>
          ) : (
            <>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleFollow}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${displayUser.isFollowing ? "btn-secondary" : "btn-primary"}`}
              >{displayUser.isFollowing ? "Following" : "Follow"}</motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleMessage}
                className="btn-secondary flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1">
                <MessageCircle size={14} /> Message
              </motion.button>
            </>
          )}
        </div>

        {/* Badges */}
        {displayUser.badges && displayUser.badges.length > 0 && (
          <div className="px-4 mt-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {displayUser.badges.map((b: any, i: number) => (
                <span key={i} className="gradient-primary-subtle px-3 py-1.5 rounded-full text-xs whitespace-nowrap">{b.icon} {b.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Karma (own profile) */}
        {isMe && (
          <div className="px-6 mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Karma</span><span>{displayUser.karma}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (displayUser.karma || 0) / 30)}%` }}
                transition={{ duration: 0.8 }} />
            </div>
          </div>
        )}

        {/* Sports */}
        {displayUser.sportsPlayed && displayUser.sportsPlayed.length > 0 && (
          <div className="px-4 mt-4 flex flex-wrap gap-1.5">
            {displayUser.sportsPlayed.map((s: string) => (
              <span key={s} className="pill pill-inactive">{s}</span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-4 mt-5">
          {["hosting", "reviews"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pill flex-1 py-2 text-sm font-medium ${activeTab === tab ? "pill-active" : "pill-inactive"}`}
            >{tab === "hosting" ? "Hosting" : "Reviews"}</button>
          ))}
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="px-4 mt-3 space-y-3">
          {activeTab === "hosting" && (
            hostedPools.length > 0 ? hostedPools.map(p => (
              <motion.div key={p.id} variants={item}><PoolCard pool={p} /></motion.div>
            )) : <p className="text-muted-foreground text-center py-4 text-sm">No hosted pools yet</p>
          )}
          {activeTab === "reviews" && (
            reviews.length > 0 ? reviews.map((r: any) => (
              <motion.div key={r.id} variants={item} className="card-premium p-3">
                <div className="flex items-center gap-2">
                  <img src={r.reviewerAvatar || ""} className="w-8 h-8 rounded-full avatar-ring" />
                  <div>
                    <p className="text-sm font-medium">{r.reviewerName}</p>
                    <div className="flex">{Array.from({ length: r.rating }, (_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}</div>
                  </div>
                </div>
                {r.text && <p className="text-sm text-muted-foreground mt-2">{r.text}</p>}
              </motion.div>
            )) : <p className="text-muted-foreground text-center py-4 text-sm">No reviews yet</p>
          )}
        </motion.div>

        {isMe && <BottomNav />}
      </motion.div>
    </MobileFrame>
  );
};

export default Profile;
