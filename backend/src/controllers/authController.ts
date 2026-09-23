import type { Response } from "express";
import { authService } from "../services/authService.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const authController = {
  async register(req: AuthedRequest, res: Response) {
    try {
      const { user, token } = await authService.register(req.body ?? {});
      res.status(201).json({ user, token });
    } catch (err) {
      res.status(400).json({ error: "bad_request", message: (err as Error).message });
    }
  },

  async login(req: AuthedRequest, res: Response) {
    try {
      const { user, token } = await authService.login(req.body ?? {});
      res.json({ user, token });
    } catch (err) {
      res.status(401).json({ error: "unauthorized", message: (err as Error).message });
    }
  },

  async me(req: AuthedRequest, res: Response) {
    const user = await authService.me(req.userId!);
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }
    res.json(user);
  },
};
