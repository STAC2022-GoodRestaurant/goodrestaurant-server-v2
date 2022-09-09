import { Router, Request, Response, NextFunction } from "express";
import { authValidator, multerValidator } from "../public/middleware";
import fs from "fs";
import sharp from "sharp";
import { File } from "../models/file.mo";
import { AppDataSource } from "../utils/rds";

export const filePath = "/file";
export const fileRouter = Router();

fileRouter.post(
  "/",
  authValidator(),
  multerValidator.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "파일이 없습니다." });
      }

      const fileRepository = await AppDataSource.getRepository(File);

      const changedFilename = "@" + file.filename;
      const oldPath = file.path.replace(file.filename, changedFilename);

      fs.renameSync(file.path, oldPath);
      await sharp(oldPath).resize(480, 360).toFormat("png").toFile(file.path);

      const fileData = await fileRepository.create({
        filename: file.filename,
        path: file.path,
      });
      await fileRepository.save(fileData);

      res.json(fileData);
    } catch (err) {
      next(err);
    }
  }
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
