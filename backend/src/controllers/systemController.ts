import type { Request, Response } from "express";
import { runAsyncDemo, getDashboardData, getExternalDashboardData } from "../services/systemService.js";

export const systemController = {
  async asyncDemo(_req: Request, res: Response) {
    const result = await runAsyncDemo();
    res.json(result);
  },

  async dashboard(_req: Request, res: Response) {
    const data = await getDashboardData();
    res.json(data);
  },

  async externalDashboard(_req: Request, res: Response) {
    const data = await getExternalDashboardData();
    res.json(data);
  },
};
