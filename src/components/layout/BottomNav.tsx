import { useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/explore", icon: Compass, label: "Explore" },
  { path: "/create", icon: Plus, label: "Create", primary: true },
  { path: "/messages", icon: MessageCircle, label: "Inbox" },
  { path: "/profile/me", icon: User, label: "Me" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = tabs.findIndex(t =>
    t.path === "/profile/me"
      ? location.pathname.startsWith("/profile")
      : location.pathname.startsWith(t.path)
  );

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 px-4 pb-4">
      <div className="glass-strong rounded-full px-2 py-2 relative">
        <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center justify-around relative">
          {tabs.map((tab, i) => {
            const isActive = activeIndex === i;
            const Icon = tab.icon;

            if (tab.primary) {
              return (
                <motion.button
                  key={tab.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate(tab.path)}
                  className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground"
                  style={{ boxShadow: "0 0 24px hsla(73, 100%, 50%, 0.45)" }}
                >
                  <Icon size={22} strokeWidth={3} />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-background" />
                </motion.button>
              );
            }

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-0.5 py-2 px-3 relative rounded-full"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 rounded-full bg-white/5 border border-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative z-10"
                >
                  <Icon
                    size={20}
                    className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span className={`text-[9px] font-mono uppercase tracking-wider relative z-10 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
