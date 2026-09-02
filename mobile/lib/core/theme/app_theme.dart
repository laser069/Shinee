import 'package:flutter/material.dart';

import 'tokens.dart';

/// Builds the light/dark [ThemeData], wiring [BrutalTokens] in as a
/// [ThemeExtension] and mirroring the web's font rule
/// (`client/src/index.css:59-63`): body copy uses Space Grotesk, anything
/// bold/semibold+ (w600 and up) swaps to Sora. Syne is reserved for the logo
/// only and is applied directly where the logo widget is built, not here.
class AppTheme {
  AppTheme._();

  static ThemeData light() => _build(BrutalTokens.light, Brightness.light);
  static ThemeData dark() => _build(BrutalTokens.dark, Brightness.dark);

  static ThemeData _build(BrutalTokens tokens, Brightness brightness) {
    final base = ThemeData(
      brightness: brightness,
      useMaterial3: true,
      scaffoldBackgroundColor: tokens.bg,
      fontFamily: 'Space Grotesk',
      colorScheme: ColorScheme.fromSeed(
        seedColor: tokens.accent,
        brightness: brightness,
        surface: tokens.surface,
      ),
      extensions: [tokens],
    );

    final textTheme = base.textTheme.apply(
      bodyColor: tokens.fg,
      displayColor: tokens.fg,
      fontFamily: 'Space Grotesk',
    );

    return base.copyWith(
      textTheme: textTheme.copyWith(
        // Headings mirror the web's bold-text font swap to Sora.
        displayLarge: textTheme.displayLarge?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w800),
        displayMedium: textTheme.displayMedium?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w800),
        displaySmall: textTheme.displaySmall?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w700),
        headlineLarge: textTheme.headlineLarge?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w700),
        headlineMedium: textTheme.headlineMedium?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w700),
        headlineSmall: textTheme.headlineSmall?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w600),
        titleLarge: textTheme.titleLarge?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w700),
        titleMedium: textTheme.titleMedium?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w600),
        titleSmall: textTheme.titleSmall?.copyWith(fontFamily: 'Sora', fontWeight: FontWeight.w600),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: tokens.bg,
        foregroundColor: tokens.fg,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: tokens.bg,
        indicatorColor: tokens.accent,
        surfaceTintColor: Colors.transparent,
      ),
      dividerColor: tokens.fg.withValues(alpha: 0.1),
    );
  }
}
