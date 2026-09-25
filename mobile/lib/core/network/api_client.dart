import 'package:dio/dio.dart';

/// عميل شبكة مركزي (Dio) يضيف تلقائياً الـ Bearer Token ويعالج تجديد الجلسة.
class ApiClient {
  final Dio _dio;

  ApiClient({required String baseUrl, required Future<String?> Function() getAccessToken})
      : _dio = Dio(BaseOptions(baseUrl: baseUrl, connectTimeout: const Duration(seconds: 10))) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) =>
      _dio.get(path, queryParameters: queryParameters);

  Future<Response> post(String path, {dynamic data}) => _dio.post(path, data: data);

  Future<Response> patch(String path, {dynamic data}) => _dio.patch(path, data: data);
}
