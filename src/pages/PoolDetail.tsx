import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, MapPin, Clock, IndianRupee, MessageCircle, Star } from "lucide-react";
import { CATEGORIES } from "@/constants";
import { usePool, useJoinPool, useLeavePool, usePools } from "@/hooks/usePools";
import { useFollow, useUnfollow } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { PoolCard } from "@/components/PoolCard";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { toast } from "sonner";

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

  const category = CATEGORIES.find(c => c.id === pool.category);
  const spotsLeft = pool.spotsTotal - pool.spotsFilled;
  const fillPercent = Math.round((pool.spotsFilled / pool.spotsTotal) * 100);
  const time = new Date(pool.scheduledTime);
  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  const dayNum = time.getDate();
  const monthStr = time.toLocaleDateString([], { month: "short" }).toUpperCase();

  const handleJoin = async () => {
    try {
      if (pool.joined) {
        await leaveMutation.mutateAsync(pool.id);
        toast("Left pool");
      } else {
        await joinMutation.mutateAsync(pool.id);
        toast.success("You're in");
      }
    } catch (err: any) { toast.error(err.message); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: pool.title, text: `Join "${pool.title}" on SQUAD`, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen pb-32">
        {/* Hero gradient */}
        <div className="relative h-72 overflow-hidden">
          <div className="absolute inset-0 gradient-stage" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-secondary/15 blur-[80px]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />

          {/* Header buttons */}
          <div className="absolute top-5 left-0 right-0 flex items-center justify-between px-5 z-10">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleShare}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <Share2 size={18} strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Hero content */}
          <div className="relative z-10 h-full flex flex-col justify-end px-5 pb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">{category?.label || pool.category}</span>
              {pool.isLive && (
                <div className="tag tag-live">
                  <span className="pulse-dot" />
                  Live
                </div>
              )}
            </div>
            <h1 className="text-display font-bold leading-none">{pool.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">at {pool.venue}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 -mt-4 relative z-10">
          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-stage p-5 grid grid-cols-3 gap-4"
          >
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">When</div>
              <div className="font-display font-bold text-lg num leading-none mt-1">{dayNum}</div>
              <div className="text-[10px] font-mono text-primary mt-0.5">{monthStr} · {timeStr}</div>
            </div>
            <div className="border-l border-white/5 pl-4">
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Spots</div>
              <div className="font-display font-bold text-lg num leading-none mt-1">{spotsLeft}</div>
              <div className="text-[10px] font-mono text-primary mt-0.5">left of {pool.spotsTotal}</div>
            </div>
            <div className="border-l border-white/5 pl-4">
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Cost</div>
              <div className="font-display font-bold text-lg num leading-none mt-1">{pool.costPerHead > 0 ? `₹${pool.costPerHead}` : "Free"}</div>
              <div className="text-[10px] font-mono text-primary mt-0.5">per head</div>
            </div>
          </motion.div>

          {/* XP fill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Squad filling</span>
              <span className="text-[11px] font-mono num text-primary font-bold">{fillPercent}%</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${fillPercent}%` }} />
            </div>
          </motion.div>

          {/* Host card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-stage p-4 mt-5 flex items-center gap-3"
          >
            <button onClick={() => navigate(`/profile/${pool.host.id}`)} className="avatar-ring shrink-0">
              <div className="w-12 h-12 rounded-full bg-card overflow-hidden">
                {pool.host.avatar ? (
                  <img src={pool.host.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display font-bold">{pool.host.name?.[0]}</div>
                )}
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Hosted by</div>
              <p className="font-display font-bold text-sm truncate">{pool.host.name}</p>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star size={10} className="text-primary fill-primary" />
                  <span className="num text-foreground/80">{pool.host.rating}</span>
                </span>
                <span>·</span>
                <span className="num text-foreground/80">{pool.host.showUpRate}%</span>
                <span className="text-[9px] uppercase">show rate</span>
              </div>
            </div>
            {pool.host.id !== user?.id && (
              <button
                onClick={async () => {
                  if (isFollowingHost) { await unfollowMutation.mutateAsync(pool.host.id); setIsFollowingHost(false); }
                  else { await followMutation.mutateAsync(pool.host.id); setIsFollowingHost(true); }
                }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                  isFollowingHost
                    ? "bg-white/[0.04] border border-white/10 text-foreground/70"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isFollowingHost ? "Following" : "Follow"}
              </button>
            )}
          </motion.div>

          {/* Where */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card-stage p-4 mt-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <MapPin size={16} className="text-primary" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Location</div>
                <p className="font-display font-bold text-base mt-0.5">{pool.area}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{pool.venue}</p>
              </div>
            </div>
          </motion.div>

          {/* Time */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-stage p-4 mt-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20">
                <Clock size={16} className="text-secondary" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Schedule</div>
                <p className="font-display font-bold text-base mt-0.5">{dateStr}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{timeStr}</p>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          {pool.description && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-5"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary mb-2">// About</div>
              <p className="text-sm text-foreground/80 leading-relaxed">{pool.description}</p>
            </motion.div>
          )}

          {/* Tags */}
          {pool.tags && pool.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {pool.tags.map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/10 text-foreground/70">
                  #{t}
                </span>
              ))}
            </motion.div>
          )}

          {/* Participants */}
          {pool.participants && pool.participants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-base">The squad</h3>
                <span className="text-[11px] font-mono num text-primary">{pool.spotsFilled}/{pool.spotsTotal}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {pool.participants.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/profile/${p.id}`)}
                    className="flex flex-col items-center shrink-0 gap-1.5 w-14"
                  >
                    <div className="avatar-ring">
                      <div className="w-11 h-11 rounded-full bg-card overflow-hidden">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs">{p.name[0]}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider truncate w-full text-center text-muted-foreground">{p.name.split(" ")[0]}</span>
                  </button>
                ))}
                {Array.from({ length: Math.max(0, pool.spotsTotal - pool.spotsFilled) }, (_, i) => (
                  <div key={`empty-${i}`} className="w-11 h-11 rounded-full border-2 border-dashed border-white/10 shrink-0 mt-0" />
                ))}
              </div>
            </motion.div>
          )}

          {/* Pool chat */}
          {pool.conversationId && pool.joined && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/messages/${pool.conversationId}`)}
              className="card-stage w-full mt-5 p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                <MessageCircle size={16} className="text-accent" strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1">
                <p className="font-display font-bold text-sm">Squad chat</p>
                <p className="text-[11px] text-muted-foreground">drop in and say hi</p>
              </div>
              <div className="text-primary text-xl">→</div>
            </motion.button>
          )}

          {/* Similar */}
          {similarPools.filter(p => p.id !== pool.id).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-7"
            >
              <h3 className="font-display font-bold text-base mb-3">More like this</h3>
              <div className="space-y-3">
                {similarPools.filter(p => p.id !== pool.id).map((p, i) => (
                  <PoolCard key={p.id} pool={p} variant="compact" index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 px-5 pb-5 pt-4 glass-strong">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleJoin}
            disabled={joinMutation.isPending || leaveMutation.isPending || (!pool.joined && spotsLeft === 0)}
            className={`w-full py-4 rounded-2xl font-display font-bold text-base transition-all disabled:opacity-50 ${
              pool.joined
                ? "bg-white/[0.06] border border-white/10 text-foreground"
                : "bg-primary text-primary-foreground"
            }`}
            style={!pool.joined ? { boxShadow: "0 0 32px hsla(73, 100%, 50%, 0.4)" } : undefined}
          >
            {pool.joined ? "You're in · Leave?" : pool.costPerHead > 0 ? `Reserve · ₹${pool.costPerHead}` : "Reserve spot"}
          </motion.button>
        </div>
      </div>
    </MobileFrame>
  );
};

export default PoolDetail;
