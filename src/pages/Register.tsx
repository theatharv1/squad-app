import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
      toast.success("Welcome to SQUAD!");
      navigate("/onboarding");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col justify-center p-6 relative overflow-hidden">
        <div className="absolute top-10 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-20 w-60 h-60 bg-accent/8 rounded-full blur-3xl" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="relative z-10">
          <h1 className="font-heading text-4xl font-bold text-center mb-1 gradient-text">Join SQUAD</h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">Find your people in your city</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium tracking-wide uppercase">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full input-premium" placeholder="Your name" required minLength={2} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium tracking-wide uppercase">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                className="w-full input-premium" placeholder="your_username" required minLength={3} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium tracking-wide uppercase">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full input-premium" placeholder="you@email.com" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium tracking-wide uppercase">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full input-premium" placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium tracking-wide uppercase">Your City</label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map(c => (
                  <button key={c} type="button" onClick={() => setCity(c)}
                    className={`pill ${city === c ? "pill-active" : "pill-inactive"}`}
                  >{c}</button>
                ))}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading} className="w-full btn-primary mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </MobileFrame>
  );
};

export default Register;
