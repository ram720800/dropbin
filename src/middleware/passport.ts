import passport, { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model";
import { ENV } from "../lib/env";

passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID!,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error("Email not provided by google"));
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;

            if (user.authProvider !== "google") {
              user.accountLinked = true;
              user.previousProvider = user.authProvider;
            }
            
            user.authProvider = "google";
            await user.save();
          } else {
            user = await User.create({
              email,
              name: profile.displayName,
              googleId: profile.id,
              authProvider: "google",
              accountLinked: false,
            });
          }
        }
        done(null, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: ENV.GITHUB_CLIENT_ID!,
      clientSecret: ENV.GITHUB_CLIENT_SECRET!,
      callbackURL: "/api/v1/auth/github/callback",
      scope: ["user:email"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const primaryEmail = profile.emails?.[0]?.value;
        if (!primaryEmail) {
          return done(new Error("Email not provided by GitHub"));
        }

        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          user = await User.findOne({ email: primaryEmail });
          if (user) {
            user.githubId = profile.id;

            if (user.authProvider !== "github") {
              user.accountLinked = true;
              user.previousProvider = user.authProvider;
            }

            user.authProvider = "github";
            await user.save();
          } else {
            user = await User.create({
              email: primaryEmail,
              name: profile.displayName,
              githubId: profile.id,
              authProvider: "github",
              accountLinked: false,
            });
          }
        }
        done(null, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);
