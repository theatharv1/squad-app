import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, MapPin, Clock, Users, IndianRupee, MessageCircle } from "lucide-react";
import { CATEGORIES } from "@/constants";
import { usePool, useJoinPool, useLeavePool, usePools } from "@/hooks/usePools";
import { useFollow, useUnfollow } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { PoolCard } from "@/components/PoolCard";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { toast } from "sonner";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const PoolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: pool, isLoading } = usePool(id);
  const { data: similarPools = [] } = usePools(pool ? { city: pool.city, category: pool.category, limit: "3" } : {});
  const joinMutation = useJoinPool();
  const leaveMutation = useLeavePool();
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();
  const [isFollowingHost, setIsFollowingHost] = useState(false);

  if (isLoading || !pool) return (
    <MobileFrame>
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="shimmer rounded-2xl h-32" />
        <div className="shimmer rounded-2xl h-8 w-3/4" />
        <div className="shimmer rounded-2xl h-20" />
        <div className="grid grid-cols-2 gap-2">
          <div className="shimmer rounded-2xl h-20" />
          <div className="shimmer rounded-2xl h-20" />
        </div>
      </div>
    </MobileFrame>
  );

  const category = CATEGORIES.find(c => c.id === pool.category);
  const spotsLeft = pool.spotsTotal - pool.spotsFilled;
  const time = new Date(pool.scheduledTime);
  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const handleJoin = async () => {
    try {
      if (pool.joined) {
        await leaveMutation.mutateAsync(pool.id);
        toast("Left pool");
      } else {
        await joinMutation.mutateAsync(pool.id);
        toast.success("Joined pool!");
      }
    } catch (err: any) { toast.error(err.message); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: pool.title, text: `Join "${pool.title}" on SQUAD!`, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-24">
        {/* Hero Header */}
        <div className="h-32 bg-secondary flex items-center justify-center text-5xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          <span className="relative z-10">{pool.emoji}</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="absolute top-4 left-4 glass rounded-full p-2 z-10">
            <ArrowLeft size={18} className="text-white" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare}
            className="absolute top-4 right-4 glass rounded-full p-2 z-10">
            <Share2 size={18} className="text-white" />
          </motion.button>
        </div>

        <div className="px-4 -mt-4 relative z-10">
          {/* Status */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${spotsLeft === 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
              {spotsLeft === 0 ? "Full" : `${spotsLeft} spots left`}
            </span>
            {pool.isLive && (
              <span className="flex items-center gap-1 text-xs text-green-400 live-glow">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Live now
              </span>
            )}
          </div>

          <h1 className="font-heading text-2xl font-bold">{pool.title}</h1>

          {/* Host */}
          <motion.div whileHover={{ scale: 1.02, y: -2 }}
            className="card-premium flex items-center gap-3 mt-4 p-3 cursor-pointer">
            <img src={pool.host.avatar || ""} className="w-10 h-10 rounded-full avatar-ring cursor-pointer" onClick={() => navigate(`/profile/${pool.host.id}`)} />
            <div className="flex-1">
              <p className="font-medium text-sm">{pool.host.name}</p>
              <p className="text-xs text-muted-foreground">&#11088; {pool.host.rating} · {pool.host.showUpRate}% shows up</p>
            </div>
            {pool.host.id !== user?.id && (
              <button onClick={async () => {
                if (isFollowingHost) { await unfollowMutation.mutateAsync(pool.host.id); setIsFollowingHost(false); }
                else { await followMutation.mutateAsync(pool.host.id); setIsFollowingHost(true); }
              }} className={isFollowingHost ? "btn-secondary px-3 py-1 rounded-full text-xs font-semibold" : "btn-primary px-3 py-1 rounded-full text-xs font-semibold"}>
                {isFollowingHost ? "Following" : "Follow"}
              </button>
            )}
          </motion.div>

          {/* Info Grid */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-2 mt-4">
            {[
              { icon: MapPin, label: pool.area, sub: pool.venue },
              { icon: Clock, label: timeStr, sub: dateStr },
              { icon: IndianRupee, label: pool.costPerHead > 0 ? `₹${pool.costPerHead}` : "Free", sub: "per head" },
              { icon: Users, label: `${pool.spotsFilled}/${pool.spotsTotal}`, sub: "joined" },
            ].map((info, i) => (
              <motion.div key={i} variants={item} className="card-premium p-3">
                <info.icon size={14} className="text-muted-foreground mb-1" />
                <p className="text-sm font-medium">{info.label}</p>
                <p className="text-xs text-muted-foreground">{info.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Description */}
          {pool.description && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-1">About</h3>
              <p className="text-sm text-muted-foreground">{pool.description}</p>
            </div>
          )}

          {/* Tags */}
          {pool.tags && pool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {pool.tags.map(t => <span key={t} className="pill pill-inactive text-xs">{t}</span>)}
            </div>
          )}

          {/* Participants */}
          {pool.participants && pool.participants.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-2">Who's joining</h3>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {pool.participants.map(p => (
                  <div key={p.id} className="flex flex-col items-center shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${p.id}`)}>
                    <img src={p.avatarUrl || ""} className="w-10 h-10 rounded-full avatar-ring" />
                    <span className="text-[10px] mt-1 text-muted-foreground">{p.name.split(" ")[0]}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, pool.spotsTotal - pool.spotsFilled) }, (_, i) => (
                  <div key={`empty-${i}`} className="w-10 h-10 rounded-full bg-secondary border-2 border-dashed border-border shrink-0" />
                ))}
              </div>
            </div>
          )}

          {/* Chat link */}
          {pool.conversationId && pool.joined && (
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/messages/${pool.conversationId}`)}
              className="card-premium w-full mt-4 p-3 flex items-center gap-2 text-sm font-medium">
              <MessageCircle size={16} /> Pool Chat
            </motion.button>
          )}

          {/* Similar */}
          {similarPools.filter(p => p.id !== pool.id).length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Similar Pools</h3>
              <motion.div variants={container} initial="hidden" animate="show" className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {similarPools.filter(p => p.id !== pool.id).map(p => (
                  <motion.div key={p.id} variants={item} className="min-w-[250px]"><PoolCard pool={p} variant="compact" /></motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* Sticky Join Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 glass-strong z-20">
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-3" />
          <div className="max-w-[430px] mx-auto">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleJoin}
              disabled={joinMutation.isPending || leaveMutation.isPending || (!pool.joined && spotsLeft === 0)}
              className={`w-full py-3.5 rounded-xl font-bold disabled:opacity-50 ${pool.joined ? "btn-secondary" : "btn-primary shadow-glow"}`}>
              {pool.joined ? "Leave Pool" : pool.costPerHead > 0 ? `Join & Pay ₹${pool.costPerHead}` : "Join Pool"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </MobileFrame>
  );
};

export default PoolDetail;
