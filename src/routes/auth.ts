import { Router } from "express";

export const authUrl = "/auth";
export const authRouter = Router();

authRouter.post("auth");
