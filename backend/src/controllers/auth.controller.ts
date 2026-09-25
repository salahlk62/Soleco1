import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService, AuthError } from '../services/auth.service';

const authService = new AuthService();

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phoneNumber: z.string().min(8).max(20),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'VALIDATION_ERROR', issues: parsed.error.issues });
      return;
    }
    try {
      const result = await authService.register(parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof AuthError && error.code === 'USER_ALREADY_EXISTS') {
        res.status(409).json({ success: false, error: error.code, message: 'المستخدم موجود مسبقاً' });
        return;
      }
      console.error('Register error:', error);
      res.status(500).json({ success: false, error: 'SERVER_ERROR' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'VALIDATION_ERROR', issues: parsed.error.issues });
      return;
    }
    try {
      const result = await authService.login(parsed.data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(401).json({ success: false, error: error.code, message: 'بيانات الدخول غير صحيحة' });
        return;
      }
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'SERVER_ERROR' });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'MISSING_REFRESH_TOKEN' });
      return;
    }
    try {
      const tokens = await authService.refresh(refreshToken);
      res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      res.status(401).json({ success: false, error: 'INVALID_REFRESH_TOKEN' });
    }
  }
}
