import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin } from "lucide-react";
import { useVenue } from "@/hooks/useVenues";
import { usePools } from "@/hooks/usePools";
import { PoolCard } from "@/components/PoolCard";
import { MobileFrame } from "@/components/layout/MobileFrame";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: venue, isLoading } = useVenue(id);
  const { data: pools = [] } = usePools(venue ? { city: venue.city } : {});
  const venuePools = pools.filter(p => p.venue?.toLowerCase().includes(venue?.name?.toLowerCase() || "") || p.area === venue?.area);

  if (isLoading || !venue) return (
    <MobileFrame>
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="shimmer rounded-2xl h-8 w-3/4" />
        <div className="shimmer rounded-2xl h-5 w-1/2" />
        <div className="shimmer rounded-2xl h-5 w-1/3" />
        <div className="shimmer rounded-2xl h-32" />
      </div>
    </MobileFrame>
  );

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-8">
        {/* Glass Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><ArrowLeft size={20} /></motion.button>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
        </div>

        <div className="px-4 mt-4">
          <h1 className="font-heading text-xl font-bold">
            <span className="gradient-text">{venue.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin size={12} /> {venue.type} · {venue.area}, {venue.city}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Star size={14} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" />
            <span className="text-sm font-medium">{venue.rating}</span>
            <span className="text-xs text-muted-foreground">({venue.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="px-4 mt-4">
            <h3 className="font-semibold text-sm mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-1.5">
              {venue.amenities.map(a => <span key={a} className="pill pill-inactive">{a}</span>)}
            </div>
          </div>
        )}

        {/* Pools */}
        <div className="px-4 mt-4">
          <h3 className="font-semibold text-sm mb-2">Pools at this venue</h3>
          {venuePools.length > 0 ? (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {venuePools.map(p => (
                <motion.div key={p.id} variants={item}><PoolCard pool={p} /></motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-muted-foreground text-sm">No pools at this venue right now</p>
          )}
        </div>
      </motion.div>
    </MobileFrame>
  );
};

export default VenueDetail;
