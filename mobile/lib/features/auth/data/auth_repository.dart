import '../../../core/network/api_client.dart';
import '../../../core/services/auth_session.dart';

class AuthException implements Exception {
  final String message;
  AuthException(this.message);
}

/// Repository مسؤول عن تسجيل الدخول وإنشاء الحساب عبر الـ API،
/// وحفظ التوكن الناتج داخل AuthSession.
class AuthRepository {
  final ApiClient apiClient;
  AuthRepository(this.apiClient);

  Future<void> login({required String email, required String password}) async {
    try {
      final response = await apiClient.post('/api/v1/auth/login', data: {
        'email': email,
        'password': password,
      });
      _storeSession(response.data['data']);
    } catch (e) {
      throw AuthException('تعذر تسجيل الدخول، تحقق من البريد وكلمة السر');
    }
  }

  Future<void> register({
    required String fullName,
    required String email,
    required String phoneNumber,
    required String password,
  }) async {
    try {
      final response = await apiClient.post('/api/v1/auth/register', data: {
        'fullName': fullName,
        'email': email,
        'phoneNumber': phoneNumber,
        'password': password,
      });
      _storeSession(response.data['data']);
    } catch (e) {
      throw AuthException('تعذر إنشاء الحساب، قد يكون البريد مستخدماً مسبقاً');
    }
  }

  void logout() => AuthSession.instance.clear();

  void _storeSession(Map<String, dynamic> data) {
    AuthSession.instance.setSession(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
      user: data['user'] as Map<String, dynamic>?,
    );
  }
}
