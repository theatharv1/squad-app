import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PenSquare } from "lucide-react";
import { useConversations } from "@/hooks/useMessages";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";

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
    return d.toLocaleDateString([], { month: "short", day: "numeric" }).toUpperCase();
  };

  return (
    <MobileFrame>
      <div className="min-h-screen pb-28">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Inbox</div>
              <h1 className="font-display font-bold text-2xl mt-0.5">Squad chats</h1>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <PenSquare size={16} strokeWidth={2.2} />
            </motion.button>
          </div>
        </div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 mt-5"
        >
          <div className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "group", label: "Squads" },
              { id: "dm", label: "DMs" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                  filter === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/[0.04] border border-white/10 text-foreground/70"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Conversations */}
        <div className="px-5 mt-5">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card-stage h-16 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" style={{ animation: "shimmer 2s infinite" }} />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((conv, i) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className="card-stage w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="avatar-ring shrink-0">
                    <div className="w-12 h-12 rounded-full bg-card overflow-hidden">
                      {conv.avatar ? (
                        <img src={conv.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-bold">{conv.name?.[0]}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display font-bold text-sm truncate">{conv.name}</p>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0">{formatTime(conv.timestamp)}</span>
                    </div>
                    <p className="text-xs text-foreground/60 truncate mt-0.5">
                      {conv.isGroup && conv.lastSender ? <span className="text-primary">{conv.lastSender}: </span> : ""}
                      {conv.lastMessage}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">no chats yet</p>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </MobileFrame>
  );
};

export default Messages;
