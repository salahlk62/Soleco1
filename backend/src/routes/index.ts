import { Router } from 'express';
import authRouter from './auth.router';
import funnelRouter from './funnel.router';
import checkoutRouter from './checkout.router';
import orderRouter from './order.router';

const router = Router();

router.use('/api/v1', authRouter);
router.use('/api/v1', funnelRouter);
router.use('/api/v1', checkoutRouter);
router.use('/api/v1', orderRouter);

router.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

export default router;
