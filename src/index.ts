import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route";
import binRouter from "./routes/bin.route";
import publicBinRouter from "./routes/publicbin.route";
import connectDB from "./lib/db";
import passport from "passport";
import "./middleware/passport";
import { ENV } from "./lib/env";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/bin", binRouter);
app.use("/api/v1/public/bin", publicBinRouter);

const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  connectDB();
});
