import { Router } from "express";
import { db, schema } from "../db/index.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

const router = Router();

const createReportSchema = z.object({
  reportedUserId: z.string().uuid().optional(),
  reportedPoolId: z.string().uuid().optional(),
  reason: z.string().min(10).max(1000),
});

// POST /api/reports
router.post("/", requireAuth, validate(createReportSchema), async (req, res) => {
  try {
    const [report] = await db.insert(schema.reports).values({
      reporterId: req.user!.userId,
      reportedUserId: req.body.reportedUserId,
      reportedPoolId: req.body.reportedPoolId,
      reason: req.body.reason,
    }).returning();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to create report" });
  }
});

// GET /api/reports (admin/mod)
router.get("/", requireAuth, requireRole("admin", "moderator"), async (req, res) => {
  try {
    const status = req.query.status as string || "pending";
    const reportsList = await db.select({
      id: schema.reports.id,
      reason: schema.reports.reason,
      status: schema.reports.status,
      createdAt: schema.reports.createdAt,
      reporterName: schema.users.name,
      reportedUserId: schema.reports.reportedUserId,
      reportedPoolId: schema.reports.reportedPoolId,
    }).from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.reporterId, schema.users.id))
      .where(eq(schema.reports.status, status as any))
      .orderBy(desc(schema.reports.createdAt));
    res.json(reportsList);
  } catch (err) {
    res.status(500).json({ error: "Failed to get reports" });
  }
});

// PUT /api/reports/:id
router.put("/:id", requireAuth, requireRole("admin", "moderator"), async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db.update(schema.reports).set({
      status,
      resolvedAt: new Date(),
    }).where(eq(schema.reports.id, req.params.id)).returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

export default router;
