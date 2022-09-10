import ejs from "ejs";
import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "path";
import { UserModel } from "../models/user.mo";
import { VerifyLog } from "../models/verifiyLog.mo";
import { validator } from "../public/middleware";
import { logger } from "../utils/logger";
import { AppDataSource } from "../utils/rds";

export const authPath = "/auth";
export const authRouter = Router();

authRouter.get(
  "/test-token",
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = jwt.sign(
      {
        id: 1,
        email: "test@test.com",
        name: "test",
      },
      process.env.JWT_SECRET || "test",
      {
        expiresIn: "7d",
      }
    );

    res.json({ accessToken });
  }
);

authRouter.post(
  "/sign-in",
  validator([body("email").exists().isEmail(), body("password").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const userRepository = await AppDataSource.getRepository(UserModel);

      const user = await userRepository.findOne({
        where: { email, password },
      });

      if (!user) {
        return res
          .status(401)
          .json({ error: "이메일이나 비밀번호가 잘못되었습니다." });
      }

      if (user.isVerified === false) {
        return res
          .status(403)
          .json({ error: "이메일 인증이 진행되지 않았습니다." });
      }

      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user?.email,
          name: user.name,
        },
        process.env.JWT_SECRET || "test",
        {
          expiresIn: "7d",
        }
      );
      res.json({ accessToken });
    } catch (err) {
      next(err);
    }
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
    try {
      const { email, name, password } = req.body;

      const userRepository = await AppDataSource.getRepository(UserModel);

      const user = await userRepository.create({
        email,
        name,
        password,
      });

      await userRepository.save(user);

      res.json({ message: "ok" });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post(
  "/verify-code",
  validator([body("email").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const verifyLogRepository = AppDataSource.getRepository(VerifyLog);

      const verifyCode = Math.random().toString().substr(2, 6);
      let emailTemplete;
      ejs.renderFile(
        path.join(__filename, "../../../", "/template/index.ejs"),
        { verifyCode },
        function (err, data) {
          if (err) {
          }
          emailTemplete = data;
        }
      );

      let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      });

      const mailOptions = await transporter.sendMail({
        from: {
          name: `착한식당`,
          address: process.env.NODEMAILER_USER || "",
        },
        to: email,
        subject: "착한식당 회원가입을 위한 인증번호입니다.",
        html: emailTemplete,
      });

      const verifyLog = await verifyLogRepository.create({
        email,
        verifyCode,
      });

      await verifyLogRepository.save(verifyLog);

      transporter.sendMail(mailOptions, (error, _info) => {
        if (error) {
          logger.error(error.message);
        }

        res.json({ verifyCode });
        transporter.close();
      });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.put(
  "/verify-email",
  validator([
    body("email").exists().isEmail(),
    body("verifyCode").exists().isString().isNumeric(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, verifyCode } = req.body;

      const userRepository = await AppDataSource.getRepository(UserModel);
      const verifiyLogRepository = await AppDataSource.getRepository(VerifyLog);

      const isNotVerifiedUser = await userRepository.findOne({
        where: {
          email,
          isVerified: false,
        },
        order: {
          createdAt: "DESC",
        },
      });

      if (!isNotVerifiedUser) {
        return res
          .status(404)
          .json({ error: "이메일 인증 대상이 존재하지 않습니다." });
      }

      const lastVerifyLog = await verifiyLogRepository.findOne({
        where: {
          email,
        },
        order: {
          createdAt: "DESC",
        },
      });

      if (!lastVerifyLog) {
        return res.status(404).json({ error: "인증 요청을 찾을 수 없습니다." });
      }

      if (lastVerifyLog.isSuccess === true) {
        return res.status(400).json({ error: "이미 인증된 요청입니다." });
      }

      if (lastVerifyLog.verifyCode !== verifyCode) {
        return res.json({ error: "인증번호가 일치하지않습니다." });
      }

      await verifiyLogRepository.update(
        {
          id: lastVerifyLog.id,
        },
        {
          isSuccess: true,
        }
      );

      await userRepository.update(
        {
          email,
        },
        {
          isVerified: true,
        }
      );

      return res.json({ message: "ok" });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.delete(
  "/cancel",
  validator([body("email").exists().isEmail()]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const userRepository = await AppDataSource.getRepository(UserModel);
      const verifiyLogRepository = await AppDataSource.getRepository(VerifyLog);

      await userRepository.delete({ email });
      await verifiyLogRepository.delete({ email });

      res.json({ message: "ok" });
    } catch (err) {
      next(err);
    }
  }
);
