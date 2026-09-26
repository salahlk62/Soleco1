/// يحتفظ بجلسة الدخول (التوكن) في الذاكرة فقط لهذه النسخة الأولية.
///
/// ملاحظة: يُفقد التوكن عند إغلاق التطبيق لأنه غير مُخزَّن على القرص.
/// للإنتاج، استبدل هذا بـ flutter_secure_storage لحفظ التوكن بأمان بين الجلسات.
class AuthSession {
  AuthSession._internal();
  static final AuthSession instance = AuthSession._internal();

  String? accessToken;
  String? refreshToken;
  Map<String, dynamic>? user;

  bool get isLoggedIn => accessToken != null;

  void setSession({required String accessToken, required String refreshToken, Map<String, dynamic>? user}) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }

  void clear() {
    accessToken = null;
    refreshToken = null;
    user = null;
  }
}
