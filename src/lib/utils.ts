import jwt from "jsonwebtoken";
import { Response } from "express";
import { ENV } from "./env";

export const generateToken = (userId: string, res: Response): string => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET!, {
    expiresIn: "30d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production" ,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export const clearToken = (res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production" ,
    expires: new Date(0),
  })
}
