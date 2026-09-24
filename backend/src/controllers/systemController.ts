import type { Request, Response } from "express";
import type { AuthedRequest } from "../middleware/auth.js";
import { runAsyncDemo, getDashboardData, getExternalDashboardData } from "../services/systemService.js";

export const systemController = {
  async asyncDemo(_req: Request, res: Response) {
    const result = await runAsyncDemo();
    res.json(result);
  },

  async dashboard(req: AuthedRequest, res: Response) {
    const data = await getDashboardData(req.userId!);
    res.json(data);
  },

  async externalDashboard(_req: Request, res: Response) {
    const data = await getExternalDashboardData();
    res.json(data);
  },
};
