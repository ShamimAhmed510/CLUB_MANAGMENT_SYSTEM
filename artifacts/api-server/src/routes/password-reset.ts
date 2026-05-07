import { Router, type IRouter, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@workspace/db";
import { sendPasswordResetEmail, emailEnabled } from "../lib/email.js";

const router: IRouter = Router();

const JWT_SECRET = process.env["SESSION_SECRET"] ?? "fallback-secret";
const BASE_URL = process.env["FRONTEND_URL"] ?? "";
const TOKEN_TTL_SECONDS = 60 * 60;

router.post("/auth/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const doc = await User.findOne({ email: email.toLowerCase().trim() }).lean();

  if (!doc) {
    res.json({ ok: true });
    return;
  }

  const userId = (doc._id as any).toString();
  const token = jwt.sign({ sub: userId, purpose: "pw-reset" }, JWT_SECRET, {
    expiresIn: TOKEN_TTL_SECONDS,
  });

  const domains = (process.env["REPLIT_DOMAINS"] ?? BASE_URL).split(",")[0]?.trim() ?? "";
  const protocol = domains.startsWith("localhost") ? "http" : "https";
  const resetLink = domains
    ? `${protocol}://${domains}/reset-password?token=${token}`
    : `/reset-password?token=${token}`;

  if (emailEnabled) {
    try {
      await sendPasswordResetEmail((doc as any).email as string, resetLink);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to send reset email: " + err.message });
      return;
    }
  } else {
    res.json({ ok: true, _devResetLink: resetLink });
    return;
  }

  res.json({ ok: true });
});

router.post("/auth/reset-password", async (req: Request, res: Response) => {
  const { token, password } = req.body ?? {};
  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Token is required" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  if (payload?.purpose !== "pw-reset" || !payload?.sub) {
    res.status(400).json({ error: "Invalid token" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const updated = await User.findByIdAndUpdate(payload.sub, { passwordHash });

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ ok: true });
});

export default router;
