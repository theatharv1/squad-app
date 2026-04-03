import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PenSquare } from "lucide-react";
import { useConversations } from "@/hooks/useMessages";
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

const Messages = () => {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useConversations();

  const filtered = filter === "all" ? conversations
    : filter === "group" ? conversations.filter(c => c.isGroup)
    : conversations.filter(c => !c.isGroup);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold">Messages</h1>
            <button className="p-2"><PenSquare size={20} /></button>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-2" />
        </div>

        <div className="flex gap-2 px-4 mt-3">
          {["all", "group", "dm"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`pill ${filter === f ? "pill-active" : "pill-inactive"}`}
            >{f === "all" ? "All" : f === "group" ? "Activity Chats" : "Direct"}</button>
          ))}
        </div>

        <div className="mt-3">
          {isLoading ? (
            <div className="space-y-2 px-4">
              {[1,2,3].map(i => <div key={i} className="shimmer rounded-2xl h-16" />)}
            </div>
          ) : filtered.length > 0 ? (
            <motion.div variants={container} initial="hidden" animate="show">
              {filtered.map(conv => (
                <motion.div key={conv.id} variants={item}
                  whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
                  <div className="relative shrink-0">
                    <img src={conv.avatar} className="w-12 h-12 rounded-full object-cover avatar-ring" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{conv.emoji ? `${conv.emoji} ` : ""}{conv.name}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{formatTime(conv.timestamp)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.isGroup && conv.lastSender ? `${conv.lastSender}: ` : ""}{conv.lastMessage}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No conversations yet</p>
          )}
        </div>

        <BottomNav />
      </motion.div>
    </MobileFrame>
  );
};

export default Messages;
