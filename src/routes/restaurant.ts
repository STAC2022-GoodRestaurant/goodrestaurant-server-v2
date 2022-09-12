import { Router, Request, Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import { Menu } from "../models/menu.mo";
import { Restaurant } from "../models/restaurant.mo";
import { authValidator, validator } from "../public/middleware";
import { AppDataSource } from "../utils/rds";
import axios from "axios";
import { Geometry } from "geojson";
import { Review } from "../models/review.mo";

export const restaurantPath = "/restaurant";
export const restaurantRouter = Router();

restaurantRouter.get(
  "/",
  authValidator(),
  validator([
    query("lat").exists().isNumeric(),
    query("lon").exists().isNumeric(),
    query("order").optional().isString(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lon, order } = req.query;

    const restaurantRepository = await AppDataSource.getRepository(Restaurant);

    let orderBy = "";
    if (order) {
      if (order === "rate") {
        orderBy = "ORDER BY total_rating DESC";
      } else if (order === "dist") {
        orderBy = "ORDER BY rating ASC";
      }
    }
    const rawData = await restaurantRepository.query(
      `select *, ST_DISTANCE_SPHERE(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[${Number(
        lon
      )},${Number(
        lat
      )}]}'), position) AS dist FROM restaurant HAVING dist <= 2500 ${orderBy}` // 반경 2.5km
    );

    res.json(rawData);
  }
);

restaurantRouter.get(
  "/:restaurantId",
  authValidator(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { restaurantId } = req.params;

      const restaurantRepository = await AppDataSource.getRepository(
        Restaurant
      );

      const restaurant = await restaurantRepository.findOne({
        where: { id: Number(restaurantId) },
        relations: ["menus", "coupons", "categories"],
      });

      if (!restaurant) {
        return res.status(404).json({ error: "식당을 찾을 수 없습니다." });
      }

      res.json(restaurant);
    } catch (err) {
      next(err);
    }
  }
);

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

      const kakaoData = await axios.get(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURI(
          address
        )}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.KAKAO_ACCESS_KEY}`,
          },
        }
      );

      if (kakaoData.data.meta.total_count === 0) {
        return res.status(400).json({ error: "잘못된 도로명 주소입니다." });
      }

      const kakao_address = kakaoData.data.documents[0].address;

      const position: Geometry = {
        type: "Point",
        coordinates: [Number(kakao_address.x), Number(kakao_address.y)],
      };

      const restaurant = await restaurantRepository.create({
        name,
        imageUrl,
        address,
        content,
        coupon_max,
        coupon_price,
        position,
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

restaurantRouter.post(
  "/review/:restaurantId",
  authValidator(),
  validator([
    param("restaurantId").exists().isNumeric(),
    body("content").exists().isString(),
    body("rating").exists().isInt(),
    body("imageUrl").exists().isString(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { restaurantId } = req.params;
      const { content, rating, imageUrl } = req.body;

      const restaurantRepository = await AppDataSource.getRepository(
        Restaurant
      );
      const reviewRepository = await AppDataSource.getRepository(Review);

      const restaurant = await restaurantRepository.findOne({
        where: { id: Number(restaurantId) },
      });

      if (!restaurant) {
        return res.status(404).json({ error: "식당을 찾을 수 없습니다." });
      }

      await reviewRepository.insert({
        content,
        rating,
        imageUrl: imageUrl ? imageUrl : null,
        writer: user,
        restaurant,
      });

      res.json({ message: "ok" });
    } catch (err) {
      next(err);
    }
  }
);
