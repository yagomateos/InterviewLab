import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth.js";
import { getDashboardData } from "../services/systemService.js";

export const systemController = {
  async dashboard(req: AuthedRequest, res: Response) {
    const data = await getDashboardData(req.userId!);
    res.json(data);
  },
};
