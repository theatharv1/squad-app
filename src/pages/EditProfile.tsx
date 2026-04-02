import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CURRENT_USER, CATEGORIES, CITIES } from "@/data/mockData";
import { getProfile, saveProfile } from "@/lib/storage";
import MobileFrame from "@/components/layout/MobileFrame";
import { toast } from "sonner";

export default function EditProfile() {
  const navigate = useNavigate();
  const saved = getProfile();
  const [name, setName] = useState(saved.name || CURRENT_USER.name);
  const [bio, setBio] = useState(saved.bio || CURRENT_USER.bio);
  const [city, setCity] = useState(saved.city || CURRENT_USER.city);
  const [sports, setSports] = useState<string[]>(saved.sports || CURRENT_USER.sportsPlayed);

  const toggleSport = (s: string) => setSports(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    saveProfile({ name, bio, city, sports });
    toast.success("Profile updated!");
    navigate(-1);
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <span className="text-sm font-medium">Edit Profile</span>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col gap-4">
          <div className="flex justify-center">
            <img src={CURRENT_USER.avatar} alt="" className="w-20 h-20 rounded-full border-2 border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none resize-none h-20" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">City</label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c)} className={`text-xs px-3 py-1.5 rounded-full ${city === c ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Sports & Interests</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => toggleSport(c.label)} className={`text-xs px-3 py-1.5 rounded-full ${sports.includes(c.label) ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{c.emoji} {c.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border">
          <button onClick={handleSave} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">Save Changes</button>
        </div>
      </div>
    </MobileFrame>
  );
}
