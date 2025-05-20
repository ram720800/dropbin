import { Router } from "express";
const authRouter = Router();
import {
  signup,
  login,
  logout,
  getMe,
  googleAuth,
  googleAuthCallback,
  connectGithub,
  githubCallback,
  disconnectGithub,
  connectSpotify,
  spotifyCallback,
  disconnectSpotify,
} from "../controllers/auth.controller";
import authenticateuser from "../middleware/auth.middleware";

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticateuser, getMe);
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleAuthCallback);
authRouter.get("/github/connect", authenticateuser, connectGithub);
authRouter.get("/github/callback", githubCallback);
authRouter.delete("/github/disconnect", authenticateuser, disconnectGithub);
authRouter.get("/spotify/connect", authenticateuser, connectSpotify);
authRouter.get("/spotify/callback", spotifyCallback);
authRouter.delete("/spotify/disconnect", authenticateuser, disconnectSpotify);

export default authRouter;
