import jwt from "jsonwebtoken";
import { Response } from "express";
import { ENV } from "./env";
import User, { IUser, IToken } from "../models/user.model";

export const generateToken = (userId: string, res: Response): string => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET!, {
    expiresIn: "30d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export const clearToken = (res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production",
    expires: new Date(0),
  });
};

export const upsertToken = async (
  user: IUser,
  provider: IToken["provider"],
  accessToken: string,
  refreshToken?: string
): Promise<void> => {
  const newToken: IToken = {
    provider,
    accessToken,
    refreshToken,
    createdAt: new Date(),
  };

  if (!user.tokens) {
    user.tokens = [];
  }

  const tokenIndex = user.tokens.findIndex(
    (token) => token.provider === provider
  );

  if (tokenIndex !== -1) {
    user.tokens[tokenIndex] = newToken;
  } else {
    user.tokens.push(newToken);
  }
};

export const checkAlreadyLinked = async (
  provider: "google" | "github" | "spotify" | "x",
  providerId: string,
  connectUserId: string
) => {
  const exisitingUser = await User.findOne({ [`${provider}Id`]: providerId });

  if (exisitingUser && exisitingUser._id.toString() !== connectUserId) {
    throw new Error(
      `This ${provider} account is already linked to another user`
    );
  }
};
