import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin } from "lucide-react";
import { VENUES, POOLS } from "@/data/mockData";
import PoolCard from "@/components/PoolCard";
import MobileFrame from "@/components/layout/MobileFrame";

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const venue = VENUES.find(v => v.id === id);
  if (!venue) return <MobileFrame><div className="p-4"><button onClick={() => navigate(-1)} className="text-sm text-primary">Go back</button><p className="mt-4">Venue not found</p></div></MobileFrame>;

  const venuePools = POOLS.filter(p => p.venue.includes(venue.name.split(" ")[0]) || p.area === venue.area).slice(0, 5);

  return (
    <MobileFrame>
      <div className="min-h-screen pb-8">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1 className="font-heading text-lg font-bold truncate">{venue.name}</h1>
        </div>
        <div className="px-4 mt-2">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-base font-semibold">{venue.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{venue.type} · {venue.area}, {venue.city}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={12} className="text-warning fill-warning" />
              <span className="text-xs font-medium">{venue.rating}</span>
              <span className="text-xs text-muted-foreground">({venue.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {venue.amenities.map(a => <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-secondary">{a}</span>)}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Pools at this venue ({venuePools.length})</p>
            <div className="flex flex-col gap-3">
              {venuePools.map(p => <PoolCard key={p.id} pool={p} />)}
              {venuePools.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No pools here right now</p>}
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
