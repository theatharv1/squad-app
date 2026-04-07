import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useFollowers, useFollowing, useFollow, useUnfollow } from "@/hooks/useUsers";
import { MobileFrame } from "@/components/layout/MobileFrame";

const Followers = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("followers");
  const actualId = userId === "me" ? me?.id : userId;

  const { data: profileUser } = useUser(actualId);
  const { data: followersData } = useFollowers(actualId);
  const { data: followingData } = useFollowing(actualId);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  const users = tab === "followers" ? (followersData?.users || []) : (followingData?.users || []);
  const counts = { followers: followersData?.total || 0, following: followingData?.total || 0 };

  return (
    <MobileFrame>
      <div className="min-h-screen pb-12">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </motion.button>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// The crew</div>
              <h1 className="font-display font-bold text-xl mt-0.5">{profileUser?.name?.split(" ")[0] || "User"}</h1>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 mt-5"
        >
          <div className="flex gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
            {[
              { id: "followers", label: "Followers" },
              { id: "following", label: "Following" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60"
                }`}
              >
                <span>{t.label}</span>
                <span className="num">{counts[t.id as keyof typeof counts]}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* User list */}
        <div className="px-5 mt-5 space-y-2">
          {users.map((u: any, i: number) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-stage p-3 flex items-center gap-3"
            >
              <button
                onClick={() => navigate(`/profile/${u.id}`)}
                className="avatar-ring shrink-0"
              >
                <div className="w-12 h-12 rounded-full bg-card overflow-hidden">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display font-bold text-sm">{u.name?.[0]}</div>
                  )}
                </div>
              </button>
              <button
                onClick={() => navigate(`/profile/${u.id}`)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="font-display font-bold text-sm truncate">{u.name}</p>
                <p className="text-[11px] font-mono text-muted-foreground truncate">@{u.username} · {u.city}</p>
              </button>
              {u.id !== me?.id && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={async () => {
                    if (u.isFollowing) await unfollowMutation.mutateAsync(u.id);
                    else await followMutation.mutateAsync(u.id);
                  }}
                  className={`px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold transition-all ${
                    u.isFollowing
                      ? "bg-white/[0.04] border border-white/10 text-foreground/70"
                      : "bg-primary text-primary-foreground"
                  }`}
                  style={!u.isFollowing ? { boxShadow: "0 0 16px hsla(73, 100%, 50%, 0.3)" } : undefined}
                >
                  {u.isFollowing ? "Following" : "Follow"}
                </motion.button>
              )}
            </motion.div>
          ))}

          {users.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-stage flex flex-col items-center justify-center py-16 mt-4"
            >
              <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
                <UserX size={22} className="text-muted-foreground" strokeWidth={2} />
              </div>
              <p className="font-display font-bold text-sm">No {tab} yet</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">The squad is forming</p>
            </motion.div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
};

export default Followers;
