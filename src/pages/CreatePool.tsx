import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { CATEGORIES, CITIES, CURRENT_USER } from "@/data/mockData";
import { getCity, addCreatedPool } from "@/lib/storage";
import MobileFrame from "@/components/layout/MobileFrame";
import { toast } from "sonner";

const SKILL_LEVELS = ["Beginners OK", "Intermediate", "Advanced Only"];
const TAGS = ["Women Welcome", "Beginners OK", "Competitive", "Chill vibes", "Bring friends", "Solo friendly"];
const TIMES = Array.from({ length: 34 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h;
  return `${h12}:${m} ${ampm}`;
});

export default function CreatePool() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginners OK");
  const [tags, setTags] = useState<string[]>([]);
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("8:00 PM");
  const [city, setCityVal] = useState(getCity());
  const [area, setArea] = useState("");
  const [venue, setVenue] = useState("");
  const [spots, setSpots] = useState(10);
  const [isFree, setIsFree] = useState(true);
  const [cost, setCost] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const cat = CATEGORIES.find(c => c.id === category);

  const canProceed = [
    !!category,
    title.length > 3,
    !!date && !!time && !!area,
    spots >= 2,
    true,
  ];

  const handlePublish = () => {
    setPublishing(true);
    const id = `created_${Date.now()}`;
    const pool = {
      id, title, category, emoji: cat?.emoji || "", description,
      host: { id: CURRENT_USER.id, name: CURRENT_USER.name, avatar: CURRENT_USER.avatar, rating: CURRENT_USER.rating, showUpRate: CURRENT_USER.showUpRate },
      city, area, venue, time, date, spotsTotal: spots, spotsFilled: 0,
      costPerHead: isFree ? 0 : cost, tags: [...tags, skillLevel], joined: false, isLive: true,
    };
    addCreatedPool(pool);
    setTimeout(() => {
      toast.success("Pool raised! Let's get your squad together.");
      navigate(`/pool/${id}`, { replace: true });
    }, 800);
  };

  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const dates = ["Today", "Tomorrow", "This Friday", "Saturday", "Sunday", "Next Week"];

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-medium">Create Pool ({step + 1}/5)</span>
          <button onClick={() => navigate(-1)}><X size={20} className="text-muted-foreground" /></button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-4 pt-3">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>

        {/* Steps */}
        <div className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
              {step === 0 && (
                <div>
                  <h2 className="font-heading text-lg font-bold mb-4">What's happening?</h2>
                  <div className="grid grid-cols-3 gap-2.5">
                    {CATEGORIES.map(c => (
                      <motion.button
                        key={c.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategory(c.id)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border transition-colors ${
                          category === c.id ? "border-primary bg-primary/10" : "border-border bg-card"
                        }`}
                      >
                        <span className="text-2xl">{c.emoji}</span>
                        <span className="text-[11px] font-medium">{c.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-heading text-lg font-bold">Pool details</h2>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Anyone up for football tonight?" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell people what this is about" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none resize-none h-24" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Skill Level</label>
                    <div className="flex gap-2">
                      {SKILL_LEVELS.map(s => (
                        <button key={s} onClick={() => setSkillLevel(s)} className={`text-xs px-3 py-1.5 rounded-full ${skillLevel === s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(t => (
                        <button key={t} onClick={() => toggleTag(t)} className={`text-xs px-3 py-1.5 rounded-full ${tags.includes(t) ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-heading text-lg font-bold">When & Where</h2>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                    <div className="flex flex-wrap gap-2">
                      {dates.map(d => (
                        <button key={d} onClick={() => setDate(d)} className={`text-xs px-3 py-1.5 rounded-full ${date === d ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                      {TIMES.map(t => (
                        <button key={t} onClick={() => setTime(t)} className={`text-xs px-3 py-1.5 rounded-full shrink-0 ${time === t ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">City</label>
                    <div className="flex flex-wrap gap-2">
                      {CITIES.map(c => (
                        <button key={c} onClick={() => setCityVal(c)} className={`text-xs px-3 py-1.5 rounded-full ${city === c ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Area / Neighbourhood</label>
                    <input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Malviya Nagar" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Venue</label>
                    <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. TT Nagar Sports Complex" className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-heading text-lg font-bold">Spots & Cost</h2>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">How many people?</label>
                    <div className="flex items-center gap-4 mt-1">
                      <button onClick={() => setSpots(Math.max(2, spots - 1))} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg font-bold">-</button>
                      <span className="text-2xl font-heading font-bold w-12 text-center">{spots}</span>
                      <button onClick={() => setSpots(Math.min(50, spots + 1))} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Cost per head</label>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setIsFree(true)} className={`text-xs px-4 py-2 rounded-full ${isFree ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Free</button>
                      <button onClick={() => setIsFree(false)} className={`text-xs px-4 py-2 rounded-full ${!isFree ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Paid</button>
                    </div>
                    {!isFree && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">₹</span>
                        <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-24 bg-secondary rounded-xl px-3 py-2 text-sm outline-none" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-heading text-lg font-bold">Review</h2>
                  <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{cat?.emoji}</span>
                      <span className="text-xs text-muted-foreground">{cat?.label}</span>
                    </div>
                    <p className="font-semibold text-sm">{title || "Untitled Pool"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>{date} · {time}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{area}{venue ? ` · ${venue}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{spots} spots · {isFree ? "Free" : `₹${cost}/head`} · {city}</span>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {[...tags, skillLevel].map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!canProceed[step]}
              onClick={() => setStep(step + 1)}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handlePublish}
              disabled={publishing}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-60"
            >
              {publishing ? "Publishing..." : "Raise This Pool"}
            </motion.button>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
