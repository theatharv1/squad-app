import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { CATEGORIES, CITIES } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useUsers";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { toast } from "sonner";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [city, setCity] = useState(user?.city || "Bhopal");
  const [sports, setSports] = useState<string[]>(user?.sportsPlayed || []);

  const toggleSport = (s: string) => setSports(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ name, bio, city, sportsPlayed: sports } as any);
      await refreshUser();
      toast.success("Profile updated");
      navigate(-1);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen pb-12">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </motion.button>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Account</div>
              <h1 className="font-display font-bold text-xl mt-0.5">Edit profile</h1>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mt-8"
        >
          <div className="avatar-ring">
            <div className="w-24 h-24 rounded-full bg-card overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display font-bold text-3xl">{user?.name?.[0]}</div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="px-5 mt-8 space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-stage"
              placeholder="Your name"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="input-stage resize-none"
              placeholder="Tell people about yourself"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">City</label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                    city === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/[0.04] border border-white/10 text-foreground/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Sports & interests</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleSport(cat.label)}
                  className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                    sports.includes(cat.label)
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/[0.04] border border-white/10 text-foreground/70"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full mt-4 py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-base disabled:opacity-50"
            style={{ boxShadow: "0 0 24px hsla(73, 100%, 50%, 0.4)" }}
          >
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </motion.button>
        </div>
      </div>
    </MobileFrame>
  );
};

export default EditProfile;
