import axios from "axios";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
// import pino from "express-pino-logger";
import useragent from "express-useragent";
import helmet from "helmet";
import createError, { HttpError } from "http-errors";
import path from "path";
import { authPath, authRouter } from "./routes/auth";
import { couponPath, couponRouter } from "./routes/coupon";
import { filePath, fileRouter } from "./routes/file";
import { restaurantPath, restaurantRouter } from "./routes/restaurant";
import { logger } from "./utils/logger";

export const initApp = () => {
  const app = express();

  app.enable("trust proxy");

  app.use(helmet());
  app.use(useragent.express());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // app.use(pino());
  app.use(cors());

  // route
  app.get("/", (req, res) => {
    res.json({ msg: "hello" });
  });

  app.use(authPath, authRouter);
  app.use(couponPath, couponRouter);
  app.use(restaurantPath, restaurantRouter);
  app.use(filePath, fileRouter);

  app.use(
    async (
      err: Error | HttpError,
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      await axios
        .post(
          process.env.DISCORD_WEBHOOK_URL || "",
          {
            content:
              "착한식당 good-restaurant-v2 에서 **issue**가 발생하였습니다! \n" +
              err.name +
              "\n" +
              err.message,
          },
          {}
        )
        .catch((err) => {
          console.log(err);
        });
      if (createError.isHttpError(err)) {
        if (err.statusCode >= 500) {
          logger.error(err.message);
        } else {
          res.statusCode = err.statusCode;
          res.json({ error: err.message });
        }
      } else {
        console.log(err);
        res.statusCode = 500;
        res.json({ error: err.message });
      }
    }
  );

  return app;
};
