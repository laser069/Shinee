import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/tokens.dart';
import '../../../core/widgets/brutal_button.dart';
import '../../../core/widgets/brutal_card.dart';
import '../../../core/widgets/brutal_input.dart';
import 'auth_controller.dart';
import 'widgets/password_strength_meter.dart';

/// Port of `RegisterPage.tsx`: fade + slide-from-bottom entrance, 700ms.
/// Mirrors the server's exact validation (`user.schema.ts:19-23`): name
/// 2-50 chars, valid email, password >=8 with >=1 uppercase + >=1 digit.
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  late final AnimationController _entrance;
  late final Animation<double> _fade;
  late final Animation<Offset> _slide;

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _entrance = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    _fade = CurvedAnimation(parent: _entrance, curve: Curves.easeOut);
    _slide = Tween(begin: const Offset(0, 0.08), end: Offset.zero).animate(_fade);
    _entrance.forward();
    _passwordController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _entrance.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  String? _validateName(String? v) {
    final value = v?.trim() ?? '';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > 50) return 'Name is too long';
    return null;
  }

  String? _validateEmail(String? v) {
    final value = v?.trim() ?? '';
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value)) return 'Invalid email format';
    return null;
  }

  String? _validatePassword(String? v) {
    final value = v ?? '';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!RegExp(r'[A-Z]').hasMatch(value)) return 'Password must contain at least one uppercase letter';
    if (!RegExp(r'[0-9]').hasMatch(value)) return 'Password must contain at least one number';
    return null;
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_passwordController.text != _confirmController.text) {
      setState(() => _errorMessage = 'Passwords do not match');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).register(
            name: _nameController.text.trim(),
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    return Scaffold(
      backgroundColor: t.bg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: FadeTransition(
              opacity: _fade,
              child: SlideTransition(
                position: _slide,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: BrutalCard(
                    padding: const EdgeInsets.all(28),
                    radius: t.radiusXl,
                    shadowScale: 1.5,
                    color: t.bg,
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Center(
                            child: Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(color: t.fg, borderRadius: BorderRadius.circular(t.radiusMd)),
                              child: Icon(Icons.person_add, color: t.bg, size: 32),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Join Shinee',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w800, fontSize: 26, color: t.fg),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Start your journey to peak productivity.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontWeight: FontWeight.w600, color: t.fg.withValues(alpha: 0.6)),
                          ),
                          const SizedBox(height: 28),
                          if (_errorMessage != null) ...[
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(color: t.danger, borderRadius: BorderRadius.circular(t.radiusSm)),
                              child: Text(_errorMessage!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                            ),
                            const SizedBox(height: 20),
                          ],
                          BrutalInput(controller: _nameController, label: 'Full Name', validator: _validateName),
                          const SizedBox(height: 16),
                          BrutalInput(
                            controller: _emailController,
                            label: 'Email Address',
                            keyboardType: TextInputType.emailAddress,
                            validator: _validateEmail,
                          ),
                          const SizedBox(height: 16),
                          BrutalInput(
                            controller: _passwordController,
                            label: 'Security Key',
                            obscureText: true,
                            validator: _validatePassword,
                          ),
                          const SizedBox(height: 8),
                          PasswordStrengthMeter(password: _passwordController.text),
                          const SizedBox(height: 16),
                          BrutalInput(
                            controller: _confirmController,
                            label: 'Confirm Password',
                            obscureText: true,
                            validator: (v) => (v?.isEmpty ?? true) ? 'Confirm your password' : null,
                          ),
                          const SizedBox(height: 24),
                          BrutalButton(
                            label: _isSubmitting ? 'Creating Account...' : 'Initialize Workspace',
                            onPressed: _isSubmitting ? null : _submit,
                          ),
                          const SizedBox(height: 16),
                          Center(
                            child: TextButton(
                              onPressed: () => context.go('/login'),
                              child: RichText(
                                text: TextSpan(
                                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: t.fg),
                                  children: [
                                    const TextSpan(text: 'Already have an account? '),
                                    TextSpan(text: 'Sign in', style: TextStyle(color: t.accent, decoration: TextDecoration.underline)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
