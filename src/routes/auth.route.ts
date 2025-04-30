import Router from "express";
const authRouter = Router();
import {
  signup,
  login,
  logout,
  getMe,
  googleAuth,
  googleAuthCallback,
  githubAuth,
  githubAuthCallback,
} from "../controllers/auth.controller";

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", getMe);
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleAuthCallback);
authRouter.get("/github", githubAuth);
authRouter.get("/github/callback", githubAuthCallback);

export default authRouter;
