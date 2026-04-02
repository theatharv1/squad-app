import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Trophy, Medal } from "lucide-react";
import { LEADERBOARD_DATA, CITIES, CURRENT_USER } from "@/data/mockData";
import { getCity } from "@/lib/storage";
import MobileFrame from "@/components/layout/MobileFrame";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("topHosts");
  const tabs = [
    { id: "topHosts", label: "Top Hosts" },
    { id: "mostActive", label: "Most Active" },
  ];
  const data = tab === "topHosts" ? LEADERBOARD_DATA.topHosts : LEADERBOARD_DATA.mostActive;
  const statKey = tab === "topHosts" ? "poolsHosted" : "gamesThisMonth";

  const medalColors = ["text-yellow-400", "text-gray-400", "text-orange-400"];

  return (
    <MobileFrame>
      <div className="min-h-screen pb-8">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1 className="font-heading text-lg font-bold">Leaderboard</h1>
        </div>

        <div className="flex gap-2 px-4 mb-4">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`text-xs px-3 py-1.5 rounded-full ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{t.label}</button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-3 px-4 mb-6">
          {[1, 0, 2].map(idx => {
            const u = data[idx];
            if (!u) return null;
            const rank = idx + 1;
            return (
              <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center cursor-pointer" onClick={() => navigate(`/profile/${u.id}`)}>
                <img src={u.avatar} alt="" className={`rounded-full border-2 ${idx === 0 ? "w-16 h-16 border-yellow-400" : "w-12 h-12 border-border"}`} />
                <p className="text-xs font-semibold mt-1 text-center max-w-[70px] truncate">{u.name.split(" ")[0]}</p>
                <p className={`text-xs font-bold ${medalColors[idx]}`}>#{rank}</p>
                <p className="text-[10px] text-muted-foreground">{(u as any)[statKey]}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Rest */}
        <div className="px-4 flex flex-col gap-1">
          {data.slice(3).map((u, i) => (
            <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)} className="flex items-center gap-3 py-2.5 cursor-pointer">
              <span className="text-xs text-muted-foreground w-5 text-center font-medium">{i + 4}</span>
              <img src={u.avatar} alt="" className="w-9 h-9 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.rating} ★</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{(u as any)[statKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}
