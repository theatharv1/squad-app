import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Info, Send } from "lucide-react";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { useConversations } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { connectSocket, getSocket } from "@/lib/socket";
import type { Message } from "@/types";

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allConvs = [] } = useConversations();
  const { data: fetchedMessages = [] } = useMessages(id);
  const sendMutation = useSendMessage();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conv = allConvs.find(c => c.id === id);
  const messages = [...fetchedMessages, ...localMessages];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const socket = connectSocket() || getSocket();
    if (!socket || !id) return;

    socket.emit("join_conversation", id);
    const handler = (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === id && data.message.senderId !== user?.id) {
        setLocalMessages(prev => [...prev, { ...data.message, isMe: false }]);
      }
    };
    socket.on("new_message", handler);

    return () => {
      socket.off("new_message", handler);
      socket.emit("leave_conversation", id);
    };
  }, [id, user?.id]);

  useEffect(() => { setLocalMessages([]); }, [fetchedMessages]);

  const handleSend = async () => {
    if (!text.trim() || !id) return;
    const msg = text.trim();
    setText("");

    setLocalMessages(prev => [...prev, {
      id: `local_${Date.now()}`,
      sender: user?.name || "",
      senderAvatar: user?.avatarUrl || "",
      senderId: user?.id || "",
      text: msg,
      time: new Date().toISOString(),
      isMe: true,
      isSystem: false,
    }]);

    const socket = getSocket();
    if (socket) {
      socket.emit("send_message", { conversationId: id, text: msg });
    } else {
      await sendMutation.mutateAsync({ conversationId: id, text: msg });
    }
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    if (isNaN(d.getTime())) return t;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 py-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </motion.button>
            <div className="avatar-ring shrink-0">
              <div className="w-9 h-9 rounded-full bg-card overflow-hidden">
                {conv?.avatar ? (
                  <img src={conv.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs">{conv?.name?.[0] || "?"}</div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm truncate">{conv?.name || "Chat"}</p>
              {conv?.isGroup && <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{conv.members} in squad</p>}
            </div>
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <Info size={16} strokeWidth={2.2} className="text-foreground/70" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
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
            const showSender = conv?.isGroup && !msg.isMe && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
              >
                {showSender && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1 px-1">{msg.sender}</span>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 text-sm ${
                    msg.isMe
                      ? "bg-primary text-primary-foreground rounded-3xl rounded-br-md font-medium"
                      : "bg-white/[0.06] border border-white/10 rounded-3xl rounded-bl-md text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground mt-1 px-2">{formatTime(msg.time)}</span>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 px-5 py-3 glass-strong">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              className="flex-1 input-stage py-3 rounded-full"
              placeholder="Type a message..."
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!text.trim()}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 shrink-0"
              style={{ boxShadow: "0 0 20px hsla(73, 100%, 50%, 0.4)" }}
            >
              <Send size={16} strokeWidth={3} />
            </motion.button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
};

export default Chat;
