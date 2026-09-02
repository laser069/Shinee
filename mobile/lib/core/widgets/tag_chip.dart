import 'package:flutter/material.dart';

import '../theme/tokens.dart';

/// Colour dot + label chip for task tags. `active: false` drops to 40%
/// opacity, matching `TagFilterBar`'s non-matching state on web.
class TagChip extends StatelessWidget {
  const TagChip({
    super.key,
    required this.label,
    required this.color,
    this.active = true,
    this.onTap,
  });

  final String label;
  final Color color;
  final bool active;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    return Opacity(
      opacity: active ? 1 : 0.4,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: t.bg,
            border: Border.all(color: t.border, width: t.borderWidthThin),
            borderRadius: BorderRadius.circular(t.radiusFull),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: t.fg),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
