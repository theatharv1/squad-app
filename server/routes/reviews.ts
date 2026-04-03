import { Router } from "express";
import { db, schema } from "../db/index.js";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

const router = Router();

const createReviewSchema = z.object({
  reviewedUserId: z.string().uuid(),
  poolId: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  text: z.string().max(500).optional(),
});

// POST /api/reviews
router.post("/", requireAuth, validate(createReviewSchema), async (req, res) => {
  try {
    if (req.body.reviewedUserId === req.user!.userId) {
      return res.status(400).json({ error: "Cannot review yourself" });
    }

    const [review] = await db.insert(schema.reviews).values({
      reviewerId: req.user!.userId,
      reviewedUserId: req.body.reviewedUserId,
      poolId: req.body.poolId,
      rating: req.body.rating,
      text: req.body.text,
    }).returning();

    // Update reviewed user's average rating
    const [{ avg }] = await db.select({
      avg: sql<string>`round(avg(${schema.reviews.rating}), 2)`,
    }).from(schema.reviews)
      .where(eq(schema.reviews.reviewedUserId, req.body.reviewedUserId));

    await db.update(schema.users).set({ rating: avg || "0" })
      .where(eq(schema.users.id, req.body.reviewedUserId));

    // Notification
    const [me] = await db.select({ name: schema.users.name }).from(schema.users).where(eq(schema.users.id, req.user!.userId));
    await db.insert(schema.notifications).values({
      userId: req.body.reviewedUserId,
      type: "review",
      text: `${me.name} left you a ${req.body.rating}-star review!`,
      linkTo: `/profile/${req.body.reviewedUserId}`,
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// GET /api/reviews/user/:id
router.get("/user/:id", async (req, res) => {
  try {
    const revs = await db.select({
      id: schema.reviews.id,
      rating: schema.reviews.rating,
      text: schema.reviews.text,
      createdAt: schema.reviews.createdAt,
      reviewerName: schema.users.name,
      reviewerAvatar: schema.users.avatarUrl,
      reviewerId: schema.users.id,
    }).from(schema.reviews)
      .innerJoin(schema.users, eq(schema.reviews.reviewerId, schema.users.id))
      .where(eq(schema.reviews.reviewedUserId, req.params.id))
      .orderBy(desc(schema.reviews.createdAt));
    res.json(revs);
  } catch (err) {
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

export default router;
