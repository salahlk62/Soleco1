import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { OrderService } from '../services/order.service';
import { prisma } from '../config/prisma.client';

const orderService = new OrderService();

async function merchantStoreIds(userId: string): Promise<string[]> {
  const stores = await prisma.store.findMany({ where: { merchantId: userId }, select: { id: true } });
  return stores.map((s) => s.id);
}

export class OrderController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const storeIds = await merchantStoreIds(req.auth!.userId);
      const status = req.query.status as OrderStatus | undefined;
      const page = Number(req.query.page || 1);
      const limit = Math.min(Number(req.query.limit || 20), 100);

      const result = await orderService.listOrders({ storeIds, status, page, limit });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error('List orders error:', error);
      res.status(500).json({ success: false, error: 'SERVER_ERROR' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const storeIds = await merchantStoreIds(req.auth!.userId);
      const { status } = req.body as { status: OrderStatus };

      if (!Object.values(OrderStatus).includes(status)) {
        res.status(400).json({ success: false, error: 'INVALID_STATUS' });
        return;
      }

      const updated = await orderService.updateStatus(req.params.id, storeIds, status);
      if (!updated) {
        res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' });
        return;
      }

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ success: false, error: 'SERVER_ERROR' });
    }
  }
}
