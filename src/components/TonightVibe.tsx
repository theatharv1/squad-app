import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { getCheckin, setCheckin, VIBES, type Vibe } from "@/lib/engagement";

// Daily vibe check-in — BeReal / Locket / Partiful pattern
// Forces a 1-tap commitment from the user every day.
// Drives streaks + personalization + addiction.
export function TonightVibe() {
  const [checkin, setCheckinState] = useState(getCheckin());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [justChecked, setJustChecked] = useState(false);

  useEffect(() => {
    setCheckinState(getCheckin());
  }, []);

  function pick(v: Vibe) {
    setCheckin(v);
    setCheckinState(getCheckin());
    setJustChecked(true);
    setTimeout(() => {
      setPickerOpen(false);
      setJustChecked(false);
    }, 900);
  }

  if (checkin.isToday && !pickerOpen) {
    const vibe = VIBES.find(v => v.id === checkin.vibe);
    return (
      <motion.button
        onClick={() => setPickerOpen(true)}
        whileTap={{ scale: 0.98 }}
        className="card-stage w-full px-4 py-3 flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center shrink-0">
          <Check size={15} className="text-primary" strokeWidth={3} />
        </div>
        <div className="flex-1 text-left">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">// Today you're</div>
          <div className="font-display font-bold text-base">{vibe?.label || "Checked in"}</div>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">tap to change</div>
      </motion.button>
    );
  }

  return (
    <div className="card-stage p-4">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// Today's vibe</div>
      <div className="font-display font-bold text-lg mt-1">What are you on?</div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {VIBES.map((v, i) => (
          <motion.button
            key={v.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => pick(v.id)}
            className={`relative px-3 py-3 rounded-2xl border text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
              v.color === "lime"
                ? "border-primary/30 bg-primary/[0.06] text-primary hover:bg-primary/15"
                : v.color === "magenta"
                ? "border-pink-500/30 bg-pink-500/[0.06] text-pink-400 hover:bg-pink-500/15"
                : "border-cyan-400/30 bg-cyan-400/[0.06] text-cyan-300 hover:bg-cyan-400/15"
            }`}
          >
            <AnimatePresence>
              {justChecked && checkin.vibe === v.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-primary rounded-2xl"
                >
                  <Check size={20} className="text-primary-foreground" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
            {v.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
