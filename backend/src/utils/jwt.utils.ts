import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';

const getSecret = (key: string): string => {
  const secret = process.env[key];
  if (!secret) throw new Error(`Missing env var: ${key}`);
  return secret;
};

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, getSecret('ACCESS_TOKEN_SECRET'), {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m',
  } as SignOptions);

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, getSecret('REFRESH_TOKEN_SECRET'), {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  } as SignOptions);

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, getSecret('ACCESS_TOKEN_SECRET')) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, getSecret('REFRESH_TOKEN_SECRET')) as JwtPayload;
