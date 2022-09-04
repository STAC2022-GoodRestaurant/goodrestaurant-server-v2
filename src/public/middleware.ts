import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

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
      jwt.verify(token, "secretOrPrivateKey");
    } catch (err) {
      return res.status(401).json({
        error: "잘못된 토큰입니다.",
      });
    }

    return next();
  };
};
