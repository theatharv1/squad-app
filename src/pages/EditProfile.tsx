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
      toast.success("Profile updated!");
      navigate(-1);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-8">
        {/* Glass Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><ArrowLeft size={20} /></motion.button>
            <h1 className="font-heading text-lg font-bold">Edit Profile</h1>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
        </div>

        <div className="flex justify-center mt-6">
          <img src={user?.avatarUrl || ""} className="w-20 h-20 rounded-full avatar-ring shadow-glow" />
        </div>

        <div className="px-4 mt-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="input-premium w-full mt-1" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="input-premium w-full mt-1 resize-none" />
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
            <label className="text-sm text-muted-foreground">Sports & Interests</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => toggleSport(cat.label)}
                  className={`pill ${sports.includes(cat.label) ? "pill-active" : "pill-inactive"}`}
                >{cat.emoji} {cat.label}</button>
              ))}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={updateProfile.isPending}
            className="btn-primary w-full font-bold py-3.5 rounded-xl disabled:opacity-50 mt-2 shadow-glow">
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>
    </MobileFrame>
  );
};

export default EditProfile;
