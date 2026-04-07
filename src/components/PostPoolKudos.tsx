import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Star, Users, Sparkles } from "lucide-react";
import { addXP, pingStreak } from "@/lib/engagement";
import { toast } from "sonner";

interface Props {
  open: boolean;
  poolTitle: string;
  attendees: { id: string; name: string; avatarUrl: string | null }[];
  onClose: () => void;
}

// Post-Pool Kudos modal — Strava kudos + Hinge "We Met" pattern.
// Closes the IRL → digital → IRL loop.
// Triggers within 30min of pool end. Drives reputation, retention, and re-pooling.
export function PostPoolKudos({ open, poolTitle, attendees, onClose }: Props) {
  const [step, setStep] = useState<"vibe" | "kudos" | "rebook" | "done">("vibe");
  const [vibe, setVibe] = useState<number | null>(null);
  const [kudos, setKudos] = useState<Set<string>>(new Set());

  function submitVibe() {
    if (vibe === null) return;
    addXP(15);
    setStep("kudos");
  }

  function submitKudos() {
    addXP(kudos.size * 5);
    setStep("rebook");
  }

  function finish() {
    pingStreak();
    toast.success(`+${15 + kudos.size * 5 + 25} XP · Streak +1`);
    setStep("done");
    setTimeout(() => {
      onClose();
      setStep("vibe");
      setVibe(null);
      setKudos(new Set());
    }, 1200);
  }

  function toggleKudos(id: string) {
    const next = new Set(kudos);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setKudos(next);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-[430px] rounded-t-[32px] bg-card border-t border-x border-white/10 p-6 overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center z-10"
            >
              <X size={16} />
            </button>

            <div className="relative">
              {/* Step: Vibe rating */}
              {step === "vibe" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// Pool wrapped</div>
                  <h2 className="font-display font-bold text-2xl mt-2 leading-tight">
                    How was <span className="text-gradient-cyan-magenta">{poolTitle}</span>?
                  </h2>
                  <p className="text-xs text-muted-foreground mt-2">Quick rating helps the algo find you better squads.</p>

                  <div className="flex justify-center gap-2 mt-6">
                    {[1, 2, 3, 4, 5].map(n => (
                      <motion.button
                        key={n}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setVibe(n)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          vibe !== null && vibe >= n
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/[0.04] border border-white/10 text-foreground/40"
                        }`}
                        style={vibe !== null && vibe >= n ? { boxShadow: "0 0 16px hsla(73, 100%, 50%, 0.4)" } : undefined}
                      >
                        <Star size={18} fill={vibe !== null && vibe >= n ? "currentColor" : "none"} strokeWidth={2.5} />
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={vibe === null}
                    onClick={submitVibe}
                    className="mt-6 w-full py-3 rounded-full bg-primary text-primary-foreground text-[11px] font-mono uppercase tracking-wider font-bold disabled:opacity-40"
                  >
                    Continue · +15 XP
                  </motion.button>
                </motion.div>
              )}

              {/* Step: Kudos to attendees */}
              {step === "kudos" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// Drop kudos</div>
                  <h2 className="font-display font-bold text-2xl mt-2 leading-tight">
                    Anyone bring the <span className="text-gradient-cyan-magenta">vibe?</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-2">Tap people who made the night. They get karma.</p>

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {attendees.slice(0, 6).map(a => {
                      const selected = kudos.has(a.id);
                      return (
                        <motion.button
                          key={a.id}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => toggleKudos(a.id)}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                            selected ? "border-primary" : "border-white/10"
                          }`}
                          style={selected ? { boxShadow: "0 0 14px hsla(73, 100%, 50%, 0.5)" } : undefined}
                          >
                            {a.avatarUrl ? (
                              <img src={a.avatarUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-card flex items-center justify-center font-display font-bold text-xs">
                                {a.name[0]}
                              </div>
                            )}
                            {selected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute inset-0 bg-primary/30 flex items-center justify-center"
                              >
                                <Sparkles size={16} className="text-primary-foreground" fill="currentColor" />
                              </motion.div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono truncate max-w-[60px]">{a.name.split(" ")[0]}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={submitKudos}
                    className="mt-6 w-full py-3 rounded-full bg-primary text-primary-foreground text-[11px] font-mono uppercase tracking-wider font-bold"
                  >
                    Send kudos · +{kudos.size * 5} XP
                  </motion.button>
                </motion.div>
              )}

              {/* Step: Rebook */}
              {step === "rebook" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// Lock it in</div>
                  <h2 className="font-display font-bold text-2xl mt-2 leading-tight">
                    Make this a <span className="text-gradient-cyan-magenta">weekly thing?</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-2">We'll auto-create the same pool next week.</p>

                  <div className="flex items-center gap-3 mt-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <Users size={16} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-sm">{poolTitle}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">Same time, next week</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={finish}
                      className="flex-1 py-3 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono uppercase tracking-wider font-bold"
                    >
                      Skip
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={finish}
                      className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-[11px] font-mono uppercase tracking-wider font-bold"
                      style={{ boxShadow: "0 0 16px hsla(73, 100%, 50%, 0.4)" }}
                    >
                      Lock in · +25 XP
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step: Done celebration */}
              {step === "done" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="inline-flex w-20 h-20 rounded-full bg-primary/15 border-2 border-primary items-center justify-center mb-4"
                    style={{ boxShadow: "0 0 40px hsla(73, 100%, 50%, 0.5)" }}
                  >
                    <Sparkles size={32} className="text-primary" fill="currentColor" />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// Streak +1</div>
                  <h2 className="font-display font-bold text-2xl mt-2">You're locked in</h2>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
