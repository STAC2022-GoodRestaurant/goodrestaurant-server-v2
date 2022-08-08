import { Request, Response, NextFunction, Router } from "express";

export const authPath = "/auth";
export const authRouter = Router();

authRouter.post(
  "/sign-up",
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.status(200).json(req.body).end();
  }
);
