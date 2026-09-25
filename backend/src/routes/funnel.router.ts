import { Router } from 'express';
import { FunnelController } from '../controllers/funnel.controller';

const router = Router();
const funnelController = new FunnelController();

router.get('/funnels/:slug', (req, res) => funnelController.getFunnel(req, res));
// router.post('/funnels', requireAuth, requireRole('MERCHANT', 'ADMIN'), (req, res) => ...) // TODO: create funnel

export default router;
