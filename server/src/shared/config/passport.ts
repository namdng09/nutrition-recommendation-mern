import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import { UserModel } from '~/shared/database/models';

import { ROLE } from '../constants/role';

export const configurePassport = () => {
  if (process.env.JWT_SECRET) {
    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: process.env.JWT_SECRET
        },
        async (jwtPayload, done) => {
          try {
            const userId =
              jwtPayload.id ||
              jwtPayload._id ||
              jwtPayload.userId ||
              jwtPayload.sub;
            if (!userId) return done(null, false);

            const user = await UserModel.findById(userId);

            if (!user) {
              return done(null, false);
            }

            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;

            // Reject OAuth logins that provide no email — creating a user with
            // an empty email would violate the unique index and cause failures
            // for any subsequent Google login with a missing email.
            if (!email) {
              return done(null, false, { message: 'no_email_provided' });
            }

            let user = await UserModel.findOne({ email });

            if (!user) {
              user = await UserModel.create({
                email,
                name: profile.displayName || '',
                avatar: profile.photos?.[0]?.value || '',
                role: ROLE.USER
              });
            }

            if (!user.isActive) {
              return done(null, false, {
                message: 'user_inactive'
              });
            }

            // Pass provider info so controller can access it
            return done(null, user, {
              provider: 'google',
              providerId: profile.id
            });
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }
};
