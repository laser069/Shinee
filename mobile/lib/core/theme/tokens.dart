import 'package:flutter/material.dart';

/// Brutalist design tokens, ported 1:1 from `client/src/index.css:9-27`.
///
/// Light values live on the base `:root`; dark values come from `:root.dark`.
/// `accent` is intentionally constant across themes (matches web).
@immutable
class BrutalTokens extends ThemeExtension<BrutalTokens> {
  const BrutalTokens({
    required this.bg,
    required this.surface,
    required this.fg,
    required this.border,
    required this.accent,
    required this.danger,
    required this.dangerAlt,
    required this.success,
    required this.tagPalette,
    required this.borderWidthThick,
    required this.borderWidthMedium,
    required this.borderWidthThin,
    required this.radiusSm,
    required this.radiusMd,
    required this.radiusLg,
    required this.radiusXl,
    required this.radiusFull,
  });

  final Color bg;
  final Color surface;
  final Color fg;
  final Color border;
  final Color accent;

  /// `#f43f5e` — used for the deadline pill under 12h and destructive text.
  final Color danger;

  /// `#ef4444` — secondary danger shade (e.g. over-target progress bar fill).
  final Color dangerAlt;

  final Color success;

  /// Server-enforced lowercase tag colour set
  /// (`server/src/schemas/task.schema.ts`). Defined once here, unlike the
  /// web client which duplicates it in `types/task.ts` and `HabitModal.tsx`.
  final List<Color> tagPalette;

  final double borderWidthThick;
  final double borderWidthMedium;
  final double borderWidthThin;

  final double radiusSm;
  final double radiusMd;
  final double radiusLg;
  final double radiusXl;
  final double radiusFull;

  static const light = BrutalTokens(
    bg: Color(0xFFFFFFFF),
    surface: Color(0xFFF5F5F5),
    fg: Color(0xFF0A0A0A),
    border: Color(0xFF0A0A0A),
    accent: Color(0xFFF5C842),
    danger: Color(0xFFF43F5E),
    dangerAlt: Color(0xFFEF4444),
    success: Color(0xFF10B981),
    tagPalette: _tagPalette,
    borderWidthThick: 4,
    borderWidthMedium: 2,
    borderWidthThin: 1,
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 24,
    radiusFull: 40,
  );

  static const dark = BrutalTokens(
    bg: Color(0xFF0A0A0A),
    surface: Color(0xFF161616),
    fg: Color(0xFFF5F5F5),
    border: Color(0xFFF5C842),
    accent: Color(0xFFF5C842),
    danger: Color(0xFFF43F5E),
    dangerAlt: Color(0xFFEF4444),
    success: Color(0xFF10B981),
    tagPalette: _tagPalette,
    borderWidthThick: 4,
    borderWidthMedium: 2,
    borderWidthThin: 1,
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 24,
    radiusFull: 40,
  );

  static const _tagPalette = <Color>[
    Color(0xFF6366F1),
    Color(0xFFF43F5E),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
    Color(0xFF3B82F6),
    Color(0xFFA855F7),
  ];

  /// Hard offset shadow, `BoxShadow(color: fg, offset: (8,8), blur: 0)`.
  /// `scale` widens the offset/blur for the 12px/16px variants used on
  /// larger cards.
  List<BoxShadow> hardShadow({double scale = 1}) => [
        BoxShadow(
          color: fg,
          offset: Offset(8 * scale, 8 * scale),
          blurRadius: 0,
        ),
      ];

  @override
  BrutalTokens copyWith({
    Color? bg,
    Color? surface,
    Color? fg,
    Color? border,
    Color? accent,
    Color? danger,
    Color? dangerAlt,
    Color? success,
    List<Color>? tagPalette,
    double? borderWidthThick,
    double? borderWidthMedium,
    double? borderWidthThin,
    double? radiusSm,
    double? radiusMd,
    double? radiusLg,
    double? radiusXl,
    double? radiusFull,
  }) {
    return BrutalTokens(
      bg: bg ?? this.bg,
      surface: surface ?? this.surface,
      fg: fg ?? this.fg,
      border: border ?? this.border,
      accent: accent ?? this.accent,
      danger: danger ?? this.danger,
      dangerAlt: dangerAlt ?? this.dangerAlt,
      success: success ?? this.success,
      tagPalette: tagPalette ?? this.tagPalette,
      borderWidthThick: borderWidthThick ?? this.borderWidthThick,
      borderWidthMedium: borderWidthMedium ?? this.borderWidthMedium,
      borderWidthThin: borderWidthThin ?? this.borderWidthThin,
      radiusSm: radiusSm ?? this.radiusSm,
      radiusMd: radiusMd ?? this.radiusMd,
      radiusLg: radiusLg ?? this.radiusLg,
      radiusXl: radiusXl ?? this.radiusXl,
      radiusFull: radiusFull ?? this.radiusFull,
    );
  }

  @override
  BrutalTokens lerp(ThemeExtension<BrutalTokens>? other, double t) {
    if (other is! BrutalTokens) return this;
    return BrutalTokens(
      bg: Color.lerp(bg, other.bg, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      fg: Color.lerp(fg, other.fg, t)!,
      border: Color.lerp(border, other.border, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      dangerAlt: Color.lerp(dangerAlt, other.dangerAlt, t)!,
      success: Color.lerp(success, other.success, t)!,
      tagPalette: tagPalette,
      borderWidthThick: borderWidthThick,
      borderWidthMedium: borderWidthMedium,
      borderWidthThin: borderWidthThin,
      radiusSm: radiusSm,
      radiusMd: radiusMd,
      radiusLg: radiusLg,
      radiusXl: radiusXl,
      radiusFull: radiusFull,
    );
  }
}

/// Convenience accessor: `context.brutal`.
extension BrutalTokensX on BuildContext {
  BrutalTokens get brutal => Theme.of(this).extension<BrutalTokens>()!;
}
