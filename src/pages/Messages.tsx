import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PenSquare } from "lucide-react";
import { CONVERSATIONS } from "@/data/mockData";
import BottomNav from "@/components/layout/BottomNav";
import MobileFrame from "@/components/layout/MobileFrame";

export default function Messages() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? CONVERSATIONS
    : filter === "group"
      ? CONVERSATIONS.filter(c => c.isGroup)
      : CONVERSATIONS.filter(c => !c.isGroup);

  return (
    <MobileFrame>
      <div className="pb-24">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="font-heading text-xl font-bold">Messages</h1>
          <button><PenSquare size={20} className="text-muted-foreground" /></button>
        </div>

        <div className="flex gap-2 px-4 mb-3">
          {[
            { id: "all", label: "All" },
            { id: "group", label: "Activity Chats" },
            { id: "dm", label: "Direct" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                filter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {filtered.map(conv => (
            <motion.button
              key={conv.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/messages/${conv.id}`)}
              className="flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
            >
              <div className="relative shrink-0">
                <img src={conv.avatar} alt="" className="w-12 h-12 rounded-full" />
                {conv.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {conv.emoji && <span className="text-sm">{conv.emoji}</span>}
                  <span className="text-sm font-semibold truncate">{conv.name}</span>
                  {conv.isGroup && <span className="text-[10px] text-muted-foreground shrink-0">{conv.members} members</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.lastSender ? `${conv.lastSender}: ` : ""}{conv.lastMessage}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground">{conv.timestamp}</span>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{conv.unread}</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
