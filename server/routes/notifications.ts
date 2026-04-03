import { Router } from "express";
import { db, schema } from "../db/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications
router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const notifs = await db.select().from(schema.notifications)
      .where(eq(schema.notifications.userId, req.user!.userId))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit).offset(offset);

    const [{ count }] = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(schema.notifications)
      .where(and(
        eq(schema.notifications.userId, req.user!.userId),
        eq(schema.notifications.isRead, false),
      ));

    res.json({ notifications: notifs, unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    await db.update(schema.notifications).set({ isRead: true })
      .where(and(
        eq(schema.notifications.id, req.params.id),
        eq(schema.notifications.userId, req.user!.userId),
      ));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification read" });
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", requireAuth, async (req, res) => {
  try {
    await db.update(schema.notifications).set({ isRead: true })
      .where(eq(schema.notifications.userId, req.user!.userId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

export default router;
