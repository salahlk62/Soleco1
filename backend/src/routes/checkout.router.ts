import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { checkoutRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();
const checkoutController = new CheckoutController();

router.post('/checkout/process', checkoutRateLimiter, (req, res) => checkoutController.process(req, res));

export default router;
