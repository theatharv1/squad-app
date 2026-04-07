import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/home");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col px-6 pt-16 pb-8 relative overflow-hidden">
        {/* Spotlight orbs */}
        <div className="absolute top-0 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 -right-32 w-72 h-72 bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Logo block */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-3">// 2026 · India</div>
            <h1 className="text-display-xl">
              SQUAD
            </h1>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">your scene awaits</span>
            </div>
          </motion.div>

          {/* Marquee strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="marquee mb-10 py-2 border-y border-white/5"
          >
            <div className="marquee-track text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
              <span className="px-4">Football</span>
              <span className="text-primary">★</span>
              <span className="px-4">Late Night Coffee</span>
              <span className="text-primary">★</span>
              <span className="px-4">Bandra to Worli Run</span>
              <span className="text-primary">★</span>
              <span className="px-4">Indore Cricket</span>
              <span className="text-primary">★</span>
              <span className="px-4">Pune Trek</span>
              <span className="text-primary">★</span>
              <span className="px-4">Football</span>
              <span className="text-primary">★</span>
              <span className="px-4">Late Night Coffee</span>
              <span className="text-primary">★</span>
              <span className="px-4">Bandra to Worli Run</span>
              <span className="text-primary">★</span>
              <span className="px-4">Indore Cricket</span>
              <span className="text-primary">★</span>
              <span className="px-4">Pune Trek</span>
              <span className="text-primary">★</span>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-stage"
                placeholder="you@gmail.com"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-stage"
                placeholder="••••••••"
                required
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-primary text-primary-foreground rounded-2xl py-4 font-display font-bold text-base flex items-center justify-center gap-2 transition-all"
              style={{ boxShadow: "0 0 32px hsla(73, 100%, 50%, 0.4)" }}
            >
              {loading ? "Loading..." : (
                <>
                  Step into the scene
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </motion.button>
          </form>

          <div className="flex-1" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8"
          >
            <p className="text-xs text-muted-foreground">
              First time here?{" "}
              <Link to="/register" className="text-primary font-mono uppercase tracking-wider font-bold">
                Get a pass
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </MobileFrame>
  );
};

export default Login;
