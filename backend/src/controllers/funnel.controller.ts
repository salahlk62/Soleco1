import { Request, Response } from 'express';
import { FunnelCacheService } from '../services/funnel-cache.service';

const funnelCacheService = new FunnelCacheService();

export class FunnelController {
  async getFunnel(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { slug } = req.params;

    try {
      const result = await funnelCacheService.getFunnelBySlug(slug);

      if (!result) {
        res.status(404).json({ success: false, error: 'Funnel not found' });
        return;
      }

      const responseTime = Date.now() - startTime;

      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Data-Source', result.source);
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

      res.status(200).json({ success: true, responseTime: `${responseTime}ms`, data: result.data });
    } catch (error) {
      console.error('Error fetching funnel:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
}
