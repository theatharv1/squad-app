import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, ArrowRight, Calendar, MapPin, Users, Trophy, Sparkles, Shirt, Palette } from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { getCity } from "@/lib/storage";
import { useCreatePool } from "@/hooks/usePools";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { addXP } from "@/lib/engagement";
import { earnAchievement } from "@/lib/tiers";
import { POOL_THEMES, type ThemeId, themeFor } from "@/lib/poolThemes";
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
// Dress code chips — Hosted Vibe pattern from playbook section 10.
// Tap-to-add, NOT a text field, so creation stays under 90 sec.
const DRESS_CODE_OPTIONS = [
  "Casual",
  "Sportswear",
  "Smart casual",
  "Streetwear",
  "Cosy fits",
  "All black",
  "Ethnic",
  "Whatever fits",
];

const STEP_LABELS = ["Vibe", "Details", "When · Where", "Crew", "Confirm"];

// Vibe templates — pre-built fills indexed by category. Tap once, ship in <60s.
// Inspired by Partiful + Posh "vibe-led discovery" — the host doesn't have to
// be a copywriter; the format does the hosting.
type VibeTemplate = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  tags: string[];
  spots: number;
  dressCode?: string;
};

const VIBE_TEMPLATES: Record<string, VibeTemplate[]> = {
  football: [
    { id: "ft1", emoji: "⚽", title: "Sunday morning 5-a-side", description: "Casual kickabout, all levels welcome. Bring water + a smile.", tags: ["Beginners OK", "Chill vibes"], spots: 10, dressCode: "Sportswear" },
    { id: "ft2", emoji: "🔥", title: "Friday night turf session", description: "Competitive 7-a-side after work. Bring your A-game.", tags: ["Competitive"], spots: 14, dressCode: "Sportswear" },
  ],
  cricket: [
    { id: "cr1", emoji: "🏏", title: "Weekend gully cricket", description: "Tape ball, no helmets, max fun. Pads optional, vibes mandatory.", tags: ["Beginners OK", "Chill vibes"], spots: 12, dressCode: "Casual" },
  ],
  badminton: [
    { id: "bd1", emoji: "🏸", title: "Doubles night at the courts", description: "Booked the courts for an hour. Looking for 3 more for doubles.", tags: ["Intermediate"], spots: 4, dressCode: "Sportswear" },
  ],
  travel: [
    { id: "tv1", emoji: "🌅", title: "Sunset chai walk", description: "Walking the promenade, ending at the chai stall. Slow pace, deep talks.", tags: ["Solo friendly", "Chill vibes"], spots: 6, dressCode: "Casual" },
    { id: "tv2", emoji: "🚐", title: "Day trip — leaving 7am", description: "Roadtrip to the closest hill station. Petrol split, snacks shared.", tags: ["Bring friends"], spots: 5, dressCode: "Cosy fits" },
  ],
  party: [
    { id: "pt1", emoji: "🎶", title: "House party at mine", description: "Speakers, snacks, BYO drinks. Plus-ones cool.", tags: ["Bring friends", "Chill vibes"], spots: 12, dressCode: "Streetwear" },
    { id: "pt2", emoji: "🪩", title: "Club night — pre-game first", description: "Pre-gaming at 9, hitting the club at 11. Need 4 more.", tags: ["Bring friends"], spots: 8, dressCode: "All black" },
  ],
  hiking: [
    { id: "hk1", emoji: "🏔️", title: "Sunrise trek + breakfast", description: "Easy 2-hour trek, breakfast at the top. Alarms set for 5am.", tags: ["Beginners OK"], spots: 8, dressCode: "Sportswear" },
  ],
  running: [
    { id: "rn1", emoji: "🏃", title: "Easy 5k along the lake", description: "No pace pressure. Coffee after.", tags: ["Beginners OK", "Solo friendly"], spots: 6, dressCode: "Sportswear" },
  ],
  cycling: [
    { id: "cy1", emoji: "🚴", title: "Sunday morning ride", description: "20km loop, café stop midway. Helmets non-negotiable.", tags: ["Intermediate"], spots: 8, dressCode: "Sportswear" },
  ],
  gaming: [
    { id: "gm1", emoji: "🎮", title: "Tournament night at the café", description: "Pulling up to the gaming café for a tourney. 4-team bracket.", tags: ["Competitive"], spots: 8, dressCode: "Casual" },
  ],
};

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
  const [dressCode, setDressCode] = useState("");
  const [coHost, setCoHost] = useState("");
  // Pool theme picker — Partiful "designed object" pattern.
  // Default to "club-neon" so the host always sees a vibe pre-loaded.
  const [themeId, setThemeId] = useState<ThemeId>("club-neon");
  const [publishing, setPublishing] = useState(false);

  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  // Apply a vibe template — pre-fills everything in one tap. Partiful pattern.
  const applyTemplate = (tpl: VibeTemplate) => {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setTags(tpl.tags);
    setSpots(tpl.spots);
    if (tpl.dressCode) setDressCode(tpl.dressCode);
    toast.success("Vibe loaded · tap Next");
  };

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

    // Encode dress code + co-host + theme into tags (back-compat with current
    // backend schema). Future server work can split these into proper columns.
    const enrichedTags = [...tags];
    if (dressCode) enrichedTags.push(`fit:${dressCode}`);
    if (coHost.trim()) enrichedTags.push(`cohost:${coHost.trim().replace(/^@/, "")}`);
    if (themeId) enrichedTags.push(`theme:${themeId}`);

    try {
      const result = await createPool.mutateAsync({
        title, category, emoji: cat?.label || "Activity",
        city, area, venue, description, tags: enrichedTags, skillLevel,
        scheduledTime: scheduledDate.toISOString(),
        spotsTotal: spots,
        costPerHead: isFree ? 0 : parseInt(cost) || 0,
      });
      addXP(50);
      const firstHost = earnAchievement("first_host");
      toast.success(firstHost ? "Pool raised · First Host unlocked · +50 XP" : "Pool raised · +50 XP");
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

                {/* Vibe templates — Partiful "format does the hosting" pattern.
                    One tap pre-fills title, desc, tags, spots, dress code. */}
                {category && VIBE_TEMPLATES[category]?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={12} className="text-pink-400" strokeWidth={2.5} />
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-400">// Quick-start vibe</div>
                    </div>
                    <div className="space-y-2">
                      {VIBE_TEMPLATES[category].map((tpl, i) => (
                        <motion.button
                          key={tpl.id}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12 + i * 0.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => applyTemplate(tpl)}
                          className="card-stage w-full p-4 text-left flex items-start gap-3"
                        >
                          <div className="text-2xl shrink-0 leading-none">{tpl.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-display font-bold text-sm leading-tight">{tpl.title}</div>
                            <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{tpl.description}</div>
                            <div className="flex gap-1.5 mt-2">
                              {tpl.tags.slice(0, 2).map(t => (
                                <span key={t} className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-foreground/60">{t}</span>
                              ))}
                              <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary num">
                                {tpl.spots} spots
                              </span>
                            </div>
                          </div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-pink-400 shrink-0 self-center">tap</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
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

                {/* Dress code — Hosted Vibe pattern. Tap-to-add chip, not text. */}
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Shirt size={10} className="text-primary" strokeWidth={2.5} />
                    Dress code (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DRESS_CODE_OPTIONS.map(d => (
                      <Pill key={d} active={dressCode === d} onClick={() => setDressCode(dressCode === d ? "" : d)}>{d}</Pill>
                    ))}
                  </div>
                </div>

                {/* Color theme — Partiful pattern. The pool is a "designed object."
                    Picker shows live gradient swatches so hosts feel the vibe. */}
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Palette size={10} className="text-primary" strokeWidth={2.5} />
                    Color theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {POOL_THEMES.map((t) => {
                      const active = themeId === t.id;
                      return (
                        <motion.button
                          key={t.id}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setThemeId(t.id)}
                          className="aspect-square rounded-2xl relative overflow-hidden border transition-all"
                          style={{
                            backgroundImage: t.gradient,
                            borderColor: active ? t.accent : "rgba(255,255,255,0.08)",
                            boxShadow: active ? `0 0 18px ${t.glow}` : undefined,
                          }}
                          title={t.label}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl leading-none" style={{ color: t.accent }}>{t.emoji}</span>
                            <span className="text-[8px] font-mono uppercase tracking-wider mt-1.5" style={{ color: t.foreground }}>
                              {t.label.split(" ")[0]}
                            </span>
                          </div>
                          {active && (
                            <div
                              className="absolute top-1 right-1 w-3 h-3 rounded-full"
                              style={{ background: t.accent, boxShadow: `0 0 8px ${t.glow}` }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground mt-2 leading-relaxed">
                    {themeFor(themeId)?.vibe}
                  </p>
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

                {/* Co-host invite — playbook: doubles trust + reach via co-host's social graph */}
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Tag your accomplice (optional)</label>
                  <div className="card-stage p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-primary" strokeWidth={2.5} />
                    </div>
                    <input
                      value={coHost}
                      onChange={e => setCoHost(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm font-mono placeholder:text-foreground/30"
                      placeholder="@username"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground mt-2 leading-relaxed">
                    Co-hosts double your reach · their friends see your pool too
                  </p>
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

                <div
                  className="card-stage mt-6 p-5 relative overflow-hidden"
                  style={{
                    backgroundImage: themeFor(themeId)?.gradient,
                    borderColor: (themeFor(themeId)?.accent || "") + "40",
                    boxShadow: `0 0 0 1px ${themeFor(themeId)?.accent}22, 0 18px 50px -12px ${themeFor(themeId)?.glow}`,
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(120% 80% at 50% -20%, ${themeFor(themeId)?.accent}22 0%, transparent 60%)`,
                    }}
                  />
                  <div className="relative">
                    <div
                      className="text-[10px] font-mono uppercase tracking-[0.15em] inline-flex items-center gap-1"
                      style={{ color: themeFor(themeId)?.accent }}
                    >
                      <span>{themeFor(themeId)?.emoji}</span>
                      {CATEGORIES.find(c => c.id === category)?.label}
                    </div>
                    <h3 className="font-display font-bold text-2xl mt-1" style={{ color: themeFor(themeId)?.foreground }}>{title}</h3>
                    {description && (
                      <p className="text-sm mt-2" style={{ color: (themeFor(themeId)?.foreground || "") + "cc" }}>{description}</p>
                    )}

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
                      {dressCode && (
                        <div className="flex items-center gap-3 text-sm">
                          <Shirt size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                          <span>{dressCode}</span>
                        </div>
                      )}
                      {coHost && (
                        <div className="flex items-center gap-3 text-sm">
                          <Users size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                          <span>Co-host: <span className="text-primary font-mono">{coHost.startsWith("@") ? coHost : `@${coHost}`}</span></span>
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
