import { Queue } from 'bullmq';
import { redis } from '../config/redis.client';

export const CHECKOUT_QUEUE_NAME = 'checkout-processing-queue';

export interface CheckoutJobData {
  orderId: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  wilaya: string;
  commune: string;
  address?: string;
  totalAmount: number;
  shippingProvider: 'YALIDINE' | 'ZR_EXPRESS' | 'ECOTRACK' | 'CUSTOM';
}

export const checkoutQueue = new Queue<CheckoutJobData>(CHECKOUT_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: { count: 1000 },
  },
});
