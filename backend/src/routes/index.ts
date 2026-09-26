import { Router } from 'express';
import { authRouter } from './auth.router';
import { funnelRouter } from './funnel.router';
import { orderRouter } from './order.router';
import { checkoutRouter } from './checkout.router';

const router = Router();

// Routes Prefix
router.use('/auth', authRouter);         // /api/v1/auth
router.use('/funnel', funnelRouter);     // /api/v1/funnel
router.use('/orders', orderRouter);      // /api/v1/orders
router.use('/checkout', checkoutRouter); // /api/v1/checkout

export default router;
