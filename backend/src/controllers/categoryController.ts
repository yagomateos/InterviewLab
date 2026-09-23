import type { Request, Response } from "express";
import { categoryService } from "../services/categoryService.js";

export const categoryController = {
  async getAll(_req: Request, res: Response) {
    const categories = await categoryService.getAll();
    res.json(categories);
  },
};
