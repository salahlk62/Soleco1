import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../orders/presentation/orders_cubit.dart';

class MerchantDashboardScreen extends StatelessWidget {
  const MerchantDashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('لوحة التحكم | Soleco.ai', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined, color: Colors.green),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<OrdersCubit>().fetchOrders(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildRevenueCard('84,500 د.ج', 'مبيعات اليوم', '+18.5% مقارنة بالأمس'),
              const SizedBox(height: 16),
              BlocBuilder<OrdersCubit, OrdersState>(
                builder: (context, state) {
                  final pendingCount = state is OrdersLoaded ? state.pendingCount : 0;
                  return Row(
                    children: [
                      Expanded(
                        child: _buildStatTile(
                            'الطلبات الجديدة', '$pendingCount', Colors.orange, Icons.shopping_bag),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: _buildStatTile('معدل التحويل', '4.2%', Colors.green, Icons.trending_up)),
                    ],
                  );
                },
              ),
              const SizedBox(height: 24),
              const Text('آخر الطلبيات الواردة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              BlocBuilder<OrdersCubit, OrdersState>(
                builder: (context, state) {
                  if (state is OrdersLoading || state is OrdersInitial) {
                    return const Padding(
                      padding: EdgeInsets.symmetric(vertical: 32),
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }
                  if (state is OrdersError) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Text(state.message, style: const TextStyle(color: Colors.red)),
                    );
                  }
                  final orders = (state as OrdersLoaded).orders;
                  if (orders.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Text('لا توجد طلبيات بعد'),
                    );
                  }
                  return _buildRecentOrdersList(orders);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRevenueCard(String amount, String title, String subtitle) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: const Color(0xFF1E293B), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          const SizedBox(height: 8),
          Text(amount, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(subtitle, style: const TextStyle(color: Colors.greenAccent, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildStatTile(String title, String count, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(count, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          Text(title, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildRecentOrdersList(List<dynamic> orders) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: orders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final order = orders[index] as Map<String, dynamic>;
        final isPending = order['status'] == 'PENDING';
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            side: BorderSide(color: Colors.grey.shade200),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: const Color(0xFFE2E8F0),
              child: Icon(Icons.person, color: Colors.blueGrey.shade700),
            ),
            title: Text('${order['customerName'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${order['wilaya'] ?? ''} • ${order['totalAmount'] ?? ''} د.ج'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isPending ? Colors.orange.shade50 : Colors.green.shade50,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                isPending ? 'قيد الانتظار' : '${order['status'] ?? ''}',
                style: TextStyle(
                  color: isPending ? Colors.orange.shade800 : Colors.green.shade800,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
