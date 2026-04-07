import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Plane, Home } from "lucide-react";
import { isTraveler, setTraveler, getHomeCity, setHomeCity, getCity } from "@/lib/storage";

interface Props {
  city: string;
}

// Traveler toggle — Hinge "Travel Mode" + Bumble pattern.
// Research insight: cross-city growth is the single biggest unlock for an
// activity-pooling app — once a user visits Bombay/Goa for a weekend, they
// want to see what's happening THERE without losing their Bhopal feed.
//
// Toggle is in the city sheet. When ON:
//   • Saves the previous city as "home_city" so we can switch back
//   • Marks user as traveler → DailyPicks + EndingTonight surface
//     "Welcome to <city>" copy
//   • Pinned in the feed so locals see "visiting from Bhopal" tag
//
// All client-side for now; backend can persist later.
export function TravelerToggle({ city }: Props) {
  const [traveler, setTravelerState] = useState(false);
  const [homeCity, setHomeCityState] = useState<string>("");

  useEffect(() => {
    setTravelerState(isTraveler());
    setHomeCityState(getHomeCity());
  }, [city]);

  function toggle() {
    if (!traveler) {
      // Switching ON — remember the current home city before traveling.
      setHomeCity(getCity());
      setHomeCityState(getCity());
      setTraveler(true);
      setTravelerState(true);
    } else {
      setTraveler(false);
      setTravelerState(false);
    }
  }

  return (
    <div className="mt-4 mb-6">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={toggle}
        className="w-full p-4 rounded-2xl border flex items-center gap-3 transition-all"
        style={{
          background: traveler
            ? "linear-gradient(135deg, hsla(200,80%,16%,0.95) 0%, hsla(220,70%,12%,0.95) 100%)"
            : "rgba(255,255,255,0.04)",
          borderColor: traveler ? "hsla(200,90%,65%,0.5)" : "rgba(255,255,255,0.1)",
          boxShadow: traveler ? "0 0 28px hsla(200,90%,65%,0.35)" : undefined,
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: traveler ? "hsla(200,90%,65%,0.18)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${traveler ? "hsla(200,90%,65%,0.45)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          {traveler ? (
            <Plane size={16} className="text-cyan-300" strokeWidth={2.5} />
          ) : (
            <Home size={16} className="text-foreground/60" strokeWidth={2.5} />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="font-display font-bold text-sm">
            {traveler ? `Visiting ${city}` : "I'm visiting another city"}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
            {traveler
              ? `home: ${homeCity || "—"} · tap to switch back`
              : "unlock the local scene wherever you land"}
          </div>
        </div>
        <div
          className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all shrink-0"
          style={{
            background: traveler ? "hsl(200,90%,65%)" : "rgba(255,255,255,0.1)",
          }}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-white"
            animate={{ x: traveler ? 16 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
      </motion.button>
    </div>
  );
}
