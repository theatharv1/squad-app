import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CITIES } from "@/constants";
import { setCity, setOnboarded } from "@/lib/storage";
import { useUpdateProfile } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { MobileFrame } from "@/components/layout/MobileFrame";

const slides = [
  {
    eyebrow: "// Step 01",
    title: "Your city,",
    title2: "your scene",
    subtitle: "SQUAD links you with real people in your city for sports, late-night runs, parties, treks — anything.",
  },
  {
    eyebrow: "// Step 02",
    title: "Raise a pool,",
    title2: "build a squad",
    subtitle: "Drop a pool, pick a vibe, and watch strangers become your weekend crew.",
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedCity, setSelectedCity] = useState("Bhopal");
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const { refreshUser } = useAuth();

  const finish = async () => {
    setCity(selectedCity);
    setOnboarded();
    await updateProfile.mutateAsync({ city: selectedCity } as any);
    await refreshUser();
    navigate("/home");
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col px-6 pt-6 pb-8 relative overflow-hidden">
        {/* Spotlight orbs */}
        <div className="absolute top-0 -right-32 w-80 h-80 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-1">
          <div className="flex justify-end">
            <button
              onClick={finish}
              className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground"
            >
              Skip
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {step < 2 ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-3">{slides[step].eyebrow}</div>
                  <h1 className="text-display-xl">
                    {slides[step].title}<br />
                    <span className="text-gradient-cyan-magenta">{slides[step].title2}</span>
                  </h1>
                  <p className="text-base text-muted-foreground mt-6 leading-relaxed">{slides[step].subtitle}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="city"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-3">// Step 03</div>
                  <h1 className="text-display-lg">
                    Pick your <br />
                    <span className="text-gradient-cyan-magenta">scene</span>
                  </h1>
                  <p className="text-sm text-muted-foreground mt-3 mb-6 font-mono uppercase tracking-wider">where you live</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {CITIES.map((c, i) => (
                      <motion.button
                        key={c}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedCity(c)}
                        className={`py-4 rounded-2xl font-display font-bold text-sm transition-all ${
                          selectedCity === c
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/[0.04] border border-white/10 text-foreground/80"
                        }`}
                        style={selectedCity === c ? { boxShadow: "0 0 24px hsla(73, 100%, 50%, 0.4)" } : undefined}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ width: step === i ? 24 : 6, opacity: step === i ? 1 : 0.4 }}
                  className="h-1.5 rounded-full bg-primary"
                />
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => step < 2 ? setStep(s => s + 1) : finish()}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-base flex items-center justify-center gap-2"
              style={{ boxShadow: "0 0 32px hsla(73, 100%, 50%, 0.4)" }}
            >
              {step < 2 ? "Continue" : "Let's go"}
              <ArrowRight size={18} strokeWidth={3} />
            </motion.button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
};

export default Onboarding;
