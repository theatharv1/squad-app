import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity } from "@/lib/storage";
import { useCreatePool } from "@/hooks/usePools";
import { useAuth } from "@/contexts/AuthContext";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { toast } from "sonner";

const TIMES = Array.from({ length: 37 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 && h < 24 ? "PM" : "AM";
  return `${hour}:${m} ${ampm}`;
});

const SKILL_LEVELS = ["Beginners OK", "Intermediate", "Advanced Only"];
const TAG_OPTIONS = ["Women Welcome", "Beginners OK", "Competitive", "Chill vibes", "Bring friends", "Solo friendly"];
const DATE_OPTIONS = ["Today", "Tomorrow", "This Friday", "Saturday", "Sunday", "Next Week"];

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24,
};

const CreatePool = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPool = useCreatePool();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState(getCity());
  const [area, setArea] = useState("");
  const [venue, setVenue] = useState("");
  const [spots, setSpots] = useState(6);
  const [isFree, setIsFree] = useState(true);
  const [cost, setCost] = useState("");
  const [publishing, setPublishing] = useState(false);

  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const canProceed = [
    !!category,
    title.length > 3,
    !!(date && time && area),
    spots >= 2,
    true,
  ];

  const handlePublish = async () => {
    setPublishing(true);
    const cat = CATEGORIES.find(c => c.id === category);

    const now = new Date();
    let scheduledDate = new Date(now);
    if (date === "Tomorrow") scheduledDate.setDate(now.getDate() + 1);
    else if (date === "This Friday") { scheduledDate.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7)); }
    else if (date === "Saturday") { scheduledDate.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7)); }
    else if (date === "Sunday") { scheduledDate.setDate(now.getDate() + ((0 - now.getDay() + 7) % 7 || 7)); }
    else if (date === "Next Week") { scheduledDate.setDate(now.getDate() + 7); }

    const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let h = parseInt(timeParts[1]);
      const m = parseInt(timeParts[2]);
      if (timeParts[3].toUpperCase() === "PM" && h !== 12) h += 12;
      if (timeParts[3].toUpperCase() === "AM" && h === 12) h = 0;
      scheduledDate.setHours(h, m, 0, 0);
    }

    try {
      const result = await createPool.mutateAsync({
        title, category, emoji: cat?.emoji || "🎯",
        city, area, venue, description, tags, skillLevel,
        scheduledTime: scheduledDate.toISOString(),
        spotsTotal: spots,
        costPerHead: isFree ? 0 : parseInt(cost) || 0,
      });
      toast.success("Pool raised!");
      navigate(`/pool/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create pool");
      setPublishing(false);
    }
  };

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStep(s => s - 1)}>
                  <ArrowLeft size={20} />
                </motion.button>
              )}
              <div>
                <div className="h-1.5 w-32 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full gradient-primary rounded-full" animate={{ width: `${((step + 1) / 5) * 100}%` }} transition={springTransition} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Step {step + 1} of 5</p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><X size={20} /></motion.button>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
        </div>

        {/* Steps */}
        <div className="flex-1 px-4 pt-6 pb-24 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: springTransition }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-heading text-xl font-bold mb-4">What are you raising?</h2>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <motion.button key={cat.id} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => setCategory(cat.id)}
                      className={`card-premium p-3 text-center transition-all ${category === cat.id ? "ring-2 ring-primary shadow-glow" : ""}`}>
                      <span className="text-2xl">{cat.emoji}</span>
                      <p className="text-xs mt-1">{cat.label}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: springTransition }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <h2 className="font-heading text-xl font-bold">Pool Details</h2>
                <div>
                  <label className="text-sm text-muted-foreground">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    className="input-premium w-full mt-1"
                    placeholder="e.g., Anyone up for football tonight?" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    className="input-premium w-full mt-1 resize-none"
                    placeholder="Tell people what to expect..." />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Skill Level</label>
                  <div className="flex gap-2 mt-1">
                    {SKILL_LEVELS.map(s => (
                      <button key={s} onClick={() => setSkillLevel(s)}
                        className={`pill ${skillLevel === s ? "pill-active" : "pill-inactive"}`}
                      >{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {TAG_OPTIONS.map(t => (
                      <button key={t} onClick={() => toggleTag(t)}
                        className={`pill ${tags.includes(t) ? "pill-active" : "pill-inactive"}`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: springTransition }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <h2 className="font-heading text-xl font-bold">When & Where</h2>
                <div>
                  <label className="text-sm text-muted-foreground">Date</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {DATE_OPTIONS.map(d => (
                      <button key={d} onClick={() => setDate(d)}
                        className={`pill ${date === d ? "pill-active" : "pill-inactive"}`}
                      >{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Time</label>
                  <div className="flex gap-2 mt-1 overflow-x-auto scrollbar-hide pb-1">
                    {TIMES.map(t => (
                      <button key={t} onClick={() => setTime(t)}
                        className={`pill whitespace-nowrap ${time === t ? "pill-active" : "pill-inactive"}`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">City</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {CITIES.map(c => (
                      <button key={c} onClick={() => setCity(c)}
                        className={`pill ${city === c ? "pill-active" : "pill-inactive"}`}
                      >{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Area / Neighbourhood</label>
                  <input value={area} onChange={e => setArea(e.target.value)}
                    className="input-premium w-full mt-1"
                    placeholder="e.g., Malviya Nagar" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Venue (optional)</label>
                  <input value={venue} onChange={e => setVenue(e.target.value)}
                    className="input-premium w-full mt-1"
                    placeholder="e.g., Malviya Nagar Turf" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: springTransition }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <h2 className="font-heading text-xl font-bold">Spots & Cost</h2>
                <div>
                  <label className="text-sm text-muted-foreground">Total Spots</label>
                  <div className="flex items-center gap-4 mt-2">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSpots(s => Math.max(2, s - 1))}
                      className="w-10 h-10 card-premium rounded-full text-lg flex items-center justify-center">-</motion.button>
                    <span className="text-2xl font-bold w-12 text-center gradient-text">{spots}</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSpots(s => Math.min(50, s + 1))}
                      className="w-10 h-10 card-premium rounded-full text-lg flex items-center justify-center">+</motion.button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Cost</label>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setIsFree(true)}
                      className={`pill ${isFree ? "pill-active" : "pill-inactive"} px-4 py-2`}>Free</button>
                    <button onClick={() => setIsFree(false)}
                      className={`pill ${!isFree ? "pill-active" : "pill-inactive"} px-4 py-2`}>Paid</button>
                  </div>
                  {!isFree && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-muted-foreground">&#8377;</span>
                      <input type="number" value={cost} onChange={e => setCost(e.target.value)}
                        className="input-premium w-32"
                        placeholder="per head" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: springTransition }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-heading text-xl font-bold mb-4">Review Your Pool</h2>
                <div className="card-premium gradient-primary-subtle p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CATEGORIES.find(c => c.id === category)?.emoji}</span>
                    <span className="text-sm text-muted-foreground">{CATEGORIES.find(c => c.id === category)?.label}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  {description && <p className="text-sm text-muted-foreground">{description}</p>}
                  <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>&#128197; {date} at {time}</p>
                    <p>&#128205; {area}{venue ? ` · ${venue}` : ""}, {city}</p>
                    <p>&#128101; {spots} spots · {isFree ? "Free" : `₹${cost}/head`}</p>
                    {skillLevel && <p>&#127919; {skillLevel}</p>}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(t => <span key={t} className="pill pill-inactive text-xs">{t}</span>)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 glass-strong">
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-4" />
          {step < 4 ? (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(s => s + 1)}
              disabled={!canProceed[step]}
              className="btn-primary w-full font-bold py-3.5 rounded-xl disabled:opacity-50">
              Next
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handlePublish}
              disabled={publishing}
              className="btn-primary w-full font-bold py-3.5 rounded-xl disabled:opacity-50 shadow-glow">
              {publishing ? "Raising..." : "Raise This Pool 🚀"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </MobileFrame>
  );
};

export default CreatePool;
