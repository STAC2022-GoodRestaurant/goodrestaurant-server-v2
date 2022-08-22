import { Request, Response, NextFunction, Router } from "express";
import { body } from "express-validator";
import { UserModel } from "../models/user.mo";
import { validator } from "../public/middleware";
import { AppDataSource } from "../utils/rds";

export const authPath = "/auth";
export const authRouter = Router();

authRouter.post(
  "/sign-in",
  validator([body("email").exists(), body("password").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.json(req.body).end();
  }
);

authRouter.post(
  "/sign-up",
  validator([
    body("email").exists(),
    body("name").exists(),
    body("password").exists(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password } = req.body;

    const userRepository = AppDataSource.getRepository(UserModel);

    await userRepository.create({
      email,
      name,
      password,
    });

    res.json(req.body).end();
  }
);

authRouter.get(
  "/check-email",
  validator([body("email").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.json(req.body).end();
  }
);

authRouter.delete(
  "/cancel",
  validator([body("email").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.json(req.body).end();
  }
);
