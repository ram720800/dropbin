import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  profilePic?: string;
  authProvider: "local" | "google" | "github";
  googleId?: string;
  githubId?: string;
  accountLinked?: boolean;
  previousProvider?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    name: { type: String },
    profilePic: { type: String },
    googleId: { type: String },
    githubId: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "github", "google"],
      required: true,
    },
    accountLinked: { type: Boolean, default: false },
    previousProvider: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", userSchema);
