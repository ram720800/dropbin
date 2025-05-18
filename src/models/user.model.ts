import { Schema, model, Document, Types } from "mongoose";

export interface IToken {
  provider: "google" | "github" | "spotify" | "X" | "youtube";
  accessToken: string;
  refreshToken?: string;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  profilePic?: string;
  authProvider: "local" | "google";
  googleId?: string;
  githubId?: string;
  tokens?: IToken[];
  createdAt: Date;
}

const tokenSchema = new Schema<IToken>({
  provider: {
    type: String,
    enum: ["google", "github", "spotify", "X", "youtube"],
    required: true,
  },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string): boolean {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: [7, "Password must be at least 7 characters long"],
      select: false,
    },
    name: { type: String, required: true },
    profilePic: { type: String },
    googleId: { type: String },
    githubId: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      required: true,
    },
    tokens: { type: [tokenSchema], default: [] },
    
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default model<IUser>("User", userSchema);
