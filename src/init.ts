import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import useragent from "express-useragent";
import pino from "express-pino-logger";
import createError, { HttpError } from "http-errors";
import { logger } from "./utils/logger";
import { authRouter, authUrl } from "./routes/auth";

export const initApp = () => {
  const app = express();

  app.enable("trust proxy");

  app.use(cors());
  app.use(helmet());
  app.use(useragent.express());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(pino());

  // route
  app.get("/", (req, res) => {
    res.json({ msg: "hello" });
  });

  app.use(authUrl, authRouter);

  app.use(
    (
      err: Error | HttpError,
      _req: Request,
      res: Response,
      _next: NextFunction
    ) => {
      if (createError.isHttpError(err)) {
        if (err.statussCode >= 500) {
          logger.error(err.message);
        } else {
          res.status(err.status).json({ error: err.message });
        }
      }
    }
  );

  return app;
};
