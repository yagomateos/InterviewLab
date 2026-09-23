import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";
import type { User } from "../types/index.js";

// Falls back to a fixed dev-only secret so local/docker dev works without
// extra setup. In production (Vercel) JWT_SECRET must be set — see below.
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const JWT_EXPIRES_IN = "7d";

if (!process.env.JWT_SECRET && process.env.VERCEL) {
  // Don't crash the whole function over this, but make it loud: signing
  // tokens with the well-known dev fallback in production is a real risk.
  console.error(
    "[auth] JWT_SECRET is not set in production — sessions are signed with an insecure default secret."
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function signToken(userId: number): string {
  // JWT's registered "sub" claim is conventionally a string.
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "string" || !payload.sub) return null;
    const userId = Number(payload.sub);
    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
}

export const authService = {
  async register(data: {
    name?: string;
    email?: string;
    password?: string;
  }): Promise<{ user: User; token: string }> {
    const name = data.name?.trim() ?? "";
    const email = data.email?.trim().toLowerCase() ?? "";
    const password = data.password ?? "";

    if (!name) throw new Error("Name is required");
    if (!email || !EMAIL_RE.test(email)) throw new Error("A valid email is required");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("Email already registered");

    const password_hash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ name, email, password_hash });
    return { user, token: signToken(user.id) };
  },

  async login(data: {
    email?: string;
    password?: string;
  }): Promise<{ user: User; token: string }> {
    const email = data.email?.trim().toLowerCase() ?? "";
    const password = data.password ?? "";

    const found = email ? await userRepository.findByEmail(email) : null;
    // Same error for "no such user" and "wrong password" — don't reveal
    // which one it was.
    if (!found) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(password, found.password_hash);
    if (!valid) throw new Error("Invalid email or password");

    const { password_hash: _drop, ...user } = found;
    return { user, token: signToken(user.id) };
  },

  async me(userId: number): Promise<User | null> {
    return userRepository.findById(userId);
  },
};
