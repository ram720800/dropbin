import { Schema, model, Document, Types, Mongoose } from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

export interface IBin extends Document {
  user: Types.ObjectId;
  title?: string;
  description?: string;
  customId?: string;
  tags?: string[];
  links: {
    url: string;
    type:
      | "youtube"
      | "github"
      | "linkedin"
      | "x"
      | "instagram"
      | "website"
      | "other";
    data?: Record<string, any>;
    fetchedAt: Date;
  }[];
  isShared: boolean;
  views?: number;
  createdAt: Date;
}

const binSchema = new Schema<IBin>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    description: { type: String },
    customId: { type: String, unique: true, sparse: true },
    tags: [String],
    links: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: [
            "youtube",
            "github",
            "linkedin",
            "x",
            "instagram",
            "website",
            "other",
          ],
          default: "other",
        },
        data: Schema.Types.Mixed,
        fetchedAt: { type: Date, default: Date.now },
      },
    ],
    isShared: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

binSchema.pre("save", function (next) {
  if (!this.customId) {
    this.customId = nanoid();
  }
  next();
});

export default model<IBin>("Bin", binSchema);
