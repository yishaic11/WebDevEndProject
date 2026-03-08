import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user';

export const initPassport = (): void => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.BACKEND_URL ?? 'http://localhost:3000'}/auth/google/callback`,
        },
        (_accessToken, _refreshToken, profile, done) => {
          void (async () => {
            try {
              let user = await User.findOne({ googleId: profile.id });

              if (!user) {
                const email = profile.emails?.[0]?.value ?? `${profile.id}@google.oauth`;
                user = await User.findOne({ email });

                if (user) {
                  user.googleId = profile.id;

                  if (!user.photoUrl && profile.photos?.[0]?.value) {
                    user.photoUrl = profile.photos[0].value;
                  }
                  await user.save();
                } else {
                  const baseUsername = profile.displayName.replace(/\s+/g, '_').toLowerCase();
                  let username = baseUsername;
                  let counter = 1;

                  while (await User.findOne({ username })) {
                    username = `${baseUsername}_${counter++}`;
                  }

                  user = await User.create({
                    googleId: profile.id,
                    email,
                    username,
                    photoUrl: profile.photos?.[0]?.value,
                    refreshTokens: [],
                  });
                }
              }

              done(null, user);
            } catch (err) {
              done(err as Error);
            }
          })();
        },
      ),
    );
  }
};
