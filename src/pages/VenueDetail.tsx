import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin, Building2 } from "lucide-react";
import { useVenue } from "@/hooks/useVenues";
import { usePools } from "@/hooks/usePools";
import { PoolCard } from "@/components/PoolCard";
import { MobileFrame } from "@/components/layout/MobileFrame";

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: venue, isLoading } = useVenue(id);
  const { data: pools = [] } = usePools(venue ? { city: venue.city } : {});
  const venuePools = pools.filter(p => p.venue?.toLowerCase().includes(venue?.name?.toLowerCase() || "") || p.area === venue?.area);

  if (isLoading || !venue) {
    return (
      <MobileFrame>
        <div className="min-h-screen p-5 space-y-3">
          <div className="card-stage h-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" style={{ animation: "shimmer 2s infinite" }} />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="card-stage h-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" style={{ animation: "shimmer 2s infinite" }} />
            </div>
          ))}
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="min-h-screen pb-12">
        {/* Hero header with gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 -right-32 w-80 h-80 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-20 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

          {/* Top bar */}
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
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// Iconic spot</div>
            </div>
          </div>

          {/* Venue header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 px-5 mt-6"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/40">{venue.type}</div>
            <h1 className="text-display-lg mt-2">
              <span className="text-gradient-cyan-magenta">{venue.name}</span>
            </h1>
            <div className="flex items-center gap-2 mt-3 text-sm font-mono text-muted-foreground">
              <MapPin size={13} className="text-primary" strokeWidth={2.5} />
              <span>{venue.area}, {venue.city}</span>
            </div>
          </motion.div>
        </div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-5 mt-6"
        >
          <div className="card-stage p-4">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              <div className="px-2">
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Rating</div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Star size={14} className="text-primary fill-primary" />
                  <span className="font-display font-bold text-lg num">{venue.rating}</span>
                </div>
              </div>
              <div className="px-2 text-center">
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Reviews</div>
                <div className="font-display font-bold text-lg num text-cyan-300 mt-1.5">{venue.reviewCount}</div>
              </div>
              <div className="px-2 text-right">
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Pools</div>
                <div className="font-display font-bold text-lg num text-magenta-400 mt-1.5">{venuePools.length}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="px-5 mt-6"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-3">// Amenities</div>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((a, i) => (
                <motion.span
                  key={a}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-foreground/80"
                >
                  {a}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pools at venue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-5 mt-8"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// Live now</div>
              <h2 className="font-display font-bold text-lg mt-0.5">Pools at this spot</h2>
            </div>
            {venuePools.length > 0 && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground num">
                {venuePools.length} active
              </span>
            )}
          </div>

          {venuePools.length > 0 ? (
            <div className="space-y-3">
              {venuePools.map((p, i) => (
                <PoolCard key={p.id} pool={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="card-stage flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
                <Building2 size={22} className="text-muted-foreground" strokeWidth={2} />
              </div>
              <p className="font-display font-bold text-sm">Quiet here right now</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">Be the first to host a pool</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/create")}
                className="mt-5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[11px] font-mono uppercase tracking-wider font-bold"
                style={{ boxShadow: "0 0 20px hsla(73, 100%, 50%, 0.4)" }}
              >
                Host a pool
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </MobileFrame>
  );
};

export default VenueDetail;
