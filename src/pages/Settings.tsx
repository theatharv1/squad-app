import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, LogOut, Trash2 } from "lucide-react";
import { CURRENT_USER, CITIES } from "@/data/mockData";
import { getSettings, saveSetting, getCity, setCity } from "@/lib/storage";
import MobileFrame from "@/components/layout/MobileFrame";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings());
  const [citySheet, setCitySheet] = useState(false);
  const [currentCity, setCurrentCity] = useState(getCity());

  const toggle = (key: string) => {
    const val = !settings[key];
    saveSetting(key, val);
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleCityChange = (c: string) => {
    setCity(c);
    setCurrentCity(c);
    setCitySheet(false);
  };

  const SettingRow = ({ label, onClick, right }: { label: string; onClick?: () => void; right?: React.ReactNode }) => (
    <button onClick={onClick} className="flex items-center justify-between py-3 w-full text-left">
      <span className="text-sm">{label}</span>
      {right || <ChevronRight size={16} className="text-muted-foreground" />}
    </button>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-10 h-6 rounded-full transition-colors relative ${value ? "bg-primary" : "bg-secondary"}`}>
      <div className={`w-4 h-4 rounded-full bg-foreground absolute top-1 transition-transform ${value ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );

  return (
    <MobileFrame>
      <div className="min-h-screen">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-border">
          <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1 className="font-heading text-lg font-bold">Settings</h1>
        </div>

        {/* Profile */}
        <button onClick={() => navigate("/profile/me/edit")} className="flex items-center gap-3 px-4 py-4 w-full text-left border-b border-border">
          <img src={CURRENT_USER.avatar} alt="" className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{CURRENT_USER.name}</p>
            <p className="text-xs text-muted-foreground">Edit Profile</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <div className="px-4">
          <p className="text-xs text-muted-foreground mt-4 mb-1 font-medium uppercase tracking-wide">Account</p>
          <SettingRow label="Phone Number" right={<span className="text-xs text-muted-foreground">+91 98765 XXXXX</span>} />
          <SettingRow label="Change City" onClick={() => setCitySheet(true)} right={<span className="text-xs text-muted-foreground">{currentCity}</span>} />

          <p className="text-xs text-muted-foreground mt-4 mb-1 font-medium uppercase tracking-wide">Preferences</p>
          <SettingRow label="Push Notifications" right={<Toggle value={settings.notifications ?? true} onChange={() => toggle("notifications")} />} />
          <SettingRow label="Notification Sound" right={<Toggle value={settings.sound ?? true} onChange={() => toggle("sound")} />} />

          <p className="text-xs text-muted-foreground mt-4 mb-1 font-medium uppercase tracking-wide">Safety</p>
          <SettingRow label="Blocked Users" right={<span className="text-xs text-muted-foreground">0</span>} />
          <SettingRow label="Show-up Commitment" right={<span className="text-xs text-success font-medium">{CURRENT_USER.showUpRate}%</span>} />

          <p className="text-xs text-muted-foreground mt-4 mb-1 font-medium uppercase tracking-wide">About</p>
          <SettingRow label="App Version" right={<span className="text-xs text-muted-foreground">1.0.0</span>} />
          <SettingRow label="Rate SQUAD" />
          <SettingRow label="Share with Friends" />
          <SettingRow label="Privacy Policy" />
          <SettingRow label="Terms of Service" />

          <div className="mt-6 mb-8 flex flex-col gap-2">
            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondary text-sm font-medium">
              <LogOut size={16} /> Log Out
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-destructive text-sm font-medium">
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      <Sheet open={citySheet} onOpenChange={setCitySheet}>
        <SheetContent side="bottom" className="bg-card rounded-t-3xl max-w-[430px] mx-auto">
          <SheetHeader><SheetTitle className="font-heading">Change City</SheetTitle></SheetHeader>
          <div className="grid grid-cols-2 gap-2 mt-4 pb-4">
            {CITIES.map(c => (
              <button key={c} onClick={() => handleCityChange(c)} className={`py-3 px-4 rounded-xl text-sm font-medium border ${currentCity === c ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}>{c}</button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </MobileFrame>
  );
}
