import { motion } from "framer-motion";
import { Calendar, ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { addXP } from "@/lib/engagement";
import { earnAchievement } from "@/lib/tiers";
import { toast } from "sonner";

interface Props {
  city: string;
}

// Squad Saturday — second weekly anchor (Wednesday is dinner; Saturday is the
// flagship). Research playbook says two weekly rituals beat one because they
// catch different audiences (work-week vs weekend) and double the habit hooks.
//
// Saturday is THE big night in Indian Gen Z culture — house parties, club
// nights, late-night chai. We surface a curated "Squad Saturday" experience
// every Friday-Saturday window so the user opens the app expecting plans.

const KEY_LAST_RSVP = "squad_saturday_last";

function isSaturdayWindow(): boolean {
  const day = new Date().getDay();
  return day === 5 || day === 6; // Friday + Saturday
}

function nextSaturdayLabel(): string {
  const now = new Date();
  const day = now.getDay();
  if (day === 6) return "TONIGHT";
  if (day === 5) return "TOMORROW";
  return "THIS SATURDAY";
}

function hasRSVPdThisWeek(): boolean {
  const last = localStorage.getItem(KEY_LAST_RSVP);
  if (!last) return false;
  const lastDate = new Date(last);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < 7;
}

function rsvpSaturday() {
  localStorage.setItem(KEY_LAST_RSVP, new Date().toISOString());
  addXP(40);
}

export function SquadSaturday({ city }: Props) {
  const navigate = useNavigate();
  const [rsvpd, setRsvpd] = useState(false);

  useEffect(() => {
    setRsvpd(hasRSVPdThisWeek());
  }, []);

  if (!isSaturdayWindow()) return null;

  function handleRSVP() {
    rsvpSaturday();
    setRsvpd(true);
    const unlocked = earnAchievement("weekly_lock");
    toast.success(unlocked ? "You're in · Weekly Lock-In unlocked · +40 XP" : "You're in · +40 XP");
    setTimeout(() => navigate("/explore"), 700);
  }

  const label = nextSaturdayLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden card-stage p-5"
      style={{
        backgroundImage:
          "linear-gradient(135deg, hsla(330,80%,16%,0.95) 0%, hsla(285,70%,12%,0.95) 50%, hsla(240,80%,18%,0.95) 100%)",
        borderColor: "hsla(330,90%,65%,0.35)",
        boxShadow: "0 0 0 1px hsla(330,90%,65%,0.15), 0 24px 60px -16px hsla(330,90%,65%,0.45)",
      }}
    >
      {/* Spotlight glows */}
      <div
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-[80px] pointer-events-none"
        style={{ background: "hsla(330,90%,65%,0.35)" }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-[80px] pointer-events-none"
        style={{ background: "hsla(280,90%,65%,0.25)" }}
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-pink-500/15 border border-pink-500/40 flex items-center justify-center">
            <Calendar size={11} className="text-pink-400" strokeWidth={2.5} />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-400">
            // {label} · Squad Saturday
          </div>
        </div>

        <h3 className="font-display font-bold text-2xl mt-3 leading-tight" style={{ color: "hsl(330,80%,96%)" }}>
          The big <span className="text-gradient-cyan-magenta">night</span>
        </h3>

        <p className="text-xs mt-2 leading-relaxed" style={{ color: "hsla(330,80%,96%,0.72)" }}>
          {city}'s biggest pools drop this Saturday. House parties, club nights, late chai — pick your scene before it locks.
        </p>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex -space-x-2">
            {[
              "from-pink-500/60 to-pink-500/20",
              "from-purple-500/60 to-purple-500/20",
              "from-cyan-400/60 to-cyan-400/20",
              "from-yellow-400/60 to-yellow-400/20",
              "from-orange-400/60 to-orange-400/20",
            ].map((c, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full border-2 border-background bg-gradient-to-br ${c}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/70">
            <span className="text-pink-400 num">218</span> RSVPs in {city}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleRSVP}
          disabled={rsvpd}
          className="mt-5 w-full px-5 py-3 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-70"
          style={{
            background: rsvpd ? "rgba(255,255,255,0.06)" : "hsl(330, 95%, 65%)",
            color: rsvpd ? "hsl(330,80%,96%)" : "#0a0a0a",
            border: rsvpd ? "1px solid hsla(330,90%,65%,0.4)" : "none",
            boxShadow: !rsvpd ? "0 0 28px hsla(330,90%,65%,0.55)" : undefined,
          }}
        >
          {rsvpd ? (
            <>
              <Users size={13} strokeWidth={2.5} />
              You're in — see you Saturday
            </>
          ) : (
            <>
              Lock my Saturday · +40 XP
              <ArrowRight size={13} strokeWidth={3} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
