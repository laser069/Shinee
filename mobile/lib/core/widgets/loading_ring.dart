import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// `border-4 fg/10 + top accent`, spinning. Mirrors the web's loading
/// spinner exactly.
class LoadingRing extends StatelessWidget {
  const LoadingRing({super.key, this.size = 32});

  final double size;

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    return SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: 4,
        backgroundColor: t.fg.withValues(alpha: 0.1),
        valueColor: AlwaysStoppedAnimation(t.accent),
      ),
    );
  }
}
