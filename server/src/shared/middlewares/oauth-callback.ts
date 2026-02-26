import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

/**
 * Shape of the info object passed by OAuth strategies to the verify callback.
 * Strategies can pass arbitrary extra fields (e.g. provider, providerId for
 * our Google strategy), so we extend with an index signature.
 */
export interface OAuthInfo {
  message?: string;
  provider?: string;
  providerId?: string;
  [key: string]: unknown;
}

/** An Express Request augmented with the authInfo set by createOAuthCallback. */
export type OAuthRequest = Request & { authInfo: OAuthInfo };

/**
 * Creates OAuth callback middleware for handling authentication responses
 * @param provider - The OAuth provider name (e.g., 'google', 'facebook')
 * @returns Express middleware function
 */
export const createOAuthCallback =
  (provider: string) => (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      provider,
      { session: false },
      function (
        err: Error | null,
        user: Express.User | false,
        info: OAuthInfo
      ) {
        if (err) {
          console.error(`${provider} OAuth error:`, err);
          return res.redirect(
            `${process.env.CLIENT_URL}/auth/login?error=oauth_failed`
          );
        }

        if (!user) {
          const message = info?.message || 'authentication_failed';
          console.error(`${provider} OAuth failed:`, message);
          return res.redirect(
            `${process.env.CLIENT_URL}/auth/login?error=${encodeURIComponent(message)}`
          );
        }

        req.user = user;
        (req as OAuthRequest).authInfo = info;
        next();
      }
    )(req, res, next);
  };
