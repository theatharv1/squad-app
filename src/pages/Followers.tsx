import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { USERS, CURRENT_USER } from "@/data/mockData";
import { getFollowing, toggleFollow } from "@/lib/storage";
import MobileFrame from "@/components/layout/MobileFrame";
import { motion } from "framer-motion";

export default function Followers() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"followers" | "following">("followers");
  const [, setRefresh] = useState(0);
  const following = getFollowing();
  const user = userId === "user_me" || userId === "me" ? CURRENT_USER : USERS.find(u => u.id === userId);
  const list = tab === "followers" ? USERS.slice(0, 8) : USERS.slice(0, 5);

  return (
    <MobileFrame>
      <div className="min-h-screen">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-border">
          <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1 className="font-heading text-lg font-bold">{user?.name || "User"}</h1>
        </div>
        <div className="flex border-b border-border">
          {(["followers", "following"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-xs font-medium text-center capitalize relative ${tab === t ? "text-foreground" : "text-muted-foreground"}`}>
              {t} {t === "followers" ? `(${user?.followers || 0})` : `(${user?.following || 0})`}
              {tab === t && <motion.div layoutId="ftab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>
        <div className="flex flex-col">
          {list.map(u => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <img src={u.avatar} alt="" className="w-10 h-10 rounded-full cursor-pointer" onClick={() => navigate(`/profile/${u.id}`)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.username} · {u.city}</p>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { toggleFollow(u.id); setRefresh(r => r + 1); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${following.includes(u.id) ? "bg-secondary" : "bg-primary text-primary-foreground"}`}>
                {following.includes(u.id) ? "Following" : "Follow"}
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}
