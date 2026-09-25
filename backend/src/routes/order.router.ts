import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

router.get('/orders', requireAuth, (req, res) => orderController.list(req, res));
router.patch('/orders/:id/status', requireAuth, (req, res) => orderController.updateStatus(req, res));

export default router;
