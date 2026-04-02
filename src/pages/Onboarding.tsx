import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CITIES } from "@/data/mockData";
import { setCity, setOnboarded } from "@/lib/storage";

const slides = [
  {
    title: "Your city. Your people. Tonight.",
    subtitle: "Sports, food, travel and everything in between. Find your squad in minutes.",
    cta: "Find My Squad",
  },
  {
    title: "Raise a pool. Anyone can join.",
    subtitle: "Create an activity, set the time and place, and watch your squad form in real-time.",
    cta: "Next",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedCity, setSelectedCity] = useState("");
  const navigate = useNavigate();

  const finish = () => {
    if (selectedCity) setCity(selectedCity);
    setOnboarded();
    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={finish} className="text-sm text-muted-foreground">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {step < 2 ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3 }}
              className="text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl mb-8">
                {step === 0 ? "🏙" : "🤝"}
              </div>
              <h1 className="font-heading text-2xl font-bold mb-3 leading-tight">{slides[step].title}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">{slides[step].subtitle}</p>

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 bg-card rounded-2xl p-4 border border-border w-full max-w-[300px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                    <span className="text-xs text-success font-medium">Forming now</span>
                  </div>
                  <p className="text-sm font-semibold">Football tonight at Malviya Nagar</p>
                  <p className="text-xs text-muted-foreground mt-1">3 spots left · 8:00 PM · ₹80/head</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="city"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3 }}
              className="text-center w-full"
            >
              <h1 className="font-heading text-2xl font-bold mb-2">Which city are you in?</h1>
              <p className="text-muted-foreground text-sm mb-6">We'll show you what's happening nearby</p>
              <div className="grid grid-cols-2 gap-2.5 max-w-[320px] mx-auto">
                {CITIES.map(city => (
                  <motion.button
                    key={city}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCity(city)}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${
                      selectedCity === city
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border"
                    }`}
                  >
                    {city}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 pb-8">
        <div className="flex justify-center gap-1.5 mb-6">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${step === i ? "w-6 bg-primary" : "w-1.5 bg-muted"}`} />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => step < 2 ? setStep(step + 1) : finish()}
          disabled={step === 2 && !selectedCity}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-opacity"
        >
          {step < 2 ? slides[step].cta : "Let's Go"}
        </motion.button>
      </div>
    </div>
  );
}
