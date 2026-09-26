import 'package:flutter/material.dart';

import '../data/auth_repository.dart';

class LoginScreen extends StatefulWidget {
  final AuthRepository authRepository;
  final VoidCallback onLoggedIn;

  const LoginScreen({Key? key, required this.authRepository, required this.onLoggedIn}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isRegisterMode = false;
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();

  bool _loading = false;
  String? _errorMessage;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      if (_isRegisterMode) {
        await widget.authRepository.register(
          fullName: _fullNameController.text.trim(),
          email: _emailController.text.trim(),
          phoneNumber: _phoneController.text.trim(),
          password: _passwordController.text,
        );
      } else {
        await widget.authRepository.login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
      }
      widget.onLoggedIn();
    } on AuthException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Soleco.ai',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isRegisterMode ? 'إنشاء حساب تاجر جديد' : 'تسجيل الدخول إلى لوحة التحكم',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 32),
                  if (_isRegisterMode) ...[
                    TextFormField(
                      controller: _fullNameController,
                      decoration: const InputDecoration(labelText: 'الاسم الكامل', border: OutlineInputBorder()),
                      validator: (v) => (v == null || v.trim().length < 2) ? 'مطلوب' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _phoneController,
                      decoration: const InputDecoration(labelText: 'رقم الهاتف', border: OutlineInputBorder()),
                      keyboardType: TextInputType.phone,
                      validator: (v) => (v == null || v.trim().length < 8) ? 'مطلوب' : null,
                    ),
                    const SizedBox(height: 12),
                  ],
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(labelText: 'البريد الإلكتروني', border: OutlineInputBorder()),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => (v == null || !v.contains('@')) ? 'بريد إلكتروني غير صالح' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _passwordController,
                    decoration: const InputDecoration(labelText: 'كلمة السر', border: OutlineInputBorder()),
                    obscureText: true,
                    validator: (v) => (v == null || v.length < 8) ? '8 أحرف على الأقل' : null,
                  ),
                  if (_errorMessage != null) ...[
                    const SizedBox(height: 12),
                    Text(_errorMessage!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
                  ],
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF16A34A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _loading
                        ? const SizedBox(
                            height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white))
                        : Text(_isRegisterMode ? 'إنشاء الحساب' : 'دخول'),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: _loading ? null : () => setState(() => _isRegisterMode = !_isRegisterMode),
                    child: Text(_isRegisterMode ? 'لديك حساب؟ سجّل الدخول' : 'ليس لديك حساب؟ أنشئ واحداً'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
