import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.middleware';
import './workers/checkout.worker';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(globalRateLimiter);

// 1. مسار جذر رئيسي لتأكيد عمل السيرفر عند التصفح المباشر
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Soleco.ai API Ecosystem is running live!',
    version: '1.0.0',
  });
});

// 2. ربط جميع المسارات بالبادئة /api/v1
app.use('/api/v1', routes);

// 3. معالجة الأخطاء والمسارات المفقودة
app.use(notFoundHandler);
app.use(globalErrorHandler);

const server = app.listen(env.port, () => {
  console.log(`🚀 Soleco.ai API Running on port ${env.port} [${env.nodeEnv}]`);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => process.exit(0));
});
