import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/theme/tokens.dart';
import '../../../core/widgets/brutal_button.dart';
import '../../../core/widgets/brutal_card.dart';
import '../../../core/widgets/brutal_input.dart';
import 'auth_controller.dart';

/// Port of `LoginPage.tsx`: fade + slide-from-top entrance, 700ms.
class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> with SingleTickerProviderStateMixin {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

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
    _slide = Tween(begin: const Offset(0, -0.08), end: Offset.zero).animate(_fade);
    _entrance.forward();
  }

  @override
  void dispose() {
    _entrance.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).login(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
      // Router redirect handles navigation once AuthState flips to
      // authenticated — no explicit go() needed here.
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
                child: BrutalCard(
                  padding: const EdgeInsets.all(28),
                  radius: t.radiusXl,
                  shadowScale: 1.5,
                  color: t.bg,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(color: t.fg, borderRadius: BorderRadius.circular(t.radiusMd)),
                          child: Icon(Icons.lock, color: t.bg, size: 32),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Welcome Back',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w800, fontSize: 26, color: t.fg),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Continue your productivity journey.',
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
                      BrutalInput(
                        controller: _emailController,
                        label: 'Email Address',
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 16),
                      BrutalInput(
                        controller: _passwordController,
                        label: 'Security Key',
                        obscureText: true,
                      ),
                      const SizedBox(height: 24),
                      BrutalButton(
                        label: _isSubmitting ? 'Authenticating...' : 'Sign In Now',
                        onPressed: _isSubmitting ? null : _submit,
                      ),
                      const SizedBox(height: 16),
                      Center(
                        child: TextButton(
                          onPressed: () => context.go('/register'),
                          child: RichText(
                            text: TextSpan(
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: t.fg),
                              children: [
                                const TextSpan(text: 'New to Shinee? '),
                                TextSpan(text: 'Create an account', style: TextStyle(color: t.accent, decoration: TextDecoration.underline)),
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
    );
  }
}
