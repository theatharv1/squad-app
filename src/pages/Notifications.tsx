import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Bell, Users, Trophy, AlertCircle, Star, Zap } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { MobileFrame } from "@/components/layout/MobileFrame";

const typeConfig: Record<string, { Icon: any; color: string }> = {
  activity: { Icon: Zap, color: "text-primary" },
  reminder: { Icon: Bell, color: "text-accent" },
  social: { Icon: Users, color: "text-secondary" },
  pool_full: { Icon: Trophy, color: "text-primary" },
  cancelled: { Icon: AlertCircle, color: "text-destructive" },
  new_pool: { Icon: Zap, color: "text-primary" },
  payment: { Icon: Trophy, color: "text-accent" },
  review: { Icon: Star, color: "text-primary" },
  milestone: { Icon: Trophy, color: "text-primary" },
};

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];
  const filtered = filter === "all" ? notifications
    : filter === "activity" ? notifications.filter(n => ["activity", "pool_full", "cancelled", "reminder"].includes(n.type))
    : filter === "social" ? notifications.filter(n => ["social", "review", "milestone"].includes(n.type))
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
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <MobileFrame>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full glass flex items-center justify-center"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </motion.button>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Inbox</div>
                <h1 className="font-display font-bold text-xl mt-0.5">Notifications</h1>
              </div>
            </div>
            <button
              onClick={() => markAllRead.mutate()}
              className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
            >
              <Check size={12} strokeWidth={3} />
              Mark all
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 mt-5"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: "all", label: "All" },
              { id: "activity", label: "Activity" },
              { id: "social", label: "Social" },
              { id: "payments", label: "Payments" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
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

        {/* List */}
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
              {filtered.map((n, i) => {
                const config = typeConfig[n.type] || { Icon: Bell, color: "text-primary" };
                const { Icon, color } = config;
                return (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTap(n)}
                    className={`card-stage w-full p-4 text-left flex items-start gap-3 ${
                      !n.isRead ? "border-primary/30" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className={color} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-foreground" : "text-foreground/70"}`}>
                        {n.text}
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">{formatTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">all caught up</p>
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
};

export default Notifications;
