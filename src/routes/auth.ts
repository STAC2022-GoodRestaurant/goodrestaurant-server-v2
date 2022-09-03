import ejs from "ejs";
import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import nodemailer from "nodemailer";
import path from "path";
import { UserModel } from "../models/user.mo";
import { VerifyLog } from "../models/verifiyLog.mo";
import { validator } from "../public/middleware";
import { AppDataSource } from "../utils/rds";

export const authPath = "/auth";
export const authRouter = Router();

authRouter.post(
  "/sign-in",
  validator([body("email").exists(), body("password").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    res.json(req.body);
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

      const userRepository = AppDataSource.getRepository(UserModel);

      await userRepository.create({
        email,
        name,
        password,
      });

      res.json(req.body);
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
            console.log(err);
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
        from: `착한식당`,
        to: email,
        subject: "착한식당 회원가입을 위한 인증번호입니다.",
        html: emailTemplete,
      });

      await verifyLogRepository.create({
        email,
        verifyCode,
      });

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
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

      if (lastVerifyLog.verifyCode === verifyCode) {
        await verifiyLogRepository.update(
          {
            isSuccess: true,
          },
          {
            id: lastVerifyLog.id,
          }
        );

        await userRepository.update(
          {
            isVerified: true,
          },
          {
            email,
          }
        );

        return res.json({ message: "ok" });
      }
    } catch (err) {
      next(err);
    }
  }
);
