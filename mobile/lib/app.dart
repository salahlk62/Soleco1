import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/network/api_client.dart';
import 'core/network/api_config.dart';
import 'core/theme/app_theme.dart';
import 'features/orders/data/orders_repository.dart';
import 'features/orders/presentation/orders_cubit.dart';
import 'features/dashboard/presentation/dashboard_screen.dart';

class SolecoApp extends StatelessWidget {
  const SolecoApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // لا يوجد نظام تسجيل دخول مفعّل بعد في هذه النسخة الأولية، لذا نُرجع null دائماً.
    // عند إضافة شاشة auth، استبدل هذا بقراءة التوكن من تخزين آمن (flutter_secure_storage).
    final apiClient = ApiClient(
      baseUrl: apiBaseUrl,
      getAccessToken: () async => null,
    );
    final ordersRepository = OrdersRepository(apiClient);

    return MaterialApp(
      title: 'Soleco.ai',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      locale: const Locale('ar'),
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: BlocProvider(
        create: (_) => OrdersCubit(ordersRepository)..fetchOrders(),
        child: const MerchantDashboardScreen(),
      ),
    );
  }
}
