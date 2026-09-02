import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// 4px border + hard offset shadow + radius. The base building block every
/// other brutal widget composes.
class BrutalCard extends StatelessWidget {
  const BrutalCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color,
    this.radius,
    this.shadowScale = 1,
    this.borderWidth,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final double? radius;
  final double shadowScale;
  final double? borderWidth;

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? t.surface,
        border: Border.all(color: t.border, width: borderWidth ?? t.borderWidthThick),
        borderRadius: BorderRadius.circular(radius ?? t.radiusMd),
        boxShadow: t.hardShadow(scale: shadowScale),
      ),
      child: child,
    );
  }
}
