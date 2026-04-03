import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CITIES } from "@/constants";
import { setCity, setOnboarded } from "@/lib/storage";
import { useUpdateProfile } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";

const slides = [
  { emoji: "🌆", title: "Your city. Your people. Tonight.", subtitle: "SQUAD connects you with real people in your city for sports, travel, parties, and more." },
  { emoji: "🎯", title: "Raise a pool. Anyone can join.", subtitle: "Create an activity pool, set a time, and watch your squad come together." },
];

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24,
};

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      <div className="flex justify-end p-4">
        <button onClick={finish} className="text-sm text-muted-foreground">Skip</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {step < 2 ? (
            <motion.div key={step}
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0, transition: springTransition }} exit={{ opacity: 0, x: -50 }}
              className="text-center">
              <div className="w-20 h-20 rounded-2xl gradient-primary-subtle flex items-center justify-center text-4xl mx-auto shadow-glow">
                {slides[step].emoji}
              </div>
              <h1 className="font-heading text-2xl font-bold mt-6 gradient-text">{slides[step].title}</h1>
              <p className="text-muted-foreground mt-2">{slides[step].subtitle}</p>
            </motion.div>
          ) : (
            <motion.div key="city"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0, transition: springTransition }}
              className="w-full text-center">
              <h1 className="font-heading text-2xl font-bold gradient-text">Pick your city</h1>
              <p className="text-muted-foreground mt-1 mb-6">You can always change this later</p>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map(c => (
                  <motion.button key={c} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCity(c)}
                    className={`pill py-3 text-sm font-medium ${selectedCity === c ? "pill-active shadow-glow" : "pill-inactive"}`}
                  >{c}</motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-6">
        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {[0,1,2].map(i => (
            <motion.div key={i}
              animate={{ scale: step === i ? 1.2 : 1 }}
              className={`w-2 h-2 rounded-full transition-all ${step === i ? "gradient-primary shadow-glow" : "bg-secondary"}`} />
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => step < 2 ? setStep(s => s + 1) : finish()}
          className="btn-primary w-full font-bold py-3.5 rounded-xl shadow-glow">
          {step < 2 ? "Next" : "Let's Go"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Onboarding;
