import { Router } from "express";
import { db, schema } from "../db/index.js";
import { eq, sql, desc, ilike, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

// All admin routes require admin or moderator role
router.use(requireAuth, requireRole("admin", "moderator"));

// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
  try {
    const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)::int` }).from(schema.users);
    const [{ totalPools }] = await db.select({ totalPools: sql<number>`count(*)::int` }).from(schema.pools);
    const [{ activePools }] = await db.select({ activePools: sql<number>`count(*)::int` })
      .from(schema.pools).where(eq(schema.pools.status, "open"));
    const [{ pendingReports }] = await db.select({ pendingReports: sql<number>`count(*)::int` })
      .from(schema.reports).where(eq(schema.reports.status, "pending"));
    const [{ totalMessages }] = await db.select({ totalMessages: sql<number>`count(*)::int` }).from(schema.messages);

    res.json({ totalUsers, totalPools, activePools, pendingReports, totalMessages });
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const search = req.query.search as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const conditions = search ? [ilike(schema.users.name, `%${search}%`)] : [];

    const usersList = await db.select({
      id: schema.users.id, name: schema.users.name, username: schema.users.username,
      email: schema.users.email, avatarUrl: schema.users.avatarUrl, city: schema.users.city,
      role: schema.users.role, isBanned: schema.users.isBanned,
      karma: schema.users.karma, totalGames: schema.users.totalGames,
      createdAt: schema.users.createdAt,
    }).from(schema.users)
      .where(and(...conditions))
      .orderBy(desc(schema.users.createdAt))
      .limit(limit).offset(offset);

    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` })
      .from(schema.users).where(and(...conditions));

    res.json({ users: usersList, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to get users" });
  }
});

// PUT /api/admin/users/:id/role
router.put("/users/:id/role", requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "moderator", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const [updated] = await db.update(schema.users).set({ role })
      .where(eq(schema.users.id, req.params.id)).returning();
    res.json({ id: updated.id, role: updated.role });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

// PUT /api/admin/users/:id/ban
router.put("/users/:id/ban", async (req, res) => {
  try {
    const { banned } = req.body;
    const [updated] = await db.update(schema.users).set({ isBanned: !!banned })
      .where(eq(schema.users.id, req.params.id)).returning();
    res.json({ id: updated.id, isBanned: updated.isBanned });
  } catch (err) {
    res.status(500).json({ error: "Failed to update ban status" });
  }
});

export default router;
