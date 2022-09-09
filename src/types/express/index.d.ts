import express from "express";

interface Payload {
  id: number;
  email: string;
  name: string;
}

declare module "express" {
  interface Request extends express.Request {
    user?: Payload;
  }
}
