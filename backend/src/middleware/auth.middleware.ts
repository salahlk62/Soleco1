import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthPayload {
  userId: string;
  role: 'ADMIN' | 'MERCHANT' | 'STAFF';
  storeIds?: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

/**
 * يتحقق من صحة الـ Bearer Token ويرفض الطلب إن لم يكن موجوداً أو صالحاً.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'رمز الدخول مفقود' });
    return;
  }

  const token = header.substring('Bearer '.length);

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.auth = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'رمز الدخول غير صالح أو منتهي' });
  }
}

/**
 * يقيّد الوصول حسب الدور (مثلاً ADMIN فقط).
 */
export function requireRole(...roles: AuthPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'صلاحيات غير كافية' });
      return;
    }
    next();
  };
}
