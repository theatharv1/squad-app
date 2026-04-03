import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, schema } from "../db/index.js";
import { eq, and } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  city: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { name, username, email, password, city } = req.body;

    const existing = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const existingUsername = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    if (existingUsername.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&size=128`;

    const [user] = await db.insert(schema.users).values({
      name,
      username,
      email,
      passwordHash,
      avatarUrl,
      city,
      bio: "",
      sportsPlayed: [],
    }).returning();

    const accessToken = generateAccessToken({ userId: user.id, role: user.role! });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role! });

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, accessToken, refreshToken });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(schema.users)
      .where(eq(schema.users.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: "Account is banned" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role! });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role! });

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    const payload = verifyRefreshToken(refreshToken);

    const [stored] = await db.select().from(schema.refreshTokens)
      .where(and(
        eq(schema.refreshTokens.token, refreshToken),
        eq(schema.refreshTokens.userId, payload.userId),
      )).limit(1);

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Rotate refresh token
    await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.id, stored.id));

    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, payload.userId)).limit(1);
    if (!user) return res.status(401).json({ error: "User not found" });

    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role! });
    const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role! });

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.delete(schema.refreshTokens).where(
        and(
          eq(schema.refreshTokens.token, refreshToken),
          eq(schema.refreshTokens.userId, req.user!.userId),
        )
      );
    }
    res.json({ message: "Logged out" });
  } catch {
    res.json({ message: "Logged out" });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(schema.users)
      .where(eq(schema.users.id, req.user!.userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });

    const badges = await db.select().from(schema.badges)
      .where(eq(schema.badges.userId, user.id));

    const { passwordHash: _, ...safeUser } = user;
    res.json({ ...safeUser, badges });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// DELETE /api/auth/me — delete account
router.delete("/me", requireAuth, async (req, res) => {
  try {
    await db.delete(schema.users).where(eq(schema.users.id, req.user!.userId));
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
