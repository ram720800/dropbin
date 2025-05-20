import passport, { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { Request } from "express";
import User from "../models/user.model";
import { ENV } from "../lib/env";
import { upsertToken } from "../lib/utils";

passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID!,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${ENV.BASE_URL}/api/v1/auth/google/callback`,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value.toLowerCase();
        if (!email) {
          return done(new Error("Email not provided by google"));
        }

        let exisitingUser = await User.findOne({ googleId: profile.id });

        if (!exisitingUser) {
          exisitingUser = await User.findOne({ email });
        }
        if (exisitingUser) {
          if (!exisitingUser.googleId) {
            exisitingUser.googleId = profile.id;
            exisitingUser.authProvider = "google";
          }
          await upsertToken(
            exisitingUser,
            "google",
            _accessToken,
            _refreshToken
          );
          await exisitingUser.save();
          return done(null, exisitingUser);
        }

        const newUser = await User.create({
          email,
          name: profile.displayName,
          authProvider: "google",
          googleId: profile.id,
        });

        // lets update and insert the google token
        await upsertToken(newUser, "google", _accessToken, _refreshToken);

        await newUser.save();
        done(null, newUser);
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
      callbackURL: `${ENV.BASE_URL}/api/v1/auth/github/callback`,
      passReqToCallback: true,
      scope: ["user:email"],
    },
    async (
      _req: Request,
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: Function
    ) => {
      try {
        const githubProfile = {
          id: profile.id,
          username: profile.username,
          email:
            profile.email && profile.emails[0]
              ? profile.emails[0].value.toLowerCase()
              : null,
          accessToken: _accessToken,
          refreshToken: _refreshToken,
        };
        done(null, githubProfile);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

passport.use(
  new SpotifyStrategy(
    {
      clientID: ENV.SPOTIFY_CLIENT_ID!,
      clientSecret: ENV.SPOTIFY_CLIENT_SECRET!,
      callbackURL: `${ENV.BASE_URL}/api/v1/auth/spotify/callback`,
      passReqToCallback: true,
    },
    async (
      _req: Request,
      _accesstoken: string,
      _refreshToken: string,
      expires_in: number,
      profile: any,
      done: Function
    ) => {
      try {
        const spotifyProfile = {
          id: profile.id,
          displayName: profile.displayName,
          accessToken: _accesstoken,
          refreshToken: _refreshToken,
          expiresIn: expires_in,
          issueAt: Date.now(),
        };
        done(null, spotifyProfile);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);
