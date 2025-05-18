import { Schema, model, Types, Document } from "mongoose";

export type SupportedPlatforms =
  | "youtube"
  | "github"
  | "spotify"
  | "x"
  | "linkedin"
  | "peerlist"
  | "slack";

export interface ILinkedMeatdat extends Document {
  user: Types.ObjectId;
  platform: SupportedPlatforms;
  url: string;
  title?: string;
  description?: string;
  image?: string;
  data?: Record<string, any>;
  fetchedAt: Date;
}

const LinkedMetadata = new Schema<ILinkedMeatdat>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    platform: {
      type: String,
      enum: [
        "youtube",
        "github",
        "spotify",
        "x",
        "linkedin",
        "peerlist",
        "slack",
      ],
      required: true,
    },
    url: { type: String, required: true },
    title: String,
    description: String,
    image: String,
    data: Schema.Types.Mixed,
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
LinkedMetadata.index({ user: 1, platform: 1 });

export default model<ILinkedMeatdat>("LinkedMetadata", LinkedMetadata);
