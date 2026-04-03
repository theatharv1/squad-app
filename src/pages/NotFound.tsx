import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="text-8xl font-bold gradient-text mb-4">
          404
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground mb-8">
          Oops! Page not found
        </motion.p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate("/")}
          className="btn-primary px-6 py-3 rounded-xl font-semibold shadow-glow">
          Return to Home
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NotFound;
