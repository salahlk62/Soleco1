import { redis } from '../config/redis.client';
import { prisma } from '../config/prisma.client';

const FUNNEL_CACHE_TTL = 21600; // 6 ساعات (أقصر من 24 كصمام أمان إضافي بجانب invalidation اليدوي)

export class FunnelCacheService {
  /**
   * جلب بيانات الـ Funnel بأسرع زمن استجابة ممكن (Cache-First)
   */
  async getFunnelBySlug(slug: string) {
    const cacheKey = `funnel:slug:${slug}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return { source: 'CACHE' as const, data: JSON.parse(cachedData) };
    }

    const funnelFromDb = await prisma.funnel.findUnique({
      where: { slug, isActive: true },
      include: {
        store: { select: { id: true, name: true, currency: true } },
        pages: { orderBy: { stepOrder: 'asc' } },
      },
    });

    if (!funnelFromDb) return null;

    await redis.setex(cacheKey, FUNNEL_CACHE_TTL, JSON.stringify(funnelFromDb));

    return { source: 'DATABASE' as const, data: funnelFromDb };
  }

  /**
   * إبطال التخزين المؤقت فور تعديل التاجر لـ Funnel.
   */
  async invalidateFunnelCache(slug: string): Promise<void> {
    await redis.del(`funnel:slug:${slug}`);
  }
}
