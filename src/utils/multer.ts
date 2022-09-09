import { randomUUID } from "crypto";
import multer from "multer";

export const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },

  filename: (req, file, cb) => {
    cb(null, randomUUID() + "." + file.mimetype.split("/")[1]);
  },
});
