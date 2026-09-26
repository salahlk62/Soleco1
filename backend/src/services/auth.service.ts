import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.client';
import { env } from '../config/env';
import { UserRole } from '@prisma/client';

export class AuthError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

function signTokens(userId: string, role: UserRole) {
  const accessToken = jwt.sign(
    { userId, role },
    env.jwtAccessSecret as jwt.Secret,
    {
      expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
    }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    env.jwtRefreshSecret as jwt.Secret,
    {
      expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
    }
  );

  return { accessToken, refreshToken };
}

export class AuthService {
  async register(input: { fullName: string; email: string; phoneNumber: string; password: string }) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { phoneNumber: input.phoneNumber }] },
    });
    if (existing) throw new AuthError('USER_ALREADY_EXISTS');

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        passwordHash,
      },
    });

    const tokens = signTokens(user.id, user.role);
    return { user: sanitizeUser(user), ...tokens };
  }

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AuthError('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new AuthError('INVALID_CREDENTIALS');

    const tokens = signTokens(user.id, user.role);
    return { user: sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let decoded: { userId: string; role: UserRole };
    try {
      decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as any;
    } catch {
      throw new AuthError('INVALID_REFRESH_TOKEN');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new AuthError('INVALID_REFRESH_TOKEN');

    return signTokens(user.id, user.role);
  }
}

function sanitizeUser(user: { passwordHash: string; [k: string]: any }) {
  const { passwordHash, ...rest } = user;
  return rest;
}
