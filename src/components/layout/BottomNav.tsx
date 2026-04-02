import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/explore", icon: Search, label: "Explore" },
  { path: "/create", icon: PlusCircle, label: "Create" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/profile/me", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = tabs.findIndex(t =>
    t.path === "/profile/me"
      ? location.pathname.startsWith("/profile")
      : location.pathname.startsWith(t.path)
  );

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        <div className="flex items-center justify-around relative">
          {tabs.map((tab, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center py-2 px-3 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <tab.icon
                    size={22}
                    className={isActive ? "text-primary" : "text-muted-foreground"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                </motion.div>
                <span className={`text-[10px] mt-0.5 ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
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
