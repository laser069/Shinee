import 'package:flutter/material.dart';

import '../../../../core/theme/tokens.dart';

/// Port of the web's 3-segment meter (`RegisterPage.tsx:18-26,137-148`).
/// Score: +1 length>6, +1 has uppercase, +1 has digit-or-symbol.
class PasswordStrengthMeter extends StatelessWidget {
  const PasswordStrengthMeter({super.key, required this.password});

  final String password;

  static int scoreFor(String pw) {
    if (pw.isEmpty) return 0;
    var score = 0;
    if (pw.length > 6) score++;
    if (RegExp(r'[A-Z]').hasMatch(pw)) score++;
    if (RegExp(r'[0-9]').hasMatch(pw) || RegExp(r'[^A-Za-z0-9]').hasMatch(pw)) score++;
    return score;
  }

  @override
  Widget build(BuildContext context) {
    final t = context.brutal;
    final score = scoreFor(password);

    Color segmentColor(int s) {
      if (score < s) return t.fg.withValues(alpha: 0.1);
      return switch (score) {
        1 => t.danger,
        2 => t.accent,
        _ => t.success,
      };
    }

    return Row(
      children: List.generate(3, (i) {
        final s = i + 1;
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: i < 2 ? 6 : 0),
            height: 8,
            decoration: BoxDecoration(
              color: segmentColor(s),
              border: Border.all(color: t.border, width: t.borderWidthThin),
              borderRadius: BorderRadius.circular(t.radiusFull),
            ),
          ),
        );
      }),
    );
  }
}
