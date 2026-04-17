import { useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";

// Instagram-style 5-tab bottom nav.
// Home | Explore | + (Create) | Chat | Profile
// Clean iOS aesthetic — no heavy glass, just a clean bar with subtle border.
const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/explore", icon: Compass, label: "Explore" },
  { path: "/create", icon: Plus, label: "", primary: true },
  { path: "/messages", icon: MessageCircle, label: "Chat" },
  { path: "/profile/me", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = tabs.findIndex((t) =>
    t.path === "/profile/me"
      ? location.pathname.startsWith("/profile")
      : location.pathname.startsWith(t.path)
  );

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="bg-background/90 backdrop-blur-xl border-t border-white/[0.06] px-2 pt-1.5 pb-5">
        <div className="flex items-center justify-around">
          {tabs.map((tab, i) => {
            const isActive = activeIndex === i;
            const Icon = tab.icon;

            // Center "+" button — raised, solid
            if (tab.primary) {
              return (
                <motion.button
                  key={tab.path}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => navigate(tab.path)}
                  className="relative flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground -mt-2"
                  style={{ boxShadow: "0 4px 16px hsla(73, 100%, 50%, 0.35)" }}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </motion.button>
              );
            }

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
              >
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  fill={isActive && (tab.icon === Home) ? "currentColor" : "none"}
                />
                <span
                  className={`text-[9px] tracking-wider transition-colors duration-200 ${
                    isActive ? "text-foreground" : "text-muted-foreground/50"
                  }`}
                >
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
