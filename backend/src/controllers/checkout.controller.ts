import { Request, Response } from 'express';
import { z } from 'zod';
import { CheckoutService, CheckoutError } from '../services/checkout.service';

const checkoutService = new CheckoutService();

const checkoutSchema = z.object({
  storeId: z.string().uuid(),
  funnelId: z.string().uuid().optional(),
  idempotencyKey: z.string().min(8).max(100),
  customer: z.object({
    fullName: z.string().min(2).max(100),
    phone: z.string().min(8).max(20),
    wilaya: z.string().min(2).max(50),
    commune: z.string().min(2).max(50),
    address: z.string().max(500).optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(100),
      })
    )
    .min(1),
  shippingProvider: z.enum(['YALIDINE', 'ZR_EXPRESS', 'ECOTRACK', 'CUSTOM']),
  shippingCost: z.number().nonnegative().optional(),
});

export class CheckoutController {
  async process(req: Request, res: Response): Promise<void> {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'يرجى التحقق من البيانات المدخلة',
        issues: parsed.error.issues,
      });
      return;
    }

    try {
      const order = await checkoutService.processCheckout(parsed.data);

      res.status(201).json({
        success: true,
        message: 'تم تسجيل طلبك بنجاح',
        data: {
          orderId: order.id,
          status: order.status,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Checkout Error:', error);

      if (error instanceof CheckoutError) {
        const map: Record<string, { status: number; message: string }> = {
          STORE_NOT_FOUND: { status: 404, message: 'المتجر غير موجود' },
          INVALID_PRODUCTS: { status: 400, message: 'أحد المنتجات غير متوفر أو غير صالح' },
          INSUFFICIENT_STOCK: { status: 409, message: 'المخزون غير كافٍ لأحد المنتجات' },
          INVALID_QUANTITY: { status: 400, message: 'الكمية المطلوبة غير صالحة' },
          EMPTY_CART: { status: 400, message: 'السلة فارغة' },
          MISSING_IDEMPOTENCY_KEY: { status: 400, message: 'معرّف الطلب مفقود' },
        };
        const mapped = map[error.code] || { status: 400, message: 'تعذر معالجة الطلب' };
        res.status(mapped.status).json({ success: false, error: error.code, message: mapped.message });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'حدث خطأ غير متوقع أثناء معالجة الطلب',
      });
    }
  }
}
