import { Schema, model, Document,Types } from "mongoose";

export interface IUser extends Document {
  _id:Types.ObjectId,
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
    name: { type: String, required:true},
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
    collection: "users",
  }
);

export default model<IUser>("User", userSchema);
