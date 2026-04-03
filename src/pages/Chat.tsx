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
  const { data: fetchedMessages = [], refetch } = useMessages(id);
  const sendMutation = useSendMessage();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conv = allConvs.find(c => c.id === id);
  const messages = [...fetchedMessages, ...localMessages];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Socket.io for real-time
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

  // Clear local messages when fetched messages update
  useEffect(() => { setLocalMessages([]); }, [fetchedMessages]);

  const handleSend = async () => {
    if (!text.trim() || !id) return;
    const msg = text.trim();
    setText("");

    // Optimistic local add
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

    // Also send via socket for real-time
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 py-3 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </motion.button>
          <img src={conv?.avatar || ""} className="w-8 h-8 rounded-full avatar-ring" />
          <div className="flex-1">
            <p className="font-semibold text-sm">{conv?.name || "Chat"}</p>
            {conv?.isGroup && <p className="text-xs text-muted-foreground">{conv.members} members</p>}
          </div>
          <button><Info size={20} className="text-muted-foreground" /></button>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.map((msg, i) => {
            if (msg.isSystem) {
              return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center">
                  <span className="text-xs glass px-3 py-1 rounded-full text-muted-foreground inline-block">{msg.text}</span>
                </motion.div>
              );
            }
            const showSender = conv?.isGroup && !msg.isMe && (i === 0 || messages[i-1]?.senderId !== msg.senderId);
            return (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                {showSender && <span className="text-[10px] text-muted-foreground mb-0.5 px-1">{msg.sender}</span>}
                <div className={`max-w-[75%] px-3.5 py-2 text-sm ${msg.isMe ? "gradient-primary text-primary-foreground rounded-2xl rounded-br-md" : "glass rounded-2xl rounded-bl-md"}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 px-1">{formatTime(msg.time)}</span>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 p-3 glass-strong flex items-center gap-2">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            className="input-premium flex-1 rounded-full px-4 py-2.5"
            placeholder="Type a message..." />
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend}
            disabled={!text.trim()}
            className="w-10 h-10 gradient-primary shadow-glow rounded-full flex items-center justify-center disabled:opacity-50">
            <Send size={16} className="text-primary-foreground" />
          </motion.button>
        </div>
      </motion.div>
    </MobileFrame>
  );
};

export default Chat;
