import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { MobileFrame } from "@/components/layout/MobileFrame";

const typeIcons: Record<string, string> = { activity: "⚡", reminder: "⏰", social: "👥", pool_full: "🎉", cancelled: "❌", new_pool: "🆕", payment: "💰", review: "⭐", milestone: "🏆" };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];
  const filtered = filter === "all" ? notifications
    : filter === "activity" ? notifications.filter(n => ["activity","pool_full","cancelled","reminder"].includes(n.type))
    : filter === "social" ? notifications.filter(n => ["social","review","milestone"].includes(n.type))
    : notifications.filter(n => n.type === "payment");

  const handleTap = (n: any) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.linkTo) navigate(n.linkTo);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-8">
        {/* Glass Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><ArrowLeft size={20} /></motion.button>
              <h1 className="font-heading text-lg font-bold">Notifications</h1>
            </div>
            <button onClick={() => markAllRead.mutate()} className="text-xs text-primary font-semibold flex items-center gap-1 gradient-primary-subtle px-2.5 py-1 rounded-full">
              <Check size={14} /> Mark all read
            </button>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-2" />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 px-4 mt-3">
          {["all","activity","social","payments"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`pill capitalize ${filter === f ? "pill-active" : "pill-inactive"}`}
            >{f}</button>
          ))}
        </div>

        {/* Notification List */}
        <div className="mt-3">
          {isLoading ? (
            <div className="space-y-2 px-4">{[1,2,3].map(i => <div key={i} className="shimmer rounded-2xl h-14" />)}</div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show">
              {filtered.map(n => (
                <motion.div key={n.id} variants={item}
                  whileTap={{ scale: 0.98 }} onClick={() => handleTap(n)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-secondary/30 ${!n.isRead ? "border-l-2 border-primary bg-primary/5" : ""}`}>
                  <span className="w-8 h-8 rounded-full gradient-primary-subtle flex items-center justify-center text-sm shrink-0">
                    {typeIcons[n.type] || "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? "font-semibold" : "text-muted-foreground"}`}>{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatTime(n.createdAt)}</p>
                  </div>
                  {n.actionLabel && <span className="pill pill-inactive text-[10px] shrink-0">{n.actionLabel}</span>}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </MobileFrame>
  );
};

export default Notifications;
