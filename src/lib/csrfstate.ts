import crypto from "crypto";
import { ENV } from "./env";
import { Request, Response } from "express";

const STATE_COOKIE_NAME = "oauth_state";

export function generateState(res: Response): string {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production" ? true : false,
    maxAge: 1000 * 60 * 5,
  });
  return state;
}

export function validateState(req: Request): boolean{
    const stored = req.cookies[STATE_COOKIE_NAME];
    const recived = req.query.state;

    return typeof recived === "string" && stored===recived;
}
