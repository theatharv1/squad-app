import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUser, useFollowers, useFollowing, useFollow, useUnfollow } from "@/hooks/useUsers";
import { MobileFrame } from "@/components/layout/MobileFrame";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-8">
        {/* Glass Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><ArrowLeft size={20} /></motion.button>
            <h1 className="font-heading text-lg font-bold">{profileUser?.name || "User"}</h1>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 px-4 mt-4">
          {["followers", "following"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pill flex-1 py-2 text-sm font-medium capitalize ${tab === t ? "pill-active" : "pill-inactive"}`}
            >{t} ({counts[t as keyof typeof counts]})</button>
          ))}
        </div>

        {/* User List */}
        <motion.div variants={container} initial="hidden" animate="show" className="px-4 mt-4 space-y-3">
          {users.map((u: any) => (
            <motion.div key={u.id} variants={item} className="flex items-center gap-3">
              <img src={u.avatarUrl || ""} className="w-10 h-10 rounded-full avatar-ring cursor-pointer" onClick={() => navigate(`/profile/${u.id}`)} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground">@{u.username} · {u.city}</p>
              </div>
              {u.id !== me?.id && (
                <button onClick={async () => {
                  if (u.isFollowing) await unfollowMutation.mutateAsync(u.id);
                  else await followMutation.mutateAsync(u.id);
                }} className={`${u.isFollowing ? "btn-secondary" : "btn-primary"} px-3 py-1 rounded-full text-xs font-semibold`}>
                  {u.isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </motion.div>
          ))}
          {users.length === 0 && (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <UserX size={40} className="mb-3 opacity-50" />
              <p className="text-sm">No {tab} yet</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </MobileFrame>
  );
};

export default Followers;
