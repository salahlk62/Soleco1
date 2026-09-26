import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/network/api_client.dart';
import 'core/network/api_config.dart';
import 'core/services/auth_session.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/data/auth_repository.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/orders/data/orders_repository.dart';
import 'features/orders/presentation/orders_cubit.dart';
import 'features/dashboard/presentation/dashboard_screen.dart';

class SolecoApp extends StatefulWidget {
  const SolecoApp({Key? key}) : super(key: key);

  @override
  State<SolecoApp> createState() => _SolecoAppState();
}

class _SolecoAppState extends State<SolecoApp> {
  late final ApiClient _apiClient;
  late final AuthRepository _authRepository;
  late final OrdersRepository _ordersRepository;

  @override
  void initState() {
    super.initState();
    // getAccessToken يقرأ التوكن الحالي من AuthSession في كل طلب،
    // لذا يعكس تلقائياً حالة الدخول/الخروج دون إعادة بناء ApiClient.
    _apiClient = ApiClient(
      baseUrl: apiBaseUrl,
      getAccessToken: () async => AuthSession.instance.accessToken,
    );
    _authRepository = AuthRepository(_apiClient);
    _ordersRepository = OrdersRepository(_apiClient);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Soleco.ai',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: AuthSession.instance.isLoggedIn
          ? _buildDashboard()
          : LoginScreen(
              authRepository: _authRepository,
              onLoggedIn: () => setState(() {}),
            ),
    );
  }

  Widget _buildDashboard() {
    return BlocProvider(
      create: (_) => OrdersCubit(_ordersRepository)..fetchOrders(),
      child: const MerchantDashboardScreen(),
    );
  }
}
