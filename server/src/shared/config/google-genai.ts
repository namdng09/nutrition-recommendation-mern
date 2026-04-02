import dotenv from 'dotenv';

dotenv.config();

export const resolveGoogleApiKey = () =>
  process.env.GOOGLE_API_KEY?.trim() ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
  undefined;

export const googleApiKey = resolveGoogleApiKey();
