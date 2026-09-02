import 'package:flutter/material.dart';

import 'brutal_card.dart';
import '../theme/tokens.dart';

/// A single KPI tile: big value, small uppercase label, optional icon.
class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.label,
    required this.value,
    this.icon,
    this.accentValue = false,
  });

  final String label;
  final String value;
  final IconData? icon;

  /// When true, renders [value] in the accent colour (e.g. XP totals).
  final bool accentValue;

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    return BrutalCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) Icon(icon, size: 16, color: t.fg),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Sora',
              fontWeight: FontWeight.w800,
              fontSize: 22,
              color: accentValue ? t.accent : t.fg,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
              color: t.fg.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }
}
