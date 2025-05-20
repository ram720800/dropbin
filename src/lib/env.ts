import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  PORT: z.string().default("3000"),
  JWT_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  CLIENT_URL: z.string().url(),
  BASE_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
  console.error(`invalid or missing env:\n ${env.error.format()}`);
  process.exit(1);
}
export const ENV = env.data;