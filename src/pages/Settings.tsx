import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, LogOut, Trash2, Moon, Sun } from "lucide-react";
import { CITIES } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getCity, setCity as saveCity, getSettings, saveSetting } from "@/lib/storage";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, deleteAccount, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(getSettings());
  const [currentCity, setCurrentCity] = useState(getCity());
  const [citySheet, setCitySheet] = useState(false);

  const toggle = (key: string) => {
    const val = !settings[key];
    saveSetting(key, val);
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleCityChange = (c: string) => { setCurrentCity(c); saveCity(c); setCitySheet(false); };

  const handleLogout = async () => { await logout(); toast.success("Logged out"); navigate("/login"); };
  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await deleteAccount();
    toast.success("Account deleted");
    navigate("/login");
  };

  const SettingRow = ({ label, right, onClick }: { label: string; right?: React.ReactNode; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className="card-stage w-full flex items-center justify-between py-3.5 px-4 text-left"
    >
      <span className="text-sm font-display font-medium">{label}</span>
      {right || <ChevronRight size={16} className="text-muted-foreground" />}
    </button>
  );

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      role="switch"
      aria-checked={on}
      className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-300 relative ${
        on ? "bg-primary" : "bg-white/[0.08] border border-white/10"
      }`}
      style={on ? { boxShadow: "0 0 16px hsla(73, 100%, 50%, 0.4)" } : undefined}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`w-5 h-5 rounded-full absolute top-0.5 ${on ? "bg-primary-foreground" : "bg-white"}`}
      />
    </div>
  );

  const SectionLabel = ({ children }: any) => (
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary px-1 mb-2 mt-6">{children}</div>
  );

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
              <h1 className="font-display font-bold text-xl mt-0.5">Settings</h1>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 space-y-2">
          {/* Profile card */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/profile/me/edit")}
            className="card-stage w-full p-4 flex items-center gap-3 text-left"
          >
            <div className="avatar-ring shrink-0">
              <div className="w-12 h-12 rounded-full bg-card overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display font-bold">{user?.name?.[0]}</div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold truncate">{user?.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground">@{user?.username}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </motion.button>

          <SectionLabel>// Account</SectionLabel>
          <SettingRow label="Phone number" right={<span className="text-xs font-mono text-muted-foreground">{user?.phone || "Not set"}</span>} />
          <Sheet open={citySheet} onOpenChange={setCitySheet}>
            <SheetTrigger asChild>
              <div>
                <SettingRow label="Change city" right={<span className="text-xs font-mono text-primary">{currentCity}</span>} />
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="glass-strong border-t border-white/10 rounded-t-3xl">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl text-left">Pick city</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2.5 mt-5 pb-6">
                {CITIES.map(c => (
                  <motion.button
                    key={c}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCityChange(c)}
                    className={`py-4 rounded-2xl font-display font-bold text-sm transition-all ${
                      currentCity === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/[0.04] border border-white/10 text-foreground"
                    }`}
                  >
                    {c}
                  </motion.button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          {isAdmin && (
            <SettingRow
              label="Admin dashboard"
              onClick={() => navigate("/admin")}
              right={<span className="text-[9px] font-mono uppercase tracking-wider font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full">Admin</span>}
            />
          )}

          <SectionLabel>// Preferences</SectionLabel>
          <SettingRow
            label="Dark mode"
            right={
              <div className="flex items-center gap-2">
                {theme === "dark" ? <Moon size={14} className="text-primary" /> : <Sun size={14} className="text-warning" />}
                <Toggle on={theme === "dark"} onToggle={toggleTheme} />
              </div>
            }
          />
          <SettingRow label="Push notifications" right={<Toggle on={settings.notifications} onToggle={() => toggle("notifications")} />} />
          <SettingRow label="Notification sound" right={<Toggle on={settings.sound} onToggle={() => toggle("sound")} />} />

          <SectionLabel>// About</SectionLabel>
          <SettingRow label="App version" right={<span className="text-xs font-mono text-muted-foreground">2.0.0</span>} />
          <SettingRow label="Privacy policy" />
          <SettingRow label="Terms of service" />

          {/* Danger zone */}
          <div className="mt-6 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-warning/5 border border-warning/20 text-warning"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span className="font-display font-bold text-sm">Log out</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-destructive"
            >
              <Trash2 size={18} strokeWidth={2.5} />
              <span className="font-display font-bold text-sm">Delete account</span>
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
};

export default Settings;
