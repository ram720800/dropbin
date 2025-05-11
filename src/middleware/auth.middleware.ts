import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { ENV } from "../lib/env";

const authenticateuser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized, no token provided" });
      return;
    }

    const JWT_SECRET = ENV.JWT_SECRET;
    if (!JWT_SECRET) {
      res
        .status(500)
        .json({ message: "Internal server error, JWT secret not found" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId, "_id email name");
    if (!user) {
      res.status(401).json({ message: "Unauthorized, user not found" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Unauthorized, invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Unauthorized, token expired" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export default authenticateuser;
