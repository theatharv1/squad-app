import { Router } from "express";
import { db, schema } from "../db/index.js";
import { eq, and, sql, desc, gte, lte, ilike, ne } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

const router = Router();

const createPoolSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.string(),
  emoji: z.string(),
  city: z.string(),
  area: z.string(),
  venue: z.string().optional().default(""),
  description: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  skillLevel: z.string().optional(),
  scheduledTime: z.string(),
  spotsTotal: z.number().min(2).max(100),
  costPerHead: z.number().min(0).optional().default(0),
});

const updatePoolSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  venue: z.string().optional(),
  tags: z.array(z.string()).optional(),
  scheduledTime: z.string().optional(),
  spotsTotal: z.number().min(2).optional(),
  costPerHead: z.number().min(0).optional(),
  isLive: z.boolean().optional(),
  status: z.enum(["open", "full", "completed", "cancelled"]).optional(),
});

// GET /api/pools
router.get("/", optionalAuth, async (req, res) => {
  try {
    const city = req.query.city as string;
    const category = req.query.category as string;
    const status = req.query.status as string || "open";
    const search = req.query.search as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;
    const hostId = req.query.hostId as string;
    const date = req.query.date as string; // "today", "tomorrow", "week"

    const conditions = [
      ne(schema.pools.status, "cancelled"),
      ...(city ? [eq(schema.pools.city, city)] : []),
      ...(category && category !== "all" ? [eq(schema.pools.category, category)] : []),
      ...(status ? [eq(schema.pools.status, status as any)] : []),
      ...(search ? [ilike(schema.pools.title, `%${search}%`)] : []),
      ...(hostId ? [eq(schema.pools.hostId, hostId)] : []),
    ];

    if (date === "today") {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      conditions.push(gte(schema.pools.scheduledTime, start), lte(schema.pools.scheduledTime, end));
    } else if (date === "tomorrow") {
      const start = new Date(); start.setDate(start.getDate() + 1); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setHours(23, 59, 59, 999);
      conditions.push(gte(schema.pools.scheduledTime, start), lte(schema.pools.scheduledTime, end));
    } else if (date === "week") {
      const start = new Date();
      const end = new Date(); end.setDate(end.getDate() + 7);
      conditions.push(gte(schema.pools.scheduledTime, start), lte(schema.pools.scheduledTime, end));
    }

    const poolRows = await db.select({
      id: schema.pools.id, title: schema.pools.title, category: schema.pools.category,
      emoji: schema.pools.emoji, city: schema.pools.city, area: schema.pools.area,
      venue: schema.pools.venue, description: schema.pools.description,
      tags: schema.pools.tags, skillLevel: schema.pools.skillLevel,
      scheduledTime: schema.pools.scheduledTime, spotsTotal: schema.pools.spotsTotal,
      spotsFilled: schema.pools.spotsFilled, costPerHead: schema.pools.costPerHead,
      isLive: schema.pools.isLive, status: schema.pools.status,
      createdAt: schema.pools.createdAt,
      hostId: schema.users.id, hostName: schema.users.name,
      hostAvatar: schema.users.avatarUrl, hostRating: schema.users.rating,
      hostShowUpRate: schema.users.showUpRate,
    }).from(schema.pools)
      .innerJoin(schema.users, eq(schema.pools.hostId, schema.users.id))
      .where(and(...conditions))
      .orderBy(desc(schema.pools.createdAt))
      .limit(limit).offset(offset);

    // Check which pools user has joined
    let joinedPoolIds = new Set<string>();
    if (req.user) {
      const joined = await db.select({ poolId: schema.poolParticipants.poolId })
        .from(schema.poolParticipants)
        .where(and(
          eq(schema.poolParticipants.userId, req.user.userId),
          eq(schema.poolParticipants.status, "joined"),
        ));
      joinedPoolIds = new Set(joined.map(j => j.poolId));
    }

    const pools = poolRows.map(p => ({
      id: p.id, title: p.title, category: p.category, emoji: p.emoji,
      city: p.city, area: p.area, venue: p.venue, description: p.description,
      tags: p.tags, skillLevel: p.skillLevel, scheduledTime: p.scheduledTime,
      spotsTotal: p.spotsTotal, spotsFilled: p.spotsFilled,
      costPerHead: p.costPerHead, isLive: p.isLive, status: p.status,
      createdAt: p.createdAt,
      host: { id: p.hostId, name: p.hostName, avatar: p.hostAvatar, rating: p.hostRating, showUpRate: p.hostShowUpRate },
      joined: joinedPoolIds.has(p.id),
    }));

    res.json(pools);
  } catch (err) {
    console.error("Get pools error:", err);
    res.status(500).json({ error: "Failed to get pools" });
  }
});

// POST /api/pools
router.post("/", requireAuth, validate(createPoolSchema), async (req, res) => {
  try {
    const [pool] = await db.insert(schema.pools).values({
      ...req.body,
      hostId: req.user!.userId,
      scheduledTime: new Date(req.body.scheduledTime),
    }).returning();

    // Auto-create group conversation for the pool
    const [conversation] = await db.insert(schema.conversations).values({
      name: pool.title,
      isGroup: true,
      emoji: pool.emoji,
      poolId: pool.id,
    }).returning();

    // Add host to conversation
    await db.insert(schema.conversationMembers).values({
      conversationId: conversation.id,
      userId: req.user!.userId,
    });

    // Add host as participant
    await db.insert(schema.poolParticipants).values({
      poolId: pool.id,
      userId: req.user!.userId,
    });

    await db.update(schema.pools).set({ spotsFilled: 1 }).where(eq(schema.pools.id, pool.id));

    res.status(201).json({ ...pool, conversationId: conversation.id });
  } catch (err) {
    console.error("Create pool error:", err);
    res.status(500).json({ error: "Failed to create pool" });
  }
});

// GET /api/pools/:id
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const [pool] = await db.select({
      id: schema.pools.id, title: schema.pools.title, category: schema.pools.category,
      emoji: schema.pools.emoji, city: schema.pools.city, area: schema.pools.area,
      venue: schema.pools.venue, description: schema.pools.description,
      tags: schema.pools.tags, skillLevel: schema.pools.skillLevel,
      scheduledTime: schema.pools.scheduledTime, spotsTotal: schema.pools.spotsTotal,
      spotsFilled: schema.pools.spotsFilled, costPerHead: schema.pools.costPerHead,
      isLive: schema.pools.isLive, status: schema.pools.status,
      createdAt: schema.pools.createdAt,
      hostId: schema.users.id, hostName: schema.users.name,
      hostAvatar: schema.users.avatarUrl, hostRating: schema.users.rating,
      hostShowUpRate: schema.users.showUpRate,
    }).from(schema.pools)
      .innerJoin(schema.users, eq(schema.pools.hostId, schema.users.id))
      .where(eq(schema.pools.id, req.params.id)).limit(1);

    if (!pool) return res.status(404).json({ error: "Pool not found" });

    // Get participants
    const participants = await db.select({
      id: schema.users.id, name: schema.users.name, username: schema.users.username,
      avatarUrl: schema.users.avatarUrl, rating: schema.users.rating,
    }).from(schema.poolParticipants)
      .innerJoin(schema.users, eq(schema.poolParticipants.userId, schema.users.id))
      .where(and(
        eq(schema.poolParticipants.poolId, pool.id),
        eq(schema.poolParticipants.status, "joined"),
      ));

    let joined = false;
    if (req.user) {
      const [p] = await db.select().from(schema.poolParticipants)
        .where(and(
          eq(schema.poolParticipants.poolId, pool.id),
          eq(schema.poolParticipants.userId, req.user.userId),
          eq(schema.poolParticipants.status, "joined"),
        )).limit(1);
      joined = !!p;
    }

    // Get conversation ID
    const [conv] = await db.select({ id: schema.conversations.id })
      .from(schema.conversations).where(eq(schema.conversations.poolId, pool.id)).limit(1);

    res.json({
      id: pool.id, title: pool.title, category: pool.category, emoji: pool.emoji,
      city: pool.city, area: pool.area, venue: pool.venue, description: pool.description,
      tags: pool.tags, skillLevel: pool.skillLevel, scheduledTime: pool.scheduledTime,
      spotsTotal: pool.spotsTotal, spotsFilled: pool.spotsFilled,
      costPerHead: pool.costPerHead, isLive: pool.isLive, status: pool.status,
      createdAt: pool.createdAt,
      host: { id: pool.hostId, name: pool.hostName, avatar: pool.hostAvatar, rating: pool.hostRating, showUpRate: pool.hostShowUpRate },
      participants, joined,
      conversationId: conv?.id,
    });
  } catch (err) {
    console.error("Get pool error:", err);
    res.status(500).json({ error: "Failed to get pool" });
  }
});

// PUT /api/pools/:id
router.put("/:id", requireAuth, validate(updatePoolSchema), async (req, res) => {
  try {
    const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, req.params.id)).limit(1);
    if (!pool) return res.status(404).json({ error: "Pool not found" });
    if (pool.hostId !== req.user!.userId && req.user!.role === "user") {
      return res.status(403).json({ error: "Only the host can edit this pool" });
    }

    const updateData: any = { ...req.body, updatedAt: new Date() };
    if (req.body.scheduledTime) updateData.scheduledTime = new Date(req.body.scheduledTime);

    const [updated] = await db.update(schema.pools).set(updateData)
      .where(eq(schema.pools.id, req.params.id)).returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update pool" });
  }
});

// DELETE /api/pools/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, req.params.id)).limit(1);
    if (!pool) return res.status(404).json({ error: "Pool not found" });
    if (pool.hostId !== req.user!.userId && req.user!.role === "user") {
      return res.status(403).json({ error: "Only the host can delete this pool" });
    }

    await db.update(schema.pools).set({ status: "cancelled" }).where(eq(schema.pools.id, req.params.id));
    res.json({ message: "Pool cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete pool" });
  }
});

// POST /api/pools/:id/join
router.post("/:id/join", requireAuth, async (req, res) => {
  try {
    const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, req.params.id)).limit(1);
    if (!pool) return res.status(404).json({ error: "Pool not found" });
    if (pool.status !== "open") return res.status(400).json({ error: "Pool is not open" });
    if (pool.spotsFilled! >= pool.spotsTotal) return res.status(400).json({ error: "Pool is full" });

    await db.insert(schema.poolParticipants).values({
      poolId: pool.id,
      userId: req.user!.userId,
    }).onConflictDoNothing();

    const newFilled = pool.spotsFilled! + 1;
    const newStatus = newFilled >= pool.spotsTotal ? "full" : "open";

    await db.update(schema.pools).set({
      spotsFilled: newFilled,
      status: newStatus,
    }).where(eq(schema.pools.id, pool.id));

    // Add to conversation
    const [conv] = await db.select().from(schema.conversations)
      .where(eq(schema.conversations.poolId, pool.id)).limit(1);
    if (conv) {
      await db.insert(schema.conversationMembers).values({
        conversationId: conv.id,
        userId: req.user!.userId,
      }).onConflictDoNothing();

      // System message
      const [me] = await db.select({ name: schema.users.name }).from(schema.users).where(eq(schema.users.id, req.user!.userId));
      await db.insert(schema.messages).values({
        conversationId: conv.id,
        senderId: req.user!.userId,
        text: `${me.name} joined the pool`,
        isSystem: true,
      });
    }

    // Notification to host
    const [me] = await db.select({ name: schema.users.name }).from(schema.users).where(eq(schema.users.id, req.user!.userId));
    await db.insert(schema.notifications).values({
      userId: pool.hostId,
      type: "activity",
      text: `${me.name} joined your ${pool.title} pool`,
      linkTo: `/pool/${pool.id}`,
    });

    if (newStatus === "full") {
      await db.insert(schema.notifications).values({
        userId: pool.hostId,
        type: "pool_full",
        text: `${pool.title} is now full (${pool.spotsTotal}/${pool.spotsTotal})`,
        linkTo: `/pool/${pool.id}`,
      });
    }

    // Update user game count
    await db.update(schema.users).set({
      totalGames: sql`${schema.users.totalGames} + 1`,
    }).where(eq(schema.users.id, req.user!.userId));

    res.json({ joined: true, spotsFilled: newFilled, status: newStatus });
  } catch (err) {
    console.error("Join pool error:", err);
    res.status(500).json({ error: "Failed to join pool" });
  }
});

// DELETE /api/pools/:id/leave
router.delete("/:id/leave", requireAuth, async (req, res) => {
  try {
    const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, req.params.id)).limit(1);
    if (!pool) return res.status(404).json({ error: "Pool not found" });

    await db.update(schema.poolParticipants).set({ status: "left" })
      .where(and(
        eq(schema.poolParticipants.poolId, pool.id),
        eq(schema.poolParticipants.userId, req.user!.userId),
      ));

    const newFilled = Math.max(0, pool.spotsFilled! - 1);
    await db.update(schema.pools).set({
      spotsFilled: newFilled,
      status: newFilled < pool.spotsTotal ? "open" : "full",
    }).where(eq(schema.pools.id, pool.id));

    res.json({ joined: false, spotsFilled: newFilled });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave pool" });
  }
});

// GET /api/pools/:id/participants
router.get("/:id/participants", async (req, res) => {
  try {
    const participants = await db.select({
      id: schema.users.id, name: schema.users.name, username: schema.users.username,
      avatarUrl: schema.users.avatarUrl, rating: schema.users.rating,
    }).from(schema.poolParticipants)
      .innerJoin(schema.users, eq(schema.poolParticipants.userId, schema.users.id))
      .where(and(
        eq(schema.poolParticipants.poolId, req.params.id),
        eq(schema.poolParticipants.status, "joined"),
      ));
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: "Failed to get participants" });
  }
});

export default router;
