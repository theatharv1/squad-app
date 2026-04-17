import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation, MapPin } from "lucide-react";
import { resolvePoolTheme } from "@/lib/poolThemes";
import type { Pool } from "@/types";

interface Props {
  pools: Pool[];
  city: string;
}

// Deterministic position from pool id so pins stay stable across renders.
function pinPosition(id: string, index: number): { top: string; left: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  h = Math.abs(h);

  // Scatter pins in a ring around the center (user dot), avoiding the very
  // center and edges so nothing overlaps the pulsing dot or clips the card.
  const angles = [40, 130, 210, 290, 350];
  const angle = angles[index % angles.length] + (h % 20 - 10);
  const radius = 22 + (h % 14); // 22-35% from center
  const rad = (angle * Math.PI) / 180;
  const top = 50 + radius * Math.sin(rad);
  const left = 50 + radius * Math.cos(rad);

  return {
    top: `${Math.max(10, Math.min(88, top))}%`,
    left: `${Math.max(8, Math.min(92, left))}%`,
  };
}

export function MapView({ pools, city }: Props) {
  const navigate = useNavigate();
  const displayPools = pools.slice(0, 5);
  const nearbyCount = pools.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate("/explore")}
      className="relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group select-none"
      style={{
        background:
          "linear-gradient(145deg, #0d1117 0%, #111827 40%, #0f172a 70%, #0c1222 100%)",
      }}
    >
      {/* ---- Street grid ---- */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: [
            "linear-gradient(0deg, rgba(148,163,184,1) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "28px 28px",
        }}
      />

      {/* ---- Diagonal avenue ---- */}
      <div
        className="absolute opacity-[0.06]"
        style={{
          width: "140%",
          height: "1px",
          background: "rgba(148,163,184,0.9)",
          top: "38%",
          left: "-20%",
          transform: "rotate(-28deg)",
          transformOrigin: "center",
        }}
      />

      {/* ---- Curved road 1 ---- */}
      <div
        className="absolute opacity-[0.055]"
        style={{
          width: "65%",
          height: "65%",
          border: "1px solid rgba(148,163,184,0.8)",
          borderRadius: "50%",
          top: "-18%",
          right: "-22%",
        }}
      />

      {/* ---- Curved road 2 ---- */}
      <div
        className="absolute opacity-[0.05]"
        style={{
          width: "55%",
          height: "55%",
          border: "1px solid rgba(148,163,184,0.8)",
          borderRadius: "50%",
          bottom: "-20%",
          left: "-12%",
        }}
      />

      {/* ---- Horizontal boulevard ---- */}
      <div
        className="absolute opacity-[0.06]"
        style={{
          width: "100%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.6) 30%, rgba(148,163,184,0.6) 70%, transparent 100%)",
          top: "62%",
          left: 0,
        }}
      />

      {/* ---- Vertical boulevard ---- */}
      <div
        className="absolute opacity-[0.06]"
        style={{
          width: "2px",
          height: "100%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(148,163,184,0.6) 20%, rgba(148,163,184,0.6) 80%, transparent 100%)",
          top: 0,
          left: "36%",
        }}
      />

      {/* ---- Ambient glow patches (simulate map terrain) ---- */}
      <div
        className="absolute rounded-full blur-3xl opacity-[0.08]"
        style={{
          width: "40%",
          height: "40%",
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          top: "30%",
          left: "30%",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-[0.04]"
        style={{
          width: "30%",
          height: "30%",
          background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)",
          top: "10%",
          right: "10%",
        }}
      />

      {/* ---- User location pulsing dot (center) ---- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        {/* outer pulse ring */}
        <span
          className="absolute -inset-3 rounded-full animate-ping"
          style={{
            background: "rgba(59,130,246,0.25)",
            animationDuration: "2s",
          }}
        />
        {/* mid glow */}
        <span
          className="absolute -inset-2 rounded-full"
          style={{
            background: "rgba(59,130,246,0.15)",
            filter: "blur(4px)",
          }}
        />
        {/* core dot */}
        <span
          className="relative block w-3.5 h-3.5 rounded-full border-2 border-white/90"
          style={{
            background: "#3b82f6",
            boxShadow: "0 0 12px 2px rgba(59,130,246,0.6)",
          }}
        />
      </div>

      {/* ---- Activity pins ---- */}
      {displayPools.map((pool, i) => {
        const theme = resolvePoolTheme(pool);
        const pos = pinPosition(pool.id, i);
        return (
          <motion.div
            key={pool.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.3 + i * 0.1,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute z-[5]"
            style={{ top: pos.top, left: pos.left }}
          >
            <span
              className="block w-2.5 h-2.5 rounded-full"
              style={{
                background: theme.accent,
                boxShadow: `0 0 8px 2px ${theme.glow}, 0 0 2px 0 ${theme.accent}`,
              }}
            />
          </motion.div>
        );
      })}

      {/* ---- Overlay: nearby pill (top-left) ---- */}
      <div className="absolute top-3 left-3 z-20">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md"
          style={{
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            className="block w-1.5 h-1.5 rounded-full"
            style={{
              background: "#22c55e",
              boxShadow: "0 0 6px 1px rgba(34,197,94,0.5)",
            }}
          />
          <span className="text-[10px] font-mono tracking-wider text-white/80">
            {nearbyCount} nearby
          </span>
        </motion.div>
      </div>

      {/* ---- Overlay: city label (top-right) ---- */}
      <div className="absolute top-3 right-3 z-20">
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md"
          style={{
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <MapPin size={10} className="text-white/50" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
            {city}
          </span>
        </motion.div>
      </div>

      {/* ---- Overlay: navigation button (bottom-right) ---- */}
      <div className="absolute bottom-3 right-3 z-20">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/explore");
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Navigation size={14} className="text-white/80" fill="rgba(255,255,255,0.15)" />
        </motion.button>
      </div>

      {/* ---- Overlay: activities pill (bottom-center) ---- */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/explore");
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-display text-xs font-bold tracking-tight backdrop-blur-md"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.9)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <MapPin size={12} className="text-primary" />
          Activities
        </motion.button>
      </div>

      {/* ---- Hover shimmer ---- */}
      <div
        className="absolute inset-0 z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}
