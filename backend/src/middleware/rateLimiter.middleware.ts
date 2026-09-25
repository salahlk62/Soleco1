import rateLimit from 'express-rate-limit';

/**
 * يحد من عدد الطلبات على /checkout/process لكل IP لمنع استنزاف المخزون
 * أو هجمات الطلبيات الوهمية (spam orders) على نقطة عامة بلا مصادقة.
 */
export const checkoutRateLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 8, // 8 محاولات شراء لكل IP في الدقيقة
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'عدد كبير من المحاولات، الرجاء الانتظار قليلاً',
  },
});

/**
 * حد عام أخف للـ API بالكامل.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
