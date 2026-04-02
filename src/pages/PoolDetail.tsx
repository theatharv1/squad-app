import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, MapPin, Clock, Users, Star, IndianRupee, MessageCircle } from "lucide-react";
import { POOLS, CATEGORIES, USERS } from "@/data/mockData";
import { getJoinedPools, toggleJoinPool, getFollowing, toggleFollow, getCreatedPools } from "@/lib/storage";
import PoolCard from "@/components/PoolCard";
import MobileFrame from "@/components/layout/MobileFrame";
import { toast } from "sonner";

export default function PoolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const allPools = [...getCreatedPools(), ...POOLS];
  const pool = allPools.find(p => p.id === id);
  const [isJoined, setIsJoined] = useState(getJoinedPools().includes(id || ""));
  const [animating, setAnimating] = useState(false);
  const following = getFollowing();
  const [isFollowingHost, setIsFollowingHost] = useState(following.includes(pool?.host.id || ""));

  if (!pool) return <MobileFrame><div className="p-4"><button onClick={() => navigate(-1)} className="text-sm text-primary">Go back</button><p className="mt-4">Pool not found</p></div></MobileFrame>;

  const cat = CATEGORIES.find(c => c.id === pool.category);
  const spotsLeft = pool.spotsTotal - pool.spotsFilled - (isJoined ? 1 : 0);
  const similarPools = POOLS.filter(p => p.category === pool.category && p.id !== pool.id).slice(0, 3);
  const joinedUsers = USERS.slice(0, pool.spotsFilled);

  const handleJoin = () => {
    if (animating) return;
    setAnimating(true);
    const joined = toggleJoinPool(pool.id);
    setTimeout(() => {
      setIsJoined(joined);
      setAnimating(false);
      if (joined) toast.success("You're in! Pool chat added to messages");
      else toast("Left the pool");
    }, 400);
  };

  const handleFollowHost = () => {
    const now = toggleFollow(pool.host.id);
    setIsFollowingHost(now);
  };

  return (
    <MobileFrame>
      <div className="pb-24">
        {/* Header */}
        <div className="relative h-48 bg-secondary flex items-center justify-center">
          <span className="text-6xl">{cat?.emoji}</span>
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-background/60 backdrop-blur flex items-center justify-center">
              <ArrowLeft size={18} />
            </button>
            <button className="w-8 h-8 rounded-full bg-background/60 backdrop-blur flex items-center justify-center">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className="px-4 -mt-4 relative">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              spotsLeft <= 2 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
            }`}>
              {spotsLeft <= 0 ? "Full" : spotsLeft <= 2 ? `${spotsLeft} spots left` : "Open"}
            </span>
            {pool.isLive && <span className="text-xs text-success flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />Live</span>}
          </div>

          <h1 className="font-heading text-xl font-bold leading-tight">{pool.title}</h1>

          {/* Host Card */}
          <div className="bg-card rounded-2xl p-3 border border-border mt-4 flex items-center gap-3">
            <img src={pool.host.avatar} alt="" className="w-12 h-12 rounded-full cursor-pointer" onClick={() => navigate(`/profile/${pool.host.id}`)} />
            <div className="flex-1">
              <p className="text-sm font-semibold">{pool.host.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{pool.host.rating} ★</span>
                <span>{pool.host.showUpRate}% shows up</span>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleFollowHost}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  isFollowingHost ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {isFollowingHost ? "Following" : "Follow"}
              </motion.button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: MapPin, label: pool.area, sub: pool.venue },
              { icon: Clock, label: pool.time, sub: pool.date },
              { icon: IndianRupee, label: pool.costPerHead === 0 ? "Free" : `₹${pool.costPerHead}`, sub: "per head" },
              { icon: Users, label: `${pool.spotsFilled + (isJoined ? 1 : 0)}/${pool.spotsTotal}`, sub: "joined" },
              { icon: Star, label: cat?.label || "", sub: cat?.emoji || "" },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-2.5 border border-border text-center">
                <item.icon size={14} className="mx-auto text-muted-foreground mb-1" />
                <p className="text-xs font-medium leading-tight">{item.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-1">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{pool.description}</p>
          </div>

          {/* Tags */}
          {pool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {pool.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
              ))}
            </div>
          )}

          {/* Joined Players */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-3">Who's joining ({pool.spotsFilled + (isJoined ? 1 : 0)}/{pool.spotsTotal})</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {joinedUsers.map(u => (
                <div key={u.id} className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => navigate(`/profile/${u.id}`)}>
                  <img src={u.avatar} alt="" className="w-10 h-10 rounded-full" />
                  <span className="text-[10px] text-muted-foreground max-w-[48px] truncate">{u.name.split(" ")[0]}</span>
                </div>
              ))}
              {Array.from({ length: Math.max(0, spotsLeft) }).slice(0, 4).map((_, i) => (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">?</div>
                  <span className="text-[10px] text-muted-foreground">Open</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="mt-5 bg-card rounded-2xl p-4 border border-border">
            <div className="h-24 bg-secondary rounded-xl mb-3 flex items-center justify-center">
              <MapPin size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">{pool.venue}</p>
            <p className="text-xs text-muted-foreground">{pool.area}, {pool.city}</p>
          </div>

          {/* Similar Pools */}
          {similarPools.length > 0 && (
            <div className="mt-5 mb-4">
              <h3 className="text-sm font-semibold mb-3">You might also like</h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                {similarPools.map(p => <PoolCard key={p.id} pool={p} variant="compact" />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Join */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 bg-background/95 backdrop-blur border-t border-border z-50">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleJoin}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
            isJoined ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {animating ? "..." : isJoined ? "Leave Pool" : pool.costPerHead === 0 ? "Join Pool" : `Join & Pay ₹${pool.costPerHead}`}
        </motion.button>
      </div>
    </MobileFrame>
  );
}
