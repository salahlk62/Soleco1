import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(globalRateLimiter);

// استجابة المسار الرئيسي للتحقق من عمل السيرفر
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SOL Ecosystem API is running smoothly',
  });
});

// ربط كافة المسارات المعتمدة
app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(env.port, () => {
  console.log(`🚀 API Running on port ${env.port}`);
});
