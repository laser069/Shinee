import 'package:flutter/material.dart';

import '../theme/tokens.dart';

enum BrutalButtonVariant { primary, outline, danger }

/// Filled `fg` (press → `accent`), outline, or danger button, all with a
/// `scale(0.95)` press animation mirroring the web's active-state transform.
class BrutalButton extends StatefulWidget {
  const BrutalButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = BrutalButtonVariant.primary,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final BrutalButtonVariant variant;
  final IconData? icon;

  @override
  State<BrutalButton> createState() => _BrutalButtonState();
}

class _BrutalButtonState extends State<BrutalButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    final disabled = widget.onPressed == null;

    final (bg, fg, border) = switch (widget.variant) {
      BrutalButtonVariant.primary => (_pressed ? t.accent : t.fg, _pressed ? t.fg : t.bg, t.fg),
      BrutalButtonVariant.outline => (_pressed ? t.accent.withValues(alpha: 0.1) : t.bg, t.fg, t.fg),
      BrutalButtonVariant.danger => (_pressed ? t.dangerAlt : t.danger, Colors.white, t.fg),
    };

    return GestureDetector(
      onTapDown: disabled ? null : (_) => setState(() => _pressed = true),
      onTapUp: disabled ? null : (_) => setState(() => _pressed = false),
      onTapCancel: disabled ? null : () => setState(() => _pressed = false),
      onTap: widget.onPressed,
      child: AnimatedScale(
        scale: _pressed ? 0.95 : 1,
        duration: const Duration(milliseconds: 100),
        child: Opacity(
          opacity: disabled ? 0.5 : 1,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: BoxDecoration(
              color: bg,
              border: Border.all(color: border, width: t.borderWidthMedium),
              borderRadius: BorderRadius.circular(t.radiusSm),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.icon != null) ...[
                  Icon(widget.icon, size: 18, color: fg),
                  const SizedBox(width: 8),
                ],
                Text(
                  widget.label.toUpperCase(),
                  style: TextStyle(
                    color: fg,
                    fontFamily: 'Sora',
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
