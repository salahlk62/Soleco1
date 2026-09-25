import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma.client';

export interface ListOrdersParams {
  storeIds: string[];
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export class OrderService {
  async listOrders({ storeIds, status, page = 1, limit = 20 }: ListOrdersParams) {
    const where = { storeId: { in: storeIds }, ...(status ? { status } : {}) };

    const [totalItems, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      pagination: {
        totalItems,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
        pageSize: limit,
      },
      data,
    };
  }

  async updateStatus(orderId: string, storeIds: string[], status: OrderStatus) {
    // نتأكد أن الطلب يعود لأحد متاجر التاجر المصادق عليه قبل التعديل
    const order = await prisma.order.findFirst({ where: { id: orderId, storeId: { in: storeIds } } });
    if (!order) return null;

    return prisma.order.update({ where: { id: orderId }, data: { status } });
  }
}
