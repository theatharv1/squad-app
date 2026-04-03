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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

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
    <motion.div variants={item} onClick={onClick} role={onClick ? "button" : undefined}
      className="w-full flex items-center justify-between py-3.5 px-4 cursor-pointer hover:bg-secondary/30 transition-colors rounded-xl">
      <span className="text-sm">{label}</span>
      {right || <ChevronRight size={16} className="text-muted-foreground" />}
    </motion.div>
  );

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={(e) => { e.stopPropagation(); onToggle(); }} role="switch" aria-checked={on}
      className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${on ? "gradient-primary shadow-glow" : "bg-secondary border border-border/50"}`}>
      <motion.div animate={{ x: on ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4.5 h-4.5 rounded-full bg-white shadow-sm mt-[3px]" style={{ width: 18, height: 18 }} />
    </div>
  );

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-8">
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><ArrowLeft size={20} /></motion.button>
            <h1 className="font-heading text-lg font-bold">Settings</h1>
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show">
          {/* Profile Card */}
          <motion.button variants={item} onClick={() => navigate("/profile/me/edit")} className="flex items-center gap-3 px-4 py-4 w-full hover:bg-secondary/20 transition-colors rounded-xl mx-0">
            <img src={user?.avatarUrl || ""} className="w-12 h-12 rounded-full avatar-ring" />
            <div className="text-left flex-1">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">@{user?.username}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </motion.button>

          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mx-4" />

          <p className="text-xs text-muted-foreground px-4 pt-4 pb-1 font-medium tracking-wide uppercase">Account</p>
          <SettingRow label="Phone Number" right={<span className="text-sm text-muted-foreground">{user?.phone || "Not set"}</span>} />
          <Sheet open={citySheet} onOpenChange={setCitySheet}>
            <SheetTrigger asChild><div><SettingRow label="Change City" right={<span className="text-sm text-muted-foreground">{currentCity}</span>} /></div></SheetTrigger>
            <SheetContent side="bottom" className="glass-strong rounded-t-3xl border-t border-border/30">
              <SheetHeader><SheetTitle>Select City</SheetTitle></SheetHeader>
              <div className="grid grid-cols-2 gap-2.5 mt-4 pb-6">
                {CITIES.map(c => (
                  <motion.button key={c} whileTap={{ scale: 0.97 }} onClick={() => handleCityChange(c)}
                    className={`py-3 rounded-2xl text-sm font-medium transition-all ${currentCity === c ? "gradient-primary text-primary-foreground shadow-glow" : "glass"}`}
                  >{c}</motion.button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          {isAdmin && <SettingRow label="Admin Dashboard" onClick={() => navigate("/admin")} right={<span className="text-xs gradient-primary text-primary-foreground px-2.5 py-0.5 rounded-full shadow-glow">Admin</span>} />}

          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mx-4 mt-1" />

          <p className="text-xs text-muted-foreground px-4 pt-4 pb-1 font-medium tracking-wide uppercase">Preferences</p>
          <SettingRow label="Dark Mode" right={
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Moon size={14} className="text-primary" /> : <Sun size={14} className="text-warning" />}
              <Toggle on={theme === "dark"} onToggle={toggleTheme} />
            </div>
          } />
          <SettingRow label="Push Notifications" right={<Toggle on={settings.notifications} onToggle={() => toggle("notifications")} />} />
          <SettingRow label="Notification Sound" right={<Toggle on={settings.sound} onToggle={() => toggle("sound")} />} />

          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mx-4 mt-1" />

          <p className="text-xs text-muted-foreground px-4 pt-4 pb-1 font-medium tracking-wide uppercase">About</p>
          <SettingRow label="App Version" right={<span className="text-sm text-muted-foreground">1.0.0</span>} />
          <SettingRow label="Privacy Policy" />
          <SettingRow label="Terms of Service" />

          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mx-4 mt-2" />

          <div className="px-4 mt-4 space-y-1">
            <motion.button variants={item} onClick={handleLogout} className="w-full flex items-center gap-3 py-3 text-warning hover:bg-warning/10 rounded-xl px-3 transition-colors">
              <LogOut size={18} /> Log Out
            </motion.button>
            <motion.button variants={item} onClick={handleDelete} className="w-full flex items-center gap-3 py-3 text-destructive hover:bg-destructive/10 rounded-xl px-3 transition-colors">
              <Trash2 size={18} /> Delete Account
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </MobileFrame>
  );
};

export default Settings;
