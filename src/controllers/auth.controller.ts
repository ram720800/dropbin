import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model";
import passport from "passport";
import bcrypt from "bcryptjs";
import { generateToken, clearToken } from "../lib/utils";
import { generateState } from "../lib/csrfstate";
import { validateState } from "../lib/csrfstate";
import { ENV } from "../lib/env";
import { checkRateLimit } from "../lib/ratelimit";
import { errorHandler } from "../lib/errorhandler";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const name = email.split("@")[0];

    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser: IUser = new User({
      email,
      password: hashedpassword,
      name,
      authProvider: "local",
    });

    if (newUser) {
      generateToken(newUser._id.toString(), res);
      await newUser.save();
      res.status(201).json({ message: "User created successfully" });
    } else {
      res.status(400).json({ message: "User creation failed" });
    }
  } catch (error) {
    errorHandler(res, error);
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user: IUser = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    generateToken(user._id.toString(), res);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    errorHandler(res, error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    clearToken(res);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as IUser)?._id.toString();
    const user = await User.findById(userId, "_id email name");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const googleAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientIP =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  if (!checkRateLimit(clientIP)) {
    res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
    return;
  }

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
  const clientIP =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  if (!checkRateLimit(clientIP)) {
    res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
    return;
  }

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
