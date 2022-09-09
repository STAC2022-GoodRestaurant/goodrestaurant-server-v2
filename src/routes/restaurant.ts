import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { Menu } from "../models/menu.mo";
import { Restaurant } from "../models/restaurant.mo";
import { authValidator, validator } from "../public/middleware";
import { AppDataSource } from "../utils/rds";

export const restaurantPath = "/restaurant";
export const restaurantRouter = Router();

restaurantRouter.post(
  "/",
  authValidator(),
  validator([
    body("name").exists().isString(),
    body("imageUrl").exists().isString(),
    body("address").exists().isString(),
    body("content").exists().isString(),
    body("coupon_max").exists().isInt(),
    body("coupon_price").exists().isString(),
    body("menus").exists(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        imageUrl,
        name,
        address,
        content,
        coupon_max,
        coupon_price,
        menus,
      } = req.body;

      const restaurantRepository = await AppDataSource.getRepository(
        Restaurant
      );
      const menuRepository = await AppDataSource.getRepository(Menu);

      const restaurant = await restaurantRepository.create({
        name,
        imageUrl,
        address,
        content,
        coupon_max,
        coupon_price,
      });

      for (const menu of menus) {
        const menuData = await menuRepository.create({
          name: menu.name,
          content: menu.content,
          price: menu.price,
          imageUrl: menu.imageUrl,
          restaurant,
        });

        await menuRepository.save(menuData);
      }

      await restaurantRepository.save(restaurant);

      res.json({ message: "ok" });
    } catch (err) {
      next(err);
    }
  }
);
