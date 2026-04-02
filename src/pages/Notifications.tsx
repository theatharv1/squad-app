import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { NOTIFICATIONS } from "@/data/mockData";
import { getReadNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/storage";
import MobileFrame from "@/components/layout/MobileFrame";

const typeStyles: Record<string, string> = {
  activity: "bg-success/20 text-success",
  reminder: "bg-warning/20 text-warning",
  social: "bg-accent/20 text-accent",
  pool_full: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
  new_pool: "bg-primary/20 text-primary",
  payment: "bg-success/20 text-success",
  review: "bg-warning/20 text-warning",
  milestone: "bg-primary/20 text-primary",
};

const typeIcons: Record<string, string> = {
  activity: "🟢", reminder: "🟡", social: "🔵", pool_full: "🟠",
  cancelled: "🔴", new_pool: "🟣", payment: "💰", review: "⭐", milestone: "🎉",
};

export default function Notifications() {
  const navigate = useNavigate();
  const [readIds, setReadIds] = useState(getReadNotifications());
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? NOTIFICATIONS :
    filter === "activity" ? NOTIFICATIONS.filter(n => ["activity", "pool_full", "cancelled", "reminder"].includes(n.type)) :
    filter === "social" ? NOTIFICATIONS.filter(n => ["social", "review", "milestone"].includes(n.type)) :
    NOTIFICATIONS.filter(n => n.type === "payment");

  const handleMarkAll = () => {
    markAllNotificationsRead();
    setReadIds(NOTIFICATIONS.map(n => n.id));
  };

  const handleTap = (n: typeof NOTIFICATIONS[0]) => {
    markNotificationRead(n.id);
    setReadIds(prev => [...prev, n.id]);
    if (n.linkTo) navigate(n.linkTo);
  };

  return (
    <MobileFrame>
      <div className="min-h-screen">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
            <h1 className="font-heading text-lg font-bold">Notifications</h1>
          </div>
          <button onClick={handleMarkAll} className="text-xs text-primary font-medium">Mark all read</button>
        </div>

        <div className="flex gap-2 px-4 mb-3">
          {["all", "activity", "social", "payments"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{f}</button>
          ))}
        </div>

        <div className="flex flex-col">
          {filtered.map(n => {
            const isRead = readIds.includes(n.id);
            return (
              <motion.button
                key={n.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTap(n)}
                className={`flex items-start gap-3 px-4 py-3 text-left transition-colors ${!isRead ? "border-l-2 border-l-primary" : ""}`}
              >
                <span className="text-base mt-0.5">{typeIcons[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!isRead ? "font-medium" : "text-muted-foreground"}`}>{n.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.timestamp}</p>
                </div>
                {n.actionLabel && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0">{n.actionLabel}</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </MobileFrame>
  );
}
