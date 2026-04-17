import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PenSquare, Users, Plus, X, ChevronRight } from "lucide-react";
import { useConversations } from "@/hooks/useMessages";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileFrame } from "@/components/layout/MobileFrame";

const GROUP_EMOJIS = [
  "\u26BD", "\u{1F3C0}", "\u{1F3CF}", "\u{1F3BE}", "\u{1F3B3}",
  "\u{1F3AE}", "\u{1F3B5}", "\u{1F37B}", "\u2615", "\u{1F4DA}",
  "\u{1F680}", "\u{1F525}",
];

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const Messages = () => {
  const [filter, setFilter] = useState("all");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("\u26BD");
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useConversations();

  const filtered =
    filter === "all"
      ? conversations
      : filter === "group"
        ? conversations.filter((c) => c.isGroup)
        : conversations.filter((c) => !c.isGroup);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d
      .toLocaleDateString([], { month: "short", day: "numeric" })
      .toUpperCase();
  };

  // Deterministic "online" based on conversation id hash
  const isOnline = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return Math.abs(h) % 3 === 0;
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    setShowCreateGroup(false);
    setToast("Group created!");
    setGroupName("");
    setGroupDesc("");
    setGroupEmoji("\u26BD");
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <MobileFrame>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-4 pt-4 pb-3" style={{ height: 44, boxSizing: "content-box" }}>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                Inbox
              </div>
              <h1 className="font-display font-bold text-xl mt-0.5">
                Squad chats
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowCreateGroup(true)}
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center"
              >
                <Users size={15} strokeWidth={2.2} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center"
              >
                <PenSquare size={15} strokeWidth={2.2} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 mt-3"
        >
          <div className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "group", label: "Squads" },
              { id: "dm", label: "DMs" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
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
        <div className="px-4 mt-3">
          {isLoading ? (
            <div className="space-y-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl h-[62px] relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
                    style={{ animation: "shimmer 2s infinite" }}
                  />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <motion.div
              className="space-y-1.5"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filtered.map((conv) => (
                <motion.button
                  key={conv.id}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 w-full flex items-center gap-3 text-left"
                >
                  {/* Avatar with online dot */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-card overflow-hidden">
                      {conv.avatar ? (
                        <img
                          src={conv.avatar}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-bold text-sm">
                          {conv.emoji || conv.name?.[0]}
                        </div>
                      )}
                    </div>
                    {isOnline(conv.id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
                    )}
                    {conv.isGroup && conv.members && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[9px] font-mono font-bold flex items-center justify-center px-1">
                        {conv.members}
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-display font-bold truncate">
                        {conv.name}
                      </p>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0">
                        {formatTime(conv.timestamp)}
                      </span>
                    </div>
                    <p className="text-[12px] text-foreground/50 truncate mt-0.5">
                      {conv.isGroup && conv.lastSender ? (
                        <span className="text-primary">{conv.lastSender}: </span>
                      ) : null}
                      {conv.lastMessage}
                    </p>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-foreground/20 shrink-0"
                  />
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
                no chats yet
              </p>
            </div>
          )}
        </div>

        {/* Create Group Sheet */}
        <AnimatePresence>
          {showCreateGroup && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateGroup(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={spring}
                className="fixed inset-x-0 bottom-0 z-50 bg-background border-t border-white/[0.06] rounded-t-3xl max-h-[85vh] overflow-y-auto"
                style={{ maxWidth: 430, margin: "0 auto" }}
              >
                <div className="px-5 pt-5 pb-8">
                  {/* Handle */}
                  <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display font-bold text-lg">
                      Create group
                    </h2>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowCreateGroup(false)}
                      className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>

                  {/* Emoji picker */}
                  <div className="mb-5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-foreground/50 mb-2 block">
                      Group avatar
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {GROUP_EMOJIS.map((e) => (
                        <motion.button
                          key={e}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => setGroupEmoji(e)}
                          className={`h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                            groupEmoji === e
                              ? "bg-primary/20 border-2 border-primary"
                              : "bg-white/[0.04] border border-white/[0.06]"
                          }`}
                        >
                          {e}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Group name */}
                  <div className="mb-4">
                    <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-foreground/50 mb-1.5 block">
                      Group name
                    </label>
                    <input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Friday Football"
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-foreground/50 mb-1.5 block">
                      Description
                    </label>
                    <textarea
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      placeholder="What's this group about?"
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Create button */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim()}
                    className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-sm disabled:opacity-40 transition-opacity"
                    style={{
                      boxShadow: groupName.trim()
                        ? "0 0 24px hsla(73, 100%, 50%, 0.35)"
                        : "none",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Plus size={16} strokeWidth={2.5} />
                      Create group
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold shadow-lg"
              style={{ boxShadow: "0 0 24px hsla(73, 100%, 50%, 0.4)" }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </MobileFrame>
  );
};

export default Messages;
