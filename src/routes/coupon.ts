import { Router, Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.mo";
import { authValidator } from "../public/middleware";
import { AppDataSource } from "../utils/rds";

export const couponPath = "/coupon";
export const couponRouter = Router();

couponRouter.get(
  "/",
  authValidator(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;

      const userRepository = await AppDataSource.getRepository(UserModel);

      const coupons = await userRepository.find({
        where: { id: user?.id },
        relations: { coupons: true },
        order: { updatedAt: "desc" },
      });

      res.json(coupons);
    } catch (err) {
      next(err);
    }
  }
);
