import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Info, Send } from "lucide-react";
import { CONVERSATIONS } from "@/data/mockData";
import MobileFrame from "@/components/layout/MobileFrame";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conv = CONVERSATIONS.find(c => c.id === id);
  const [messages, setMessages] = useState(conv?.messages || []);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conv) return <MobileFrame><div className="p-4"><button onClick={() => navigate(-1)} className="text-sm text-primary">Go back</button></div></MobileFrame>;

  const handleSend = () => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, {
      id: `m_${Date.now()}`,
      sender: "Yathu",
      senderAvatar: "",
      text: text.trim(),
      time: "Just now",
      isMe: true,
    }]);
    setText("");
  };

  return (
    <MobileFrame>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
          <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <img src={conv.avatar} alt="" className="w-8 h-8 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{conv.name}</p>
            {conv.isGroup && <p className="text-[10px] text-muted-foreground">{conv.members} members</p>}
          </div>
          <button><Info size={18} className="text-muted-foreground" /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {messages.map((msg, i) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{msg.text}</span>
                </div>
              );
            }
            const showName = !msg.isMe && conv.isGroup && (i === 0 || messages[i - 1]?.sender !== msg.sender || messages[i - 1]?.isSystem);
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                {!msg.isMe && showName && (
                  <img src={msg.senderAvatar} alt="" className="w-6 h-6 rounded-full mt-auto shrink-0" />
                )}
                {!msg.isMe && !showName && <div className="w-6 shrink-0" />}
                <div className={`max-w-[75%] ${msg.isMe ? "order-first" : ""}`}>
                  {showName && <p className="text-[10px] text-muted-foreground mb-0.5 ml-1">{msg.sender}</p>}
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    msg.isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[9px] text-muted-foreground mt-0.5 ${msg.isMe ? "text-right" : "text-left"} mx-1`}>{msg.time}</p>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border bg-background shrink-0">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!text.trim()}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
