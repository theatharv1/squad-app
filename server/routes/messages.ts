import { Router } from "express";
import { db, schema } from "../db/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/conversations
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const memberships = await db.select({ conversationId: schema.conversationMembers.conversationId })
      .from(schema.conversationMembers)
      .where(eq(schema.conversationMembers.userId, req.user!.userId));

    const convIds = memberships.map(m => m.conversationId);
    if (convIds.length === 0) return res.json([]);

    const convs = [];
    for (const convId of convIds) {
      const [conv] = await db.select().from(schema.conversations)
        .where(eq(schema.conversations.id, convId)).limit(1);
      if (!conv) continue;

      // Get last message
      const [lastMsg] = await db.select({
        text: schema.messages.text,
        senderName: schema.users.name,
        createdAt: schema.messages.createdAt,
        isSystem: schema.messages.isSystem,
      }).from(schema.messages)
        .leftJoin(schema.users, eq(schema.messages.senderId, schema.users.id))
        .where(eq(schema.messages.conversationId, convId))
        .orderBy(desc(schema.messages.createdAt))
        .limit(1);

      // Get member count
      const [{ count }] = await db.select({ count: sql<number>`count(*)::int` })
        .from(schema.conversationMembers)
        .where(eq(schema.conversationMembers.conversationId, convId));

      // For DM, get the other user's info
      let name = conv.name;
      let avatar = "";
      if (!conv.isGroup) {
        const [otherMember] = await db.select({
          name: schema.users.name, avatarUrl: schema.users.avatarUrl,
        }).from(schema.conversationMembers)
          .innerJoin(schema.users, eq(schema.conversationMembers.userId, schema.users.id))
          .where(and(
            eq(schema.conversationMembers.conversationId, convId),
            sql`${schema.conversationMembers.userId} != ${req.user!.userId}`,
          )).limit(1);
        if (otherMember) {
          name = otherMember.name;
          avatar = otherMember.avatarUrl || "";
        }
      } else {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Group")}&background=random&color=fff&bold=true&size=128`;
      }

      convs.push({
        id: conv.id,
        name,
        avatar,
        isGroup: conv.isGroup,
        emoji: conv.emoji,
        members: count,
        lastMessage: lastMsg?.text || "",
        lastSender: lastMsg?.senderName || "",
        timestamp: lastMsg?.createdAt || conv.createdAt,
        poolId: conv.poolId,
      });
    }

    convs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(convs);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

// GET /api/conversations/:id/messages
router.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const msgs = await db.select({
      id: schema.messages.id,
      text: schema.messages.text,
      isSystem: schema.messages.isSystem,
      createdAt: schema.messages.createdAt,
      senderId: schema.messages.senderId,
      senderName: schema.users.name,
      senderAvatar: schema.users.avatarUrl,
    }).from(schema.messages)
      .leftJoin(schema.users, eq(schema.messages.senderId, schema.users.id))
      .where(eq(schema.messages.conversationId, req.params.id))
      .orderBy(schema.messages.createdAt)
      .limit(limit).offset(offset);

    const messages = msgs.map(m => ({
      id: m.id,
      sender: m.senderName || "System",
      senderAvatar: m.senderAvatar || "",
      senderId: m.senderId,
      text: m.text,
      time: m.createdAt,
      isMe: m.senderId === req.user!.userId,
      isSystem: m.isSystem,
    }));

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// POST /api/conversations/:id/messages
router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Message text required" });

    const [msg] = await db.insert(schema.messages).values({
      conversationId: req.params.id,
      senderId: req.user!.userId,
      text: text.trim(),
    }).returning();

    const [sender] = await db.select({ name: schema.users.name, avatarUrl: schema.users.avatarUrl })
      .from(schema.users).where(eq(schema.users.id, req.user!.userId));

    res.status(201).json({
      id: msg.id,
      sender: sender.name,
      senderAvatar: sender.avatarUrl,
      senderId: msg.senderId,
      text: msg.text,
      time: msg.createdAt,
      isMe: true,
      isSystem: false,
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// POST /api/conversations — create DM
router.post("/conversations", requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // Check for existing DM
    const myConvs = await db.select({ conversationId: schema.conversationMembers.conversationId })
      .from(schema.conversationMembers)
      .where(eq(schema.conversationMembers.userId, req.user!.userId));

    for (const mc of myConvs) {
      const [conv] = await db.select().from(schema.conversations)
        .where(and(
          eq(schema.conversations.id, mc.conversationId),
          eq(schema.conversations.isGroup, false),
        )).limit(1);
      if (!conv) continue;

      const [otherMember] = await db.select().from(schema.conversationMembers)
        .where(and(
          eq(schema.conversationMembers.conversationId, conv.id),
          eq(schema.conversationMembers.userId, userId),
        )).limit(1);

      if (otherMember) return res.json({ id: conv.id, existing: true });
    }

    // Create new DM
    const [conv] = await db.insert(schema.conversations).values({
      isGroup: false,
    }).returning();

    await db.insert(schema.conversationMembers).values([
      { conversationId: conv.id, userId: req.user!.userId },
      { conversationId: conv.id, userId },
    ]);

    res.status(201).json({ id: conv.id, existing: false });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

export default router;
