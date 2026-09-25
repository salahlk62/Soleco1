import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'المسار غير موجود' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: 'حدث خطأ غير متوقع في الخادم',
  });
}
