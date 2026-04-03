import { Router } from "express";
import { db, schema } from "../db/index.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/venues
router.get("/", async (req, res) => {
  try {
    const city = req.query.city as string;
    const conditions = city ? [eq(schema.venues.city, city)] : [];

    const venueList = await db.select().from(schema.venues)
      .where(and(...conditions));
    res.json(venueList);
  } catch (err) {
    res.status(500).json({ error: "Failed to get venues" });
  }
});

// GET /api/venues/:id
router.get("/:id", async (req, res) => {
  try {
    const [venue] = await db.select().from(schema.venues)
      .where(eq(schema.venues.id, req.params.id)).limit(1);
    if (!venue) return res.status(404).json({ error: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: "Failed to get venue" });
  }
});

export default router;
