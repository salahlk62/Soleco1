import 'package:flutter/material.dart';

/// ثيم موحّد للتطبيق (ألوان ونمط الأزرار والبطاقات).
class AppTheme {
  static const Color primaryGreen = Color(0xFF16A34A);
  static const Color darkSlate = Color(0xFF1E293B);

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8F9FA),
        colorScheme: ColorScheme.fromSeed(
          seedColor: primaryGreen,
          primary: primaryGreen,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
      );
}
