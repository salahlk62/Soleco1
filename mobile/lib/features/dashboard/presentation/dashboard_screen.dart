import 'package:flutter/material.dart';

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
            onPressed: () {
              // فتح قائمة التنبيهات
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // إعادة جلب البيانات
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildRevenueCard('84,500 د.ج', 'مبيعات اليوم', '+18.5% مقارنة بالأمس'),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildStatTile('الطلبات الجديدة', '12', Colors.orange, Icons.shopping_bag)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildStatTile('معدل التحويل', '4.2%', Colors.green, Icons.trending_up)),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'آخر الطلبيات الواردة',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildRecentOrdersList(),
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
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          const SizedBox(height: 8),
          Text(
            amount,
            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
          ),
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

  Widget _buildRecentOrdersList() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 3,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            side: BorderSide(color: Colors.grey.shade200),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: const Color(0xFFE2E8F0),
              child: Icon(Icons.person, color: Colors.blueGrey.shade700), // تم إصلاح: Colors.slate غير موجود في Flutter
            ),
            title: const Text('صلاح الدين', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('ولاية ميلة • باكة أسبوعية (4,800 د.ج)'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'قيد الانتظار',
                style: TextStyle(color: Colors.orange.shade800, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        );
      },
    );
  }
}
