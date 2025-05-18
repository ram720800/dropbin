import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model";
import passport from "passport";
import bcrypt from "bcryptjs";
import { generateToken, clearToken } from "../lib/utils";
import { encodeState, decodeState } from "../lib/oauthState";
import { ENV } from "../lib/env";
import { checkRateLimit } from "../lib/ratelimit";
import { errorHandler } from "../lib/errorhandler";
import { upsertToken } from "../lib/utils";
import { checkAlreadyLinked } from "../lib/utils";

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

  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

export const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

export const connectGithub = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.user as { _id: string } | undefined;

  if (!userId) {
    res.status(401).json({ error: "Not Logged In" });
    return;
  }

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

  const state = encodeState(userId._id.toString());
  passport.authenticate("github", {
    scope: ["read:user", "user:email"],
    state,
  })(req, res, next);
};

export const githubCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const rawState = req.query.state;

  if (!rawState || typeof rawState !== "string") {
    return res.redirect(`${ENV.CLIENT_URL}/settings?error=MissingState`);
  }

  let decoded;
  try {
    decoded = decodeState(rawState);
  } catch (error) {
    return res.redirect(`${ENV.CLIENT_URL}/settings?error=InvalidState`);
  }

  passport.authenticate(
    "github",
    { session: false },
    async (err: any, githubProfile: any) => {
      if (err || !githubProfile) {
        console.log(`OAutherror: ${err}`);
        return res.redirect(`${ENV.CLIENT_URL}/settings?error=OAuth Failed`);
      }

      try {
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.redirect(`${ENV.CLIENT_URL}/settings?error=UserNotFound`);
        }

        try {
          await checkAlreadyLinked(
            "github",
            githubProfile.id,
            user._id.toString()
          );

          user.githubId = githubProfile.id;
          upsertToken(
            user,
            "github",
            githubProfile.accessToken,
            githubProfile.refreshToken
          );
          await user.save();
          return res.redirect(`${ENV.CLIENT_URL}/settings?linked=github`);
        } catch (error) {
          return res.redirect(`${ENV.CLIENT_URL}/settings?error=AlreadyLinked`);
        }
      } catch (error) {
        return res.redirect(`${ENV.CLIENT_URL}/settings?error=ServerError`);
      }
    }
  )(req, res, next);
};
