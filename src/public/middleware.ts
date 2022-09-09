import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import multer from "multer";
import { UserModel } from "../models/user.mo";
import { Payload } from "../types/express";
import { logger } from "../utils/logger";
import { imageStorage } from "../utils/multer";
import { AppDataSource } from "../utils/rds";

export const validator = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const authValidator = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        error: "인증되지 않았습니다.",
      });
    }

    const token = authorization.split(" ")[1];

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "test"
      ) as Payload;

      const userRepository = await AppDataSource.getRepository(UserModel);

      req.user = await userRepository.findOne({ where: { id: payload.id } });
    } catch (err: any) {
      logger.error(err.message);
      return res.status(401).json({
        error: "잘못된 토큰입니다.",
      });
    }

    return next();
  };
};

export const multerValidator = multer({
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
  storage: imageStorage,
});
