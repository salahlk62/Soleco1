import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.client';
import { CHECKOUT_QUEUE_NAME, CheckoutJobData } from '../queues/checkout.queue';
import { prisma } from '../config/prisma.client';

/**
 * ملاحظة اتساق: الخطوات أدناه (اتصال شركة الشحن، تحديث الحالة، SMS، Push) ليست
 * كلها idempotent بذاتها. عند إعادة محاولة (retry) بعد فشل جزئي قد يُعاد إرسال
 * SMS. لتفادي ذلك في الإنتاج، احفظ trackingNumber فور نجاح Yalidine وتحقق منه
 * قبل إعادة الاتصال، أو قسّم كل خطوة إلى Job مستقل بحالة idempotent خاصة به.
 */
export const checkoutWorker = new Worker<CheckoutJobData>(
  CHECKOUT_QUEUE_NAME,
  async (job: Job<CheckoutJobData>) => {
    const { orderId, customerName, customerPhone, wilaya, commune, totalAmount, shippingProvider, storeId } =
      job.data;

    console.log(`[Worker] 🚀 معالجة الطلب #${orderId} في الخلفية...`);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.warn(`[Worker] الطلب #${orderId} غير موجود، تخطي المهمة`);
      return;
    }

    // إن كان تم تأكيد الطلب مسبقاً (retry بعد نجاح جزئي) لا نعيد إرسال شحنة جديدة
    let trackingNumber = order.trackingNumber ?? '';

    if (!trackingNumber && shippingProvider === 'YALIDINE') {
      trackingNumber = await sendToYalidineAPI({
        orderId,
        customerName,
        customerPhone,
        wilaya,
        commune,
        totalAmount,
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED', trackingNumber: trackingNumber || null },
    });

    if (order.status !== 'CONFIRMED') {
      await sendSMSNotification(
        customerPhone,
        `شكراً ${customerName}! تم تأكيد طلبك بنجاح. رقم التتبع الخاص بك هو: ${trackingNumber || 'قيد المعالجة'}`
      );
      await sendMerchantPushNotification(storeId, orderId, totalAmount);
    }

    console.log(`[Worker] ✅ تم إنهاء جميع المهام للطلب #${orderId}`);
  },
  { connection: redis, concurrency: 5 }
);

checkoutWorker.on('failed', (job, err) => {
  console.error(`[Worker Error] ❌ فشلت المهمة للطلب #${job?.data.orderId}:`, err.message);
});

// --- خدمات افتراضية خارجية (استبدلها بتكاملات حقيقية) ---

async function sendToYalidineAPI(payload: any): Promise<string> {
  // const response = await axios.post(`${process.env.YALIDINE_API_BASE}/parcels`, payload, { headers: {...} });
  return `YAL-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function sendSMSNotification(phone: string, message: string): Promise<void> {
  console.log(`[SMS Sent] To: ${phone} | Content: ${message}`);
}

async function sendMerchantPushNotification(storeId: string, orderId: string, amount: number): Promise<void> {
  console.log(`[FCM Push] Store: ${storeId} | Order: ${orderId} | Amount: ${amount} DZD`);
}
