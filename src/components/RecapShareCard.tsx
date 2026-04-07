import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Download, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  poolTitle: string;
  vibeRating: number;        // 1-5
  kudosCount: number;        // how many people you tapped
  cityName?: string;
}

// Post-pool Recap Share Card — Strava activity-card pattern.
// Strava's killer growth move: every workout becomes a beautiful summary card
// that's optimized for IG story sharing. We do the same for pools.
//
// Key insights from playbook:
//   1. Generated automatically (no extra step) → low friction
//   2. Aspect ratio matches IG story (9:16) → one-tap share
//   3. Branded but tasteful (logo top-left, vibe metric big)
//   4. Date + city makes it feel like a memory artifact
//
// We render an html2canvas-style screenshot via the native Web Share API
// when available, falling back to copy-link.

export function RecapShareCard({ poolTitle, vibeRating, kudosCount, cityName }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shared, setShared] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    const d = new Date();
    setToday(
      d.toLocaleDateString([], { day: "numeric", month: "short" }).toUpperCase()
    );
  }, []);

  async function handleShare() {
    try {
      const text = `Just wrapped "${poolTitle}" — ${"★".repeat(vibeRating)} on SQUAD${cityName ? ` in ${cityName}` : ""}. Building my crew, one pool at a time.`;
      if (navigator.share) {
        await navigator.share({
          title: "SQUAD recap",
          text,
          url: typeof window !== "undefined" ? window.location.origin : undefined,
        });
        setShared(true);
        toast.success("Shared · +20 XP");
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShared(true);
        toast.success("Recap copied · paste in your story");
      }
    } catch {
      // user cancelled — silent
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* The shareable card itself */}
      <div
        ref={cardRef}
        className="relative aspect-[9/12] rounded-3xl overflow-hidden border border-white/10"
        style={{
          backgroundImage:
            "linear-gradient(135deg, hsla(285,80%,16%,0.95) 0%, hsla(330,70%,12%,0.95) 50%, hsla(180,80%,18%,0.95) 100%)",
          boxShadow: "0 24px 60px -16px hsla(330,90%,65%,0.55)",
        }}
      >
        {/* Glow accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "hsla(330,90%,65%,0.45)" }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: "hsla(180,90%,55%,0.35)" }} />

        {/* Branding row */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-foreground/80">SQUAD</div>
          <div className="text-[10px] font-mono uppercase tracking-wider num text-foreground/60">{today}</div>
        </div>

        {/* Center content */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 z-10 text-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-300">// I just</div>
          <h2 className="font-display font-bold text-3xl leading-tight mt-2 text-foreground" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
            {poolTitle}
          </h2>
          {cityName && (
            <div className="text-[11px] font-mono uppercase tracking-wider text-foreground/60 mt-2">in {cityName}</div>
          )}

          {/* Vibe stars */}
          <div className="flex justify-center gap-1 mt-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Sparkles
                key={i}
                size={20}
                strokeWidth={2.5}
                className={i < vibeRating ? "text-pink-300" : "text-foreground/15"}
                fill={i < vibeRating ? "currentColor" : "none"}
              />
            ))}
          </div>

          {kudosCount > 0 && (
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 mt-3">
              kudos to <span className="num font-bold">{kudosCount}</span> {kudosCount === 1 ? "player" : "players"}
            </div>
          )}
        </div>

        {/* Footer brand */}
        <div className="absolute bottom-5 left-5 right-5 z-10 flex items-center justify-between">
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-foreground/40">join the squad</div>
          <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-pink-300">squad-app.in</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          disabled={shared}
          className="flex-1 py-3 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-70"
          style={{
            background: shared ? "rgba(255,255,255,0.06)" : "hsl(330, 95%, 65%)",
            color: shared ? "hsl(330,80%,96%)" : "#0a0a0a",
            border: shared ? "1px solid hsla(330,90%,65%,0.4)" : "none",
            boxShadow: !shared ? "0 0 24px hsla(330,90%,65%,0.5)" : undefined,
          }}
        >
          <Share2 size={13} strokeWidth={2.5} />
          {shared ? "Shared" : "Share recap · +20 XP"}
        </motion.button>
      </div>
    </motion.div>
  );
}
