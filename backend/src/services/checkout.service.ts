import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.client';
import { checkoutQueue } from '../queues/checkout.queue';

export interface CheckoutItemDTO {
  productId: string;
  quantity: number;
  // ملاحظة أمنية: لا نثق بـ unitPrice القادم من العميل إطلاقاً.
  // نحتفظ بالحقل هنا فقط لأغراض العرض/المطابقة على الواجهة، ولا يُستخدم في الحساب.
}

export interface CheckoutDTO {
  storeId: string;
  funnelId?: string;
  idempotencyKey: string; // مطلوب: UUID يولّده العميل لمنع تكرار الطلب عند إعادة الإرسال
  customer: {
    fullName: string;
    phone: string;
    wilaya: string;
    commune: string;
    address?: string;
  };
  items: CheckoutItemDTO[];
  shippingProvider: 'YALIDINE' | 'ZR_EXPRESS' | 'ECOTRACK' | 'CUSTOM';
  shippingCost?: number;
}

export class CheckoutError extends Error {
  constructor(public code: string, message?: string) {
    super(message || code);
  }
}

export class CheckoutService {
  /**
   * معالجة الطلب السريع داخل Transaction واحدة.
   *
   * إصلاحات أمنية/اتساق مطبقة هنا:
   * 1) التسعير يُحسب دائماً من Product.basePrice في قاعدة البيانات، وليس من قيمة
   *    unitPrice القادمة من العميل (منع التلاعب بالأسعار).
   * 2) إنقاص المخزون يتم عبر تحديث شرطي (updateMany WHERE stockQuantity >= qty)
   *    داخل نفس الـ Transaction، بدل "تحقق ثم حدّث" غير الآمن تحت التزامن.
   * 3) idempotencyKey فريد على مستوى قاعدة البيانات لمنع إنشاء طلبين لنفس
   *    الطلب الأصلي عند إعادة الإرسال (retry / نقر مزدوج).
   */
  async processCheckout(data: CheckoutDTO) {
    const { storeId, funnelId, customer, items, shippingProvider, shippingCost = 0, idempotencyKey } = data;

    if (!idempotencyKey) {
      throw new CheckoutError('MISSING_IDEMPOTENCY_KEY');
    }

    if (!items?.length) {
      throw new CheckoutError('EMPTY_CART');
    }

    // إعادة استخدام نتيجة سابقة إن كان هذا الطلب مكرراً (نفس المفتاح)
    const existing = await prisma.order.findUnique({ where: { idempotencyKey } });
    if (existing) {
      return existing;
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new CheckoutError('STORE_NOT_FOUND');
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId, isActive: true },
    });

    if (products.length !== new Set(productIds).size) {
      throw new CheckoutError('INVALID_PRODUCTS');
    }

    // التسعير من مصدر الحقيقة الوحيد: قاعدة البيانات
    let subtotal = new Prisma.Decimal(0);
    const priced = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (item.quantity < 1) throw new CheckoutError('INVALID_QUANTITY');
      const lineTotal = product.basePrice.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);
      return { productId: product.id, quantity: item.quantity, unitPrice: product.basePrice };
    });

    const totalAmount = subtotal.add(new Prisma.Decimal(shippingCost));

    try {
      const order = await prisma.$transaction(async (tx) => {
        // إنقاص المخزون بشكل ذري وآمن تحت التزامن العالي
        for (const item of priced) {
          const updateResult = await tx.product.updateMany({
            where: { id: item.productId, stockQuantity: { gte: item.quantity } },
            data: { stockQuantity: { decrement: item.quantity } },
          });
          if (updateResult.count === 0) {
            throw new CheckoutError('INSUFFICIENT_STOCK', item.productId);
          }
        }

        return tx.order.create({
          data: {
            storeId,
            funnelId: funnelId || null,
            idempotencyKey,
            customerName: customer.fullName,
            customerPhone: customer.phone,
            wilaya: customer.wilaya,
            commune: customer.commune,
            address: customer.address || null,
            subtotal,
            shippingCost,
            totalAmount,
            status: OrderStatus.PENDING,
            orderItems: { create: priced },
          },
          include: { orderItems: true },
        });
      });

      // إدراج مهمة الخلفية (شحن + SMS + Push) بعد نجاح المعاملة المالية
      await checkoutQueue.add(
        'process-post-checkout',
        {
          orderId: order.id,
          storeId: order.storeId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          wilaya: order.wilaya,
          commune: order.commune,
          address: order.address ?? undefined,
          totalAmount: Number(order.totalAmount),
          shippingProvider,
        },
        { jobId: `checkout_${order.id}` }
      );

      return order;
    } catch (err) {
      // في حال تعارض على idempotencyKey الفريد (سباق بين طلبين متزامنين لنفس المفتاح)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const duplicate = await prisma.order.findUnique({ where: { idempotencyKey } });
        if (duplicate) return duplicate;
      }
      throw err;
    }
  }
}
