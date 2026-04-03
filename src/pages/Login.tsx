import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
      toast.success("Welcome back!");
      navigate("/home");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-60 h-60 bg-accent/8 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-heading text-5xl font-bold text-center mb-1 gradient-text"
          >
            SQUAD
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center mb-10 text-sm"
          >
            Your city. Your people. Tonight.
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium tracking-wide uppercase">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full input-premium" placeholder="you@email.com" required />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium tracking-wide uppercase">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full input-premium" placeholder="••••••" required />
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full btn-primary mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Sign Up</Link>
          </motion.p>
        </motion.div>
      </div>
    </MobileFrame>
  );
};

export default Login;
