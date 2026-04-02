import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, MessageCircle, Star, MapPin } from "lucide-react";
import { CURRENT_USER, USERS, POOLS, REVIEWS } from "@/data/mockData";
import { getFollowing, toggleFollow, getJoinedPools } from "@/lib/storage";
import BottomNav from "@/components/layout/BottomNav";
import MobileFrame from "@/components/layout/MobileFrame";
import PoolCard from "@/components/PoolCard";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isMe = userId === "me";
  const user = isMe ? CURRENT_USER : USERS.find(u => u.id === userId);
  const [activeTab, setActiveTab] = useState("hosting");
  const following = getFollowing();
  const [isFollowing, setIsFollowing] = useState(following.includes(userId || ""));

  if (!user) return <MobileFrame><div className="p-4"><button onClick={() => navigate(-1)} className="text-sm text-primary">Go back</button><p className="mt-4">User not found</p></div></MobileFrame>;

  const hostedPools = POOLS.filter(p => p.host.id === user.id).slice(0, 4);
  const joinedPoolIds = getJoinedPools();
  const joinedPools = POOLS.filter(p => joinedPoolIds.includes(p.id)).slice(0, 4);
  const userReviews = isMe ? REVIEWS : REVIEWS.slice(0, 3);

  const handleFollow = () => {
    const now = toggleFollow(user.id);
    setIsFollowing(now);
  };

  const tabs = ["hosting", "joined", "reviews"];

  return (
    <MobileFrame>
      <div className="pb-24">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          {!isMe && <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>}
          {isMe && <div />}
          <span className="text-sm font-medium">{isMe ? "Profile" : ""}</span>
          {isMe ? (
            <button onClick={() => navigate("/settings")}><Settings size={20} className="text-muted-foreground" /></button>
          ) : <div className="w-5" />}
        </div>

        {/* Avatar & Info */}
        <div className="flex flex-col items-center px-4 mt-2">
          <div className="relative">
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-full border-2 border-border" />
          </div>
          <h2 className="font-heading text-lg font-bold mt-3">{user.name}</h2>
          <p className="text-xs text-muted-foreground">{user.username}</p>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-[260px]">{user.bio}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{user.city}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around mt-4 px-6">
          {[
            { value: user.totalGames, label: "Games" },
            { value: user.followers, label: "Followers", link: `/followers/${user.id}` },
            { value: user.following, label: "Following", link: `/followers/${user.id}` },
            { value: user.rating, label: "Rating" },
          ].map(stat => (
            <button
              key={stat.label}
              onClick={() => stat.link && navigate(stat.link)}
              className="text-center"
            >
              <p className="font-heading font-bold text-base">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 px-4 mt-4">
          {isMe ? (
            <button onClick={() => navigate("/profile/me/edit")} className="flex-1 py-2.5 rounded-xl bg-secondary text-sm font-medium text-center">
              Edit Profile
            </button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                  isFollowing ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </motion.button>
              <button onClick={() => navigate("/messages")} className="flex-1 py-2.5 rounded-xl bg-secondary text-sm font-medium flex items-center justify-center gap-1.5">
                <MessageCircle size={14} /> Message
              </button>
            </>
          )}
        </div>

        {/* Badges */}
        <div className="px-4 mt-4">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {user.badges.map(b => (
              <div key={b.label} className="shrink-0 bg-card rounded-xl px-3 py-2 border border-border flex items-center gap-1.5">
                <span className="text-sm">{b.icon}</span>
                <span className="text-[10px] font-medium whitespace-nowrap">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Karma (own profile) */}
        {isMe && (
          <div className="mx-4 mt-3 bg-card rounded-2xl p-3 border border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold">{CURRENT_USER.karma} Karma</span>
              <span className="text-[10px] text-muted-foreground">Next level: 1500</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(CURRENT_USER.karma / 1500) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Sports */}
        <div className="flex gap-1.5 px-4 mt-3">
          {user.sportsPlayed.map(s => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-secondary">{s}</span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex mt-4 border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium text-center capitalize relative ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-4 mt-3 flex flex-col gap-3">
          {activeTab === "hosting" && (
            hostedPools.length > 0 ? hostedPools.map(p => <PoolCard key={p.id} pool={p} />) : (
              <p className="text-sm text-muted-foreground text-center py-8">No pools hosted yet</p>
            )
          )}
          {activeTab === "joined" && (
            joinedPools.length > 0 ? joinedPools.map(p => <PoolCard key={p.id} pool={p} />) : (
              <p className="text-sm text-muted-foreground text-center py-8">No pools joined yet</p>
            )
          )}
          {activeTab === "reviews" && (
            userReviews.map(r => (
              <div key={r.id} className="bg-card rounded-2xl p-3 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <img src={r.userAvatar} alt="" className="w-8 h-8 rounded-full cursor-pointer" onClick={() => navigate(`/profile/${r.userId}`)} />
                  <div>
                    <p className="text-xs font-semibold">{r.userName}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={10} className="text-warning fill-warning" />)}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-auto">{r.date}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.text}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">{r.activity}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {isMe && <BottomNav />}
    </MobileFrame>
  );
}
