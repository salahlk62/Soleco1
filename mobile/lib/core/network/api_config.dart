/// عنوان الـ API الأساسي.
///
/// نفس الجهاز (الهاتف) يشغّل الـ backend داخل Termux/Ubuntu على المنفذ 3000،
/// والتطبيق يعمل على نفس نظام أندرويد، لذا 127.0.0.1 يصل إليه مباشرة.
/// إن اختبرت على محاكي Android Studio بدل الجهاز الحقيقي، استخدم 10.0.2.2 بدلاً منه.
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://127.0.0.1:3000',
);
