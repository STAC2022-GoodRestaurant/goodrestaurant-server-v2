import { Router, Request, Response, NextFunction } from "express";
import { authValidator } from "../public/middleware";
import fs from "fs";

export const filePath = "/file";
export const fileRouter = Router();

fileRouter.post(
  "/",
  authValidator(),
  async (req: Request, res: Response, next: NextFunction) => {}
);

fileRouter.get(
  "/60bd2d52f2fccbaad916c899555740212ffde63921676baa62ceafa39c32bc6a/:filename",
  async (req: Request, res: Response, next: NextFunction) => {
    const { filename } = req.params;

    const stream = fs.createReadStream("public/images/" + filename);
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    stream.pipe(res);
  }
);
