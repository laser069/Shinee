import 'package:flutter/material.dart';

import '../../../core/theme/tokens.dart';
import '../../../core/widgets/loading_ring.dart';

/// Shown while `AuthController` rehydrates from storage. The router's
/// `redirect` moves off this route the instant `AuthState` resolves to
/// authenticated/unauthenticated.
class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    return Scaffold(
      backgroundColor: t.bg,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RichText(
              text: TextSpan(
                style: const TextStyle(fontFamily: 'Syne', fontWeight: FontWeight.w800, fontSize: 32),
                children: [
                  TextSpan(text: 'SH', style: TextStyle(color: t.fg)),
                  TextSpan(text: '[I]', style: TextStyle(color: t.accent)),
                  TextSpan(text: 'NEE', style: TextStyle(color: t.fg)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const LoadingRing(),
          ],
        ),
      ),
    );
  }
}
