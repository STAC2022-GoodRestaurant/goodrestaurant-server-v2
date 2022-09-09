import { Router, Request, Response, NextFunction } from "express";

export const restaurantPath = "/restaurant";
export const restaurantRouter = Router();

restaurantRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (err) {
      next(err);
    }
  }
);
