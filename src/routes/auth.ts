import { Request, Response, NextFunction, Router } from "express";
import { body } from "express-validator";
import { UserModel } from "../models/user.mo";
import { validator } from "../public/middleware";
import { AppDataSource } from "../utils/rds";
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

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
    const { email, name, password } = req.body;

    const userRepository = AppDataSource.getRepository(UserModel);

    await userRepository.create({
      email,
      name,
      password,
    });

    res.json(req.body);
  }
);

authRouter.post(
  "/email",
  async (req: Request, res: Response, next: NextFunction) => {
    const authNum = Math.random().toString().substr(2, 6);
    let emailTemplete;
    ejs.renderFile(
      path.join(__filename, "../../../", "/template/index.ejs"),
      { authCode: authNum },
      function (err, data) {
        if (err) {
          console.log(err);
        }
        emailTemplete = data;
      }
    );
    console.log({
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    });

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
      to: req.body.mail,
      subject: "착한식당 회원가입을 위한 인증번호입니다.",
      html: emailTemplete,
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
      console.log("Finish sending email : " + info.response);
      res.json({ authNum });
      transporter.close();
    });
  }
);

authRouter.get(
  "/check-email",
  validator([body("email").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.json(req.body);
  }
);

authRouter.delete(
  "/cancel",
  validator([body("email").exists()]),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.json(req.body);
  }
);
