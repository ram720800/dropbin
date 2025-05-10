import { Request, Response, NextFunction } from "express";
import passport from "passport";
import generateToken from "../lib/utils";
import { generateState } from "../lib/csrfstate";
import { validateState } from "../lib/csrfstate";
import { ENV } from "../lib/env";

export const signup = async (req: Request, res: Response): Promise<void> => {};
export const login = async (req: Request, res: Response): Promise<void> => { };

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production" ? true : false,
  });
  
  return res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {};

export const googleAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const state = generateState(res);
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
};

export const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!validateState(req)) {
    return res.redirect(
      `${ENV.CLIENT_URL}/login?error=Invalid%20OAuth%20state`
    );
  }
  passport.authenticate(
    "google",
    { session: false },
    async (err: any, user: any) => {
      if (err || !user) {
        console.log(`OAutherror: ${err}`);
        return res.redirect(`${ENV.CLIENT_URL}/login?error=OAuth Failed`);
      }
      generateToken(user._id, res);
      return res.redirect(`${ENV.CLIENT_URL}/authSuccess`);
    }
  )(req, res, next);
};

export const githubAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const state = generateState(res);
  passport.authenticate("github", {
    scope: ["user:email"],
    state,
  })(req, res, next);
};

export const githubAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!validateState(req)) {
    return res.redirect(
      `${ENV.CLIENT_URL}/login?error=Invalid%20OAuth%20state`
    );
  }

  passport.authenticate(
    "github",
    { session: false },
    async (err: any, user: any) => {
      if (err || !user) {
        console.log(`OAutherror: ${err}`);
        res.redirect(`${ENV.CLIENT_URL}/login?error=OAuth Failed`);
      }
      generateToken(user._id, res);
      return res.redirect(`${ENV.CLIENT_URL}/authSuccess`);
    }
  )(req, res, next);
};
