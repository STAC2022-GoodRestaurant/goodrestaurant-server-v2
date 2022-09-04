import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import pino from "express-pino-logger";
import useragent from "express-useragent";
import helmet from "helmet";
import createError, { HttpError } from "http-errors";
import { authPath, authRouter } from "./routes/auth";
import { logger } from "./utils/logger";

export const initApp = () => {
  const app = express();

  app.enable("trust proxy");

  app.use(helmet());
  app.use(useragent.express());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(pino());
  app.use(cors());

  // route
  app.get("/", (req, res) => {
    res.json({ msg: "hello" });
  });

  app.use(authPath, authRouter);

  app.use(
    (
      err: Error | HttpError,
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
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
