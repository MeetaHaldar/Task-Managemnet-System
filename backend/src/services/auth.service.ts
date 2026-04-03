import { hashPassword, verifyPassword } from '../utils/hash.utils';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.utils';
import { RegisterBody, LoginBody } from '../schemas/auth.schema';
import { prisma } from '../lib/prisma';

type TokenPair = { accessToken: string; refreshToken: string };
type AuthResult = {
  user: { id: string; name: string; email: string };
} & TokenPair;

class AuthServiceError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

const buildTokenPair = (userId: string, email: string): TokenPair => ({
  accessToken: signAccessToken({ userId, email }),
  refreshToken: signRefreshToken({ userId, email }),
});

export class AuthService {
  async register(data: RegisterBody): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      throw new AuthServiceError('Email already in use', 'EMAIL_EXISTS');
    }

    const hashedPw = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPw,
      },
      select: { id: true, name: true, email: true },
    });

    const finalTokens = buildTokenPair(user.id, user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: finalTokens.refreshToken },
    });

    return { user, ...finalTokens };
  }

  async login(data: LoginBody): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AuthServiceError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordValid = await verifyPassword(data.password, user.password);
    if (!passwordValid) {
      throw new AuthServiceError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const tokens = buildTokenPair(user.id, user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      ...tokens,
    };
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    let payload: { userId: string; email: string };
    try {
      payload = verifyRefreshToken(rawRefreshToken) as {
        userId: string;
        email: string;
      };
    } catch {
      throw new AuthServiceError(
        'Refresh token is invalid or expired',
        'INVALID_REFRESH_TOKEN'
      );
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.userId, refreshToken: rawRefreshToken },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AuthServiceError(
        'Refresh token has been revoked',
        'INVALID_REFRESH_TOKEN'
      );
    }

    const newTokens = buildTokenPair(user.id, user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newTokens.refreshToken },
    });

    return newTokens;
  }

  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
