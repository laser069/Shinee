import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Theme mode state. Persistence to `shared_preferences`
/// (key `theme-storage`, mirroring `client/src/store/themeStore.ts`) lands
/// in Phase 6 — for now this just holds in-memory state, defaulting to the
/// device's platform brightness, so the AppBar toggle has something to
/// flip during Phase 1.
class ThemeModeController extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ThemeMode.system;

  void toggle() {
    final brightness = WidgetsBinding.instance.platformDispatcher.platformBrightness;
    final isCurrentlyDark = switch (state) {
      ThemeMode.dark => true,
      ThemeMode.light => false,
      ThemeMode.system => brightness == Brightness.dark,
    };
    state = isCurrentlyDark ? ThemeMode.light : ThemeMode.dark;
  }
}

final themeModeProvider = NotifierProvider<ThemeModeController, ThemeMode>(ThemeModeController.new);
