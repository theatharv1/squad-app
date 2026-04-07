import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { CITIES } from "@/constants";
import { toast } from "sonner";

const Register = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Bhopal");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name, username, email, password, city });
      toast.success("Welcome to SQUAD");
      navigate("/onboarding");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col px-6 pt-12 pb-8 relative overflow-hidden">
        {/* Spotlight orbs */}
        <div className="absolute top-20 -right-32 w-72 h-72 bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-3">// Issue your pass</div>
            <h1 className="text-display-lg">
              Get on <br />
              <span className="text-gradient-cyan-magenta">the list</span>
            </h1>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-stage" placeholder="Your full name" required minLength={2} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Handle</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} className="input-stage" placeholder="@yourhandle" required minLength={3} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-stage" placeholder="you@gmail.com" required />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-stage" placeholder="Min 6 characters" required minLength={6} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Your city</label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                      city === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/[0.04] border border-white/10 text-foreground/70"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary text-primary-foreground rounded-2xl py-4 font-display font-bold text-base flex items-center justify-center gap-2"
              style={{ boxShadow: "0 0 32px hsla(73, 100%, 50%, 0.4)" }}
            >
              {loading ? "Issuing pass..." : (
                <>
                  Claim my pass
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground mt-8"
          >
            Already on the list?{" "}
            <Link to="/login" className="text-primary font-mono uppercase tracking-wider font-bold">
              Sign in
            </Link>
          </motion.p>
        </div>
      </div>
    </MobileFrame>
  );
};

export default Register;
