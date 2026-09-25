import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.middleware';
import './workers/checkout.worker'; // تشغيل الـ Worker مع السيرفر (استخدم "npm run worker" لتشغيله منفصلاً في الإنتاج)

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(globalRateLimiter);

app.use(routes);

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
