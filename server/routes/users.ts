import { Router } from "express";
import { db, schema } from "../db/index.js";
import { eq, and, ilike, sql, desc, ne } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().optional(),
  sportsPlayed: z.array(z.string()).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
});

// GET /api/users/search?q=&city=
router.get("/search", optionalAuth, async (req, res) => {
  try {
    const q = req.query.q as string || "";
    const city = req.query.city as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    let query = db.select({
      id: schema.users.id, name: schema.users.name, username: schema.users.username,
      avatarUrl: schema.users.avatarUrl, bio: schema.users.bio, city: schema.users.city,
      sportsPlayed: schema.users.sportsPlayed, rating: schema.users.rating,
      totalGames: schema.users.totalGames, showUpRate: schema.users.showUpRate,
      followersCount: schema.users.followersCount, followingCount: schema.users.followingCount,
      karma: schema.users.karma,
    }).from(schema.users).where(
      and(
        eq(schema.users.isBanned, false),
        ...(q ? [ilike(schema.users.name, `%${q}%`)] : []),
        ...(city ? [eq(schema.users.city, city)] : []),
      )
    ).limit(limit).$dynamic();

    const users = await query;
    res.json(users);
  } catch (err) {
    console.error("Search users error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// GET /api/users/leaderboard?type=topHosts|mostActive
router.get("/leaderboard", async (req, res) => {
  try {
    const type = req.query.type as string || "topHosts";
    let result;

    if (type === "mostActive") {
      result = await db.select({
        id: schema.users.id, name: schema.users.name, username: schema.users.username,
        avatarUrl: schema.users.avatarUrl, rating: schema.users.rating,
        city: schema.users.city, totalGames: schema.users.totalGames,
      }).from(schema.users)
        .where(eq(schema.users.isBanned, false))
        .orderBy(desc(schema.users.totalGames))
        .limit(10);
    } else {
      // topHosts: count pools hosted
      result = await db.select({
        id: schema.users.id, name: schema.users.name, username: schema.users.username,
        avatarUrl: schema.users.avatarUrl, rating: schema.users.rating,
        city: schema.users.city,
        poolsHosted: sql<number>`count(${schema.pools.id})::int`.as("pools_hosted"),
      }).from(schema.users)
        .leftJoin(schema.pools, eq(schema.users.id, schema.pools.hostId))
        .where(eq(schema.users.isBanned, false))
        .groupBy(schema.users.id)
        .orderBy(sql`count(${schema.pools.id}) desc`)
        .limit(10);
    }

    res.json(result);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Leaderboard failed" });
  }
});

// GET /api/users/:id
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const [user] = await db.select({
      id: schema.users.id, name: schema.users.name, username: schema.users.username,
      avatarUrl: schema.users.avatarUrl, bio: schema.users.bio, city: schema.users.city,
      sportsPlayed: schema.users.sportsPlayed, rating: schema.users.rating,
      totalGames: schema.users.totalGames, showUpRate: schema.users.showUpRate,
      followersCount: schema.users.followersCount, followingCount: schema.users.followingCount,
      karma: schema.users.karma, isVerified: schema.users.isVerified, role: schema.users.role,
      createdAt: schema.users.createdAt,
    }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);

    if (!user) return res.status(404).json({ error: "User not found" });

    const badges = await db.select().from(schema.badges).where(eq(schema.badges.userId, userId));

    let isFollowing = false;
    if (req.user) {
      const [follow] = await db.select().from(schema.follows)
        .where(and(
          eq(schema.follows.followerId, req.user.userId),
          eq(schema.follows.followingId, userId),
        )).limit(1);
      isFollowing = !!follow;
    }

    res.json({ ...user, badges, isFollowing });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// PUT /api/users/me
router.put("/me", requireAuth, validate(updateProfileSchema), async (req, res) => {
  try {
    const [updated] = await db.update(schema.users)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(schema.users.id, req.user!.userId))
      .returning();

    const { passwordHash: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// GET /api/users/:id/followers
router.get("/:id/followers", async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const followers = await db.select({
      id: schema.users.id, name: schema.users.name, username: schema.users.username,
      avatarUrl: schema.users.avatarUrl, city: schema.users.city,
      rating: schema.users.rating, sportsPlayed: schema.users.sportsPlayed,
    }).from(schema.follows)
      .innerJoin(schema.users, eq(schema.follows.followerId, schema.users.id))
      .where(eq(schema.follows.followingId, userId))
      .limit(limit).offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
      .from(schema.follows).where(eq(schema.follows.followingId, userId));

    res.json({ users: followers, total: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to get followers" });
  }
});

// GET /api/users/:id/following
router.get("/:id/following", async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const following = await db.select({
      id: schema.users.id, name: schema.users.name, username: schema.users.username,
      avatarUrl: schema.users.avatarUrl, city: schema.users.city,
      rating: schema.users.rating, sportsPlayed: schema.users.sportsPlayed,
    }).from(schema.follows)
      .innerJoin(schema.users, eq(schema.follows.followingId, schema.users.id))
      .where(eq(schema.follows.followerId, userId))
      .limit(limit).offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
      .from(schema.follows).where(eq(schema.follows.followerId, userId));

    res.json({ users: following, total: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to get following" });
  }
});

// POST /api/users/:id/follow
router.post("/:id/follow", requireAuth, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user!.userId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    await db.insert(schema.follows).values({
      followerId: req.user!.userId,
      followingId: targetId,
    }).onConflictDoNothing();

    // Update counts
    await db.update(schema.users)
      .set({ followingCount: sql`${schema.users.followingCount} + 1` })
      .where(eq(schema.users.id, req.user!.userId));
    await db.update(schema.users)
      .set({ followersCount: sql`${schema.users.followersCount} + 1` })
      .where(eq(schema.users.id, targetId));

    // Create notification
    const [me] = await db.select({ name: schema.users.name }).from(schema.users).where(eq(schema.users.id, req.user!.userId));
    await db.insert(schema.notifications).values({
      userId: targetId,
      type: "social",
      text: `${me.name} started following you`,
      actionLabel: "Follow Back",
      linkTo: `/profile/${req.user!.userId}`,
    });

    res.json({ followed: true });
  } catch (err) {
    res.status(500).json({ error: "Follow failed" });
  }
});

// DELETE /api/users/:id/follow
router.delete("/:id/follow", requireAuth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const result = await db.delete(schema.follows).where(and(
      eq(schema.follows.followerId, req.user!.userId),
      eq(schema.follows.followingId, targetId),
    ));

    await db.update(schema.users)
      .set({ followingCount: sql`greatest(${schema.users.followingCount} - 1, 0)` })
      .where(eq(schema.users.id, req.user!.userId));
    await db.update(schema.users)
      .set({ followersCount: sql`greatest(${schema.users.followersCount} - 1, 0)` })
      .where(eq(schema.users.id, targetId));

    res.json({ followed: false });
  } catch (err) {
    res.status(500).json({ error: "Unfollow failed" });
  }
});

export default router;
