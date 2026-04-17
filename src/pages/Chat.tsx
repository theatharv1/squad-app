import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Info,
  Send,
  Image,
  Mic,
  X,
  Play,
  Pause,
  Users,
  Plus,
  LogOut,
} from "lucide-react";
import { useMessages, useSendMessage, useConversations } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { connectSocket, getSocket } from "@/lib/socket";
import type { Message } from "@/types";

type ChatMessage = Message & {
  imageUrl?: string;
  isVoiceNote?: boolean;
  voiceDuration?: number;
};

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

// Mock waveform bars (fixed heights for visual consistency)
const WAVEFORM_BARS = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.65];

const MOCK_MEMBERS = [
  { id: "m1", name: "Arjun K", avatar: null },
  { id: "m2", name: "Priya S", avatar: null },
  { id: "m3", name: "Rahul M", avatar: null },
  { id: "m4", name: "Sneha T", avatar: null },
];

const IMAGE_GRADIENTS = [
  "from-violet-500/60 to-fuchsia-500/60",
  "from-cyan-500/60 to-blue-500/60",
  "from-amber-500/60 to-orange-500/60",
  "from-emerald-500/60 to-teal-500/60",
];

function VoiceNoteBubble({
  duration,
  isMe,
}: {
  duration: number;
  isMe: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex items-center gap-2.5 min-w-[180px]">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => setPlaying(!playing)}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isMe ? "bg-primary-foreground/20" : "bg-white/10"
        }`}
      >
        {playing ? (
          <Pause size={13} strokeWidth={2.5} />
        ) : (
          <Play size={13} strokeWidth={2.5} className="ml-0.5" />
        )}
      </motion.button>

      {/* Waveform */}
      <div className="flex items-center gap-[3px] flex-1 h-6">
        {WAVEFORM_BARS.map((h, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all ${
              isMe ? "bg-primary-foreground/50" : "bg-foreground/30"
            }`}
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>

      <span
        className={`text-[10px] font-mono shrink-0 ${
          isMe ? "text-primary-foreground/70" : "text-foreground/40"
        }`}
      >
        0:{String(duration).padStart(2, "0")}
      </span>
    </div>
  );
}

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allConvs = [] } = useConversations();
  const { data: fetchedMessages = [] } = useMessages(id);
  const sendMutation = useSendMessage();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const conv = allConvs.find((c) => c.id === id);
  const messages: ChatMessage[] = [...fetchedMessages, ...localMessages];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Socket handling -- preserved from original
  useEffect(() => {
    const socket = connectSocket() || getSocket();
    if (!socket || !id) return;

    socket.emit("join_conversation", id);
    const handler = (data: {
      conversationId: string;
      message: Message;
    }) => {
      if (data.conversationId === id && data.message.senderId !== user?.id) {
        setLocalMessages((prev) => [
          ...prev,
          { ...data.message, isMe: false },
        ]);
      }
    };
    socket.on("new_message", handler);

    return () => {
      socket.off("new_message", handler);
      socket.emit("leave_conversation", id);
    };
  }, [id, user?.id]);

  useEffect(() => {
    setLocalMessages([]);
  }, [fetchedMessages]);

  // Voice recording mock: auto-stop at 3 seconds
  useEffect(() => {
    if (isRecording) {
      setRecordTime(0);
      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 2) {
            // Will reach 3 on this tick
            stopRecording(prev + 1);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecording]);

  const stopRecording = (dur: number) => {
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    // Add a voice note message
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local_voice_${Date.now()}`,
        sender: user?.name || "",
        senderAvatar: user?.avatarUrl || "",
        senderId: user?.id || "",
        text: "",
        time: new Date().toISOString(),
        isMe: true,
        isSystem: false,
        isVoiceNote: true,
        voiceDuration: dur,
      },
    ]);
  };

  const handleSend = async () => {
    if (!text.trim() || !id) return;
    const msg = text.trim();
    setText("");

    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local_${Date.now()}`,
        sender: user?.name || "",
        senderAvatar: user?.avatarUrl || "",
        senderId: user?.id || "",
        text: msg,
        time: new Date().toISOString(),
        isMe: true,
        isSystem: false,
      },
    ]);

    const socket = getSocket();
    if (socket) {
      socket.emit("send_message", { conversationId: id, text: msg });
    } else {
      await sendMutation.mutateAsync({ conversationId: id, text: msg });
    }
  };

  const handleSendImage = () => {
    if (!id) return;
    setImagePreview(false);
    const gradIdx = Math.floor(Math.random() * IMAGE_GRADIENTS.length);
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local_img_${Date.now()}`,
        sender: user?.name || "",
        senderAvatar: user?.avatarUrl || "",
        senderId: user?.id || "",
        text: "",
        time: new Date().toISOString(),
        isMe: true,
        isSystem: false,
        imageUrl: IMAGE_GRADIENTS[gradIdx],
      },
    ]);
  };

  const handleMicTap = () => {
    if (isRecording) {
      stopRecording(recordTime);
    } else {
      setIsRecording(true);
    }
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    if (isNaN(d.getTime())) return t;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col pb-0">
        {/* Header - 48px */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-3 py-1.5">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center gap-2 h-[48px]">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={17} strokeWidth={2.5} />
            </motion.button>
            <div className="w-9 h-9 rounded-full bg-card overflow-hidden shrink-0">
              {conv?.avatar ? (
                <img
                  src={conv.avatar}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs">
                  {conv?.emoji || conv?.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-[14px] truncate leading-tight">
                {conv?.name || "Chat"}
              </p>
              {conv?.isGroup && (
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {conv.members} in squad
                </p>
              )}
            </div>
            {conv?.isGroup && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowGroupInfo(true)}
                className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0"
              >
                <Info size={15} strokeWidth={2.2} className="text-foreground/70" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.map((msg, i) => {
            if (msg.isSystem) {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-muted-foreground inline-block">
                    {msg.text}
                  </span>
                </motion.div>
              );
            }

            const showSender =
              conv?.isGroup &&
              !msg.isMe &&
              (i === 0 || messages[i - 1]?.senderId !== msg.senderId);

            // Image message
            if (msg.imageUrl) {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
                >
                  {showSender && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1 px-1">
                      {msg.sender}
                    </span>
                  )}
                  <div
                    className={`w-48 h-36 rounded-xl overflow-hidden bg-gradient-to-br ${msg.imageUrl} flex items-center justify-center`}
                  >
                    <span className="text-3xl">📷</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground mt-1 px-2">
                    {formatTime(msg.time)}
                  </span>
                </motion.div>
              );
            }

            // Voice note message
            if (msg.isVoiceNote) {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
                >
                  {showSender && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1 px-1">
                      {msg.sender}
                    </span>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 ${
                      msg.isMe
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                        : "bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-sm text-foreground"
                    }`}
                  >
                    <VoiceNoteBubble
                      duration={msg.voiceDuration || 3}
                      isMe={msg.isMe}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground mt-1 px-2">
                    {formatTime(msg.time)}
                  </span>
                </motion.div>
              );
            }

            // Text message
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
              >
                {showSender && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1 px-1">
                    {msg.sender}
                  </span>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 text-sm ${
                    msg.isMe
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm font-medium"
                      : "bg-white/[0.05] border border-white/[0.06] rounded-2xl rounded-bl-sm text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground mt-1 px-2">
                  {formatTime(msg.time)}
                </span>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Image preview strip */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 border-t border-white/[0.06] bg-background/90"
            >
              <div className="py-2 flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/60 to-fuchsia-500/60 flex items-center justify-center relative"
                >
                  <span className="text-lg">📷</span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setImagePreview(false)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <X size={10} strokeWidth={3} />
                  </motion.button>
                </motion.div>
                <div className="flex-1">
                  <p className="text-[11px] font-mono text-foreground/50">
                    1 image selected
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendImage}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 16px hsla(73, 100%, 50%, 0.35)",
                  }}
                >
                  <Send size={14} strokeWidth={3} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="px-4 py-2 border-t border-white/[0.06] bg-background/90 flex items-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-3 h-3 rounded-full bg-red-500"
              />
              <span className="text-red-400 text-xs font-mono font-bold">
                0:{String(recordTime).padStart(2, "0")}
              </span>
              <div className="flex-1" />
              <span className="text-[10px] font-mono text-foreground/40">
                Recording... auto-stops at 0:03
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="sticky bottom-0 px-3 py-2.5 bg-background/90 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            {/* Attachment */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setImagePreview(true)}
              className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0"
            >
              <Image size={16} strokeWidth={2} className="text-foreground/60" />
            </motion.button>

            {/* Text input */}
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2.5 text-sm placeholder:text-foreground/30 focus:outline-none focus:border-primary/40 transition-colors"
              placeholder="Type a message..."
            />

            {/* Send or Mic */}
            {text.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleSend}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
                style={{
                  boxShadow: "0 0 20px hsla(73, 100%, 50%, 0.4)",
                }}
              >
                <Send size={15} strokeWidth={3} />
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleMicTap}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  isRecording
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/[0.05] text-foreground/60"
                }`}
              >
                <Mic size={16} strokeWidth={2} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Group info panel */}
        <AnimatePresence>
          {showGroupInfo && conv?.isGroup && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowGroupInfo(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={spring}
                className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-[360px] bg-background border-l border-white/[0.06] overflow-y-auto"
              >
                <div className="px-5 pt-5 pb-8">
                  {/* Close */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display font-bold text-lg">
                      Group info
                    </h2>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowGroupInfo(false)}
                      className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>

                  {/* Group avatar & name */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-3xl mb-3">
                      {conv.emoji || conv.name?.[0]}
                    </div>
                    <input
                      defaultValue={conv.name}
                      className="text-center font-display font-bold text-lg bg-transparent border-b border-white/[0.1] focus:border-primary/50 outline-none pb-1 w-full max-w-[220px] transition-colors"
                    />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-2">
                      <Users size={11} className="inline mr-1" />
                      {conv.members} members
                    </span>
                  </div>

                  {/* Add members */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center gap-2 text-sm font-display font-bold text-primary mb-4"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    Add members
                  </motion.button>

                  {/* Members list */}
                  <div className="mb-6">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-foreground/40 mb-3">
                      Members
                    </p>
                    <div className="space-y-1">
                      {MOCK_MEMBERS.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                        >
                          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs font-display font-bold">
                            {m.name[0]}
                          </div>
                          <span className="flex-1 text-sm font-display font-medium truncate">
                            {m.name}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            className="text-[10px] font-mono text-red-400/70 px-2 py-1 rounded-lg bg-red-500/10"
                          >
                            Remove
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leave group */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 text-sm font-display font-bold text-red-400"
                  >
                    <LogOut size={15} strokeWidth={2.5} />
                    Leave group
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MobileFrame>
  );
};

export default Chat;
