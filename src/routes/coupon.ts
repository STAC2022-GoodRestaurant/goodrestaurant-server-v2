import { Router, Request, Response, NextFunction } from "express";
import { param } from "express-validator";
import { Equal, Not, Raw } from "typeorm";
import { Coupon } from "../models/coupon.mo";
import { Restaurant } from "../models/restaurant.mo";
import { UserModel } from "../models/user.mo";
import { authValidator, validator } from "../public/middleware";
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

couponRouter.put(
  "/:restaurantId",
  authValidator(),
  validator([param("restaurantId").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { restaurantId } = req.params;

      const couponRepository = await AppDataSource.getRepository(Coupon);
      const restaurantRepository = await AppDataSource.getRepository(
        Restaurant
      );

      const restaurant = await restaurantRepository.findOne({
        where: { id: Number(restaurantId) },
      });

      if (!restaurant) {
        return res.status(404).json({ error: "식당을 찾을 수 없습니다." });
      }

      const coupon = await couponRepository.findOne({
        where: {
          restaurant: { id: Number(restaurantId) },
          user: { id: user?.id },
          isUsed: false,
          max: Not(Raw("visitCount")),
        },
      });

      await couponRepository.upsert(
        [
          {
            max: restaurant?.coupon_max,
            visitCount: coupon ? coupon.visitCount + 1 : 1,
            isUsed: false,
            restaurant,
            user,
          },
        ],
        []
      );

      res.json({ message: "ok" });
    } catch (err) {
      next(err);
    }
  }
);

couponRouter.delete(
  "/:couponId",
  authValidator(),
  validator([param("couponId").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { couponId } = req.params;

      const couponRepository = await AppDataSource.getRepository(Coupon);

      const coupon = await couponRepository.findOne({
        where: { id: Number(couponId) },
      });

      if (!coupon) {
        return res.status(404).json({ error: "쿠폰을 찾을 수 없습니다." });
      }

      const result = await couponRepository.update(
        { id: coupon.id },
        { isUsed: false }
      );
      console.log(result);

      res.json({ message: "ok" });
    } catch (err) {
      next(err);
    }
  }
);
