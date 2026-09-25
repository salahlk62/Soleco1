import '../../../core/network/api_client.dart';

/// Repository مسؤول عن جلب وتحديث الطلبيات عبر الـ API.
class OrdersRepository {
  final ApiClient apiClient;
  OrdersRepository(this.apiClient);

  Future<List<dynamic>> getOrders({String? status, int page = 1, int limit = 20}) async {
    final response = await apiClient.get('/api/v1/orders', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
      'limit': limit,
    });
    return response.data['data'] as List<dynamic>;
  }

  Future<void> updateOrderStatus(String orderId, String status) async {
    await apiClient.patch('/api/v1/orders/$orderId/status', data: {'status': status});
  }
}
