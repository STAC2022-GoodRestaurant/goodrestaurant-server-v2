import { Router, Request, Response, NextFunction } from "express";
import { body, query } from "express-validator";
import { Menu } from "../models/menu.mo";
import { Restaurant } from "../models/restaurant.mo";
import { authValidator, validator } from "../public/middleware";
import { AppDataSource } from "../utils/rds";
import axios from "axios";
import { Geometry } from "geojson";

export const restaurantPath = "/restaurant";
export const restaurantRouter = Router();

restaurantRouter.get(
  "/",
  authValidator(),
  validator([
    query("lat").exists().isNumeric(),
    query("lon").exists().isNumeric(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lon } = req.query;

    const restaurantRepository = await AppDataSource.getRepository(Restaurant);
    const rawData = await restaurantRepository.query(
      `select *, ST_DISTANCE_SPHERE(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[${Number(
        lon
      )},${Number(
        lat
      )}]}'), position) AS dist FROM restaurant HAVING dist <= 2500`
    );

    res.json(rawData);
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
