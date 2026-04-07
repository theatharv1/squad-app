import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, ArrowRight, Calendar, MapPin, Users, Trophy } from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity } from "@/lib/storage";
import { useCreatePool } from "@/hooks/usePools";
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

const STEP_LABELS = ["Vibe", "Details", "When · Where", "Crew", "Confirm"];

const Pill = ({ active, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-white/[0.04] border border-white/10 text-foreground/70"
    }`}
  >
    {children}
  </button>
);

const CreatePool = () => {
  const navigate = useNavigate();
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
        title, category, emoji: cat?.label || "Activity",
        city, area, venue, description, tags, skillLevel,
        scheduledTime: scheduledDate.toISOString(),
        spotsTotal: spots,
        costPerHead: isFree ? 0 : parseInt(cost) || 0,
      });
      toast.success("Pool raised");
      navigate(`/pool/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create pool");
      setPublishing(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setStep(s => s - 1)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center"
                >
                  <ArrowLeft size={18} strokeWidth={2.5} />
                </motion.button>
              ) : (
                <div className="w-10" />
              )}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Raise a pool · {step + 1}/5</div>
                <div className="font-display font-bold text-xl mt-0.5">{STEP_LABELS[step]}</div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <X size={18} strokeWidth={2.5} />
            </motion.button>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="xp-bar">
              <motion.div
                className="xp-bar-fill"
                animate={{ width: `${((step + 1) / 5) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 px-5 pt-6 pb-32 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-display">
                  Pick the <br />
                  <span className="text-gradient-cyan-magenta">vibe</span>
                </h2>
                <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-2">what's the activity</p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  {CATEGORIES.map((cat, i) => (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCategory(cat.id)}
                      className={`bento-item h-24 text-left transition-all ${
                        category === cat.id
                          ? "border-primary/50 bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-primary">Sport</div>
                      <div className="font-display font-bold text-lg leading-tight mt-1">{cat.label}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h2 className="text-display">
                  Tell us <br />
                  <span className="text-gradient-cyan-magenta">the deets</span>
                </h2>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Title</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="input-stage"
                    placeholder="Anyone up for football tonight?"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="input-stage resize-none"
                    placeholder="Tell people what to expect..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Skill level</label>
                  <div className="flex gap-2 flex-wrap">
                    {SKILL_LEVELS.map(s => (
                      <Pill key={s} active={skillLevel === s} onClick={() => setSkillLevel(s)}>{s}</Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map(t => (
                      <Pill key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Pill>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h2 className="text-display">
                  When <span className="text-gradient-cyan-magenta">&</span> <br />
                  where
                </h2>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Date</label>
                  <div className="flex flex-wrap gap-2">
                    {DATE_OPTIONS.map(d => (
                      <Pill key={d} active={date === d} onClick={() => setDate(d)}>{d}</Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Time</label>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {TIMES.map(t => (
                      <Pill key={t} active={time === t} onClick={() => setTime(t)}>{t}</Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">City</label>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map(c => (
                      <Pill key={c} active={city === c} onClick={() => setCity(c)}>{c}</Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Area / neighbourhood</label>
                  <input
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="input-stage"
                    placeholder="e.g., Malviya Nagar"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Venue (optional)</label>
                  <input
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    className="input-stage"
                    placeholder="e.g., Malviya Nagar Turf"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-display">
                  Build the <br />
                  <span className="text-gradient-cyan-magenta">crew</span>
                </h2>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-3 block">Total spots</label>
                  <div className="card-stage p-6 flex items-center justify-between">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSpots(s => Math.max(2, s - 1))}
                      className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 text-2xl font-display font-bold flex items-center justify-center"
                    >
                      −
                    </motion.button>
                    <div className="text-center">
                      <div className="font-display font-bold text-6xl num leading-none text-gradient-cyan-magenta">{spots}</div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-2">players</div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSpots(s => Math.min(50, s + 1))}
                      className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-2xl font-display font-bold flex items-center justify-center"
                      style={{ boxShadow: "0 0 20px hsla(73, 100%, 50%, 0.4)" }}
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Cost</label>
                  <div className="flex gap-2">
                    <Pill active={isFree} onClick={() => setIsFree(true)}>Free</Pill>
                    <Pill active={!isFree} onClick={() => setIsFree(false)}>Paid</Pill>
                  </div>
                  {!isFree && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-2xl font-display font-bold text-primary">₹</span>
                      <input
                        type="number"
                        value={cost}
                        onChange={e => setCost(e.target.value)}
                        className="input-stage w-32"
                        placeholder="per head"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-display">
                  Final <br />
                  <span className="text-gradient-cyan-magenta">check</span>
                </h2>
                <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-2">review your pool</p>

                <div className="card-stage mt-6 p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                  <div className="relative">
                    <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">{CATEGORIES.find(c => c.id === category)?.label}</div>
                    <h3 className="font-display font-bold text-2xl mt-1">{title}</h3>
                    {description && <p className="text-sm text-foreground/80 mt-2">{description}</p>}

                    <div className="divider-dashed my-4" />

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                        <span>{date} at {time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                        <span>{area}{venue ? ` · ${venue}` : ""}, {city}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                        <span className="num">{spots} spots</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-primary font-bold">{isFree ? "Free" : `₹${cost}/head`}</span>
                      </div>
                      {skillLevel && (
                        <div className="flex items-center gap-3 text-sm">
                          <Trophy size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                          <span>{skillLevel}</span>
                        </div>
                      )}
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {tags.map(t => (
                          <span key={t} className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/10 text-foreground/70">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-5 pt-4 pb-5 glass-strong">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed[step]}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ boxShadow: canProceed[step] ? "0 0 24px hsla(73, 100%, 50%, 0.4)" : undefined }}
            >
              Next
              <ArrowRight size={18} strokeWidth={3} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handlePublish}
              disabled={publishing}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-base disabled:opacity-50"
              style={{ boxShadow: "0 0 32px hsla(73, 100%, 50%, 0.5)" }}
            >
              {publishing ? "Raising..." : "Raise this pool"}
            </motion.button>
          )}
        </div>
      </div>
    </MobileFrame>
  );
};

export default CreatePool;
