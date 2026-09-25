# Soleco.ai

منصة لبناء مسارات بيع (Funnels) وصفحات هبوط/دفع بخطوة واحدة، موجهة للتجار في الجزائر، مع لوحة تحكم موبايل وربط مباشر بشركات الشحن (Yalidine, ZR Express, ...).

## البنية

```
soleco-ai/
├── backend/     # Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis + BullMQ
└── mobile/      # Flutter (لوحة تحكم التاجر)
```

## تشغيل الـ Backend

```bash
cd backend
cp .env.example .env      # عدّل القيم (DATABASE_URL, REDIS_URL, أسرار JWT...)
npm install
npm run prisma:generate
npm run prisma:migrate    # ينشئ الجداول في PostgreSQL
npm run dev                # يشغّل الـ API على المنفذ 3000 (والـ Worker معه)
```

يتطلب تشغيله محلياً: PostgreSQL و Redis (يمكن تشغيلهما بسرعة عبر Docker):

```bash
docker run -d --name soleco-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=soleco_ai -p 5432:5432 postgres:16
docker run -d --name soleco-redis -p 6379:6379 redis:7
```

## أهم القرارات المعمارية

- **التسعير من الخادم فقط**: `checkout.service.ts` يحسب السعر دائماً من `Product.basePrice` في قاعدة البيانات، ويتجاهل أي سعر يُرسله العميل، لمنع التلاعب بالأسعار.
- **إنقاص مخزون آمن تحت التزامن**: باستخدام `updateMany` الشرطي (`stockQuantity >= quantity`) داخل الـ Transaction بدل "تحقق ثم حدّث".
- **Idempotency**: كل طلب يتطلب `idempotencyKey` فريداً (UUID من العميل) لمنع تكرار الطلب عند إعادة الإرسال أو ضعف الشبكة.
- **Cache-first للـ Funnels**: القراءة من Redis أولاً (`funnel:slug:<slug>`)، مع TTL كصمام أمان بجانب invalidation اليدوي عند التعديل.
- **معالجة غير متزامنة (BullMQ)**: الشحن، الـ SMS، والإشعارات تتم في الخلفية عبر Worker منفصل بعد نجاح المعاملة المالية مباشرة.
- **Rate limiting** على `/checkout/process` لحماية نقطة عامة بلا مصادقة من هجمات استنزاف المخزون.

## نقاط يُنصح بمعالجتها قبل الإنتاج

- تشفير بيانات اعتماد شركات الشحن (`ShippingIntegration.apiKeyEnc`) قبل الكتابة، وفك تشفيرها عند الاستخدام فقط.
- فصل الـ Worker عن عملية الـ API في الإنتاج (`npm run worker` كخدمة/Container منفصل) بدل استيراده داخل `server.ts`.
- إضافة CAPTCHA أو تحقق سلوكي على `/checkout/process` كطبقة حماية إضافية فوق الـ rate limiter.
- تفعيل `helmet`/CSP وإعداد CORS بقائمة نطاقات محددة بدل السماح للجميع في الإنتاج.
